<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use App\Services\OwnershipRules;
use App\Services\TournamentRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminTournamentController extends Controller
{
    public function __construct(
        private TournamentRules $tournamentRules,
        private OwnershipRules $ownershipRules
    ) {
    }

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

        $tournament->update($this->tournamentRules->acceptanceAttributes(auth('api')->id(), now()));

        $this->forgetTournamentCache($tournament->id);

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

        $tournament->update($this->tournamentRules->refusalAttributes(
            auth('api')->id(),
            now(),
            $validated['admin_note'] ?? null
        ));

        $this->forgetTournamentCache($tournament->id);

        return response()->json($tournament->load(['creator', 'approvedBy']));
    }

    private function isAdmin(): bool
    {
        return $this->ownershipRules->canAccessAdminActions(auth('api')->user()?->role);
    }

    private function forgetTournamentCache(int $tournamentId): void
    {
        Cache::forget('public:tournaments');
        Cache::forget("tournament:{$tournamentId}:details");
    }
}
