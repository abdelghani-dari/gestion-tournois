<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('championship_id')->nullable()->constrained('championships')->nullOnDelete();
            $table->foreignId('tournament_id')->nullable()->constrained('tournaments')->nullOnDelete();
            $table->text('content');
            $table->string('image_path')->nullable();
            $table->string('type')->default('general');
            $table->timestamps();
        });

        DB::statement("ALTER TABLE posts ADD CONSTRAINT posts_type_check CHECK (type IN ('announcement', 'result', 'news', 'general'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
