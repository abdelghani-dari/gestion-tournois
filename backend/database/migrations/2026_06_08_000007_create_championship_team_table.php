<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('championship_team', function (Blueprint $table) {
            $table->id();
            $table->foreignId('championship_id')->constrained('championships')->cascadeOnDelete();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['championship_id', 'team_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('championship_team');
    }
};
