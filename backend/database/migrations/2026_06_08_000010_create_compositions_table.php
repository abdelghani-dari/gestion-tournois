<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compositions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_game_id')->constrained('match_games')->cascadeOnDelete();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->foreignId('player_id')->constrained('players')->cascadeOnDelete();
            $table->string('role');
            $table->timestamps();

            $table->unique(['match_game_id', 'player_id']);
        });

        DB::statement("ALTER TABLE compositions ADD CONSTRAINT compositions_role_check CHECK (role IN ('starter', 'substitute'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('compositions');
    }
};
