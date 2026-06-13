<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTournamentController extends Controller
{
    public function pending(): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(
            Tournament::with('creator')
                ->where('approval_status', 'pending')
                ->latest()
                ->get()
        );
    }

    public function index(): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(
            Tournament::with(['creator', 'approvedBy'])->latest()->get()
        );
    }

    public function accept(Request $request, Tournament $tournament): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $tournament->update([
            'approval_status' => 'accepted',
            'status' => 'open',
            'approved_by' => auth('api')->id(),
            'approved_at' => now(),
            'admin_note' => null,
        ]);

        return response()->json($tournament->load(['creator', 'approvedBy']));
    }

    public function refuse(Request $request, Tournament $tournament): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'admin_note' => ['nullable', 'string'],
        ]);

        $tournament->update([
            'approval_status' => 'refused',
            'status' => 'cancelled',
            'approved_by' => auth('api')->id(),
            'approved_at' => now(),
            'admin_note' => $validated['admin_note'] ?? null,
        ]);

        return response()->json($tournament->load(['creator', 'approvedBy']));
    }

    private function isAdmin(): bool
    {
        return auth('api')->user()?->role === 'admin';
    }
}
