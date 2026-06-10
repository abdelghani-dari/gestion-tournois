<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'payment_status',
        'subscription_plan',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [];
    }

    public function championshipsCreated(): HasMany
    {
        return $this->hasMany(Championship::class, 'created_by');
    }

    public function tournamentsCreated(): HasMany
    {
        return $this->hasMany(Tournament::class, 'created_by');
    }

    public function teamsManaged(): HasMany
    {
        return $this->hasMany(Team::class, 'manager_id');
    }

    public function fakePayments(): HasMany
    {
        return $this->hasMany(FakePayment::class);
    }

    public function joinRequests(): HasMany
    {
        return $this->hasMany(JoinRequest::class, 'manager_id');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
