<?php

namespace App\Services;

class OwnershipRules
{
    public function ownsTeam(int|string|null $managerId, int|string|null $userId): bool
    {
        return $this->idsMatch($managerId, $userId);
    }

    public function ownsTournament(int|string|null $createdBy, int|string|null $userId): bool
    {
        return $this->idsMatch($createdBy, $userId);
    }

    public function isAdmin(?string $role): bool
    {
        return $role === 'admin';
    }

    public function canAccessAdminActions(?string $role): bool
    {
        return $this->isAdmin($role);
    }

    public function canManageTournamentResources(
        int|string|null $tournamentCreatedBy,
        int|string|null $userId,
        ?string $role
    ): bool {
        return $this->isAdmin($role)
            || $this->ownsTournament($tournamentCreatedBy, $userId);
    }

    public function canManageMatchResources(
        int|string|null $tournamentCreatedBy,
        int|string|null $userId,
        ?string $role
    ): bool {
        return $this->canManageTournamentResources($tournamentCreatedBy, $userId, $role);
    }

    public function canManageStatistics(
        int|string|null $tournamentCreatedBy,
        int|string|null $userId,
        ?string $role
    ): bool {
        return $this->canManageTournamentResources($tournamentCreatedBy, $userId, $role);
    }

    public function canManageStatisticResources(
        int|string|null $tournamentCreatedBy,
        int|string|null $userId,
        ?string $role
    ): bool {
        return $this->canManageStatistics($tournamentCreatedBy, $userId, $role);
    }

    private function idsMatch(int|string|null $firstId, int|string|null $secondId): bool
    {
        if ($firstId === null || $secondId === null) {
            return false;
        }

        return (int) $firstId === (int) $secondId;
    }
}
