<?php

namespace Database\Seeders\Concerns;

use App\Models\Team;
use Illuminate\Support\Carbon;

trait SeedsLeagueFixtures
{
    /**
     * @return array<int, array<int, array{0: int, 1: int}>>
     */
    protected function buildRoundRobinGameweeks(int $teamCount): array
    {
        $teams = range(0, $teamCount - 1);

        if ($teamCount % 2 === 1) {
            $teams[] = -1;
            $teamCount++;
        }

        $rounds = $teamCount - 1;
        $half = (int) ($teamCount / 2);
        $firstLeg = [];

        for ($round = 0; $round < $rounds; $round++) {
            $week = [];

            for ($i = 0; $i < $half; $i++) {
                $home = $teams[$i];
                $away = $teams[$teamCount - 1 - $i];

                if ($home === -1 || $away === -1) {
                    continue;
                }

                $week[] = $round % 2 === 0 ? [$home, $away] : [$away, $home];
            }

            $firstLeg[] = $week;
            $last = array_pop($teams);
            array_splice($teams, 1, 0, [$last]);
        }

        // Generate second leg (swapping home and away)
        $secondLeg = [];
        foreach ($firstLeg as $week) {
            $reversedWeek = [];
            foreach ($week as $match) {
                $reversedWeek[] = [$match[1], $match[0]];
            }
            $secondLeg[] = $reversedWeek;
        }

        return array_merge($firstLeg, $secondLeg);
    }

    /**
     * @param array<int, Team> $teams
     */
    protected function findRajaTeam(array $teams): ?Team
    {
        foreach ($teams as $team) {
            if (stripos($team->name, 'Raja') !== false) {
                return $team;
            }
        }

        return null;
    }

    /**
     * @param array<int, Team> $teams
     */
    protected function findDcheiraTeam(array $teams): ?Team
    {
        foreach ($teams as $team) {
            if (stripos($team->name, 'Dcheira') !== false) {
                return $team;
            }
        }

        return null;
    }

    /**
     * @return array{0: int, 1: int}
     */
    protected function generateMatchScores(
        Team $home,
        Team $away,
        ?Team $rajaTeam = null,
        ?Team $dcheiraTeam = null,
    ): array {
        $rajaId = $rajaTeam?->id;
        $dcheiraId = $dcheiraTeam?->id;
        $homeIsRaja = $rajaId !== null && (int) $home->id === $rajaId;
        $awayIsRaja = $rajaId !== null && (int) $away->id === $rajaId;
        $homeIsDcheira = $dcheiraId !== null && (int) $home->id === $dcheiraId;
        $awayIsDcheira = $dcheiraId !== null && (int) $away->id === $dcheiraId;

        // Deterministic seed based on team IDs
        $seed = ($home->id * 17) + ($away->id * 23);

        if (($homeIsRaja && $awayIsDcheira) || ($homeIsDcheira && $awayIsRaja)) {
            return $homeIsRaja
                ? [2 + ($seed % 2), $seed % 2]
                : [$seed % 2, 2 + ($seed % 2)];
        }

        if ($homeIsRaja || $awayIsRaja) {
            return $homeIsRaja
                ? [2 + ($seed % 3), $seed % 2]
                : [$seed % 2, 2 + ($seed % 3)];
        }

        if ($homeIsDcheira || $awayIsDcheira) {
            $roll = $seed % 100;

            if ($roll < 52) {
                return $homeIsDcheira
                    ? [2 + ($seed % 2), $seed % 2]
                    : [$seed % 2, 2 + ($seed % 2)];
            }

            if ($roll < 72) {
                $draw = $seed % 3;
                return [$draw, $draw];
            }

            return $homeIsDcheira
                ? [$seed % 2, 2 + ($seed % 2)]
                : [2 + ($seed % 2), $seed % 2];
        }

        $homeScore = $seed % 4;
        $awayScore = ($seed >> 2) % 4;

        if ($homeScore === $awayScore && ($seed % 2 === 1)) {
            $homeScore = min(4, $homeScore + 1);
        }

        return [$homeScore, $awayScore];
    }

    protected function gameweekMatchDate(
        Carbon $startDate,
        Carbon $endDate,
        int $gameweekIndex,
        int $slotInWeek,
        int $totalGameweeks = 30
    ): string {
        $totalDays = max(1, (int) $startDate->diffInDays($endDate));
        // Spread the gameweeks evenly across the total number of days
        $dayOffset = (int) floor(($gameweekIndex * $totalDays) / max(1, $totalGameweeks));
        $dayOffset = min($dayOffset, $totalDays - 1);

        // Add slot-based day offset within the week
        $slotDayOffset = $slotInWeek % 3;

        $hour = 15 + ($slotInWeek % 4);

        return $startDate->copy()
            ->addDays($dayOffset)
            ->addDays($slotDayOffset)
            ->setTime($hour, ($slotInWeek % 2) * 30)
            ->toDateTimeString();
    }
}
