<?php

use App\Http\Controllers\Api\AdminTournamentController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TournamentController;
use Illuminate\Support\Facades\Route;

Route::get('health', function () {
    return response()->json(['status' => 'ok']);
});

Route::get('tournaments', [TournamentController::class, 'index']);
Route::post('tournaments', [TournamentController::class, 'store']);
Route::get('tournaments/{tournament}', [TournamentController::class, 'show']);
Route::put('tournaments/{tournament}', [TournamentController::class, 'update']);
Route::delete('tournaments/{tournament}', [TournamentController::class, 'destroy']);

Route::get('admin/tournaments/pending', [AdminTournamentController::class, 'pending']);
Route::get('admin/tournaments', [AdminTournamentController::class, 'index']);
Route::put('admin/tournaments/{tournament}/accept', [AdminTournamentController::class, 'accept']);
Route::put('admin/tournaments/{tournament}/refuse', [AdminTournamentController::class, 'refuse']);

Route::get('teams', [TeamController::class, 'index']);
Route::post('teams', [TeamController::class, 'store']);
Route::get('teams/{team}', [TeamController::class, 'show']);
Route::put('teams/{team}', [TeamController::class, 'update']);
Route::delete('teams/{team}', [TeamController::class, 'destroy']);
Route::get('my-teams', [TeamController::class, 'myTeams']);

Route::get('players', [PlayerController::class, 'index']);
Route::post('players', [PlayerController::class, 'store']);
Route::get('players/{player}', [PlayerController::class, 'show']);
Route::put('players/{player}', [PlayerController::class, 'update']);
Route::delete('players/{player}', [PlayerController::class, 'destroy']);
