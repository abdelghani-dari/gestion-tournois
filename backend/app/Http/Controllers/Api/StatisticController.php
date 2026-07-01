<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AppliesListSorting;
use App\Http\Controllers\Controller;
use App\Models\MatchGame;
use App\Models\Player;
use App\Models\Statistic;
use App\Services\OwnershipRules;
use App\Services\StatisticRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatisticController extends Controller
{
    use AppliesListSorting;

    private const STAT_TYPES = 'goal,assist,yellow_card,red_card,clean_sheet';
    private const DEFAULT_INDEX_LIMIT = 100;
    private const MAX_INDEX_LIMIT = 500;

    private const STATISTIC_COLUMNS = [
        'id',
        'match_game_id',
        'team_id',
        'player_id',
        'stat_type',
        'value',
        'created_at',
        'updated_at',
    ];

    public function __construct(
        private StatisticRules $statisticRules,
        private OwnershipRules $ownershipRules
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'match_game_id' => ['sometimes', 'exists:match_games,id'],
            'tournament_id' => ['sometimes', 'exists:tournaments,id'],
            'team_id' => ['sometimes', 'exists:teams,id'],
            'player_id' => ['sometimes', 'exists:players,id'],
            'stat_type' => ['sometimes', 'in:'.self::STAT_TYPES],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:'.self::MAX_INDEX_LIMIT],
        ]);

        $query = Statistic::query()
            ->select(self::STATISTIC_COLUMNS)
            ->with([
                'matchGame:id,tournament_id,created_by,home_team_id,away_team_id,match_date,home_score,away_score,status,result_status,created_at,updated_at',
                'matchGame.homeTeam:id,manager_id,name,short_name,logo_path,city,created_at,updated_at',
                'matchGame.awayTeam:id,manager_id,name,short_name,logo_path,city,created_at,updated_at',
                'team:id,manager_id,name,short_name,logo_path,city,created_at,updated_at',
                'player:id,team_id,first_name,last_name,birth_date,position,number,photo_path,created_at,updated_at',
            ]);

        foreach (['match_game_id', 'team_id', 'player_id', 'stat_type'] as $field) {
            if (isset($validated[$field])) {
                $query->where($field, $validated[$field]);
            }
        }

        if (isset($validated['tournament_id'])) {
            $query->whereHas('matchGame', fn ($matchQuery) => $matchQuery->where('tournament_id', $validated['tournament_id']));
        }

        $this->applyListSorting($query, $request, [
            'id' => 'id',
            'stat_type' => 'stat_type',
            'value' => 'value',
            'created_at' => 'created_at',
        ]);

        return response()->json(
            $query
                ->limit((int) ($validated['limit'] ?? self::DEFAULT_INDEX_LIMIT))
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'match_game_id' => ['required', 'exists:match_games,id'],
            'team_id' => ['required', 'exists:teams,id'],
            'player_id' => ['nullable', 'required_unless:stat_type,clean_sheet', 'exists:players,id'],
            'stat_type' => ['required', 'in:'.self::STAT_TYPES],
            'value' => ['required', 'integer', 'min:1'],
        ]);

        $matchGame = MatchGame::with('tournament')->findOrFail($validated['match_game_id']);

        if (! $this->canManageMatch($matchGame)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $error = $this->validateStatisticContext($matchGame, $validated);

        if ($error !== null) {
            return response()->json(['message' => $error], 422);
        }

        $statistic = Statistic::create($validated);

        return response()->json($statistic->load(['matchGame.homeTeam', 'matchGame.awayTeam', 'team', 'player']), 201);
    }

    public function show(Statistic $statistic): JsonResponse
    {
        return response()->json($statistic->load(['matchGame.homeTeam', 'matchGame.awayTeam', 'team', 'player']));
    }

    public function update(Request $request, Statistic $statistic): JsonResponse
    {
        $statistic->load('matchGame.tournament');

        if (! $this->canManageStatistic($statistic)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'stat_type' => ['sometimes', 'required', 'in:'.self::STAT_TYPES],
            'value' => ['sometimes', 'required', 'integer', 'min:1'],
        ]);

        $error = $this->validateStatisticContext($statistic->matchGame, [
            ...$statistic->only(['match_game_id', 'team_id', 'player_id', 'stat_type', 'value']),
            ...$validated,
        ]);

        if ($error !== null) {
            return response()->json(['message' => $error], 422);
        }

        $statistic->update($validated);

        return response()->json($statistic->load(['matchGame.homeTeam', 'matchGame.awayTeam', 'team', 'player']));
    }

    public function destroy(Statistic $statistic): JsonResponse
    {
        $statistic->load('matchGame.tournament');

        if (! $this->canManageStatistic($statistic)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $statistic->delete();

        return response()->json(['message' => 'Statistic deleted.']);
    }

    private function validateStatisticContext(MatchGame $matchGame, array $data): ?string
    {
        $player = empty($data['player_id']) ? null : Player::find($data['player_id']);

        return $this->statisticRules->validateContext(
            [
                'home_team_id' => $matchGame->home_team_id,
                'away_team_id' => $matchGame->away_team_id,
            ],
            $data,
            $player?->only(['id', 'team_id'])
        );
    }

    private function canManageStatistic(Statistic $statistic): bool
    {
        return $statistic->matchGame !== null
            && $this->canManageMatch($statistic->matchGame);
    }

    private function canManageMatch(MatchGame $matchGame): bool
    {
        return $this->ownershipRules->canManageStatistics(
            $matchGame->tournament->created_by,
            auth('api')->id(),
            auth('api')->user()?->role
        );
    }
}
