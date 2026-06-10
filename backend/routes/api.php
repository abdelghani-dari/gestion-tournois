<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChampionshipController;
use App\Http\Controllers\Api\CompositionController;
use App\Http\Controllers\Api\FakePaymentController;
use App\Http\Controllers\Api\JoinRequestController;
use App\Http\Controllers\Api\MatchGameController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\RankingController;
use App\Http\Controllers\Api\SeasonController;
use App\Http\Controllers\Api\StatisticController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TournamentController;
use Illuminate\Support\Facades\Route;

Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::middleware('auth:api')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::post('auth/refresh', [AuthController::class, 'refresh']);
});

Route::apiResource('championships', ChampionshipController::class)->only(['index', 'show']);
Route::apiResource('compositions', CompositionController::class)->only(['index', 'show']);
Route::apiResource('players', PlayerController::class)->only(['index', 'show']);
Route::apiResource('seasons', SeasonController::class)->only(['index', 'show']);
Route::apiResource('teams', TeamController::class)->only(['index', 'show']);
Route::apiResource('tournaments', TournamentController::class)->only(['index', 'show']);
Route::get('join-requests', [JoinRequestController::class, 'index']);
Route::get('join-requests/{joinRequest}', [JoinRequestController::class, 'show']);
Route::apiResource('match-games', MatchGameController::class)->only(['index', 'show']);
Route::get('posts', [PostController::class, 'index']);
Route::get('posts/{post}', [PostController::class, 'show']);
Route::get('rankings', [RankingController::class, 'index']);
Route::get('statistics', [StatisticController::class, 'index']);
Route::get('statistics/{statistic}', [StatisticController::class, 'show']);

Route::middleware('auth:api')->group(function () {
    Route::apiResource('championships', ChampionshipController::class)->only(['store', 'update', 'destroy']);
    Route::apiResource('compositions', CompositionController::class)->only(['store', 'update', 'destroy']);
    Route::post('fake-payments', [FakePaymentController::class, 'store']);
    Route::get('fake-payments', [FakePaymentController::class, 'index']);
    Route::get('fake-payments/{fakePayment}', [FakePaymentController::class, 'show']);
    Route::post('join-requests', [JoinRequestController::class, 'store']);
    Route::put('join-requests/{joinRequest}/accept', [JoinRequestController::class, 'accept']);
    Route::put('join-requests/{joinRequest}/refuse', [JoinRequestController::class, 'refuse']);
    Route::apiResource('match-games', MatchGameController::class)->only(['store', 'update', 'destroy']);
    Route::put('match-games/{matchGame}/result', [MatchGameController::class, 'updateResult']);
    Route::put('match-games/{matchGame}/confirm-result', [MatchGameController::class, 'confirmResult']);
    Route::put('match-games/{matchGame}/dispute-result', [MatchGameController::class, 'disputeResult']);
    Route::apiResource('players', PlayerController::class)->only(['store', 'update', 'destroy']);
    Route::post('posts', [PostController::class, 'store']);
    Route::put('posts/{post}/approve', [PostController::class, 'approve']);
    Route::put('posts/{post}/reject', [PostController::class, 'reject']);
    Route::delete('posts/{post}', [PostController::class, 'destroy']);
    Route::post('rankings/recalculate', [RankingController::class, 'recalculate']);
    Route::apiResource('seasons', SeasonController::class)->only(['store', 'update', 'destroy']);
    Route::post('statistics', [StatisticController::class, 'store']);
    Route::delete('statistics/{statistic}', [StatisticController::class, 'destroy']);
    Route::apiResource('teams', TeamController::class)->only(['store', 'update', 'destroy']);
    Route::apiResource('tournaments', TournamentController::class)->only(['store', 'update', 'destroy']);
});
