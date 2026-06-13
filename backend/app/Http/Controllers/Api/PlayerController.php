<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            'photo_path' => ['nullable', 'string', 'max:255'],
        ]);

        $player = Player::create($validated);

        return response()->json($player, 201);
    }

    public function show(Player $player): JsonResponse
    {
        return response()->json($player->load('team'));
    }

    public function update(Request $request, Player $player): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'position' => ['nullable', 'string', 'max:255'],
            'number' => ['nullable', 'integer', 'min:1', 'max:99'],
            'photo_path' => ['nullable', 'string', 'max:255'],
        ]);

        $player->update($validated);

        return response()->json($player);
    }

    public function destroy(Player $player): JsonResponse
    {
        $player->delete();

        return response()->json(['message' => 'Player deleted.']);
    }
}
