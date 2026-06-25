<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\Composition;
use App\Models\MatchGame;
use App\Models\Statistic;
use App\Models\Team;
use Illuminate\Support\Facades\DB;

trait DeletesTeamSafely
{
    protected function deleteTeamSafely(Team $team): void
    {
        DB::transaction(function () use ($team) {
            $teamId = $team->id;

            $matchIds = MatchGame::query()
                ->where('home_team_id', $teamId)
                ->orWhere('away_team_id', $teamId)
                ->pluck('id');

            if ($matchIds->isNotEmpty()) {
                Composition::query()->whereIn('match_game_id', $matchIds)->delete();
                MatchGame::query()->whereIn('id', $matchIds)->delete();
            }

            Statistic::query()->where('team_id', $teamId)->delete();
            Composition::query()->where('team_id', $teamId)->delete();
            $team->rankings()->delete();
            $team->joinRequests()->delete();
            $team->tournaments()->detach();
            $team->players()->delete();
            $team->delete();
        });
    }
}
