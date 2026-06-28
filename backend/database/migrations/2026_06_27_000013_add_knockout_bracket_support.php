<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->string('format')->default('league')->after('banner_path')->index();
        });

        $this->makeTeamColumnsNullable();

        Schema::table('match_games', function (Blueprint $table) {
            $table->unsignedInteger('round_number')->nullable()->after('result_status')->index();
            $table->unsignedInteger('bracket_position')->nullable()->after('round_number');
            $table->foreignId('next_match_id')->nullable()->after('bracket_position')->constrained('match_games')->nullOnDelete();
            $table->string('next_slot')->nullable()->after('next_match_id');
            $table->foreignId('winner_team_id')->nullable()->after('next_slot')->constrained('teams')->nullOnDelete();
            $table->string('bracket_status')->nullable()->after('winner_team_id')->index();

            $table->index(['tournament_id', 'round_number', 'bracket_position'], 'match_games_bracket_round_index');
        });
    }

    public function down(): void
    {
        Schema::table('match_games', function (Blueprint $table) {
            $table->dropIndex('match_games_bracket_round_index');
            $table->dropIndex(['round_number']);
            $table->dropIndex(['bracket_status']);
            $table->dropForeign(['next_match_id']);
            $table->dropForeign(['winner_team_id']);
            $table->dropColumn([
                'round_number',
                'bracket_position',
                'next_match_id',
                'next_slot',
                'winner_team_id',
                'bracket_status',
            ]);
        });

        $this->makeTeamColumnsRequired();

        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropIndex(['format']);
            $table->dropColumn('format');
        });
    }

    private function makeTeamColumnsNullable(): void
    {
        match (DB::getDriverName()) {
            'pgsql' => $this->alterPostgresTeamColumns(nullable: true),
            'mysql', 'mariadb' => $this->alterMysqlTeamColumns(nullable: true),
            default => Schema::table('match_games', function (Blueprint $table) {
                $table->foreignId('home_team_id')->nullable()->change();
                $table->foreignId('away_team_id')->nullable()->change();
            }),
        };
    }

    private function makeTeamColumnsRequired(): void
    {
        match (DB::getDriverName()) {
            'pgsql' => $this->alterPostgresTeamColumns(nullable: false),
            'mysql', 'mariadb' => $this->alterMysqlTeamColumns(nullable: false),
            default => Schema::table('match_games', function (Blueprint $table) {
                $table->foreignId('home_team_id')->nullable(false)->change();
                $table->foreignId('away_team_id')->nullable(false)->change();
            }),
        };
    }

    private function alterPostgresTeamColumns(bool $nullable): void
    {
        $action = $nullable ? 'DROP NOT NULL' : 'SET NOT NULL';

        DB::statement("ALTER TABLE match_games ALTER COLUMN home_team_id {$action}");
        DB::statement("ALTER TABLE match_games ALTER COLUMN away_team_id {$action}");
    }

    private function alterMysqlTeamColumns(bool $nullable): void
    {
        $nullSql = $nullable ? 'NULL' : 'NOT NULL';

        DB::statement("ALTER TABLE match_games MODIFY home_team_id BIGINT UNSIGNED {$nullSql}");
        DB::statement("ALTER TABLE match_games MODIFY away_team_id BIGINT UNSIGNED {$nullSql}");
    }
};
