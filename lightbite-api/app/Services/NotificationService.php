<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    private ?string $fcmServerKey;
    private ?string $fcmEndpoint;

    public function __construct()
    {
        $this->fcmServerKey = config('services.fcm.server_key');
        $this->fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';
    }

    public function sendPush(string $deviceToken, string $platform, string $title, string $body, array $data = []): void
    {
        if ($this->shouldSkip()) {
            return;
        }

        try {
            if ($platform === 'android' && $this->fcmServerKey) {
                $this->sendFcm($deviceToken, $title, $body, $data);
            } elseif ($platform === 'ios' && $this->fcmServerKey) {
                // FCM also works for iOS via APNs proxy
                $this->sendFcm($deviceToken, $title, $body, $data);
            } else {
                Log::info('Push notification skipped (no server key configured)', [
                    'platform' => $platform,
                    'title' => $title,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('Push notification failed', [
                'platform' => $platform,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function sendSilent(string $deviceToken, string $platform, array $data): void
    {
        if ($this->shouldSkip()) {
            return;
        }

        try {
            $payload = [
                'to' => $deviceToken,
                'data' => $this->formatData($data),
                'content_available' => true,
                'priority' => 'normal',
            ];

            if ($platform === 'ios') {
                $payload['notification'] = [
                    'title' => '',
                    'body' => '',
                ];
            }

            if ($this->fcmServerKey) {
                Http::withHeaders([
                    'Authorization' => 'key='.$this->fcmServerKey,
                    'Content-Type' => 'application/json',
                ])->post($this->fcmEndpoint, $payload);
            }

            Log::info('Silent push notification sent', [
                'platform' => $platform,
                'data_keys' => array_keys($data),
            ]);
        } catch (\Throwable $e) {
            Log::error('Silent push notification failed', [
                'platform' => $platform,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function sendFcm(string $token, string $title, string $body, array $data): void
    {
        $payload = [
            'to' => $token,
            'notification' => [
                'title' => $title,
                'body' => $body,
                'sound' => 'default',
                'click_action' => $data['click_action'] ?? 'FLUTTER_NOTIFICATION_CLICK',
            ],
            'data' => $this->formatData($data),
            'priority' => 'high',
        ];

        Http::withHeaders([
            'Authorization' => 'key='.$this->fcmServerKey,
            'Content-Type' => 'application/json',
        ])->post($this->fcmEndpoint, $payload);

        Log::info('Push notification sent via FCM', [
            'title' => $title,
            'data_keys' => array_keys($data),
        ]);
    }

    private function formatData(array $data): array
    {
        // FCM requires all data values to be strings
        $formatted = [];
        foreach ($data as $key => $value) {
            $formatted[$key] = is_scalar($value) ? (string) $value : json_encode($value);
        }

        return $formatted;
    }

    private function shouldSkip(): bool
    {
        // Skip in testing environment
        if (app()->environment('testing')) {
            return true;
        }

        // Warn once per process when FCM is not configured
        if (! $this->fcmServerKey) {
            Log::warning('FCM_SERVER_KEY not configured — push notifications are logged but NOT sent to devices.', [
                'tip' => 'Set FCM_SERVER_KEY in .env to enable real push delivery.',
            ]);

            return true;
        }

        return false;
    }
}
