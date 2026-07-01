<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AppliesListSorting;
use App\Http\Controllers\Api\Concerns\DeletesTeamSafely;
use App\Http\Controllers\Api\Concerns\FiltersTeamsAndPlayers;
use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Throwable;

class TeamController extends Controller
{
    use AppliesListSorting;
    use DeletesTeamSafely;
    use FiltersTeamsAndPlayers;

    public function index(Request $request): JsonResponse
    {
        $query = Team::query()->with('manager')->withCount('players');
        $this->applyTeamFilters($query, $request);
        $this->applyListSorting($query, $request, [
            'id' => 'id',
            'name' => 'name',
            'short_name' => 'short_name',
            'city' => 'city',
            'created_at' => 'created_at',
        ]);

        if ($request->has('page') || $request->has('per_page')) {
            $perPage = min(50, max(1, (int) $request->query('per_page', 12)));
            $paginator = $query->paginate($perPage);

            return response()->json([
                'data' => $paginator->items(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ]);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'short_name' => ['nullable', 'string', 'max:3'],
            'logo_path' => ['nullable', 'string', 'max:255'],
            'logo_url' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,gif,svg,bmp,tiff,avif,heic,heif', 'max:8192'],
            'city' => ['nullable', 'string', 'max:255'],
        ]);
        $validated['short_name'] = $this->normalizeShortName($validated['short_name'] ?? null, $validated['name']);
        $validated['logo_path'] = $this->imagePath($request, 'logo', 'teams', 'logo') ?? $validated['logo_url'] ?? $validated['logo_path'] ?? null;
        unset($validated['logo'], $validated['logo_url']);

        $team = Team::create([
            ...$validated,
            'manager_id' => auth('api')->id(),
        ]);

        return response()->json($team, 201);
    }

    public function show(Team $team): JsonResponse
    {
        return response()->json($team->load(['manager', 'players']));
    }

    public function update(Request $request, Team $team): JsonResponse
    {
        if (! $this->isAdmin() && (int) $team->manager_id !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'short_name' => ['nullable', 'string', 'max:4'],
            'logo_path' => ['nullable', 'string', 'max:255'],
            'logo_url' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,gif,svg,bmp,tiff,avif,heic,heif', 'max:8192'],
            'city' => ['nullable', 'string', 'max:255'],
        ]);
        $validated['short_name'] = $this->normalizeShortName($validated['short_name'] ?? null, $validated['name'] ?? $team->name);
        $imagePath = $this->imagePath($request, 'logo', 'teams', 'logo');
        if ($imagePath) {
            $validated['logo_path'] = $imagePath;
        } elseif ($request->filled('logo_url')) {
            $validated['logo_path'] = $validated['logo_url'];
        } else {
            unset($validated['logo_path']);
        }
        unset($validated['logo'], $validated['logo_url']);

        $team->update($validated);

        return response()->json($team);
    }

    public function destroy(Team $team): JsonResponse
    {
        if (! $this->isAdmin() && (int) $team->manager_id !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        try {
            $this->deleteTeamSafely($team);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Impossible de supprimer cette équipe. Réessayez ou contactez un administrateur.',
            ], 500);
        }

        return response()->json(['message' => 'Team deleted.']);
    }

    public function myTeams(): JsonResponse
    {
        $user = auth('api')->user();

        if ($user?->role === 'admin') {
            return response()->json(Team::query()->with('manager')->latest()->get());
        }

        return response()->json(
            Team::where('manager_id', $user->id)->latest()->get()
        );
    }

    private function normalizeShortName(?string $shortName, string $name): ?string
    {
        $value = trim((string) $shortName);

        if ($value === '') {
            $parts = preg_split('/\s+/', trim($name)) ?: [];
            $value = implode('', array_map(static fn (string $part): string => $part[0] ?? '', array_slice($parts, 0, 3)));
        }

        $value = strtoupper(substr($value, 0, 3));

        return $value !== '' ? $value : null;
    }

    private function isAdmin(): bool
    {
        return auth('api')->user()?->role === 'admin';
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
}
