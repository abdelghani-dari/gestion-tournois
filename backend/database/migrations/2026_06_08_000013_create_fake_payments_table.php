<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fake_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('plan')->default('organizer');
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('status')->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE fake_payments ADD CONSTRAINT fake_payments_status_check CHECK (status IN ('pending', 'paid', 'failed'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('fake_payments');
    }
};
