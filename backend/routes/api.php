<?php

use App\Http\Controllers\Api\ChampionshipController;
use App\Http\Controllers\Api\FakePaymentController;
use App\Http\Controllers\Api\JoinRequestController;
use App\Http\Controllers\Api\MatchGameController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\SeasonController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TournamentController;
use Illuminate\Support\Facades\Route;

Route::apiResource('championships', ChampionshipController::class);
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
Route::apiResource('seasons', SeasonController::class);
Route::apiResource('teams', TeamController::class);
Route::apiResource('tournaments', TournamentController::class);
