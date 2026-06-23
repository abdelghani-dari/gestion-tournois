<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(User::query()->latest()->get());
    }

    public function pending(): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(
            User::query()
                ->where('role', 'user')
                ->where('account_status', 'pending')
                ->latest()
                ->get()
        );
    }

    public function accept(User $user): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($user->role !== 'user') {
            return response()->json(['message' => 'Only normal users can be validated.'], 422);
        }

        $user->update([
            'account_status' => 'active',
            'approved_by' => auth('api')->id(),
            'approved_at' => now(),
            'admin_note' => null,
        ]);

        return response()->json($user);
    }

    public function refuse(Request $request, User $user): JsonResponse
    {
        if (! $this->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($user->role !== 'user') {
            return response()->json(['message' => 'Only normal users can be validated.'], 422);
        }

        $validated = $request->validate([
            'admin_note' => ['nullable', 'string'],
        ]);

        $user->update([
            'account_status' => 'refused',
            'approved_by' => auth('api')->id(),
            'approved_at' => now(),
            'admin_note' => $validated['admin_note'] ?? null,
        ]);

        return response()->json($user);
    }

    private function isAdmin(): bool
    {
        return auth('api')->user()?->role === 'admin';
    }
}
