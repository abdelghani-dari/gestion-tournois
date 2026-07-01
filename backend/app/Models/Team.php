<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'manager_id',
        'name',
        'short_name',
        'logo_path',
        'city',
    ];

    protected function logoPath(): Attribute
    {
        return Attribute::make(
            get: static function (?string $value): ?string {
                if ($value === null) {
                    return null;
                }
                // Already a full URL (external or previously resolved)
                if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
                    return $value;
                }
                // Relative storage path — resolve to full public URL
                return Storage::disk('public')->url(ltrim($value, '/'));
            },
        );
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    public function tournaments(): BelongsToMany
    {
        return $this->belongsToMany(Tournament::class, 'tournament_team')->withTimestamps();
    }

    public function joinRequests(): HasMany
    {
        return $this->hasMany(JoinRequest::class);
    }

    public function homeMatches(): HasMany
    {
        return $this->hasMany(MatchGame::class, 'home_team_id');
    }

    public function awayMatches(): HasMany
    {
        return $this->hasMany(MatchGame::class, 'away_team_id');
    }

    public function rankings(): HasMany
    {
        return $this->hasMany(Ranking::class);
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
