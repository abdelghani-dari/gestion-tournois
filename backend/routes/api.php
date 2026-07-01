<?php

use App\Http\Controllers\Api\AdminDataController;
use App\Http\Controllers\Api\AdminTournamentController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompositionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\JoinRequestController;
use App\Http\Controllers\Api\MatchGameController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\PublicHomeController;
use App\Http\Controllers\Api\RankingController;
use App\Http\Controllers\Api\StatisticController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TournamentController;
use Illuminate\Support\Facades\Route;

Route::get('health', [HealthController::class, 'show']);

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::get('tournaments', [TournamentController::class, 'index']);
Route::get('tournaments/{tournament}', [TournamentController::class, 'show']);
Route::get('rankings', [RankingController::class, 'index']);
Route::get('statistics', [StatisticController::class, 'index']);
Route::get('statistics/{statistic}', [StatisticController::class, 'show']);
Route::get('compositions', [CompositionController::class, 'index']);
Route::get('compositions/{composition}', [CompositionController::class, 'show']);
Route::get('matches', [MatchGameController::class, 'index']);
Route::get('matches/{matchGame}', [MatchGameController::class, 'show']);

Route::get('teams', [TeamController::class, 'index']);
Route::get('teams/{team}', [TeamController::class, 'show']);
Route::get('players', [PlayerController::class, 'index']);
Route::get('players/{player}', [PlayerController::class, 'show']);
Route::get('public/home-preview', [PublicHomeController::class, 'preview']);

Route::middleware('auth:api')->group(function () {
    Route::get('dashboard/summary', [DashboardController::class, 'summary']);
    Route::get('me', [AuthController::class, 'me']);
    Route::put('me/password', [AuthController::class, 'updatePassword']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);

    Route::post('tournaments', [TournamentController::class, 'store']);
    Route::put('tournaments/{tournament}', [TournamentController::class, 'update']);
    Route::delete('tournaments/{tournament}', [TournamentController::class, 'destroy']);
    Route::get('my-tournaments', [TournamentController::class, 'myTournaments']);

    Route::get('admin/tournaments/pending', [AdminTournamentController::class, 'pending']);
    Route::get('admin/tournaments', [AdminTournamentController::class, 'index']);
    Route::put('admin/tournaments/{tournament}/accept', [AdminTournamentController::class, 'accept']);
    Route::put('admin/tournaments/{tournament}/refuse', [AdminTournamentController::class, 'refuse']);
    Route::get('admin/users', [AdminUserController::class, 'index']);
    Route::get('admin/users/pending', [AdminUserController::class, 'pending']);
    Route::put('admin/users/{user}', [AdminUserController::class, 'update']);
    Route::put('admin/users/{user}/accept', [AdminUserController::class, 'accept']);
    Route::put('admin/users/{user}/refuse', [AdminUserController::class, 'refuse']);
    Route::get('admin/teams', [AdminDataController::class, 'teams']);
    Route::post('admin/teams', [AdminDataController::class, 'storeTeam']);
    Route::get('admin/teams/{team}', [AdminDataController::class, 'showTeam']);
    Route::get('admin/players', [AdminDataController::class, 'players']);
    Route::post('admin/players', [AdminDataController::class, 'storePlayer']);
    Route::get('admin/join-requests', [AdminDataController::class, 'joinRequests']);
    Route::get('admin/matches', [AdminDataController::class, 'matches']);

    Route::post('teams', [TeamController::class, 'store']);
    Route::put('teams/{team}', [TeamController::class, 'update']);
    Route::post('teams/{team}', [TeamController::class, 'update']);
    Route::delete('teams/{team}', [TeamController::class, 'destroy']);
    Route::get('my-teams', [TeamController::class, 'myTeams']);

    Route::post('players', [PlayerController::class, 'store']);
    Route::put('players/{player}', [PlayerController::class, 'update']);
    Route::post('players/{player}', [PlayerController::class, 'update']);
    Route::delete('players/{player}', [PlayerController::class, 'destroy']);

    Route::get('join-requests', [JoinRequestController::class, 'index']);
    Route::post('join-requests', [JoinRequestController::class, 'store']);
    Route::get('join-requests/{joinRequest}', [JoinRequestController::class, 'show']);
    Route::put('join-requests/{joinRequest}/accept', [JoinRequestController::class, 'accept']);
    Route::put('join-requests/{joinRequest}/refuse', [JoinRequestController::class, 'refuse']);

    Route::post('matches', [MatchGameController::class, 'store']);
    Route::put('matches/{matchGame}', [MatchGameController::class, 'update']);
    Route::delete('matches/{matchGame}', [MatchGameController::class, 'destroy']);
    Route::put('matches/{matchGame}/result', [MatchGameController::class, 'result']);
    Route::put('matches/{matchGame}/confirm-result', [MatchGameController::class, 'confirmResult']);
    Route::put('matches/{matchGame}/dispute-result', [MatchGameController::class, 'disputeResult']);

    Route::post('rankings/recalculate', [RankingController::class, 'recalculate']);

    Route::post('statistics', [StatisticController::class, 'store']);
    Route::put('statistics/{statistic}', [StatisticController::class, 'update']);
    Route::delete('statistics/{statistic}', [StatisticController::class, 'destroy']);

    Route::post('compositions', [CompositionController::class, 'store']);
    Route::put('compositions/{composition}', [CompositionController::class, 'update']);
    Route::delete('compositions/{composition}', [CompositionController::class, 'destroy']);
});
