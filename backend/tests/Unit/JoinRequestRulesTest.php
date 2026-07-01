<?php

namespace Tests\Unit;

use App\Services\JoinRequestRules;
use PHPUnit\Framework\TestCase;

class JoinRequestRulesTest extends TestCase
{
    private JoinRequestRules $rules;

    protected function setUp(): void
    {
        parent::setUp();

        $this->rules = new JoinRequestRules();
    }

    public function test_request_can_be_sent_only_to_accepted_tournament(): void
    {
        $this->assertTrue($this->rules->canRequestTournament('accepted', 'open'));
    }

    public function test_request_cannot_be_sent_to_pending_tournament(): void
    {
        $this->assertFalse($this->rules->canRequestTournament('pending', 'open'));
        $this->assertSame(
            'Tournament must be accepted before teams can request participation.',
            $this->rules->requestEligibilityError('pending', 'open')
        );
    }

    public function test_request_cannot_be_sent_to_refused_tournament(): void
    {
        $this->assertFalse($this->rules->canRequestTournament('refused', 'cancelled'));
        $this->assertSame(
            'Tournament must be accepted before teams can request participation.',
            $this->rules->requestEligibilityError('refused', 'cancelled')
        );
    }

    public function test_duplicate_request_for_same_tournament_team_is_invalid(): void
    {
        $this->assertTrue($this->rules->duplicateRequestIsInvalid(true));
        $this->assertFalse($this->rules->duplicateRequestIsInvalid(false));
    }

    public function test_creator_can_manage_request_when_tournament_created_by_equals_user_id(): void
    {
        $this->assertTrue($this->rules->creatorCanManageRequest(5, 5));
    }

    public function test_non_creator_cannot_manage_request(): void
    {
        $this->assertFalse($this->rules->creatorCanManageRequest(5, 6));
    }
}
