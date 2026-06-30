<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BuildsDashboardWidgets;
use App\Http\Controllers\Controller;
use App\Models\Tournament;
use Illuminate\Http\JsonResponse;

class PublicHomeController extends Controller
{
    use BuildsDashboardWidgets;

    public function preview(): JsonResponse
    {
        $featured = Tournament::query()
            ->where('approval_status', 'accepted')
            ->withCount(['matches as played_matches_count' => function ($query) {
                $query->where('status', 'played');
            }])
            ->orderByDesc('played_matches_count')
            ->orderByRaw("case when status in ('active', 'ongoing', 'in_progress') then 0 else 1 end")
            ->orderBy('id')
            ->first() ?? $this->featuredAcceptedTournament();
        $trending = $this->buildTournamentPreviews(3);

        if ($featured === null) {
            return response()->json([
                'featured_tournament' => null,
                'ranking_preview' => [],
                'top_scorers' => [],
                'trending_tournaments' => $trending,
            ]);
        }

        return response()->json([
            'featured_tournament' => [
                'id' => $featured->id,
                'name' => $featured->name,
                'status' => $featured->status,
            ],
            'ranking_preview' => $this->buildRankingPreview($featured->id, 5),
            'top_scorers' => $this->buildTopScorers($featured->id, 5),
            'trending_tournaments' => $trending,
        ]);
    }
}
