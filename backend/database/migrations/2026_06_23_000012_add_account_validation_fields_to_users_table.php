<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('account_status')->default('pending')->after('role');
            $table->foreignId('approved_by')->nullable()->after('account_status')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('admin_note')->nullable()->after('approved_at');
        });

        DB::table('users')
            ->where('role', 'admin')
            ->update([
                'account_status' => 'active',
                'approved_at' => now(),
            ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['account_status', 'approved_by', 'approved_at', 'admin_note']);
        });
    }
};
