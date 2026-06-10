<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    public function index()
    {
        return response()->json(Player::with('team')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'team_id' => ['required', 'exists:teams,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'position' => ['nullable', 'string', 'max:255'],
            'number' => ['nullable', 'integer', 'min:0'],
            'photo_path' => ['nullable', 'string', 'max:255'],
        ]);

        $player = Player::create($validated);

        return response()->json($player, 201);
    }

    public function show(Player $player)
    {
        return response()->json($player->load('team'));
    }

    public function update(Request $request, Player $player)
    {
        $validated = $request->validate([
            'team_id' => ['sometimes', 'required', 'exists:teams,id'],
            'first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'birth_date' => ['sometimes', 'nullable', 'date'],
            'position' => ['sometimes', 'nullable', 'string', 'max:255'],
            'number' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'photo_path' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $player->update($validated);

        return response()->json($player->load('team'));
    }

    public function destroy(Player $player)
    {
        $player->delete();

        return response()->json(null, 204);
    }
}
