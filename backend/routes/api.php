<?php

use App\Http\Controllers\Api\AdminTournamentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JoinRequestController;
use App\Http\Controllers\Api\MatchGameController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\RankingController;
use App\Http\Controllers\Api\StatisticController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TournamentController;
use Illuminate\Support\Facades\Route;

Route::get('health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
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

Route::get('join-requests', [JoinRequestController::class, 'index']);
Route::post('join-requests', [JoinRequestController::class, 'store']);
Route::get('join-requests/{joinRequest}', [JoinRequestController::class, 'show']);
Route::put('join-requests/{joinRequest}/accept', [JoinRequestController::class, 'accept']);
Route::put('join-requests/{joinRequest}/refuse', [JoinRequestController::class, 'refuse']);

Route::get('matches', [MatchGameController::class, 'index']);
Route::post('matches', [MatchGameController::class, 'store']);
Route::get('matches/{matchGame}', [MatchGameController::class, 'show']);
Route::put('matches/{matchGame}', [MatchGameController::class, 'update']);
Route::delete('matches/{matchGame}', [MatchGameController::class, 'destroy']);
Route::put('matches/{matchGame}/result', [MatchGameController::class, 'result']);
Route::put('matches/{matchGame}/confirm-result', [MatchGameController::class, 'confirmResult']);
Route::put('matches/{matchGame}/dispute-result', [MatchGameController::class, 'disputeResult']);

Route::get('rankings', [RankingController::class, 'index']);
Route::post('rankings/recalculate', [RankingController::class, 'recalculate']);

Route::get('statistics', [StatisticController::class, 'index']);
Route::post('statistics', [StatisticController::class, 'store']);
Route::get('statistics/{statistic}', [StatisticController::class, 'show']);
Route::put('statistics/{statistic}', [StatisticController::class, 'update']);
Route::delete('statistics/{statistic}', [StatisticController::class, 'destroy']);
