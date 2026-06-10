<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('season_id')->constrained('seasons')->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('level')->default('local');
            $table->string('source')->default('user_created');
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->string('status')->default('draft');
            $table->timestamps();
        });

        DB::statement("ALTER TABLE tournaments ADD CONSTRAINT tournaments_status_check CHECK (status IN ('draft', 'active', 'finished'))");
        DB::statement("ALTER TABLE tournaments ADD CONSTRAINT tournaments_level_check CHECK (level IN ('international', 'national', 'local'))");
        DB::statement("ALTER TABLE tournaments ADD CONSTRAINT tournaments_source_check CHECK (source IN ('official', 'user_created'))");
        DB::statement("ALTER TABLE tournaments ADD CONSTRAINT tournaments_dates_check CHECK (end_date >= start_date)");
    }

    public function down(): void
    {
        Schema::dropIfExists('tournaments');
    }
};
