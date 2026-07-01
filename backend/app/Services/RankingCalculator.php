<?php

namespace App\Services;

class RankingCalculator
{
    private MatchResultRules $matchResultRules;

    public function __construct(?MatchResultRules $matchResultRules = null)
    {
        $this->matchResultRules = $matchResultRules ?? new MatchResultRules();
    }

    /**
     * @param array<int, array<string, mixed>|object> $teams
     * @param array<int, array<string, mixed>|object> $matches
     *
     * @return array<int, array<string, int>>
     */
    public function calculate(array $teams, array $matches): array
    {
        $rankings = [];

        foreach ($teams as $team) {
            $teamId = $this->intValue($team, 'id');

            if ($teamId === null) {
                continue;
            }

            $rankings[$teamId] = [
                'team_id' => $teamId,
                'played' => 0,
                'wins' => 0,
                'draws' => 0,
                'losses' => 0,
                'goals_for' => 0,
                'goals_against' => 0,
                'goal_difference' => 0,
                'points' => 0,
                '_team_name' => $this->stringValue($team, 'name') ?? '',
            ];
        }

        foreach ($matches as $match) {
            $matchData = $this->matchData($match);

            if (! $this->matchResultRules->isCountable($matchData)) {
                continue;
            }

            $homeTeamId = (int) $matchData['home_team_id'];
            $awayTeamId = (int) $matchData['away_team_id'];

            if (! isset($rankings[$homeTeamId], $rankings[$awayTeamId])) {
                continue;
            }

            $homeScore = (int) $matchData['home_score'];
            $awayScore = (int) $matchData['away_score'];

            $rankings[$homeTeamId]['played']++;
            $rankings[$awayTeamId]['played']++;

            $rankings[$homeTeamId]['goals_for'] += $homeScore;
            $rankings[$homeTeamId]['goals_against'] += $awayScore;
            $rankings[$awayTeamId]['goals_for'] += $awayScore;
            $rankings[$awayTeamId]['goals_against'] += $homeScore;

            if ($homeScore > $awayScore) {
                $rankings[$homeTeamId]['wins']++;
                $rankings[$homeTeamId]['points'] += 3;
                $rankings[$awayTeamId]['losses']++;
            } elseif ($homeScore < $awayScore) {
                $rankings[$awayTeamId]['wins']++;
                $rankings[$awayTeamId]['points'] += 3;
                $rankings[$homeTeamId]['losses']++;
            } else {
                $rankings[$homeTeamId]['draws']++;
                $rankings[$awayTeamId]['draws']++;
                $rankings[$homeTeamId]['points']++;
                $rankings[$awayTeamId]['points']++;
            }

            $rankings[$homeTeamId]['goal_difference'] =
                $rankings[$homeTeamId]['goals_for'] - $rankings[$homeTeamId]['goals_against'];
            $rankings[$awayTeamId]['goal_difference'] =
                $rankings[$awayTeamId]['goals_for'] - $rankings[$awayTeamId]['goals_against'];
        }

        usort($rankings, static function (array $first, array $second): int {
            return ($second['points'] <=> $first['points'])
                ?: ($second['goal_difference'] <=> $first['goal_difference'])
                ?: ($second['goals_for'] <=> $first['goals_for'])
                ?: strcmp((string) $first['_team_name'], (string) $second['_team_name'])
                ?: ($first['team_id'] <=> $second['team_id']);
        });

        return array_map(static function (array $ranking): array {
            unset($ranking['_team_name']);

            return $ranking;
        }, $rankings);
    }

    /**
     * @param array<string, mixed>|object $match
     *
     * @return array<string, mixed>
     */
    private function matchData(array|object $match): array
    {
        return [
            'home_team_id' => $this->intValue($match, 'home_team_id'),
            'away_team_id' => $this->intValue($match, 'away_team_id'),
            'home_score' => $this->value($match, 'home_score'),
            'away_score' => $this->value($match, 'away_score'),
            'status' => $this->value($match, 'status'),
            'result_status' => $this->value($match, 'result_status'),
        ];
    }

    private function intValue(array|object $item, string $key): ?int
    {
        $value = $this->value($item, $key);

        return $value === null ? null : (int) $value;
    }

    private function stringValue(array|object $item, string $key): ?string
    {
        $value = $this->value($item, $key);

        return $value === null ? null : (string) $value;
    }

    private function value(array|object $item, string $key): mixed
    {
        if (is_array($item)) {
            return $item[$key] ?? null;
        }

        return $item->{$key} ?? null;
    }
}
