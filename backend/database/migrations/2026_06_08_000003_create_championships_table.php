<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('championships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('season_id')->constrained('seasons')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('draft');
            $table->timestamps();
        });

        DB::statement("ALTER TABLE championships ADD CONSTRAINT championships_status_check CHECK (status IN ('draft', 'active', 'finished'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('championships');
    }
};
