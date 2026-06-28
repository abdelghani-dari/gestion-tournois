<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MatchGame;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class TournamentBracketController extends Controller
{
    public function show(Tournament $tournament): JsonResponse
    {
        return response()->json($this->bracketPayload($tournament));
    }

    public function generate(Request $request, Tournament $tournament): JsonResponse
    {
        if (! $this->canManageTournament($tournament)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($tournament->format !== 'knockout') {
            return response()->json(['message' => 'Bracket generation is only available for knockout tournaments.'], 422);
        }

        if ($tournament->approval_status !== 'accepted') {
            return response()->json(['message' => 'Tournament must be accepted before generating a bracket.'], 422);
        }

        $validated = $request->validate([
            'reset' => ['sometimes', 'boolean'],
        ]);

        $reset = (bool) ($validated['reset'] ?? false);
        $teamIds = $tournament->teams()->orderBy('teams.id')->pluck('teams.id')->values();

        if ($teamIds->count() < 2) {
            return response()->json(['message' => 'At least two accepted teams are required to generate a bracket.'], 422);
        }

        $existingBracket = $tournament->bracketMatches();

        if ((clone $existingBracket)->exists()) {
            if (! $reset) {
                return response()->json([
                    'message' => 'A bracket already exists for this tournament. Send reset=true to regenerate an unplayed bracket.',
                ], 422);
            }

            $hasPlayedBracket = (clone $existingBracket)
                ->where(function ($query): void {
                    $query
                        ->where('status', 'played')
                        ->orWhere('result_status', '!=', 'pending')
                        ->orWhereNotNull('home_score')
                        ->orWhereNotNull('away_score');
                })
                ->exists();

            if ($hasPlayedBracket) {
                return response()->json(['message' => 'Cannot reset a bracket with played or scored matches.'], 422);
            }
        }

        DB::transaction(function () use ($tournament, $teamIds, $reset): void {
            if ($reset) {
                $tournament->bracketMatches()->update(['next_match_id' => null]);
                $tournament->bracketMatches()->delete();
            }

            $this->createBracket($tournament, $teamIds);
        });

        $this->forgetTournamentCache($tournament->id);

        return response()->json($this->bracketPayload($tournament->fresh()), 201);
    }

    private function createBracket(Tournament $tournament, Collection $teamIds): void
    {
        $teamCount = $teamIds->count();

        if ($this->isPowerOfTwo($teamCount)) {
            $firstRound = $this->createRoundFromSlots(
                $tournament,
                $teamIds
                    ->map(fn (int $teamId): array => ['team_id' => $teamId])
                    ->all(),
                1
            );
            $this->createRemainingRounds($tournament, $firstRound, 2);

            return;
        }

        $bracketSize = $this->nextPowerOfTwo($teamCount);
        $mainBracketSize = (int) ($bracketSize / 2);
        $preliminaryMatchCount = $teamCount - $mainBracketSize;
        $preliminaryTeamCount = $preliminaryMatchCount * 2;
        $preliminaryTeamIds = $teamIds->take($preliminaryTeamCount)->values();
        $byeTeamIds = $teamIds->slice($preliminaryTeamCount)->values();

        $preliminaryMatches = [];

        for ($index = 0; $index < $preliminaryMatchCount; $index++) {
            $preliminaryMatches[] = $this->createMatch(
                $tournament,
                1,
                $index + 1,
                $preliminaryTeamIds[$index * 2],
                $preliminaryTeamIds[($index * 2) + 1],
            );
        }

        $slots = $this->mainBracketSlots($preliminaryMatches, $byeTeamIds, $mainBracketSize);
        $firstMainRound = $this->createRoundFromSlots($tournament, $slots, 2);
        $this->linkPreliminaryMatches($preliminaryMatches, $slots, $firstMainRound);
        $this->createRemainingRounds($tournament, $firstMainRound, 3);
    }

    /**
     * @param array<int, array{team_id?: int, source_match?: MatchGame}> $slots
     * @return array<int, MatchGame>
     */
    private function createRoundFromSlots(Tournament $tournament, array $slots, int $roundNumber): array
    {
        $matches = [];

        for ($index = 0; $index < count($slots); $index += 2) {
            $homeSlot = $slots[$index] ?? [];
            $awaySlot = $slots[$index + 1] ?? [];

            $matches[] = $this->createMatch(
                $tournament,
                $roundNumber,
                (int) (($index / 2) + 1),
                $homeSlot['team_id'] ?? null,
                $awaySlot['team_id'] ?? null,
            );
        }

        return $matches;
    }

    /**
     * @param array<int, MatchGame> $previousRound
     */
    private function createRemainingRounds(Tournament $tournament, array $previousRound, int $roundNumber): void
    {
        $currentRound = $previousRound;

        while (count($currentRound) > 1) {
            $nextRound = [];
            $nextRoundMatchCount = (int) (count($currentRound) / 2);

            for ($index = 0; $index < $nextRoundMatchCount; $index++) {
                $nextRound[] = $this->createMatch($tournament, $roundNumber, $index + 1);
            }

            foreach ($currentRound as $index => $match) {
                $match->update([
                    'next_match_id' => $nextRound[(int) floor($index / 2)]->id,
                    'next_slot' => $index % 2 === 0 ? 'home' : 'away',
                ]);
            }

            $currentRound = $nextRound;
            $roundNumber++;
        }
    }

    private function createMatch(
        Tournament $tournament,
        int $roundNumber,
        int $position,
        ?int $homeTeamId = null,
        ?int $awayTeamId = null
    ): MatchGame {
        return MatchGame::create([
            'tournament_id' => $tournament->id,
            'created_by' => auth('api')->id(),
            'home_team_id' => $homeTeamId,
            'away_team_id' => $awayTeamId,
            'match_date' => $this->roundDate($tournament, $roundNumber),
            'home_score' => null,
            'away_score' => null,
            'status' => 'scheduled',
            'result_status' => 'pending',
            'round_number' => $roundNumber,
            'bracket_position' => $position,
            'bracket_status' => $homeTeamId && $awayTeamId ? 'ready' : 'pending',
        ]);
    }

    /**
     * @param array<int, MatchGame> $preliminaryMatches
     * @return array<int, array{team_id?: int, source_match?: MatchGame}>
     */
    private function mainBracketSlots(array $preliminaryMatches, Collection $byeTeamIds, int $mainBracketSize): array
    {
        $slots = [];
        $preliminaryIndex = 0;
        $byeIndex = 0;

        for ($slotIndex = 0; $slotIndex < $mainBracketSize; $slotIndex++) {
            $shouldPlacePreliminary = $preliminaryIndex < count($preliminaryMatches)
                && ($slotIndex % 2 === 0 || $byeIndex >= $byeTeamIds->count());

            if ($shouldPlacePreliminary) {
                $slots[] = ['source_match' => $preliminaryMatches[$preliminaryIndex]];
                $preliminaryIndex++;
                continue;
            }

            if ($byeIndex < $byeTeamIds->count()) {
                $slots[] = ['team_id' => $byeTeamIds[$byeIndex]];
                $byeIndex++;
            }
        }

        while ($preliminaryIndex < count($preliminaryMatches)) {
            $slots[] = ['source_match' => $preliminaryMatches[$preliminaryIndex]];
            $preliminaryIndex++;
        }

        while ($byeIndex < $byeTeamIds->count()) {
            $slots[] = ['team_id' => $byeTeamIds[$byeIndex]];
            $byeIndex++;
        }

        return array_slice($slots, 0, $mainBracketSize);
    }

    /**
     * @param array<int, MatchGame> $preliminaryMatches
     * @param array<int, array{team_id?: int, source_match?: MatchGame}> $slots
     * @param array<int, MatchGame> $firstMainRound
     */
    private function linkPreliminaryMatches(array $preliminaryMatches, array $slots, array $firstMainRound): void
    {
        foreach ($slots as $slotIndex => $slot) {
            if (! isset($slot['source_match'])) {
                continue;
            }

            $match = $slot['source_match'];
            $match->update([
                'next_match_id' => $firstMainRound[(int) floor($slotIndex / 2)]->id,
                'next_slot' => $slotIndex % 2 === 0 ? 'home' : 'away',
            ]);
        }
    }

    private function roundDate(Tournament $tournament, int $roundNumber): string
    {
        return ($tournament->start_date ?? now())
            ->copy()
            ->startOfDay()
            ->addDays($roundNumber - 1)
            ->toDateTimeString();
    }

    private function isPowerOfTwo(int $value): bool
    {
        return $value > 0 && ($value & ($value - 1)) === 0;
    }

    private function nextPowerOfTwo(int $value): int
    {
        $power = 1;

        while ($power < $value) {
            $power *= 2;
        }

        return $power;
    }

    private function bracketPayload(Tournament $tournament): array
    {
        $matches = $tournament->bracketMatches()
            ->with(['homeTeam', 'awayTeam', 'winnerTeam'])
            ->orderBy('round_number')
            ->orderBy('bracket_position')
            ->get();

        $roundCounts = $matches->groupBy('round_number')->map->count();
        $maxRound = (int) ($matches->max('round_number') ?? 0);
        $hasPreliminary = $maxRound > 1 && (int) ($roundCounts->get(1) ?? 0) < (2 ** ($maxRound - 1));

        return [
            'tournament' => $tournament->load('teams'),
            'rounds' => $matches
                ->groupBy('round_number')
                ->map(fn ($roundMatches, int $roundNumber): array => [
                    'round_number' => $roundNumber,
                    'name' => $this->roundName($roundNumber, $maxRound, $hasPreliminary),
                    'matches' => $roundMatches->values(),
                ])
                ->values(),
        ];
    }

    private function roundName(int $roundNumber, int $maxRound, bool $hasPreliminary): string
    {
        if ($hasPreliminary && $roundNumber === 1) {
            return 'Preliminary round';
        }

        $distanceFromFinal = $maxRound - $roundNumber;

        return match ($distanceFromFinal) {
            0 => 'Final',
            1 => 'Semi-finals',
            2 => 'Quarter-finals',
            default => 'Round of '.(2 ** ($distanceFromFinal + 1)),
        };
    }

    private function canManageTournament(Tournament $tournament): bool
    {
        return auth('api')->user()?->role === 'admin'
            || (int) $tournament->created_by === (int) auth('api')->id();
    }

    private function forgetTournamentCache(int $tournamentId): void
    {
        Cache::forget('public:tournaments');
        Cache::forget("tournament:{$tournamentId}:details");
        Cache::forget("tournament:{$tournamentId}:rankings");
        Cache::forget("tournament:{$tournamentId}:statistics");
    }
}
