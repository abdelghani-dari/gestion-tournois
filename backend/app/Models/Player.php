<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'first_name',
        'last_name',
        'birth_date',
        'position',
        'number',
        'photo_path',
    ];

    protected function photoPath(): Attribute
    {
        return Attribute::make(
            get: static function (?string $value): ?string {
                if ($value === null) {
                    return null;
                }
                if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
                    return $value;
                }
                return Storage::disk('public')->url(ltrim($value, '/'));
            },
        );
    }

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
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