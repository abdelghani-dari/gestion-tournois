<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JoinRequest;
use App\Models\MatchGame;
use App\Models\Player;
use App\Models\Ranking;
use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function summary(): JsonResponse
    {
        $startedAt = microtime(true);
        $timings = [];
        $mark = function (string $label) use ($startedAt, &$timings): void {
            $timings[$label] = round((microtime(true) - $startedAt) * 1000, 2);
        };

        $user = auth('api')->user();
        $isAdmin = $user->role === 'admin';
        $mark('auth');

        $tournaments = Tournament::query();
        if (! $isAdmin) {
            $tournaments->where('created_by', $user->id);
        }

        $teams = Team::query()->where('manager_id', $user->id);
        $matches = MatchGame::query()->whereIn('tournament_id', (clone $tournaments)->select('id'));
        $requests = JoinRequest::query()->where(function (Builder $query) use ($tournaments, $teams): void {
            $query->whereIn('tournament_id', (clone $tournaments)->select('id'))
                ->orWhereIn('team_id', (clone $teams)->select('id'));
        });

        $firstTournamentId = (clone $tournaments)
            ->orderByRaw("case when approval_status = 'accepted' then 0 else 1 end")
            ->orderBy('id')
            ->value('id');

        $rankingPreview = [];
        $matchPreview = [];
        if ($firstTournamentId !== null) {
            $rankingPreview = Ranking::query()
                ->select(['id', 'tournament_id', 'team_id', 'played', 'wins', 'draws', 'losses', 'goals_for', 'goals_against', 'goal_difference', 'points'])
                ->with('team:id,name,short_name,logo_path')
                ->where('tournament_id', $firstTournamentId)
                ->orderByDesc('points')
                ->orderByDesc('goal_difference')
                ->limit(6)
                ->get();

            $matchPreview = MatchGame::query()
                ->select(['id', 'tournament_id', 'home_team_id', 'away_team_id', 'match_date', 'home_score', 'away_score', 'status', 'result_status'])
                ->with([
                    'homeTeam:id,name,short_name,logo_path',
                    'awayTeam:id,name,short_name,logo_path',
                ])
                ->where('tournament_id', $firstTournamentId)
                ->orderBy('match_date')
                ->limit(6)
                ->get();
        }

        $pendingTournaments = $isAdmin
            ? Tournament::query()
                ->select(['id', 'name', 'city', 'start_date', 'approval_status'])
                ->where('approval_status', 'pending')
                ->latest('id')
                ->limit(5)
                ->get()
            : [];
        $mark('previews');

        $counts = [
            'my_tournaments' => (clone $tournaments)->count(),
            'my_teams' => (clone $teams)->count(),
            'my_players' => Player::query()->whereIn('team_id', (clone $teams)->select('id'))->count(),
            'pending_requests' => (clone $requests)->where('status', 'pending')->count(),
            'join_requests' => (clone $requests)->count(),
            'matches' => (clone $matches)->count(),
            'confirmed_results' => (clone $matches)->where('result_status', 'confirmed')->count(),
        ];
        $mark('counts');

        $tournamentStatus = $this->groupedCounts((clone $tournaments), 'approval_status');
        $matchStatus = $this->groupedCounts((clone $matches), 'status');
        $resultStatus = $this->groupedCounts((clone $matches), 'result_status');
        $mark('statuses');

        $payload = [
            'user' => $user->only(['id', 'name', 'email', 'role', 'avatar_url']),
            'counts' => $counts,
            'tournament_status' => $tournamentStatus,
            'match_status' => $matchStatus,
            'result_status' => $resultStatus,
            'first_tournament_id' => $firstTournamentId,
            'ranking_preview' => $rankingPreview,
            'match_preview' => $matchPreview,
            'pending_tournaments' => $pendingTournaments,
        ];
        $mark('payload');

        $totalMs = round((microtime(true) - $startedAt) * 1000, 2);
        if ($totalMs > 1000) {
            Log::warning('Slow dashboard summary response', [
                'total_ms' => $totalMs,
                'timings_ms' => $timings,
                'user_id' => $user->id,
            ]);
        }

        return response()->json($payload);
    }

    private function groupedCounts(Builder $query, string $column): array
    {
        return $query
            ->selectRaw("{$column}, count(*) as aggregate")
            ->groupBy($column)
            ->pluck('aggregate', $column)
            ->map(fn ($count) => (int) $count)
            ->all();
    }
}
