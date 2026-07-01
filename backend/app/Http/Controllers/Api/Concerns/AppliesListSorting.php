<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait AppliesListSorting
{
    /** @param array<string, string> $columns Map request key => DB column */
    protected function applyListSorting(Builder $query, Request $request, array $columns, string $default = 'created_at'): void
    {
        $sortBy = (string) $request->query('sort_by', $default);
        $sortDir = strtolower((string) $request->query('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        if (! array_key_exists($sortBy, $columns)) {
            $sortBy = $default;
        }

        $query->orderBy($columns[$sortBy], $sortDir);
    }
}
