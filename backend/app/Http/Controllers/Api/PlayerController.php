<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class PlayerController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Player::with('team')->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'team_id' => ['required', 'exists:teams,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'position' => ['nullable', 'string', 'max:255'],
            'number' => ['nullable', 'integer', 'min:1', 'max:99'],
            'photo_path' => ['nullable', 'url', 'max:255'],
            'photo_url' => ['nullable', 'url', 'max:255'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);
        $validated['photo_path'] = $this->imagePath($request, 'photo', 'players', 'photo') ?? $validated['photo_url'] ?? $validated['photo_path'] ?? null;
        unset($validated['photo'], $validated['photo_url']);

        $team = Team::findOrFail($validated['team_id']);

        if ((int) $team->manager_id !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $player = Player::create($validated);

        return response()->json($player, 201);
    }

    public function show(Player $player): JsonResponse
    {
        return response()->json($player->load('team'));
    }

    public function update(Request $request, Player $player): JsonResponse
    {
        if ((int) $player->team->manager_id !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'position' => ['nullable', 'string', 'max:255'],
            'number' => ['nullable', 'integer', 'min:1', 'max:99'],
            'photo_path' => ['nullable', 'url', 'max:255'],
            'photo_url' => ['nullable', 'url', 'max:255'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);
        $imagePath = $this->imagePath($request, 'photo', 'players', 'photo');
        if ($imagePath || array_key_exists('photo_url', $validated) || array_key_exists('photo_path', $validated)) {
            $validated['photo_path'] = $imagePath ?? $validated['photo_url'] ?? $validated['photo_path'] ?? null;
        }
        unset($validated['photo'], $validated['photo_url']);

        $player->update($validated);

        return response()->json($player);
    }

    public function destroy(Player $player): JsonResponse
    {
        if ((int) $player->team->manager_id !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $player->delete();

        return response()->json(['message' => 'Player deleted.']);
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
