<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->date('birth_date')->nullable();
            $table->string('position')->nullable();
            $table->integer('number')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();

            $table->unique(['team_id', 'number']);
        });

        DB::statement("ALTER TABLE players ADD CONSTRAINT players_number_check CHECK (number IS NULL OR number > 0)");
    }

    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};
