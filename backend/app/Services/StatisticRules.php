<?php

namespace App\Services;

class StatisticRules
{
    public const TYPE_GOAL = 'goal';
    public const TYPE_ASSIST = 'assist';
    public const TYPE_YELLOW_CARD = 'yellow_card';
    public const TYPE_RED_CARD = 'red_card';
    public const TYPE_CLEAN_SHEET = 'clean_sheet';

    public const ALLOWED_TYPES = [
        self::TYPE_GOAL,
        self::TYPE_ASSIST,
        self::TYPE_YELLOW_CARD,
        self::TYPE_RED_CARD,
        self::TYPE_CLEAN_SHEET,
    ];

    public function isAllowedType(?string $statType): bool
    {
        return in_array($statType, self::ALLOWED_TYPES, true);
    }

    public function requiresPlayer(?string $statType): bool
    {
        return in_array($statType, [
            self::TYPE_GOAL,
            self::TYPE_ASSIST,
            self::TYPE_YELLOW_CARD,
            self::TYPE_RED_CARD,
        ], true);
    }

    public function isValueValid(mixed $value): bool
    {
        return is_int($value) && $value > 0;
    }

    public function teamIsPartOfMatch(int|string|null $teamId, int|string|null $homeTeamId, int|string|null $awayTeamId): bool
    {
        if ($teamId === null || $homeTeamId === null || $awayTeamId === null) {
            return false;
        }

        return in_array((int) $teamId, [(int) $homeTeamId, (int) $awayTeamId], true);
    }

    public function playerBelongsToTeam(int|string|null $playerTeamId, int|string|null $teamId): bool
    {
        if ($playerTeamId === null || $teamId === null) {
            return false;
        }

        return (int) $playerTeamId === (int) $teamId;
    }

    /**
     * @param array<string, mixed> $match
     * @param array<string, mixed> $data
     * @param array<string, mixed>|null $player
     */
    public function validateContext(array $match, array $data, ?array $player = null): ?string
    {
        if (! $this->teamIsPartOfMatch(
            $data['team_id'] ?? null,
            $match['home_team_id'] ?? null,
            $match['away_team_id'] ?? null
        )) {
            return 'The team must be one of the match teams.';
        }

        if ($this->requiresPlayer($data['stat_type'] ?? null) && empty($data['player_id'])) {
            return 'The player field is required for this statistic type.';
        }

        if (! empty($data['player_id']) && $player !== null
            && ! $this->playerBelongsToTeam($player['team_id'] ?? null, $data['team_id'] ?? null)) {
            return 'The player must belong to the selected team.';
        }

        return null;
    }
}
