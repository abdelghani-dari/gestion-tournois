<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait FiltersTeamsAndPlayers
{
    protected function applyTeamFilters(Builder $query, Request $request): Builder
    {
        if ($request->filled('tournament_id')) {
            $tournamentId = (int) $request->input('tournament_id');
            $query->whereHas('tournaments', function (Builder $relation) use ($tournamentId) {
                $relation->where('tournaments.id', $tournamentId);
            });
        }

        if ($request->filled('manager_id')) {
            $query->where('manager_id', (int) $request->input('manager_id'));
        }

        if ($request->filled('search')) {
            $term = '%'.mb_strtolower(trim((string) $request->input('search'))).'%';
            $query->where(function (Builder $builder) use ($term) {
                $builder
                    ->whereRaw('LOWER(name) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(short_name, \'\')) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(city, \'\')) LIKE ?', [$term]);
            });
        }

        return $query;
    }

    protected function applyPlayerFilters(Builder $query, Request $request): Builder
    {
        if ($request->filled('team_id')) {
            $query->where('team_id', (int) $request->input('team_id'));
        }

        if ($request->filled('tournament_id')) {
            $tournamentId = (int) $request->input('tournament_id');
            $query->whereHas('team.tournaments', function (Builder $relation) use ($tournamentId) {
                $relation->where('tournaments.id', $tournamentId);
            });
        }

        if ($request->filled('manager_id')) {
            $managerId = (int) $request->input('manager_id');
            $query->whereHas('team', function (Builder $teamQuery) use ($managerId) {
                $teamQuery->where('manager_id', $managerId);
            });
        }

        if ($request->filled('search')) {
            $term = '%'.mb_strtolower(trim((string) $request->input('search'))).'%';
            $query->where(function (Builder $builder) use ($term) {
                $builder
                    ->whereRaw('LOWER(first_name) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(last_name) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(position, \'\')) LIKE ?', [$term])
                    ->orWhereRaw('CAST(number AS TEXT) LIKE ?', [$term])
                    ->orWhereHas('team', function (Builder $teamQuery) use ($term) {
                        $teamQuery->whereRaw('LOWER(name) LIKE ?', [$term]);
                    });
            });
        }

        return $query;
    }

    protected function withPlayerStatTotals(Builder $query): Builder
    {
        return $query
            ->withSum(['statistics as goals' => function (Builder $stats) {
                $stats->where('stat_type', 'goal');
            }], 'value')
            ->withSum(['statistics as assists' => function (Builder $stats) {
                $stats->where('stat_type', 'assist');
            }], 'value');
    }
}
