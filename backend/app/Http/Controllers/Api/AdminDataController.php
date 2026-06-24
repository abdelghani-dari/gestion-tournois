<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JoinRequest;
use App\Models\MatchGame;
use App\Models\Player;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class AdminDataController extends Controller
{
    public function teams(): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(Team::with('manager')->withCount('players')->latest()->get());
    }

    public function showTeam(Team $team): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json($team->load(['manager', 'players']));
    }

    public function storeTeam(Request $request): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'short_name' => ['nullable', 'string', 'max:3'],
            'city' => ['nullable', 'string', 'max:255'],
            'logo_path' => ['nullable', 'url', 'max:255'],
            'logo_url' => ['nullable', 'url', 'max:255'],
            'logo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,gif,svg,bmp,tiff,avif,heic,heif', 'max:8192'],
            'manager_id' => ['nullable', 'exists:users,id'],
        ]);
        $validated['logo_path'] = $this->imagePath($request, 'logo', 'teams', 'logo') ?? $validated['logo_url'] ?? $validated['logo_path'] ?? null;
        unset($validated['logo'], $validated['logo_url']);

        $team = Team::create([
            ...$validated,
            'manager_id' => $validated['manager_id'] ?? auth('api')->id(),
        ]);

        return response()->json($team->load('manager')->loadCount('players'), 201);
    }

    public function players(): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(Player::with('team')->latest()->get());
    }

    public function storePlayer(Request $request): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'team_id' => ['required', 'exists:teams,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'position' => ['nullable', 'string', 'max:255'],
            'number' => ['nullable', 'integer', 'min:1', 'max:99'],
            'photo_path' => ['nullable', 'url', 'max:255'],
            'photo_url' => ['nullable', 'url', 'max:255'],
            'photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,gif,svg,bmp,tiff,avif,heic,heif', 'max:8192'],
        ]);
        $validated['photo_path'] = $this->imagePath($request, 'photo', 'players', 'photo') ?? $validated['photo_url'] ?? $validated['photo_path'] ?? null;
        unset($validated['photo'], $validated['photo_url']);

        $player = Player::create($validated);

        return response()->json($player->load('team'), 201);
    }

    public function joinRequests(): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(JoinRequest::with(['tournament', 'team', 'manager'])->latest()->get());
    }

    public function matches(): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(MatchGame::with(['tournament', 'homeTeam', 'awayTeam'])->latest()->get());
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
