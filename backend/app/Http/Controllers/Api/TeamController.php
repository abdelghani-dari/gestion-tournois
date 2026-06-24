<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class TeamController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Team::with('manager')->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'short_name' => ['nullable', 'string', 'max:3'],
            'logo_path' => ['nullable', 'url', 'max:255'],
            'logo_url' => ['nullable', 'url', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
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
        if ((int) $team->manager_id !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'short_name' => ['nullable', 'string', 'max:3'],
            'logo_path' => ['nullable', 'url', 'max:255'],
            'logo_url' => ['nullable', 'url', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'city' => ['nullable', 'string', 'max:255'],
        ]);
        $validated['short_name'] = $this->normalizeShortName($validated['short_name'] ?? null, $validated['name'] ?? $team->name);
        $imagePath = $this->imagePath($request, 'logo', 'teams', 'logo');
        if ($imagePath || array_key_exists('logo_url', $validated) || array_key_exists('logo_path', $validated)) {
            $validated['logo_path'] = $imagePath ?? $validated['logo_url'] ?? $validated['logo_path'] ?? null;
        }
        unset($validated['logo'], $validated['logo_url']);

        $team->update($validated);

        return response()->json($team);
    }

    public function destroy(Team $team): JsonResponse
    {
        if ((int) $team->manager_id !== (int) auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $team->delete();

        return response()->json(['message' => 'Team deleted.']);
    }

    public function myTeams(): JsonResponse
    {
        return response()->json(
            Team::where('manager_id', auth('api')->id())->latest()->get()
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
