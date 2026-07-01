<?php

namespace Tests\Unit;

use App\Services\MatchResultRules;
use PHPUnit\Framework\TestCase;

class MatchResultRulesTest extends TestCase
{
    private MatchResultRules $rules;

    protected function setUp(): void
    {
        parent::setUp();

        $this->rules = new MatchResultRules();
    }

    public function test_home_team_id_and_away_team_id_must_be_different(): void
    {
        $this->assertTrue($this->rules->teamsAreDifferent(1, 2));
        $this->assertFalse($this->rules->teamsAreDifferent(1, 1));
    }

    public function test_negative_home_score_is_invalid(): void
    {
        $this->assertFalse($this->rules->scoreIsValid(-1));
    }

    public function test_negative_away_score_is_invalid(): void
    {
        $this->assertFalse($this->rules->playedMatchHasRequiredScores(1, -1));
    }

    public function test_zero_scores_are_valid(): void
    {
        $this->assertTrue($this->rules->playedMatchHasRequiredScores(0, 0));
    }

    public function test_played_match_requires_both_scores(): void
    {
        $this->assertFalse($this->rules->scoresAreValidForStatus('played', 1, null));
        $this->assertFalse($this->rules->scoresAreValidForStatus('played', null, 1));
        $this->assertTrue($this->rules->scoresAreValidForStatus('played', 1, 1));
    }

    public function test_scheduled_match_can_have_null_scores(): void
    {
        $this->assertTrue($this->rules->scoresAreValidForStatus('scheduled', null, null));
    }

    public function test_confirmed_result_is_countable(): void
    {
        $this->assertTrue($this->rules->isCountable([
            'status' => 'played',
            'result_status' => 'confirmed',
            'home_score' => 2,
            'away_score' => 1,
        ]));
    }

    public function test_pending_and_disputed_results_are_not_countable(): void
    {
        $this->assertFalse($this->rules->isCountable([
            'status' => 'played',
            'result_status' => 'pending',
            'home_score' => 2,
            'away_score' => 1,
        ]));
        $this->assertFalse($this->rules->isCountable([
            'status' => 'played',
            'result_status' => 'disputed',
            'home_score' => 2,
            'away_score' => 1,
        ]));
    }
}
