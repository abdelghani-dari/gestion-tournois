<?php

use App\Http\Controllers\Api\SeasonController;
use Illuminate\Support\Facades\Route;

Route::apiResource('seasons', SeasonController::class);
