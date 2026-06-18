<?php

use App\Http\Controllers\Api\AdminTournamentController;
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
