<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Championship;
use App\Models\Post;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::with(['user', 'championship', 'tournament', 'approver']);

        if ($request->filled('scope')) {
            $query->where('scope', $request->query('scope'));
        }

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        } elseif (! $request->filled('status')) {
            $query->where('status', 'approved');
        }

        if ($request->filled('championship_id')) {
            $query->where('championship_id', $request->query('championship_id'));
        }

        if ($request->filled('tournament_id')) {
            $query->where('tournament_id', $request->query('tournament_id'));
        }

        if ($request->filled('city')) {
            $city = $request->query('city');

            $query->where(function ($query) use ($city) {
                $query->whereHas('championship', fn ($query) => $query->where('city', $city))
                    ->orWhereHas('tournament', fn ($query) => $query->where('city', $city));
            });
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'championship_id' => ['nullable', 'exists:championships,id'],
            'tournament_id' => ['nullable', 'exists:tournaments,id'],
            'content' => ['required', 'string'],
            'image_path' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'in:announcement,result,news,general'],
            'scope' => ['required', 'in:official,local'],
        ]);

        if (! empty($validated['championship_id']) && ! empty($validated['tournament_id'])) {
            return response()->json([
                'message' => 'A post cannot be linked to both a championship and a tournament.',
            ], 422);
        }

        $user = User::findOrFail($validated['user_id']);
        $championship = ! empty($validated['championship_id']) ? Championship::findOrFail($validated['championship_id']) : null;
        $tournament = ! empty($validated['tournament_id']) ? Tournament::findOrFail($validated['tournament_id']) : null;

        if ($validated['scope'] === 'official') {
            if ($user->role !== 'admin') {
                return response()->json(['message' => 'Only admins can create official posts.'], 422);
            }

            $validated['status'] = 'approved';
            $validated['approved_by'] = $user->id;
            $validated['approved_at'] = now();
        }

        if ($validated['scope'] === 'local') {
            if ($user->role !== 'organizer') {
                return response()->json(['message' => 'Only organizers can create local posts.'], 422);
            }

            if (empty($validated['championship_id']) === empty($validated['tournament_id'])) {
                return response()->json([
                    'message' => 'A local post must belong to exactly one competition.',
                ], 422);
            }

            $competition = $championship ?? $tournament;

            if ($competition->level !== 'local') {
                return response()->json([
                    'message' => 'Local posts must be linked to a local competition.',
                ], 422);
            }

            $validated['status'] = 'pending';
            $validated['approved_by'] = null;
            $validated['approved_at'] = null;
        }

        $validated['type'] = $validated['type'] ?? 'general';

        $post = Post::create($validated);

        return response()->json($post->load(['user', 'championship', 'tournament', 'approver']), 201);
    }

    public function show(Post $post)
    {
        return response()->json($post->load(['user', 'championship', 'tournament', 'approver']));
    }

    public function approve(Request $request, Post $post)
    {
        $validated = $request->validate([
            'admin_id' => ['required', 'exists:users,id'],
        ]);

        $admin = User::findOrFail($validated['admin_id']);

        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Only admins can approve posts.'], 422);
        }

        $post->update([
            'status' => 'approved',
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Post approved.',
            'post' => $post->load(['user', 'championship', 'tournament', 'approver']),
        ]);
    }

    public function reject(Request $request, Post $post)
    {
        $validated = $request->validate([
            'admin_id' => ['required', 'exists:users,id'],
        ]);

        $admin = User::findOrFail($validated['admin_id']);

        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Only admins can reject posts.'], 422);
        }

        $post->update([
            'status' => 'rejected',
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Post rejected.',
            'post' => $post->load(['user', 'championship', 'tournament', 'approver']),
        ]);
    }

    public function destroy(Post $post)
    {
        $post->delete();

        return response()->json(['message' => 'Post deleted.']);
    }
}
