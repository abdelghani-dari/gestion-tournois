<?php

namespace Database\Seeders\Concerns;

use App\Models\Composition;
use App\Models\MatchGame;
use App\Models\Player;
use App\Models\Statistic;
use App\Models\Team;

trait SeedsRealisticMatchStatistics
{
    /**
     * @param array<int, array<int, Player>> $playersByTeam
     */
    protected function createStatistics(
        MatchGame $match,
        Team $home,
        Team $away,
        int $homeScore,
        int $awayScore,
        array $playersByTeam,
    ): void {
        $this->distributeTeamGoals($match, $home, $playersByTeam[$home->id] ?? [], $homeScore);
        $this->distributeTeamGoals($match, $away, $playersByTeam[$away->id] ?? [], $awayScore);

        $this->distributeCards($match, $home, $playersByTeam[$home->id] ?? []);
        $this->distributeCards($match, $away, $playersByTeam[$away->id] ?? []);

        if ($awayScore === 0 && isset($playersByTeam[$home->id][0])) {
            $this->createStat($match, $home, $playersByTeam[$home->id][0], 'clean_sheet', 1);
        }

        if ($homeScore === 0 && isset($playersByTeam[$away->id][0])) {
            $this->createStat($match, $away, $playersByTeam[$away->id][0], 'clean_sheet', 1);
        }
    }

    /**
     * @param array<int, Player> $players
     */
    private function distributeTeamGoals(MatchGame $match, Team $team, array $players, int $goalCount): void
    {
        if ($goalCount <= 0 || $players === []) {
            return;
        }

        $outfield = array_values(array_filter($players, fn (Player $player) => ($player->position ?? '') !== 'GK'));
        if ($outfield === []) {
            $outfield = $players;
        }

        for ($i = 0; $i < $goalCount; $i++) {
            $scorerIndex = ($match->id + $i + $team->id) % count($outfield);
            $scorer = $outfield[$scorerIndex];
            $this->createStat($match, $team, $scorer, 'goal', 1);

            $assistCandidates = array_values(array_filter(
                $outfield,
                fn (Player $player) => (int) $player->id !== (int) $scorer->id,
            ));

            if ($assistCandidates !== []) {
                $assisterIndex = ($match->id + $i + $scorer->id) % count($assistCandidates);
                $assister = $assistCandidates[$assisterIndex];
                $this->createStat($match, $team, $assister, 'assist', 1);
            }
        }
    }

    /**
     * @param array<int, Player> $players
     */
    private function distributeCards(MatchGame $match, Team $team, array $players): void
    {
        if ($players === []) {
            return;
        }

        $outfield = array_values(array_filter($players, fn (Player $player) => ($player->position ?? '') !== 'GK'));
        if ($outfield === []) {
            $outfield = $players;
        }

        // Deterministic yellow card count (0, 1, or 2) — lower than before
        $yellowCount = ($match->id + $team->id) % 3;
        for ($i = 0; $i < $yellowCount; $i++) {
            $yellowPlayerIndex = ($match->id + $i + 13) % count($outfield);
            $this->createStat($match, $team, $outfield[$yellowPlayerIndex], 'yellow_card', 1);
        }

        // Deterministic red card: ~6.67% chance (1 out of 15)
        if (($match->id + $team->id) % 15 === 7) {
            $redPlayerIndex = ($match->id + 42) % count($outfield);
            $this->createStat($match, $team, $outfield[$redPlayerIndex], 'red_card', 1);
        }
    }

    private function createStat(MatchGame $match, Team $team, Player $player, string $type, int $value): void
    {
        if ($value <= 0) {
            return;
        }

        Statistic::create([
            'match_game_id' => $match->id,
            'team_id' => $team->id,
            'player_id' => $player->id,
            'stat_type' => $type,
            'value' => $value,
        ]);
    }

    /**
     * @param array<int, array<int, Player>> $playersByTeam
     */
    protected function createCompositions(MatchGame $match, Team $home, Team $away, array $playersByTeam): void
    {
        foreach ([$home, $away] as $team) {
            foreach ($playersByTeam[$team->id] ?? [] as $player) {
                Composition::create([
                    'match_game_id' => $match->id,
                    'team_id' => $team->id,
                    'player_id' => $player->id,
                    'role' => 'starter',
                ]);
            }
        }
    }
}
