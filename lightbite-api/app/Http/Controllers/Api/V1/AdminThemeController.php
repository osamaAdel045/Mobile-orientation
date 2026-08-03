<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ThemeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AdminThemeController extends Controller
{
    public function __construct(private ThemeService $themeService) {}

    public function show(): JsonResponse
    {
        $this->authorizeAdmin();

        return response()->json([
            'data' => $this->themeService->getTheme(),
            'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $this->authorizeAdmin();

        try {
            $theme = $this->themeService->updateTheme($request->all());

            dispatch(fn () => $this->themeService->sendThemeUpdatePush());

            return response()->json([
                'data' => [
                    'theme' => $theme,
                    'message' => 'Theme updated. Silent push notification queued to all devices.',
                ],
                'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'error' => ['code' => 'INVALID_THEME', 'message' => $e->getMessage()],
                'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function reset(): JsonResponse
    {
        $this->authorizeAdmin();
        $theme = $this->themeService->resetToDefault();

        return response()->json([
            'data' => ['theme' => $theme, 'message' => 'Theme reset to defaults.'],
            'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
        ]);
    }

    private function authorizeAdmin(): void
    {
        abort_if(! request()->user()?->isAdmin(), 403, 'Admin access required.');
    }
}
