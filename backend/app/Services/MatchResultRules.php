<?php

namespace App\Services;

class MatchResultRules
{
    public function teamsAreDifferent(int|string|null $homeTeamId, int|string|null $awayTeamId): bool
    {
        if ($homeTeamId === null || $awayTeamId === null) {
            return false;
        }

        return (int) $homeTeamId !== (int) $awayTeamId;
    }

    public function scoreIsValid(mixed $score): bool
    {
        if (is_int($score)) {
            return $score >= 0;
        }

        return is_string($score)
            && preg_match('/^\d+$/', $score) === 1;
    }

    public function playedMatchHasRequiredScores(mixed $homeScore, mixed $awayScore): bool
    {
        return $this->scoreIsValid($homeScore)
            && $this->scoreIsValid($awayScore);
    }

    public function scoresAreValidForStatus(string $status, mixed $homeScore, mixed $awayScore): bool
    {
        if ($status === 'played') {
            return $this->playedMatchHasRequiredScores($homeScore, $awayScore);
        }

        return ($homeScore === null || $this->scoreIsValid($homeScore))
            && ($awayScore === null || $this->scoreIsValid($awayScore));
    }

    /**
     * @param array<string, mixed> $match
     */
    public function isCountable(array $match): bool
    {
        return ($match['status'] ?? null) === 'played'
            && ($match['result_status'] ?? null) === 'confirmed'
            && $this->playedMatchHasRequiredScores(
                $match['home_score'] ?? null,
                $match['away_score'] ?? null
            );
    }

    public function resultReadyError(string $status, mixed $homeScore, mixed $awayScore): ?string
    {
        if ($status !== 'played') {
            return 'Match must be played before confirming or disputing its result.';
        }

        if ($homeScore === null || $awayScore === null) {
            return 'Scores must be entered before confirming or disputing the result.';
        }

        return null;
    }
}
