<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MatchGame;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MatchGameController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tournament_id' => ['sometimes', 'exists:tournaments,id'],
            'status' => ['sometimes', 'string', 'max:255'],
            'result_status' => ['sometimes', 'string', 'max:255'],
        ]);

        $query = MatchGame::with(['tournament', 'homeTeam', 'awayTeam', 'creator'])->latest();

        if (isset($validated['tournament_id'])) {
            $query->where('tournament_id', $validated['tournament_id']);
        }

        if (isset($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (isset($validated['result_status'])) {
            $query->where('result_status', $validated['result_status']);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tournament_id' => ['required', 'exists:tournaments,id'],
            'home_team_id' => ['required', 'exists:teams,id'],
            'away_team_id' => ['required', 'exists:teams,id', 'different:home_team_id'],
            'match_date' => ['required', 'date'],
        ]);

        $tournament = Tournament::findOrFail($validated['tournament_id']);

        if (! $this->canManageTournament($tournament)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $error = $this->validateMatchTeams($tournament, $validated['home_team_id'], $validated['away_team_id']);

        if ($error !== null) {
            return response()->json(['message' => $error], 422);
        }

        $matchGame = MatchGame::create([
            ...$validated,
            'created_by' => auth('api')->id(),
            'home_score' => null,
            'away_score' => null,
            'status' => 'scheduled',
            'result_status' => 'pending',
        ]);

        return response()->json($matchGame->load(['tournament', 'homeTeam', 'awayTeam', 'creator']), 201);
    }

    public function show(MatchGame $matchGame): JsonResponse
    {
        return response()->json($matchGame->load(['tournament', 'homeTeam', 'awayTeam', 'creator']));
    }

    public function update(Request $request, MatchGame $matchGame): JsonResponse
    {
        if (! $this->canManageTournament($matchGame->tournament)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'home_team_id' => ['sometimes', 'required', 'exists:teams,id'],
            'away_team_id' => ['sometimes', 'required', 'exists:teams,id'],
            'match_date' => ['sometimes', 'required', 'date'],
            'status' => ['sometimes', 'required', 'string', 'max:255'],
        ]);

        $homeTeamId = $validated['home_team_id'] ?? $matchGame->home_team_id;
        $awayTeamId = $validated['away_team_id'] ?? $matchGame->away_team_id;

        if ((int) $homeTeamId === (int) $awayTeamId) {
            return response()->json(['message' => 'Home and away teams must be different.'], 422);
        }

        $error = $this->validateMatchTeams($matchGame->tournament, $homeTeamId, $awayTeamId);

        if ($error !== null) {
            return response()->json(['message' => $error], 422);
        }

        $matchGame->update($validated);

        return response()->json($matchGame->load(['tournament', 'homeTeam', 'awayTeam', 'creator']));
    }

    public function destroy(MatchGame $matchGame): JsonResponse
    {
        if (! $this->canDeleteTournament($matchGame->tournament)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $matchGame->delete();

        return response()->json(['message' => 'Match deleted.']);
    }

    public function result(Request $request, MatchGame $matchGame): JsonResponse
    {
        if (! $this->canManageTournament($matchGame->tournament)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'home_score' => ['required', 'integer', 'min:0'],
            'away_score' => ['required', 'integer', 'min:0'],
        ]);

        $matchGame->update([
            ...$validated,
            'status' => 'played',
            'result_status' => 'pending',
        ]);

        $this->forgetCompetitionCache($matchGame->tournament_id);

        return response()->json($matchGame->load(['tournament', 'homeTeam', 'awayTeam', 'creator']));
    }

    public function confirmResult(MatchGame $matchGame): JsonResponse
    {
        if (! $this->canManageTournament($matchGame->tournament)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $error = $this->validateResultReady($matchGame);

        if ($error !== null) {
            return response()->json(['message' => $error], 422);
        }

        $matchGame->update(['result_status' => 'confirmed']);

        $this->forgetCompetitionCache($matchGame->tournament_id);

        return response()->json($matchGame->load(['tournament', 'homeTeam', 'awayTeam', 'creator']));
    }

    public function disputeResult(MatchGame $matchGame): JsonResponse
    {
        if (! $this->canManageTournament($matchGame->tournament)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $error = $this->validateResultReady($matchGame);

        if ($error !== null) {
            return response()->json(['message' => $error], 422);
        }

        $matchGame->update(['result_status' => 'disputed']);

        $this->forgetCompetitionCache($matchGame->tournament_id);

        return response()->json($matchGame->load(['tournament', 'homeTeam', 'awayTeam', 'creator']));
    }

    private function validateMatchTeams(Tournament $tournament, int $homeTeamId, int $awayTeamId): ?string
    {
        if ($tournament->approval_status !== 'accepted') {
            return 'Tournament must be accepted before matches can be created.';
        }

        if (! in_array($tournament->status, ['open', 'active'], true)) {
            return 'Tournament must be open or active before matches can be created.';
        }

        $acceptedTeamIds = $tournament->teams()
            ->whereIn('teams.id', [$homeTeamId, $awayTeamId])
            ->pluck('teams.id')
            ->all();

        if (! in_array($homeTeamId, $acceptedTeamIds, true)) {
            return 'Home team must be accepted in this tournament.';
        }

        if (! in_array($awayTeamId, $acceptedTeamIds, true)) {
            return 'Away team must be accepted in this tournament.';
        }

        return null;
    }

    private function canManageTournament(Tournament $tournament): bool
    {
        return auth('api')->user()?->role === 'admin'
            || (int) $tournament->created_by === (int) auth('api')->id();
    }

    private function canDeleteTournament(Tournament $tournament): bool
    {
        return auth('api')->user()?->role === 'admin'
            || $this->canManageTournament($tournament);
    }

    private function validateResultReady(MatchGame $matchGame): ?string
    {
        if ($matchGame->status !== 'played') {
            return 'Match must be played before confirming or disputing its result.';
        }

        if ($matchGame->home_score === null || $matchGame->away_score === null) {
            return 'Scores must be entered before confirming or disputing the result.';
        }

        return null;
    }

    private function forgetCompetitionCache(int $tournamentId): void
    {
        Cache::forget("tournament:{$tournamentId}:rankings");
        Cache::forget("tournament:{$tournamentId}:statistics");
        Cache::forget("tournament:{$tournamentId}:details");
    }
}
