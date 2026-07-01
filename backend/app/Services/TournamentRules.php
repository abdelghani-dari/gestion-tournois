<?php

namespace App\Services;

use DateTimeInterface;

class TournamentRules
{
    /**
     * @return array<string, mixed>
     */
    public function defaultsForNewTournament(bool $createdByAdmin = false, int|string|null $adminId = null, mixed $approvedAt = null): array
    {
        if ($createdByAdmin) {
            return [
                'status' => 'open',
                'approval_status' => 'accepted',
                'admin_note' => null,
                'approved_by' => $adminId,
                'approved_at' => $approvedAt,
            ];
        }

        return [
            'status' => 'draft',
            'approval_status' => 'pending',
            'admin_note' => null,
            'approved_by' => null,
            'approved_at' => null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function acceptanceAttributes(int|string|null $adminId, mixed $approvedAt = null): array
    {
        return [
            'approval_status' => 'accepted',
            'status' => 'open',
            'approved_by' => $adminId,
            'approved_at' => $approvedAt,
            'admin_note' => null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function refusalAttributes(int|string|null $adminId, mixed $approvedAt = null, ?string $adminNote = null): array
    {
        return [
            'approval_status' => 'refused',
            'status' => 'cancelled',
            'approved_by' => $adminId,
            'approved_at' => $approvedAt,
            'admin_note' => $adminNote,
        ];
    }

    public function isPublic(?string $approvalStatus): bool
    {
        return $approvalStatus === 'accepted';
    }

    public function hasValidDateRange(mixed $startDate, mixed $endDate): bool
    {
        $start = $this->timestamp($startDate);
        $end = $this->timestamp($endDate);

        if ($start === null || $end === null) {
            return false;
        }

        return $end >= $start;
    }

    public function creatorOwnsTournament(int|string|null $createdBy, int|string|null $userId): bool
    {
        if ($createdBy === null || $userId === null) {
            return false;
        }

        return (int) $createdBy === (int) $userId;
    }

    private function timestamp(mixed $value): ?int
    {
        if ($value instanceof DateTimeInterface) {
            return $value->getTimestamp();
        }

        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        $timestamp = strtotime($value);

        return $timestamp === false ? null : $timestamp;
    }
}
