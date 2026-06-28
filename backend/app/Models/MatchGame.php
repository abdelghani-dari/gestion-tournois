<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MatchGame extends Model
{
    use HasFactory;

    public static $snakeAttributes = false;

    protected $fillable = [
        'tournament_id',
        'created_by',
        'home_team_id',
        'away_team_id',
        'match_date',
        'home_score',
        'away_score',
        'status',
        'result_status',
        'round_number',
        'bracket_position',
        'next_match_id',
        'next_slot',
        'winner_team_id',
        'bracket_status',
    ];

    protected function casts(): array
    {
        return [
            'match_date' => 'datetime',
            'round_number' => 'integer',
            'bracket_position' => 'integer',
        ];
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function homeTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    public function awayTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    public function nextMatch(): BelongsTo
    {
        return $this->belongsTo(self::class, 'next_match_id');
    }

    public function sourceMatches(): HasMany
    {
        return $this->hasMany(self::class, 'next_match_id');
    }

    public function winnerTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'winner_team_id');
    }

    public function statistics(): HasMany
    {
        return $this->hasMany(Statistic::class);
    }

    public function compositions(): HasMany
    {
        return $this->hasMany(Composition::class);
    }
}
