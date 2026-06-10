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

Route::apiResource('championships', ChampionshipController::class);
Route::apiResource('compositions', CompositionController::class);
Route::get('fake-payments', [FakePaymentController::class, 'index']);
Route::post('fake-payments', [FakePaymentController::class, 'store']);
Route::get('fake-payments/{fakePayment}', [FakePaymentController::class, 'show']);
Route::get('join-requests', [JoinRequestController::class, 'index']);
Route::post('join-requests', [JoinRequestController::class, 'store']);
Route::get('join-requests/{joinRequest}', [JoinRequestController::class, 'show']);
Route::put('join-requests/{joinRequest}/accept', [JoinRequestController::class, 'accept']);
Route::put('join-requests/{joinRequest}/refuse', [JoinRequestController::class, 'refuse']);
Route::apiResource('match-games', MatchGameController::class);
Route::put('match-games/{matchGame}/result', [MatchGameController::class, 'updateResult']);
Route::put('match-games/{matchGame}/confirm-result', [MatchGameController::class, 'confirmResult']);
Route::put('match-games/{matchGame}/dispute-result', [MatchGameController::class, 'disputeResult']);
Route::apiResource('players', PlayerController::class);
Route::get('posts', [PostController::class, 'index']);
Route::post('posts', [PostController::class, 'store']);
Route::get('posts/{post}', [PostController::class, 'show']);
Route::put('posts/{post}/approve', [PostController::class, 'approve']);
Route::put('posts/{post}/reject', [PostController::class, 'reject']);
Route::delete('posts/{post}', [PostController::class, 'destroy']);
Route::get('rankings', [RankingController::class, 'index']);
Route::post('rankings/recalculate', [RankingController::class, 'recalculate']);
Route::apiResource('seasons', SeasonController::class);
Route::get('statistics', [StatisticController::class, 'index']);
Route::post('statistics', [StatisticController::class, 'store']);
Route::get('statistics/{statistic}', [StatisticController::class, 'show']);
Route::delete('statistics/{statistic}', [StatisticController::class, 'destroy']);
Route::apiResource('teams', TeamController::class);
Route::apiResource('tournaments', TournamentController::class);
