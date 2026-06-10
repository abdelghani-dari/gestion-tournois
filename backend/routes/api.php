<?php

use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\SeasonController;
use App\Http\Controllers\Api\TeamController;
use Illuminate\Support\Facades\Route;

Route::apiResource('players', PlayerController::class);
Route::apiResource('seasons', SeasonController::class);
Route::apiResource('teams', TeamController::class);
