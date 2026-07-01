<?php

namespace App\Services;

class JoinRequestRules
{
    public function canRequestTournament(?string $approvalStatus, ?string $tournamentStatus): bool
    {
        return $approvalStatus === 'accepted'
            && in_array($tournamentStatus, ['open', 'active'], true);
    }

    public function requestEligibilityError(?string $approvalStatus, ?string $tournamentStatus): ?string
    {
        if ($approvalStatus !== 'accepted') {
            return 'Tournament must be accepted before teams can request participation.';
        }

        if (! in_array($tournamentStatus, ['open', 'active'], true)) {
            return 'Tournament must be open or active before teams can request participation.';
        }

        return null;
    }

    public function duplicateRequestIsInvalid(bool $alreadyRequested): bool
    {
        return $alreadyRequested;
    }

    public function teamAlreadyInTournamentIsInvalid(bool $alreadyInTournament): bool
    {
        return $alreadyInTournament;
    }

    public function creatorCanManageRequest(int|string|null $tournamentCreatedBy, int|string|null $userId): bool
    {
        if ($tournamentCreatedBy === null || $userId === null) {
            return false;
        }

        return (int) $tournamentCreatedBy === (int) $userId;
    }
}
