<?php

namespace Tests\Unit;

use App\Services\RankingCalculator;
use PHPUnit\Framework\TestCase;

class RankingCalculatorTest extends TestCase
{
    private RankingCalculator $calculator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->calculator = new RankingCalculator();
    }

    public function test_win_gives_three_points_and_loss_gives_zero(): void
    {
        $rankings = $this->calculator->calculate(
            $this->teams(['Winner FC', 'Loser FC']),
            [$this->matchData(1, 2, 2, 0)]
        );

        $winner = $this->rankingFor($rankings, 1);
        $loser = $this->rankingFor($rankings, 2);

        $this->assertSame(3, $winner['points']);
        $this->assertSame(1, $winner['wins']);
        $this->assertSame(0, $winner['losses']);
        $this->assertSame(0, $loser['points']);
        $this->assertSame(0, $loser['wins']);
        $this->assertSame(1, $loser['losses']);
    }

    public function test_draw_gives_one_point_to_each_team(): void
    {
        $rankings = $this->calculator->calculate(
            $this->teams(['Home FC', 'Away FC']),
            [$this->matchData(1, 2, 1, 1)]
        );

        $this->assertSame(1, $this->rankingFor($rankings, 1)['points']);
        $this->assertSame(1, $this->rankingFor($rankings, 1)['draws']);
        $this->assertSame(1, $this->rankingFor($rankings, 2)['points']);
        $this->assertSame(1, $this->rankingFor($rankings, 2)['draws']);
    }

    public function test_goals_for_goals_against_and_goal_difference_are_calculated(): void
    {
        $rankings = $this->calculator->calculate(
            $this->teams(['Attack FC', 'Defense FC']),
            [$this->matchData(1, 2, 4, 2)]
        );

        $home = $this->rankingFor($rankings, 1);
        $away = $this->rankingFor($rankings, 2);

        $this->assertSame(4, $home['goals_for']);
        $this->assertSame(2, $home['goals_against']);
        $this->assertSame(2, $home['goal_difference']);
        $this->assertSame(2, $away['goals_for']);
        $this->assertSame(4, $away['goals_against']);
        $this->assertSame(-2, $away['goal_difference']);
    }

    public function test_pending_results_are_ignored(): void
    {
        $rankings = $this->calculator->calculate(
            $this->teams(['Confirmed FC', 'Pending FC']),
            [
                $this->matchData(1, 2, 1, 0),
                $this->matchData(2, 1, 8, 0, ['result_status' => 'pending']),
            ]
        );

        $confirmed = $this->rankingFor($rankings, 1);
        $pending = $this->rankingFor($rankings, 2);

        $this->assertSame(3, $confirmed['points']);
        $this->assertSame(1, $confirmed['goals_for']);
        $this->assertSame(0, $confirmed['goals_against']);
        $this->assertSame(0, $pending['points']);
        $this->assertSame(0, $pending['wins']);
    }

    public function test_disputed_results_are_ignored(): void
    {
        $rankings = $this->calculator->calculate(
            $this->teams(['Confirmed FC', 'Disputed FC']),
            [
                $this->matchData(1, 2, 2, 1),
                $this->matchData(2, 1, 7, 0, ['result_status' => 'disputed']),
            ]
        );

        $confirmed = $this->rankingFor($rankings, 1);
        $disputed = $this->rankingFor($rankings, 2);

        $this->assertSame(3, $confirmed['points']);
        $this->assertSame(2, $confirmed['goals_for']);
        $this->assertSame(1, $confirmed['goals_against']);
        $this->assertSame(0, $disputed['points']);
        $this->assertSame(1, $disputed['goals_for']);
        $this->assertSame(2, $disputed['goals_against']);
    }

    public function test_confirmed_results_are_counted(): void
    {
        $rankings = $this->calculator->calculate(
            $this->teams(['Home FC', 'Away FC']),
            [$this->matchData(1, 2, 3, 2, ['result_status' => 'confirmed'])]
        );

        $this->assertSame(1, $this->rankingFor($rankings, 1)['played']);
        $this->assertSame(3, $this->rankingFor($rankings, 1)['points']);
        $this->assertSame(1, $this->rankingFor($rankings, 2)['played']);
    }

    public function test_ranking_is_sorted_by_points_desc(): void
    {
        $rankings = $this->calculator->calculate(
            $this->teams(['Top Points FC', 'No Points FC']),
            [$this->matchData(1, 2, 1, 0)]
        );

        $this->assertSame([1, 2], array_column($rankings, 'team_id'));
    }

    public function test_ranking_is_sorted_by_goal_difference_when_points_are_equal(): void
    {
        $rankings = $this->calculator->calculate(
            $this->teams(['High Difference FC', 'Low Difference FC', 'Opponent FC']),
            [
                $this->matchData(1, 3, 3, 0),
                $this->matchData(2, 3, 1, 0),
            ]
        );

        $this->assertSame([1, 2, 3], array_column($rankings, 'team_id'));
        $this->assertSame(3, $rankings[0]['goal_difference']);
        $this->assertSame(1, $rankings[1]['goal_difference']);
    }

    public function test_ranking_is_sorted_by_goals_for_when_goal_difference_is_equal(): void
    {
        $rankings = $this->calculator->calculate(
            $this->teams(['More Goals FC', 'Fewer Goals FC', 'First Opponent FC', 'Second Opponent FC']),
            [
                $this->matchData(1, 3, 3, 1),
                $this->matchData(2, 4, 2, 0),
            ]
        );

        $this->assertSame([1, 2, 3, 4], array_column($rankings, 'team_id'));
        $this->assertSame(2, $rankings[0]['goal_difference']);
        $this->assertSame(2, $rankings[1]['goal_difference']);
        $this->assertSame(3, $rankings[0]['goals_for']);
        $this->assertSame(2, $rankings[1]['goals_for']);
    }

    public function test_same_input_returns_same_output(): void
    {
        $teams = $this->teams(['Atlas FC', 'Rabat FC', 'Casa FC']);
        $matches = [
            $this->matchData(1, 2, 2, 0),
            $this->matchData(3, 1, 1, 1),
        ];

        $this->assertSame(
            $this->calculator->calculate($teams, $matches),
            $this->calculator->calculate($teams, $matches)
        );
    }

    /**
     * @param array<int, string> $names
     *
     * @return array<int, array{id: int, name: string}>
     */
    private function teams(array $names): array
    {
        return array_map(
            static fn (string $name, int $index): array => [
                'id' => $index + 1,
                'name' => $name,
            ],
            $names,
            array_keys($names)
        );
    }

    /**
     * @param array<string, mixed> $overrides
     *
     * @return array<string, mixed>
     */
    private function matchData(
        int $homeTeamId,
        int $awayTeamId,
        int $homeScore,
        int $awayScore,
        array $overrides = []
    ): array {
        return [
            ...[
                'home_team_id' => $homeTeamId,
                'away_team_id' => $awayTeamId,
                'home_score' => $homeScore,
                'away_score' => $awayScore,
                'status' => 'played',
                'result_status' => 'confirmed',
            ],
            ...$overrides,
        ];
    }

    /**
     * @param array<int, array<string, int>> $rankings
     *
     * @return array<string, int>
     */
    private function rankingFor(array $rankings, int $teamId): array
    {
        foreach ($rankings as $ranking) {
            if ($ranking['team_id'] === $teamId) {
                return $ranking;
            }
        }

        self::fail("Ranking for team {$teamId} was not found.");
    }
}
