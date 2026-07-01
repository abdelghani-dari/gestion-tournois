<?php

namespace Tests\Unit;

use App\Services\OwnershipRules;
use PHPUnit\Framework\TestCase;

class OwnershipRulesTest extends TestCase
{
    private OwnershipRules $rules;

    protected function setUp(): void
    {
        parent::setUp();

        $this->rules = new OwnershipRules();
    }

    public function test_user_owns_team_when_manager_id_equals_user_id(): void
    {
        $this->assertTrue($this->rules->ownsTeam(11, 11));
        $this->assertFalse($this->rules->ownsTeam(11, 12));
    }

    public function test_user_owns_tournament_when_created_by_equals_user_id(): void
    {
        $this->assertTrue($this->rules->ownsTournament(21, 21));
        $this->assertFalse($this->rules->ownsTournament(21, 22));
    }

    public function test_admin_can_access_admin_actions(): void
    {
        $this->assertTrue($this->rules->canAccessAdminActions('admin'));
    }

    public function test_normal_user_cannot_access_admin_actions(): void
    {
        $this->assertFalse($this->rules->canAccessAdminActions('user'));
    }

    public function test_creator_can_manage_tournament_resources(): void
    {
        $this->assertTrue($this->rules->canManageTournamentResources(31, 31, 'user'));
    }

    public function test_admin_can_manage_statistics(): void
    {
        $this->assertTrue($this->rules->canManageStatistics(null, null, 'admin'));
    }

    public function test_non_creator_cannot_manage_match_or_statistic_resources(): void
    {
        $this->assertFalse($this->rules->canManageMatchResources(41, 42, 'user'));
        $this->assertFalse($this->rules->canManageStatisticResources(41, 42, 'user'));
    }
}
