<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\MatchGame;
use App\Models\Player;
use App\Models\Ranking;
use App\Models\Statistic;
use App\Models\Tournament;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

trait BuildsDashboardWidgets
{
    /**
     * @return array<int, array{month: string, scored: int, conceded: int, yellow_cards: int, red_cards: int}>
     */
    protected function buildGoalsByMonth(int $tournamentId): array
    {
        $tournament = Tournament::query()->find($tournamentId);
        $start = $tournament?->start_date ? Carbon::parse((string) $tournament->start_date) : null;
        $end = $tournament?->end_date ? Carbon::parse((string) $tournament->end_date) : null;
        $matches = MatchGame::query()
            ->where('tournament_id', $tournamentId)
            ->where('result_status', 'confirmed')
            ->whereNotNull('match_date')
            ->whereNotNull('home_score')
            ->whereNotNull('away_score')
            ->get(['id', 'match_date', 'home_score', 'away_score']);

        $periods = $this->playCenteredMonthPeriods(
            $start,
            $end,
            $matches->pluck('match_date')->filter()->map(fn ($date) => (string) $date)->all(),
        );
        $buckets = [];

        foreach ($periods as $key => $meta) {
            $buckets[$key] = [
                'month' => $meta['month'],
                'period' => $meta['period'],
                'scored' => 0,
                'conceded' => 0,
                'yellow_cards' => 0,
                'red_cards' => 0,
            ];
        }

        foreach ($matches as $match) {
            $key = date('Y-n', strtotime((string) $match->match_date));
            if (! isset($buckets[$key])) {
                continue;
            }

            $totalGoals = (int) $match->home_score + (int) $match->away_score;
            $buckets[$key]['scored'] += $totalGoals;
            $buckets[$key]['conceded'] += $totalGoals;
        }

        $this->accumulateCardStatsByPeriod($tournamentId, null, $buckets);

        return array_values($buckets);
    }

    /**
     * @return array<int, array{month: string, goals_scored: int, goals_conceded: int, points: int, yellow_cards: int, red_cards: int}>
     */
    protected function buildTeamStatsByMonth(int $tournamentId, int $teamId): array
    {
        $tournament = Tournament::query()->find($tournamentId);
        $start = $tournament?->start_date ? Carbon::parse((string) $tournament->start_date) : null;
        $end = $tournament?->end_date ? Carbon::parse((string) $tournament->end_date) : null;

        $matches = MatchGame::query()
            ->where('tournament_id', $tournamentId)
            ->where('result_status', 'confirmed')
            ->whereNotNull('match_date')
            ->whereNotNull('home_score')
            ->whereNotNull('away_score')
            ->where(function ($query) use ($teamId) {
                $query->where('home_team_id', $teamId)->orWhere('away_team_id', $teamId);
            })
            ->get(['id', 'match_date', 'home_team_id', 'away_team_id', 'home_score', 'away_score']);

        $periods = $this->playCenteredMonthPeriods(
            $start,
            $end,
            $matches->pluck('match_date')->filter()->map(fn ($date) => (string) $date)->all(),
        );
        $buckets = [];

        foreach ($periods as $key => $meta) {
            $buckets[$key] = [
                'month' => $meta['month'],
                'period' => $meta['period'],
                'goals_scored' => 0,
                'goals_conceded' => 0,
                'points' => 0,
                'yellow_cards' => 0,
                'red_cards' => 0,
            ];
        }

        foreach ($matches as $match) {
            $key = date('Y-n', strtotime((string) $match->match_date));
            if (! isset($buckets[$key])) {
                continue;
            }

            $isHome = (int) $match->home_team_id === $teamId;
            $scored = $isHome ? (int) $match->home_score : (int) $match->away_score;
            $conceded = $isHome ? (int) $match->away_score : (int) $match->home_score;

            $buckets[$key]['goals_scored'] += $scored;
            $buckets[$key]['goals_conceded'] += $conceded;

            if ($scored > $conceded) {
                $buckets[$key]['points'] += 3;
            } elseif ($scored === $conceded) {
                $buckets[$key]['points'] += 1;
            }
        }

        $this->accumulateCardStatsByPeriod($tournamentId, $teamId, $buckets);

        return array_values($buckets);
    }

