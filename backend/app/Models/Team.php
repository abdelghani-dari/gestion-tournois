<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo_path',
        'city',
    ];

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    public function championships(): BelongsToMany
    {
        return $this->belongsToMany(Championship::class)->withTimestamps();
    }

    public function tournaments(): BelongsToMany
    {
        return $this->belongsToMany(Tournament::class)->withTimestamps();
    }

    public function homeMatches(): HasMany
    {
        return $this->hasMany(MatchGame::class, 'home_team_id');
    }

    public function awayMatches(): HasMany
    {
        return $this->hasMany(MatchGame::class, 'away_team_id');
    }

    public function compositions(): HasMany
    {
        return $this->hasMany(Composition::class);
    }

    public function rankings(): HasMany
    {
        return $this->hasMany(Ranking::class);
    }

    public function statistics(): HasMany
    {
        return $this->hasMany(Statistic::class);
    }
}
