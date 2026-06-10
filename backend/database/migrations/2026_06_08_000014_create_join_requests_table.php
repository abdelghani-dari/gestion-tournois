<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('join_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('championship_id')->nullable()->constrained('championships')->cascadeOnDelete();
            $table->foreignId('tournament_id')->nullable()->constrained('tournaments')->cascadeOnDelete();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->foreignId('manager_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->text('message')->nullable();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE join_requests ADD CONSTRAINT join_requests_status_check CHECK (status IN ('pending', 'accepted', 'refused'))");
        DB::statement("ALTER TABLE join_requests ADD CONSTRAINT join_requests_competition_check CHECK ((championship_id IS NOT NULL AND tournament_id IS NULL) OR (championship_id IS NULL AND tournament_id IS NOT NULL))");
    }

    public function down(): void
    {
        Schema::dropIfExists('join_requests');
    }
};