    /**
     * @param array<string, array<string, mixed>> $buckets
     */
    private function accumulateCardStatsByPeriod(int $tournamentId, ?int $teamId, array &$buckets): void
    {
        $query = Statistic::query()
            ->select(['statistics.stat_type', 'statistics.value', 'match_games.match_date'])
            ->join('match_games', 'match_games.id', '=', 'statistics.match_game_id')
            ->where('match_games.tournament_id', $tournamentId)
            ->where('match_games.result_status', 'confirmed')
            ->whereIn('statistics.stat_type', ['yellow_card', 'red_card']);

        if ($teamId !== null) {
            $query->where('statistics.team_id', $teamId);
        }

        foreach ($query->get() as $row) {
            $key = date('Y-n', strtotime((string) $row->match_date));
            if (! isset($buckets[$key])) {
                continue;
            }

            if ($row->stat_type === 'yellow_card') {
                $buckets[$key]['yellow_cards'] += (int) $row->value;
            }

            if ($row->stat_type === 'red_card') {
                $buckets[$key]['red_cards'] += (int) $row->value;
            }
        }
    }

    /**
     * @param array<int, string> $matchDates
     * @return array<string, array{month: string, period: string}>
     */
    private function playCenteredMonthPeriods(
        ?Carbon $tournamentStart,
        ?Carbon $tournamentEnd,
        array $matchDates,
        int $marginBefore = 2,
        int $marginAfter = 2,
    ): array {
        $labels = $this->monthLabels();
        $activityStart = null;
        $activityEnd = null;

        foreach ($matchDates as $date) {
            $parsed = Carbon::parse($date)->startOfMonth();
            $activityStart = $activityStart ? $activityStart->min($parsed) : $parsed->copy();
            $activityEnd = $activityEnd ? $activityEnd->max($parsed) : $parsed->copy();
        }

        $baseStart = $tournamentStart?->copy()->startOfMonth();
        $baseEnd = ($tournamentEnd ?? $tournamentStart)?->copy()->startOfMonth();

        if ($activityStart !== null && $baseStart !== null) {
            $rangeStart = $activityStart->lt($baseStart) ? $activityStart : $baseStart;
        } elseif ($activityStart !== null) {
            $rangeStart = $activityStart;
        } elseif ($baseStart !== null) {
            $rangeStart = $baseStart;
        } else {
            return [];
        }

        if ($activityEnd !== null && $baseEnd !== null) {
            $rangeEnd = $activityEnd->gt($baseEnd) ? $activityEnd : $baseEnd;
        } elseif ($activityEnd !== null) {
            $rangeEnd = $activityEnd;
        } else {
            $rangeEnd = $baseEnd ?? $rangeStart->copy();
        }

        $cursor = $rangeStart->copy()->subMonths($marginBefore)->startOfMonth();
        $endMonth = $rangeEnd->copy()->addMonths($marginAfter)->startOfMonth();
        $periods = [];

        while ($cursor <= $endMonth) {
            $month = (int) $cursor->format('n');
            $year = (int) $cursor->format('Y');
            $key = $cursor->format('Y-n');
            $short = $labels[$month] ?? $cursor->format('M');
            $periods[$key] = [
                'month' => $short,
                'period' => $short.' '.$year,
            ];
            $cursor->addMonth();
        }

        return $periods;
    }

    /**
     * @return array<string, array{month: string, period: string}>
     */
    private function tournamentMonthPeriods(?Carbon $start, ?Carbon $end): array
    {
        return $this->playCenteredMonthPeriods($start, $end, []);
    }

