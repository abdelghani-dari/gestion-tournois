<?php

use App\Http\Controllers\Api\ChampionshipController;
use App\Http\Controllers\Api\FakePaymentController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\SeasonController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TournamentController;
use Illuminate\Support\Facades\Route;

Route::apiResource('championships', ChampionshipController::class);
Route::get('fake-payments', [FakePaymentController::class, 'index']);
Route::post('fake-payments', [FakePaymentController::class, 'store']);
Route::get('fake-payments/{fakePayment}', [FakePaymentController::class, 'show']);
Route::apiResource('players', PlayerController::class);
Route::apiResource('seasons', SeasonController::class);
Route::apiResource('teams', TeamController::class);
Route::apiResource('tournaments', TournamentController::class);
