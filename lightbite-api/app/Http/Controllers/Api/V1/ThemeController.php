<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ThemeService;
use Illuminate\Http\JsonResponse;

class ThemeController extends Controller
{
    public function __construct(private ThemeService $themeService) {}

    /** Public endpoint — mobile apps fetch theme on launch and on silent push. */
    public function show(): JsonResponse
    {
        $theme = $this->themeService->getTheme();

        return response()->json([
            'data' => $theme,
            'meta' => [
                'version' => $theme['version'] ?? 1,
                'trace_id' => request()->header('X-Trace-Id', ''),
            ],
        ])->withHeaders([
            'Cache-Control' => 'public, max-age=300', // Cache 5 min, invalidated by silent push
            'ETag' => md5(json_encode($theme)),
        ]);
    }
}