    /**
     * @param array<int, array<string, int>> $buckets
     */
    private function accumulateCardStats(int $tournamentId, ?int $teamId, array &$buckets): void
    {
        $query = Statistic::query()
            ->select(['statistics.stat_type', 'statistics.value', 'match_games.match_date'])
            ->join('match_games', 'match_games.id', '=', 'statistics.match_game_id')
            ->where('match_games.tournament_id', $tournamentId)
            ->where('match_games.result_status', 'confirmed')
            ->whereIn('statistics.stat_type', ['yellow_card', 'red_card']);

        if ($teamId !== null) {
            $query->where('statistics.team_id', $teamId);
        }

        foreach ($query->get() as $row) {
            $month = (int) date('n', strtotime((string) $row->match_date));
            if ($month < 1 || $month > 12 || ! isset($buckets[$month])) {
                continue;
            }

            if ($row->stat_type === 'yellow_card') {
                $buckets[$month]['yellow_cards'] += (int) $row->value;
            }

            if ($row->stat_type === 'red_card') {
                $buckets[$month]['red_cards'] += (int) $row->value;
            }
        }
    }

    /**
     * @param array<int, string> $monthLabels
     * @param array<int, array<string, int>> $buckets
     * @return array<int, array{month: string, scored: int, conceded: int, yellow_cards: int, red_cards: int}>
     */
    private function formatMonthlyBuckets(array $monthLabels, array $buckets): array
    {
        $result = [];
        foreach ($monthLabels as $index => $label) {
            $result[] = [
                'month' => $label,
                'scored' => $buckets[$index]['scored'],
                'conceded' => $buckets[$index]['conceded'],
                'yellow_cards' => $buckets[$index]['yellow_cards'],
                'red_cards' => $buckets[$index]['red_cards'],
            ];
        }

        return $result;
    }

    /**
     * @return array<int, string>
     */
    private function monthLabels(): array
    {
        return [
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr', 5 => 'Mai', 6 => 'Jun',
            7 => 'Jul', 8 => 'Aoû', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc',
        ];
    }

    /**
     * @return array<int, array{scored: int, conceded: int, yellow_cards: int, red_cards: int}>
     */
    private function emptyMonthlyGoalBuckets(): array
    {
        $buckets = [];

        for ($month = 1; $month <= 12; $month++) {
            $buckets[$month] = [
                'scored' => 0,
                'conceded' => 0,
                'yellow_cards' => 0,
                'red_cards' => 0,
            ];
        }

        return $buckets;
    }

    /**
     * @return array<int, array{goals_scored: int, goals_conceded: int, points: int, yellow_cards: int, red_cards: int}>
     */
    private function emptyMonthlyTeamBuckets(): array
    {
        $buckets = [];

        for ($month = 1; $month <= 12; $month++) {
            $buckets[$month] = [
                'goals_scored' => 0,
                'goals_conceded' => 0,
                'points' => 0,
                'yellow_cards' => 0,
                'red_cards' => 0,
            ];
        }

        return $buckets;
    }

    protected function buildTopScorers(int $tournamentId, int $limit = 5): Collection
    {
        return Player::query()
            ->select(['id', 'team_id', 'first_name', 'last_name', 'photo_path', 'position', 'number'])
            ->with('team:id,name,short_name,logo_path')
            ->whereHas('team.tournaments', function (Builder $relation) use ($tournamentId) {
                $relation->where('tournaments.id', $tournamentId);
            })
            ->withSum(['statistics as goals' => function (Builder $stats) {
                $stats->where('stat_type', 'goal');
            }], 'value')
            ->orderByDesc('goals')
            ->orderBy('last_name')
            ->limit($limit)
            ->get()
            ->map(function (Player $player) {
                return [
                    'id' => $player->id,
                    'team_id' => $player->team_id,
                    'first_name' => $player->first_name,
                    'last_name' => $player->last_name,
                    'photo_path' => $player->photo_path,
                    'goals' => (int) ($player->goals ?? 0),
                    'team' => $player->team,
                ];
            })
            ->filter(fn (array $player) => $player['goals'] > 0)
            ->values();
    }

