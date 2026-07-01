<?php

namespace Tests\Unit;

use App\Services\StatisticRules;
use PHPUnit\Framework\TestCase;

class StatisticRulesTest extends TestCase
{
    private StatisticRules $rules;

    protected function setUp(): void
    {
        parent::setUp();

        $this->rules = new StatisticRules();
    }

    public function test_goal_is_an_allowed_type(): void
    {
        $this->assertTrue($this->rules->isAllowedType('goal'));
    }

    public function test_assist_is_an_allowed_type(): void
    {
        $this->assertTrue($this->rules->isAllowedType('assist'));
    }

    public function test_yellow_card_is_an_allowed_type(): void
    {
        $this->assertTrue($this->rules->isAllowedType('yellow_card'));
    }

    public function test_red_card_is_an_allowed_type(): void
    {
        $this->assertTrue($this->rules->isAllowedType('red_card'));
    }

    public function test_clean_sheet_is_an_allowed_type(): void
    {
        $this->assertTrue($this->rules->isAllowedType('clean_sheet'));
    }

    public function test_invalid_stat_type_is_rejected(): void
    {
        $this->assertFalse($this->rules->isAllowedType('offside'));
    }

    public function test_goal_assist_yellow_card_and_red_card_require_player_id(): void
    {
        foreach (['goal', 'assist', 'yellow_card', 'red_card'] as $statType) {
            $this->assertTrue($this->rules->requiresPlayer($statType));
            $this->assertSame(
                'The player field is required for this statistic type.',
                $this->rules->validateContext($this->matchData(), [
                    'team_id' => 1,
                    'player_id' => null,
                    'stat_type' => $statType,
                    'value' => 1,
                ])
            );
        }
    }

    public function test_clean_sheet_does_not_require_player_id(): void
    {
        $this->assertFalse($this->rules->requiresPlayer('clean_sheet'));
        $this->assertNull($this->rules->validateContext($this->matchData(), [
            'team_id' => 1,
            'player_id' => null,
            'stat_type' => 'clean_sheet',
            'value' => 1,
        ]));
    }

    public function test_value_must_be_positive_integer(): void
    {
        $this->assertTrue($this->rules->isValueValid(1));
        $this->assertFalse($this->rules->isValueValid(0));
        $this->assertFalse($this->rules->isValueValid(-1));
        $this->assertFalse($this->rules->isValueValid(1.5));
    }

    public function test_player_must_belong_to_selected_team(): void
    {
        $this->assertTrue($this->rules->playerBelongsToTeam(1, 1));
        $this->assertFalse($this->rules->playerBelongsToTeam(2, 1));
        $this->assertSame(
            'The player must belong to the selected team.',
            $this->rules->validateContext($this->matchData(), [
                'team_id' => 1,
                'player_id' => 10,
                'stat_type' => 'goal',
                'value' => 1,
            ], [
                'id' => 10,
                'team_id' => 2,
            ])
        );
    }

    public function test_team_must_be_part_of_match(): void
    {
        $this->assertTrue($this->rules->teamIsPartOfMatch(1, 1, 2));
        $this->assertTrue($this->rules->teamIsPartOfMatch(2, 1, 2));
        $this->assertFalse($this->rules->teamIsPartOfMatch(3, 1, 2));
        $this->assertSame(
            'The team must be one of the match teams.',
            $this->rules->validateContext($this->matchData(), [
                'team_id' => 3,
                'player_id' => 10,
                'stat_type' => 'goal',
                'value' => 1,
            ], [
                'id' => 10,
                'team_id' => 3,
            ])
        );
    }

    /**
     * @return array<string, int>
     */
    private function matchData(): array
    {
        return [
            'home_team_id' => 1,
            'away_team_id' => 2,
        ];
    }
}
