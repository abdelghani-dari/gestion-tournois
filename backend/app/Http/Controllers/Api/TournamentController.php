<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;

class TournamentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Cache::remember(
                'public:tournaments',
                60,
                fn () => Tournament::with('teams')
                    ->where('approval_status', 'accepted')
                    ->latest()
                    ->get()
                    ->toArray()
            )
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'banner_path' => ['nullable', 'url', 'max:255'],
            'banner_url' => ['nullable', 'url', 'max:255'],
            'banner' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,gif,svg,bmp,tiff,avif,heic,heif', 'max:8192'],
            'format' => ['nullable', 'in:league'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);
        $validated['banner_path'] = $this->imagePath($request, 'banner', 'tournaments', 'banner') ?? $validated['banner_url'] ?? $validated['banner_path'] ?? null;
        unset($validated['banner'], $validated['banner_url']);

        $user = auth('api')->user();
        $isAdmin = $user?->role === 'admin';

        $tournament = Tournament::create([
            ...$validated,
            'format' => $validated['format'] ?? 'league',
            'created_by' => $user?->id,
            'status' => $isAdmin ? 'open' : 'draft',
            'approval_status' => $isAdmin ? 'accepted' : 'pending',
            'admin_note' => null,
            'approved_by' => $isAdmin ? $user->id : null,
            'approved_at' => $isAdmin ? now() : null,
        ]);

        $this->forgetTournamentCache($tournament->id);

        return response()->json($tournament, 201);
    }

    public function show(Tournament $tournament): JsonResponse
    {
        return response()->json(
            Cache::remember("tournament:{$tournament->id}:details", 60, fn () => $tournament
                ->load(['creator', 'approvedBy', 'teams'])
                ->toArray())
        );
    }

    public function update(Request $request, Tournament $tournament): JsonResponse
    {
        if (! $this->isAdmin() && (int) $tournament->created_by !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'banner_path' => ['nullable', 'url', 'max:255'],
            'banner_url' => ['nullable', 'url', 'max:255'],
            'banner' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'format' => ['sometimes', 'required', 'in:league'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'required', 'string', 'max:255'],
        ]);
        $imagePath = $this->imagePath($request, 'banner', 'tournaments', 'banner');
        if ($imagePath || array_key_exists('banner_url', $validated) || array_key_exists('banner_path', $validated)) {
            $validated['banner_path'] = $imagePath ?? $validated['banner_url'] ?? $validated['banner_path'] ?? null;
        }
        unset($validated['banner'], $validated['banner_url']);

        $tournament->update($validated);

        $this->forgetTournamentCache($tournament->id);

        return response()->json($tournament);
    }

    public function destroy(Tournament $tournament): JsonResponse
    {
        if (! $this->isAdmin() && (int) $tournament->created_by !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $tournamentId = $tournament->id;
        $tournament->delete();
        $this->forgetTournamentCache($tournamentId);

        return response()->json(['message' => 'Tournament deleted.']);
    }

    public function myTournaments(): JsonResponse
    {
        $user = auth('api')->user();

        if ($user?->role === 'admin') {
            return response()->json(Tournament::query()->latest()->get());
        }

        return response()->json(
            Tournament::where('created_by', $user->id)->latest()->get()
        );
    }

    private function forgetTournamentCache(int $tournamentId): void
    {
        Cache::forget('public:tournaments');
        Cache::forget("tournament:{$tournamentId}:details");
        Cache::forget("tournament:{$tournamentId}:rankings");
        Cache::forget("tournament:{$tournamentId}:statistics");
    }

    private function isAdmin(): bool
    {
        return auth('api')->user()?->role === 'admin';
    }

    private function imagePath(Request $request, string $field, string $directory, string $prefix): ?string
    {
        if (! $request->hasFile($field)) {
            return null;
        }

        /** @var UploadedFile $file */
        $file = $request->file($field);

        return $file->storeAs($directory, uniqid($prefix.'-', true).'.'.$file->extension(), 'public');
    }
}
