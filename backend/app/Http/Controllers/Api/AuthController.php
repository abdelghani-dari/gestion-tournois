<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'avatar_url' => ['nullable', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user',
            'account_status' => 'pending',
            'avatar_url' => $validated['avatar_url'] ?? null,
        ]);

        return response()->json([
            'message' => "Votre compte a été créé. Veuillez attendre la validation de l'administrateur.",
            'user' => $user,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if ($user->account_status !== 'active') {
            if ($user->account_status === 'refused') {
                $message = 'Votre compte a été refusé par l\'administrateur.';
            } else {
                $message = 'Votre compte est en attente de validation par l\'administrateur.';
            }

            return response()->json([
                'message' => $message,
                'account_status' => $user->account_status,
                'admin_note' => $user->admin_note,
            ], 403);
        }

        $token = auth('api')->login($user);

        return $this->respondWithToken($token);
    }

    public function me(): JsonResponse
    {
        return response()->json($this->formatUser(auth('api')->user()));
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = auth('api')->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect.'], 422);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['message' => 'Mot de passe mis à jour avec succès.']);
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json(['message' => 'Successfully logged out.']);
    }

    public function refresh(): JsonResponse
    {
        return $this->respondWithToken(auth('api')->refresh());
    }

    private function respondWithToken(string $token): JsonResponse
    {
        return response()->json([
            'user' => $this->formatUser(auth('api')->user()),
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatUser(User $user): array
    {
        $tournamentCount = $user->role === 'admin'
            ? Tournament::query()->count()
            : Tournament::query()->where('created_by', $user->id)->where('approval_status', 'accepted')->count();

        return [
            ...$user->toArray(),
            'tournament_count' => $tournamentCount,
        ];
    }
}
