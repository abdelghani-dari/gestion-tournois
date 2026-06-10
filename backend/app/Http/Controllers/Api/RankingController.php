<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MatchGame;
use App\Models\Ranking;
use Illuminate\Http\Request;

class RankingController extends Controller
{
    public function index(Request $request)
    {
        $query = Ranking::with(['championship', 'tournament', 'team']);

        if ($request->filled('championship_id')) {
            $query->where('championship_id', $request->query('championship_id'));
        }

        if ($request->filled('tournament_id')) {
            $query->where('tournament_id', $request->query('tournament_id'));
        }

        return response()->json(
            $query->orderByDesc('points')
                ->orderByDesc('goal_difference')
                ->orderByDesc('goals_for')
                ->get()
        );
    }

    public function recalculate(Request $request)
    {
        if (! in_array(auth('api')->user()->role, ['admin', 'organizer'], true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'championship_id' => ['nullable', 'exists:championships,id'],
            'tournament_id' => ['nullable', 'exists:tournaments,id'],
        ]);

        if (empty($validated['championship_id']) === empty($validated['tournament_id'])) {
            return response()->json([
                'message' => 'Exactly one competition is required.',
            ], 422);
        }

        $competitionField = ! empty($validated['championship_id']) ? 'championship_id' : 'tournament_id';
        $competitionId = $validated[$competitionField];

        $matches = MatchGame::where($competitionField, $competitionId)
            ->where('status', 'played')
            ->where('result_status', 'confirmed')
            ->whereNotNull('home_score')
            ->whereNotNull('away_score')
            ->get();

        $rankings = [];

        foreach ($matches as $match) {
            $this->ensureTeam($rankings, $match->home_team_id);
            $this->ensureTeam($rankings, $match->away_team_id);

            $rankings[$match->home_team_id]['played']++;
            $rankings[$match->away_team_id]['played']++;

            $rankings[$match->home_team_id]['goals_for'] += $match->home_score;
            $rankings[$match->home_team_id]['goals_against'] += $match->away_score;
            $rankings[$match->away_team_id]['goals_for'] += $match->away_score;
            $rankings[$match->away_team_id]['goals_against'] += $match->home_score;

            if ($match->home_score > $match->away_score) {
                $rankings[$match->home_team_id]['wins']++;
                $rankings[$match->home_team_id]['points'] += 3;
                $rankings[$match->away_team_id]['losses']++;
            } elseif ($match->home_score < $match->away_score) {
                $rankings[$match->away_team_id]['wins']++;
                $rankings[$match->away_team_id]['points'] += 3;
                $rankings[$match->home_team_id]['losses']++;
            } else {
                $rankings[$match->home_team_id]['draws']++;
                $rankings[$match->away_team_id]['draws']++;
                $rankings[$match->home_team_id]['points']++;
                $rankings[$match->away_team_id]['points']++;
            }
        }

        Ranking::where($competitionField, $competitionId)->delete();

        foreach ($rankings as $teamId => $ranking) {
            $ranking['team_id'] = $teamId;
            $ranking[$competitionField] = $competitionId;
            $ranking['goal_difference'] = $ranking['goals_for'] - $ranking['goals_against'];

            Ranking::create($ranking);
        }

        $freshRankings = Ranking::with('team')
            ->where($competitionField, $competitionId)
            ->orderByDesc('points')
            ->orderByDesc('goal_difference')
            ->orderByDesc('goals_for')
            ->get();

        return response()->json([
            'message' => 'Rankings recalculated.',
            'rankings' => $freshRankings,
        ]);
    }

    private function ensureTeam(array &$rankings, int $teamId): void
    {
        if (isset($rankings[$teamId])) {
            return;
        }

        $rankings[$teamId] = [
            'played' => 0,
            'wins' => 0,
            'draws' => 0,
            'losses' => 0,
            'goals_for' => 0,
            'goals_against' => 0,
            'goal_difference' => 0,
            'points' => 0,
        ];
    }
}
