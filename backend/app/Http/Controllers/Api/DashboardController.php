<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BuildsDashboardWidgets;
use App\Http\Controllers\Controller;
use App\Models\JoinRequest;
use App\Models\MatchGame;
use App\Models\Player;
use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    use BuildsDashboardWidgets;

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

        $requestedTournamentId = request()->integer('tournament_id') ?: null;
        if ($requestedTournamentId && (clone $tournaments)->where('id', $requestedTournamentId)->exists()) {
            $firstTournamentId = $requestedTournamentId;
        }

        $tournamentOptions = (clone $tournaments)
            ->orderBy('name')
            ->get(['id', 'name', 'created_by'])
            ->map(fn (Tournament $tournament) => [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'created_by' => $tournament->created_by,
            ])
            ->values()
            ->all();

        $myTournamentCount = (clone $tournaments)->count();

        $teamsInScope = $isAdmin
            ? Team::query()
            : Team::query()->whereHas('tournaments', function (Builder $relation) use ($tournaments): void {
                $relation->whereIn('tournaments.id', (clone $tournaments)->select('id'));
            });

        $rankingPreview = [];
        $matchPreview = [];
        $recentMatches = [];
        $topScorers = [];
        $goalsByMonth = [];
        $teamStatsByMonth = [];
        $selectedTeamId = null;
        $featuredTournament = null;
        $tournamentsPreview = [];
        $creatorTournamentRankings = [];
        $chartStats = [
            'top_tournaments_by_goals' => [],
            'top_teams_by_goals' => [],
            'top_yellow_cards' => [],
            'top_red_cards' => [],
            'goals_by_week' => [],
            'top_matches_by_goals' => [],
        ];

        $dashboardView = [
            'sidebar_mode' => $isAdmin ? 'tournaments' : ($myTournamentCount > 1 ? 'tournaments' : 'scorers'),
            'my_tournament_count' => $myTournamentCount,
            'is_creator_scope' => ! $isAdmin,
        ];

        if ($firstTournamentId !== null) {
            $rankingPreview = $this->buildRankingPreview($firstTournamentId, 10);
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

            if ($isAdmin) {
                $recentMatches = $this->buildRecentMatches($firstTournamentId, 4);
                $topScorers = $this->buildTopScorers($firstTournamentId, 5);
                $goalsByMonth = $this->buildGoalsByMonth($firstTournamentId);
            } else {
                $recentMatches = $this->buildRecentMatches($firstTournamentId, 4);
                $topScorers = $this->buildTopScorersWithPlaceholders($firstTournamentId, 5);
                $goalsByMonth = $this->buildGoalsByMonth($firstTournamentId);
                $creatorTournamentRankings = $this->buildCreatorTournamentRankings($tournaments, 5);
            }

            $requestedTeamId = request()->integer('team_id') ?: null;
            if ($requestedTeamId) {
                $teamExists = Team::query()
                    ->where('id', $requestedTeamId)
                    ->whereHas('tournaments', function (Builder $relation) use ($firstTournamentId): void {
                        $relation->where('tournaments.id', $firstTournamentId);
                    })
                    ->exists();

                if ($teamExists) {
                    $selectedTeamId = $requestedTeamId;
                    $teamStatsByMonth = $this->buildTeamStatsByMonth($firstTournamentId, $selectedTeamId);
                }
            }

            $featured = $this->featuredAcceptedTournament($firstTournamentId);
            if ($featured) {
                $featuredTournament = [
                    'id' => $featured->id,
                    'name' => $featured->name,
                    'status' => $featured->status,
                ];
            }

            $chartStats = [
                'top_tournaments_by_goals' => $this->buildTopTournamentsByGoals($tournaments),
                'top_teams_by_goals' => $this->buildTopTeamsByGoals($firstTournamentId),
                'top_yellow_cards' => $this->buildTopPlayersByStat($firstTournamentId, 'yellow_card'),
                'top_red_cards' => $this->buildTopPlayersByStat($firstTournamentId, 'red_card'),
                'goals_by_week' => $this->buildGoalsByWeek(
                    Tournament::query()->where('id', $firstTournamentId)
                ),
                'top_matches_by_goals' => $this->buildTopMatchesByGoals(
                    Tournament::query()->where('id', $firstTournamentId)
                ),
            ];
        } elseif (! $isAdmin) {
            $topScorers = Player::query()
                ->select(['id', 'team_id', 'first_name', 'last_name', 'photo_path', 'position', 'number'])
                ->with('team:id,name,short_name,logo_path')
                ->whereIn('team_id', (clone $teams)->select('id'))
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->limit(5)
                ->get()
                ->map(fn (Player $player) => [
                    'id' => $player->id,
                    'team_id' => $player->team_id,
                    'first_name' => $player->first_name,
                    'last_name' => $player->last_name,
                    'photo_path' => $player->photo_path,
                    'goals' => 0,
                    'team' => $player->team,
                ])
                ->values();

            $tournamentsPreview = $this->buildTournamentPreviews(5, $tournaments);
        }

        if ($isAdmin) {
            $acceptedScope = Tournament::query()->where('approval_status', 'accepted');
            $tournamentsPreview = $this->buildTournamentPreviews(3, $acceptedScope);
        } else {
            $tournamentsPreview = $this->buildTournamentPreviews(5, $tournaments);
            if ($myTournamentCount > 1 && $creatorTournamentRankings === []) {
                $creatorTournamentRankings = $this->buildCreatorTournamentRankings($tournaments, 5);
            }
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
            'my_teams' => (clone $teamsInScope)->count(),
            'my_players' => Player::query()->whereIn('team_id', (clone $teamsInScope)->select('id'))->count(),
            'pending_requests' => (clone $requests)->where('status', 'pending')->count(),
            'join_requests' => (clone $requests)->count(),
            'matches' => (clone $matches)->count(),
            'confirmed_results' => (clone $matches)->where('result_status', 'confirmed')->count(),
        ];
        $mark('counts');

        $tournamentStatus = $this->groupedCounts((clone $tournaments), 'approval_status');
        $matchStatus = $this->groupedCounts((clone $matches), 'status');
        $resultStatus = $this->groupedCounts((clone $matches), 'result_status');

        $selectedTournamentProgress = null;
        if ($firstTournamentId !== null) {
            $selectedMatches = MatchGame::query()->where('tournament_id', $firstTournamentId);
            $selectedTournament = Tournament::query()->withCount('teams')->find($firstTournamentId);
            $selectedTournamentProgress = [
                'played' => (clone $selectedMatches)->where('status', 'played')->count(),
                'scheduled' => (clone $selectedMatches)->where('status', 'scheduled')->count(),
                'total' => (clone $selectedMatches)->count(),
                'teams_count' => (int) ($selectedTournament?->teams_count ?? 0),
            ];
        }
        $mark('statuses');

        $payload = [
            'user' => $user->only(['id', 'name', 'email', 'role', 'avatar_url']),
            'counts' => $counts,
            'tournament_status' => $tournamentStatus,
            'match_status' => $matchStatus,
            'result_status' => $resultStatus,
            'first_tournament_id' => $firstTournamentId,
            'selected_tournament_id' => $firstTournamentId,
            'tournament_options' => $tournamentOptions,
            'featured_tournament' => $featuredTournament,
            'ranking_preview' => $rankingPreview,
            'match_preview' => $matchPreview,
            'recent_matches' => $recentMatches,
            'top_scorers' => $topScorers,
            'goals_by_month' => $goalsByMonth,
            'team_stats_by_month' => $teamStatsByMonth,
            'selected_team_id' => $selectedTeamId,
            'tournaments_preview' => $tournamentsPreview,
            'creator_tournament_rankings' => $creatorTournamentRankings,
            'dashboard_view' => $dashboardView,
            'chart_stats' => $chartStats,
            'pending_tournaments' => $pendingTournaments,
            'selected_tournament_progress' => $selectedTournamentProgress,
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
