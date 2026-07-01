<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AppliesListSorting;
use App\Http\Controllers\Api\Concerns\FiltersTeamsAndPlayers;
use App\Http\Controllers\Controller;
use App\Models\Player;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Throwable;

class PlayerController extends Controller
{
    use AppliesListSorting;
    use FiltersTeamsAndPlayers;

    public function index(Request $request): JsonResponse
    {
        $query = Player::query()->with('team');
        $this->applyPlayerFilters($query, $request);
        $this->withPlayerStatTotals($query);
        $this->applyListSorting($query, $request, [
            'id' => 'id',
            'first_name' => 'first_name',
            'last_name' => 'last_name',
            'number' => 'number',
            'position' => 'position',
            'created_at' => 'created_at',
        ]);

        if ($request->has('page') || $request->has('per_page')) {
            $perPage = min(50, max(1, (int) $request->query('per_page', 12)));
            $paginator = $query->paginate($perPage);
            $players = collect($paginator->items())->map(function (Player $player) {
                return $this->formatPlayer($player);
            });

            return response()->json([
                'data' => $players,
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ]);
        }

        $players = $query->get()->map(function (Player $player) {
            return $this->formatPlayer($player);
        });

        return response()->json($players);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'team_id' => ['required', 'exists:teams,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'position' => ['nullable', 'string', 'max:255'],
            'number' => ['nullable', 'integer', 'min:1', 'max:99'],
            'photo_path' => ['nullable', 'string', 'max:255'],
            'photo_url' => ['nullable', 'string', 'max:255'],
            'photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,gif,svg,bmp,tiff,avif,heic,heif', 'max:8192'],
        ]);
        $validated['photo_path'] = $this->imagePath($request, 'photo', 'players', 'photo') ?? $validated['photo_url'] ?? $validated['photo_path'] ?? null;
        unset($validated['photo'], $validated['photo_url']);

        $team = Team::findOrFail($validated['team_id']);

        if (! $this->isAdmin() && (int) $team->manager_id !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $player = Player::create($validated);

        return response()->json($player, 201);
    }

    public function show(Player $player): JsonResponse
    {
        $player = Player::query()
            ->with('team')
            ->whereKey($player->id)
            ->tap(fn ($query) => $this->withPlayerStatTotals($query))
            ->firstOrFail();

        return response()->json($this->formatPlayer($player));
    }

    public function update(Request $request, Player $player): JsonResponse
    {
        if (! $this->isAdmin() && (int) $player->team->manager_id !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'team_id' => ['sometimes', 'required', 'exists:teams,id'],
            'first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'position' => ['nullable', 'string', 'max:255'],
            'number' => ['nullable', 'integer', 'min:1', 'max:99'],
            'photo_path' => ['nullable', 'string', 'max:255'],
            'photo_url' => ['nullable', 'string', 'max:255'],
            'photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,gif,svg,bmp,tiff,avif,heic,heif', 'max:8192'],
        ]);

        if (isset($validated['team_id'])) {
            $team = Team::findOrFail($validated['team_id']);
            if (! $this->isAdmin() && (int) $team->manager_id !== (int) auth('api')->id()) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }
        }
        $imagePath = $this->imagePath($request, 'photo', 'players', 'photo');
        if ($imagePath) {
            $validated['photo_path'] = $imagePath;
        } elseif ($request->filled('photo_url')) {
            $validated['photo_path'] = $validated['photo_url'];
        } else {
            unset($validated['photo_path']);
        }
        unset($validated['photo'], $validated['photo_url']);

        $player->update($validated);

        return response()->json($player);
    }

    public function destroy(Player $player): JsonResponse
    {
        if (! $this->isAdmin() && (int) $player->team->manager_id !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        try {
            $player->delete();
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de supprimer ce joueur.',
            ], 500);
        }

        return response()->json(['message' => 'Player deleted.']);
    }

    private function imagePath(Request $request, string $field, string $directory, string $prefix): ?string
    {
        if (! $request->hasFile($field)) {
            return null;
        }

        /** @var UploadedFile $file */
        $file = $request->file($field);

        return $file->storeAs($directory, uniqid($prefix.'-', true).'.'.$file->extension(), 'public');
    }

    private function isAdmin(): bool
    {
        return auth('api')->user()?->role === 'admin';
    }

    /**
     * @return array<string, mixed>
     */
    private function formatPlayer(Player $player): array
    {
        $data = $player->toArray();
        $data['goals'] = (int) ($player->goals ?? 0);
        $data['assists'] = (int) ($player->assists ?? 0);

        return $data;
    }
}