    protected function buildTopScorersWithPlaceholders(int $tournamentId, int $limit = 5): Collection
    {
        $scorers = $this->buildTopScorers($tournamentId, $limit);

        if ($scorers->isNotEmpty()) {
            return $scorers;
        }

        return Player::query()
            ->select(['id', 'team_id', 'first_name', 'last_name', 'photo_path', 'position', 'number'])
            ->with('team:id,name,short_name,logo_path')
            ->whereHas('team.tournaments', function (Builder $relation) use ($tournamentId) {
                $relation->where('tournaments.id', $tournamentId);
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit($limit)
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
    }

    protected function buildRankingPreview(int $tournamentId, int $limit = 10): Collection
    {
        return Ranking::query()
            ->select(['id', 'tournament_id', 'team_id', 'played', 'wins', 'draws', 'losses', 'goals_for', 'goals_against', 'goal_difference', 'points'])
            ->with('team:id,name,short_name,logo_path')
            ->where('tournament_id', $tournamentId)
            ->orderByDesc('points')
            ->orderByDesc('goal_difference')
            ->orderByDesc('goals_for')
            ->limit($limit)
            ->get();
    }

    protected function buildRecentMatches(int $tournamentId, int $limit = 4): Collection
    {
        return MatchGame::query()
            ->select(['id', 'tournament_id', 'home_team_id', 'away_team_id', 'match_date', 'home_score', 'away_score', 'status', 'result_status'])
            ->with([
                'homeTeam:id,name,short_name,logo_path',
                'awayTeam:id,name,short_name,logo_path',
            ])
            ->where('tournament_id', $tournamentId)
            ->orderByDesc('match_date')
            ->limit($limit)
            ->get();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function buildTournamentPreviews(int $limit = 3, ?Builder $scope = null): array
    {
        $query = $scope ?? Tournament::query();
        $tournamentIds = (clone $query)->pluck('id');

        $goalTotals = [];
        if ($tournamentIds->isNotEmpty()) {
            $goalTotals = MatchGame::query()
                ->selectRaw('tournament_id, SUM(COALESCE(home_score, 0) + COALESCE(away_score, 0)) as total_goals')
                ->whereIn('tournament_id', $tournamentIds)
                ->where('result_status', 'confirmed')
                ->groupBy('tournament_id')
                ->pluck('total_goals', 'tournament_id')
                ->map(fn ($total) => (int) $total)
                ->all();
        }

        return (clone $query)
            ->select(['id', 'name', 'banner_path', 'status', 'approval_status', 'start_date', 'end_date'])
            ->withCount('teams')
            ->latest('id')
            ->limit($limit)
            ->get()
            ->map(fn (Tournament $tournament) => [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'banner_path' => $tournament->banner_path,
                'status' => $tournament->status,
                'approval_status' => $tournament->approval_status,
                'team_count' => (int) $tournament->teams_count,
                'start_date' => $tournament->start_date,
                'end_date' => $tournament->end_date,
                'total_goals' => $goalTotals[$tournament->id] ?? 0,
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function buildCreatorTournamentRankings(Builder $tournamentsQuery, int $limit = 5): array
    {
        $tournamentIds = (clone $tournamentsQuery)->pluck('id');

        if ($tournamentIds->isEmpty()) {
            return [];
        }

        $goalTotals = MatchGame::query()
            ->selectRaw('tournament_id, SUM(COALESCE(home_score, 0) + COALESCE(away_score, 0)) as total_goals')
            ->whereIn('tournament_id', $tournamentIds)
            ->where('result_status', 'confirmed')
            ->groupBy('tournament_id')
            ->pluck('total_goals', 'tournament_id');

        return Tournament::query()
            ->select(['id', 'name', 'banner_path', 'status', 'approval_status', 'start_date', 'end_date'])
            ->whereIn('id', $tournamentIds)
            ->withCount('teams')
            ->get()
            ->map(fn (Tournament $tournament) => [
                'id' => $tournament->id,
                'name' => $tournament->name,
                'banner_path' => $tournament->banner_path,
                'status' => $tournament->status,
                'approval_status' => $tournament->approval_status,
                'team_count' => (int) $tournament->teams_count,
                'start_date' => $tournament->start_date,
                'end_date' => $tournament->end_date,
                'total_goals' => (int) ($goalTotals[$tournament->id] ?? 0),
            ])
            ->sortByDesc('total_goals')
            ->take($limit)
            ->values()
            ->all();
    }

    protected function featuredAcceptedTournament(?int $preferredId = null): ?Tournament
    {
        if ($preferredId !== null) {
            $preferred = Tournament::query()
                ->whereKey($preferredId)
                ->where('approval_status', 'accepted')
                ->first();

            if ($preferred) {
                return $preferred;
            }
        }

        return Tournament::query()
            ->where('approval_status', 'accepted')
            ->orderBy('id')
            ->first();
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    protected function buildTopTeamsByGoals(int $tournamentId, int $limit = 6): array
    {
        return Ranking::query()
            ->with('team:id,name,short_name,logo_path')
            ->where('tournament_id', $tournamentId)
            ->orderByDesc('goals_for')
            ->limit($limit)
            ->get()
            ->map(fn (Ranking $ranking) => [
                'label' => $ranking->team?->short_name ?: ($ranking->team?->name ?? 'Équipe'),
                'value' => (int) $ranking->goals_for,
                'image_url' => $ranking->team?->logo_path,
            ])
            ->filter(fn (array $row) => $row['value'] > 0)
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    protected function buildTopTournamentsByGoals(Builder $tournamentsQuery, int $limit = 6): array
    {
        $tournamentIds = (clone $tournamentsQuery)->pluck('id');

        if ($tournamentIds->isEmpty()) {
            return [];
        }

        $rows = MatchGame::query()
            ->selectRaw('tournament_id, SUM(COALESCE(home_score, 0) + COALESCE(away_score, 0)) as total_goals')
            ->whereIn('tournament_id', $tournamentIds)
            ->where('result_status', 'confirmed')
            ->groupBy('tournament_id')
            ->orderByDesc('total_goals')
            ->limit($limit)
            ->get();

        $names = Tournament::query()->whereIn('id', $rows->pluck('tournament_id'))->pluck('name', 'id');

        return $rows
            ->map(fn ($row) => [
                'label' => (string) ($names[$row->tournament_id] ?? 'Tournoi'),
                'value' => (int) $row->total_goals,
            ])
            ->filter(fn (array $item) => $item['value'] > 0)
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    protected function buildTopPlayersByStat(int $tournamentId, string $statType, int $limit = 6): array
    {
        return Player::query()
            ->select(['id', 'first_name', 'last_name'])
            ->whereHas('team.tournaments', function (Builder $relation) use ($tournamentId) {
                $relation->where('tournaments.id', $tournamentId);
            })
            ->withSum(['statistics as total' => function (Builder $stats) use ($statType) {
                $stats->where('stat_type', $statType);
            }], 'value')
            ->orderByDesc('total')
            ->limit($limit)
            ->get()
            ->map(fn (Player $player) => [
                'label' => trim("{$player->first_name} {$player->last_name}"),
                'value' => (int) ($player->total ?? 0),
            ])
            ->filter(fn (array $row) => $row['value'] > 0)
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{month: string, scored: int, conceded: int}>
     */
    protected function buildGoalsByMonthForTournaments(Builder $tournamentsQuery): array
    {
        $monthLabels = [
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr', 5 => 'Mai', 6 => 'Jun',
            7 => 'Jul', 8 => 'Aoû', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc',
        ];

        $buckets = $this->emptyMonthlyGoalBuckets();
        $tournamentIds = (clone $tournamentsQuery)->pluck('id');

        if ($tournamentIds->isEmpty()) {
            return array_map(fn (string $label) => ['month' => $label, 'scored' => 0, 'conceded' => 0], $monthLabels);
        }

        $matches = MatchGame::query()
            ->whereIn('tournament_id', $tournamentIds)
            ->where('result_status', 'confirmed')
            ->whereNotNull('match_date')
            ->whereNotNull('home_score')
            ->whereNotNull('away_score')
            ->get(['match_date', 'home_score', 'away_score']);

        foreach ($matches as $match) {
            $month = (int) date('n', strtotime((string) $match->match_date));
            if ($month < 1 || $month > 12) {
                continue;
            }

            $totalGoals = (int) $match->home_score + (int) $match->away_score;
            $buckets[$month]['scored'] += $totalGoals;
            $buckets[$month]['conceded'] += $totalGoals;
        }

        $result = [];
        foreach ($monthLabels as $index => $label) {
            $result[] = [
                'month' => $label,
                'scored' => $buckets[$index]['scored'],
                'conceded' => $buckets[$index]['conceded'],
            ];
        }

        return $result;
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    protected function buildGoalsByWeek(Builder $tournamentsQuery, int $weekLimit = 8): array
    {
        $tournamentIds = (clone $tournamentsQuery)->pluck('id');

        if ($tournamentIds->isEmpty()) {
            return [];
        }

        $buckets = [];

        $matches = MatchGame::query()
            ->whereIn('tournament_id', $tournamentIds)
            ->where('result_status', 'confirmed')
            ->whereNotNull('match_date')
            ->whereNotNull('home_score')
            ->whereNotNull('away_score')
            ->orderBy('match_date')
            ->get(['match_date', 'home_score', 'away_score']);

        foreach ($matches as $match) {
            $timestamp = strtotime((string) $match->match_date);
            if ($timestamp === false) {
                continue;
            }

            $weekKey = date('o-\WW', $timestamp);
            $weekLabel = 'S'.date('W', $timestamp);

            if (! isset($buckets[$weekKey])) {
                $buckets[$weekKey] = ['label' => $weekLabel, 'value' => 0, 'sort' => (int) date('oW', $timestamp)];
            }

            $buckets[$weekKey]['value'] += (int) $match->home_score + (int) $match->away_score;
        }

        if ($buckets === []) {
            return [];
        }

        return collect($buckets)
            ->sortBy('sort')
            ->take(-$weekLimit)
            ->values()
            ->map(fn (array $row) => ['label' => $row['label'], 'value' => $row['value']])
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    protected function buildTopMatchesByGoals(Builder $tournamentsQuery, int $limit = 6): array
    {
        $tournamentIds = (clone $tournamentsQuery)->pluck('id');

        if ($tournamentIds->isEmpty()) {
            return [];
        }

        return MatchGame::query()
            ->select(['id', 'home_team_id', 'away_team_id', 'home_score', 'away_score'])
            ->with([
                'homeTeam:id,name,short_name,logo_path',
                'awayTeam:id,name,short_name,logo_path',
            ])
            ->whereIn('tournament_id', $tournamentIds)
            ->where('result_status', 'confirmed')
            ->whereNotNull('home_score')
            ->whereNotNull('away_score')
            ->get()
            ->map(function (MatchGame $match) {
                $home = $match->homeTeam?->short_name ?: ($match->homeTeam?->name ?? '—');
                $away = $match->awayTeam?->short_name ?: ($match->awayTeam?->name ?? '—');

                return [
                    'label' => "#{$match->id} {$home} vs {$away}",
                    'value' => (int) $match->home_score + (int) $match->away_score,
                    'image_url' => $match->homeTeam?->logo_path,
                    'image_url_secondary' => $match->awayTeam?->logo_path,
                ];
            })
            ->sortByDesc('value')
            ->take($limit)
            ->values()
            ->all();
    }

    protected function buildRecentMatchesForTournaments(Builder $tournamentsQuery, int $limit = 4): Collection
    {
        $tournamentIds = (clone $tournamentsQuery)->pluck('id');

        if ($tournamentIds->isEmpty()) {
            return collect();
        }

        return MatchGame::query()
            ->select(['id', 'tournament_id', 'home_team_id', 'away_team_id', 'match_date', 'home_score', 'away_score', 'status', 'result_status'])
            ->with([
                'homeTeam:id,name,short_name,logo_path',
                'awayTeam:id,name,short_name,logo_path',
            ])
            ->whereIn('tournament_id', $tournamentIds)
            ->orderByDesc('match_date')
            ->limit($limit)
            ->get();
    }
}
