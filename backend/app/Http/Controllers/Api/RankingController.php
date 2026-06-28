<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ranking;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RankingController extends Controller
{
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

        if ($tournament->format === 'knockout') {
            return response()->json(['message' => 'Knockout tournaments use brackets instead of rankings.'], 422);
        }

        if ((int) $tournament->created_by !== (int) auth('api')->id()
            && auth('api')->user()?->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        Ranking::where('tournament_id', $tournament->id)->delete();

        $rankings = [];

        foreach ($tournament->teams as $team) {
            $rankings[$team->id] = Ranking::create([
                'tournament_id' => $tournament->id,
                'team_id' => $team->id,
            ]);
        }

        $matches = $tournament->matches()
            ->where('status', 'played')
            ->where('result_status', 'confirmed')
            ->whereNotNull('home_score')
            ->whereNotNull('away_score')
            ->get();

        foreach ($matches as $match) {
            if (! isset($rankings[$match->home_team_id], $rankings[$match->away_team_id])) {
                continue;
            }

            $homeRanking = $rankings[$match->home_team_id];
            $awayRanking = $rankings[$match->away_team_id];

            $homeRanking->played++;
            $awayRanking->played++;

            $homeRanking->goals_for += $match->home_score;
            $homeRanking->goals_against += $match->away_score;
            $awayRanking->goals_for += $match->away_score;
            $awayRanking->goals_against += $match->home_score;

            if ($match->home_score > $match->away_score) {
                $homeRanking->wins++;
                $homeRanking->points += 3;
                $awayRanking->losses++;
            } elseif ($match->home_score < $match->away_score) {
                $awayRanking->wins++;
                $awayRanking->points += 3;
                $homeRanking->losses++;
            } else {
                $homeRanking->draws++;
                $awayRanking->draws++;
                $homeRanking->points++;
                $awayRanking->points++;
            }

            $homeRanking->goal_difference = $homeRanking->goals_for - $homeRanking->goals_against;
            $awayRanking->goal_difference = $awayRanking->goals_for - $awayRanking->goals_against;

            $homeRanking->save();
            $awayRanking->save();
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
