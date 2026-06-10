<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rankings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('championship_id')->nullable()->constrained('championships')->cascadeOnDelete();
            $table->foreignId('tournament_id')->nullable()->constrained('tournaments')->cascadeOnDelete();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->integer('played')->default(0);
            $table->integer('wins')->default(0);
            $table->integer('draws')->default(0);
            $table->integer('losses')->default(0);
            $table->integer('goals_for')->default(0);
            $table->integer('goals_against')->default(0);
            $table->integer('goal_difference')->default(0);
            $table->integer('points')->default(0);
            $table->timestamps();

            $table->unique(['championship_id', 'team_id']);
            $table->unique(['tournament_id', 'team_id']);
        });

        DB::statement("ALTER TABLE rankings ADD CONSTRAINT rankings_competition_check CHECK ((championship_id IS NOT NULL AND tournament_id IS NULL) OR (championship_id IS NULL AND tournament_id IS NOT NULL))");
        DB::statement("ALTER TABLE rankings ADD CONSTRAINT rankings_values_check CHECK (played >= 0 AND wins >= 0 AND draws >= 0 AND losses >= 0 AND goals_for >= 0 AND goals_against >= 0 AND points >= 0)");
        DB::statement("ALTER TABLE rankings ADD CONSTRAINT rankings_played_check CHECK (played = wins + draws + losses)");
        DB::statement("ALTER TABLE rankings ADD CONSTRAINT rankings_goal_difference_check CHECK (goal_difference = goals_for - goals_against)");
    }

    public function down(): void
    {
        Schema::dropIfExists('rankings');
    }
};