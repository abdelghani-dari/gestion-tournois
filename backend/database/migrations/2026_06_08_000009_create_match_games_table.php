<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('championship_id')->nullable()->constrained('championships')->cascadeOnDelete();
            $table->foreignId('tournament_id')->nullable()->constrained('tournaments')->cascadeOnDelete();
            $table->foreignId('home_team_id')->constrained('teams')->cascadeOnDelete();
            $table->foreignId('away_team_id')->constrained('teams')->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('match_date');
            $table->integer('home_score')->nullable();
            $table->integer('away_score')->nullable();
            $table->string('status')->default('scheduled');
            $table->string('result_status')->default('pending');
            $table->timestamps();
        });

        DB::statement("ALTER TABLE match_games ADD CONSTRAINT match_games_status_check CHECK (status IN ('scheduled', 'played', 'cancelled'))");
        DB::statement("ALTER TABLE match_games ADD CONSTRAINT match_games_result_status_check CHECK (result_status IN ('pending', 'confirmed', 'disputed'))");
        DB::statement("ALTER TABLE match_games ADD CONSTRAINT match_games_competition_check CHECK ((championship_id IS NOT NULL AND tournament_id IS NULL) OR (championship_id IS NULL AND tournament_id IS NOT NULL))");
        DB::statement("ALTER TABLE match_games ADD CONSTRAINT match_games_teams_check CHECK (home_team_id <> away_team_id)");
        DB::statement("ALTER TABLE match_games ADD CONSTRAINT match_games_home_score_check CHECK (home_score IS NULL OR home_score >= 0)");
        DB::statement("ALTER TABLE match_games ADD CONSTRAINT match_games_away_score_check CHECK (away_score IS NULL OR away_score >= 0)");
    }

    public function down(): void
    {
        Schema::dropIfExists('match_games');
    }
};
