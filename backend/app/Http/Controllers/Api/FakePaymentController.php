<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FakePayment;
use App\Models\User;
use Illuminate\Http\Request;

class FakePaymentController extends Controller
{
    public function index()
    {
        return response()->json(FakePayment::with('user')->latest()->get());
    }

    public function store(Request $request)
    {
        if (auth('api')->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'plan' => ['nullable', 'in:organizer'],
            'amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $user = User::findOrFail($validated['user_id']);

        $payment = FakePayment::create([
            'user_id' => $user->id,
            'plan' => $validated['plan'] ?? 'organizer',
            'amount' => $validated['amount'] ?? 0,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $user->update([
            'role' => 'organizer',
            'payment_status' => 'paid',
            'subscription_plan' => 'organizer',
        ]);

        return response()->json([
            'payment' => $payment->load('user'),
            'user' => $user,
        ], 201);
    }

    public function show(FakePayment $fakePayment)
    {
        return response()->json($fakePayment->load('user'));
    }
}
