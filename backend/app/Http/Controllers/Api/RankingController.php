<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ranking;
use App\Models\Tournament;
use App\Services\OwnershipRules;
use App\Services\RankingCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RankingController extends Controller
{
    public function __construct(
        private RankingCalculator $rankingCalculator,
        private OwnershipRules $ownershipRules
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tournament_id' => ['required', 'exists:tournaments,id'],
        ]);

        $tournamentId = (int) $validated['tournament_id'];

        return response()->json(
            Cache::remember(
                "tournament:{$tournamentId}:rankings",
                60,
                fn () => $this->sortedRankings($tournamentId)
                    ->get()
                    ->toArray()
            )
        );
    }

    public function recalculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tournament_id' => ['required', 'exists:tournaments,id'],
        ]);

        $tournament = Tournament::with('teams')->findOrFail($validated['tournament_id']);

        if (! $this->ownershipRules->canManageTournamentResources(
            $tournament->created_by,
            auth('api')->id(),
            auth('api')->user()?->role
        )) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        Ranking::where('tournament_id', $tournament->id)->delete();

        $rankings = $this->rankingCalculator->calculate(
            $tournament->teams
                ->map(static fn ($team): array => [
                    'id' => $team->id,
                    'name' => $team->name,
                ])
                ->all(),
            $tournament->matches()
                ->get()
                ->map(static fn ($match): array => [
                    'home_team_id' => $match->home_team_id,
                    'away_team_id' => $match->away_team_id,
                    'home_score' => $match->home_score,
                    'away_score' => $match->away_score,
                    'status' => $match->status,
                    'result_status' => $match->result_status,
                ])
                ->all()
        );

        foreach ($rankings as $ranking) {
            Ranking::create([
                'tournament_id' => $tournament->id,
                ...$ranking,
            ]);
        }

        Cache::forget("tournament:{$tournament->id}:rankings");

        return response()->json($this->sortedRankings($tournament->id)->get());
    }

    private function sortedRankings(int $tournamentId)
    {
        return Ranking::with('team')
            ->where('tournament_id', $tournamentId)
            ->join('teams', 'rankings.team_id', '=', 'teams.id')
            ->orderByDesc('rankings.points')
            ->orderByDesc('rankings.goal_difference')
            ->orderByDesc('rankings.goals_for')
            ->orderBy('teams.name')
            ->select('rankings.*');
    }
}
