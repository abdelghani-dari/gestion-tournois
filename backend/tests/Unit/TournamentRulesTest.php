<?php

namespace Tests\Unit;

use App\Services\TournamentRules;
use PHPUnit\Framework\TestCase;

class TournamentRulesTest extends TestCase
{
    private TournamentRules $rules;

    protected function setUp(): void
    {
        parent::setUp();

        $this->rules = new TournamentRules();
    }

    public function test_new_tournament_defaults_to_pending_and_draft(): void
    {
        $defaults = $this->rules->defaultsForNewTournament();

        $this->assertSame('pending', $defaults['approval_status']);
        $this->assertSame('draft', $defaults['status']);
        $this->assertNull($defaults['approved_by']);
        $this->assertNull($defaults['approved_at']);
    }

    public function test_accepting_tournament_sets_approval_status_accepted_and_status_open(): void
    {
        $attributes = $this->rules->acceptanceAttributes(7, '2026-08-01 10:00:00');

        $this->assertSame('accepted', $attributes['approval_status']);
        $this->assertSame('open', $attributes['status']);
        $this->assertSame(7, $attributes['approved_by']);
        $this->assertNull($attributes['admin_note']);
    }

    public function test_refusing_tournament_sets_approval_status_refused(): void
    {
        $attributes = $this->rules->refusalAttributes(7, '2026-08-01 10:00:00', 'Incomplete file.');

        $this->assertSame('refused', $attributes['approval_status']);
        $this->assertSame('cancelled', $attributes['status']);
        $this->assertSame('Incomplete file.', $attributes['admin_note']);
    }

    public function test_only_accepted_tournaments_are_public(): void
    {
        $this->assertTrue($this->rules->isPublic('accepted'));
        $this->assertFalse($this->rules->isPublic('pending'));
        $this->assertFalse($this->rules->isPublic('refused'));
    }

    public function test_end_date_before_start_date_is_invalid(): void
    {
        $this->assertFalse($this->rules->hasValidDateRange('2026-08-10', '2026-08-01'));
    }

    public function test_creator_owns_tournament_when_created_by_equals_user_id(): void
    {
        $this->assertTrue($this->rules->creatorOwnsTournament(15, 15));
        $this->assertFalse($this->rules->creatorOwnsTournament(15, 16));
    }
}
