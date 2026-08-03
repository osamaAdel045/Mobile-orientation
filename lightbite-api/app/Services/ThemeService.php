<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AppConfig;
use App\Models\PushToken;

class ThemeService
{
    private const THEME_KEY = 'mobile_theme';

    public function getTheme(): array
    {
        return AppConfig::get(self::THEME_KEY, $this->defaultTheme());
    }

    public function updateTheme(array $theme): array
    {
        $current = $this->getTheme();
        $merged = array_merge($current, $theme);

        // Validate color values
        if (isset($merged['colors'])) {
            foreach (['primary', 'neutral', 'semantic', 'status'] as $group) {
                if (isset($merged['colors'][$group])) {
                    foreach ($merged['colors'][$group] as $token => $color) {
                        if (is_string($color) && ! preg_match('/^#[0-9A-Fa-f]{6}$/', $color)) {
                            throw new \RuntimeException("Invalid color for colors.{$group}.{$token}: {$color}. Must be #RRGGBB.");
                        }
                    }
                }
            }
        }

        AppConfig::set(self::THEME_KEY, $merged, 'Mobile app theme configuration');

        return $merged;
    }

    public function resetToDefault(): array
    {
        $default = $this->defaultTheme();
        AppConfig::set(self::THEME_KEY, $default, 'Reset to default theme');

        return $default;
    }

    public function sendThemeUpdatePush(): void
    {
        $tokens = PushToken::all();

        foreach ($tokens as $token) {
            try {
                (new NotificationService)->sendSilent(
                    $token->token,
                    $token->platform,
                    ['type' => 'theme_updated', 'timestamp' => now()->toISOString()],
                );
            } catch (\Exception) {
                // Token may be invalid — skip
            }
        }
    }

    public function defaultTheme(): array
    {
        return [
            'version' => 1,
            'colors' => [
                'primary' => [
                    '50' => '#FFF7ED', '100' => '#FFEDD5', '200' => '#FED7AA',
                    '300' => '#FDBA74', '400' => '#FB923C', '500' => '#F97316',
                    '600' => '#EA580C', '700' => '#C2410C', '800' => '#9A3412', '900' => '#7C2D12',
                ],
                'neutral' => [
                    '0' => '#FFFFFF', '50' => '#F9FAFB', '100' => '#F3F4F6',
                    '200' => '#E5E7EB', '300' => '#D1D5DB', '400' => '#9CA3AF',
                    '500' => '#6B7280', '700' => '#374151', '900' => '#111827',
                ],
                'semantic' => [
                    'success' => '#16A34A', 'success_light' => '#DCFCE7',
                    'warning' => '#F59E0B', 'warning_light' => '#FEF3C7',
                    'error' => '#DC2626', 'error_light' => '#FEE2E2',
                    'info' => '#2563EB', 'info_light' => '#DBEAFE',
                ],
                'status' => [
                    'pending' => '#F59E0B', 'confirmed' => '#2563EB',
                    'preparing' => '#F59E0B', 'ready' => '#16A34A',
                    'delivering' => '#F97316', 'delivered' => '#16A34A',
                    'cancelled' => '#DC2626', 'rejected' => '#DC2626',
                ],
            ],
            'typography' => [
                'font_family' => 'System',
                'scale' => [
                    'xs' => 12, 'sm' => 14, 'base' => 16, 'lg' => 18,
                    'xl' => 20, '2xl' => 24, '3xl' => 30,
                ],
            ],
            'spacing' => [
                'xs' => 4, 'sm' => 8, 'md' => 16, 'lg' => 24, 'xl' => 32, '2xl' => 48,
            ],
            'border_radius' => [
                'sm' => 6, 'md' => 12, 'lg' => 16, 'full' => 9999,
            ],
            'shadows' => [
                'sm' => '0 1px 2px rgba(0,0,0,0.05)',
                'md' => '0 4px 6px rgba(0,0,0,0.07)',
                'lg' => '0 10px 15px rgba(0,0,0,0.10)',
                'xl' => '0 20px 25px rgba(0,0,0,0.15)',
            ],
        ];
    }
}
