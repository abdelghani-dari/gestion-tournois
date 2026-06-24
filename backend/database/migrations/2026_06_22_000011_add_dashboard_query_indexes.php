<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->index('created_by', 'tournaments_created_by_index');
            $table->index('approval_status', 'tournaments_approval_status_index');
            $table->index('status', 'tournaments_status_index');
        });
        Schema::table('teams', fn (Blueprint $table) => $table->index('manager_id', 'teams_manager_id_index'));
        Schema::table('players', fn (Blueprint $table) => $table->index('team_id', 'players_team_id_index'));
        Schema::table('join_requests', function (Blueprint $table) {
            $table->index('tournament_id', 'join_requests_tournament_id_index');
            $table->index('manager_id', 'join_requests_manager_id_index');
            $table->index('status', 'join_requests_status_index');
        });
        Schema::table('match_games', function (Blueprint $table) {
            $table->index('tournament_id', 'match_games_tournament_id_index');
            $table->index('status', 'match_games_status_index');
            $table->index('result_status', 'match_games_result_status_index');
        });
        Schema::table('rankings', fn (Blueprint $table) => $table->index('tournament_id', 'rankings_tournament_id_index'));
        Schema::table('statistics', function (Blueprint $table) {
            $table->index('match_game_id', 'statistics_match_game_id_index');
            $table->index('team_id', 'statistics_team_id_index');
            $table->index('player_id', 'statistics_player_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropIndex('tournaments_created_by_index');
            $table->dropIndex('tournaments_approval_status_index');
            $table->dropIndex('tournaments_status_index');
        });
        Schema::table('teams', fn (Blueprint $table) => $table->dropIndex('teams_manager_id_index'));
        Schema::table('players', fn (Blueprint $table) => $table->dropIndex('players_team_id_index'));
        Schema::table('join_requests', function (Blueprint $table) {
            $table->dropIndex('join_requests_tournament_id_index');
            $table->dropIndex('join_requests_manager_id_index');
            $table->dropIndex('join_requests_status_index');
        });
        Schema::table('match_games', function (Blueprint $table) {
            $table->dropIndex('match_games_tournament_id_index');
            $table->dropIndex('match_games_status_index');
            $table->dropIndex('match_games_result_status_index');
        });
        Schema::table('rankings', fn (Blueprint $table) => $table->dropIndex('rankings_tournament_id_index'));
        Schema::table('statistics', function (Blueprint $table) {
            $table->dropIndex('statistics_match_game_id_index');
            $table->dropIndex('statistics_team_id_index');
            $table->dropIndex('statistics_player_id_index');
        });
    }
};
