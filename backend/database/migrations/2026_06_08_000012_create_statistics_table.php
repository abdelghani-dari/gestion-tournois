<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_game_id')->nullable()->constrained('match_games')->cascadeOnDelete();
            $table->foreignId('team_id')->nullable()->constrained('teams')->cascadeOnDelete();
            $table->foreignId('player_id')->nullable()->constrained('players')->cascadeOnDelete();
            $table->string('stat_type');
            $table->integer('value')->default(1);
            $table->timestamps();
        });

        DB::statement("ALTER TABLE statistics ADD CONSTRAINT statistics_value_check CHECK (value >= 0)");
        DB::statement("ALTER TABLE statistics ADD CONSTRAINT statistics_target_check CHECK (team_id IS NOT NULL OR player_id IS NOT NULL)");
    }

    public function down(): void
    {
        Schema::dropIfExists('statistics');
    }
};