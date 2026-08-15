<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Enums\OrderStatus;
use App\Events\OrderStatusChanged;
use App\Models\PushToken;
use App\Services\NotificationService;

class SendOrderNotification
{
    public function __construct(private NotificationService $notificationService) {}

    /**
     * Send a push notification for an order status change.
     *
     * Notifies the customer and the restaurant owner on every transition. Push
     * delivery is a no-op when FCM_SERVER_KEY is unset (development) or when the
     * user has no registered device tokens.
     */
    public function handle(OrderStatusChanged $event): void
    {
        $order = $event->order;
        $body = $this->messageForStatus($event->toStatus);

        $data = [
            'type' => 'order_status',
            'order_uuid' => $order->uuid,
            'order_number' => $order->order_number,
            'status' => $event->toStatus,
        ];

        $this->notifyUser($order->customer_id, 'Order '.$order->order_number, $body, $data);

        if ($order->restaurant) {
            $this->notifyUser($order->restaurant->owner_id, 'Order '.$order->order_number, $body, $data);
        }
    }

    private function notifyUser(int $userId, string $title, string $body, array $data): void
    {
        PushToken::where('user_id', $userId)->get()->each(function (PushToken $token) use ($title, $body, $data) {
            $this->notificationService->sendPush($token->token, $token->platform, $title, $body, $data);
        });
    }

    private function messageForStatus(string $status): string
    {
        return match ($status) {
            OrderStatus::Pending->value => 'Your order has been received and is awaiting confirmation.',
            OrderStatus::Confirmed->value => 'Your order is confirmed and being prepared.',
            OrderStatus::Preparing->value => 'Your order is now being prepared.',
            OrderStatus::Ready->value => 'Your order is ready for pickup!',
            OrderStatus::Assigned->value => 'A driver has been assigned to your order.',
            OrderStatus::PickedUp->value => 'Your order has been picked up by the driver.',
            OrderStatus::Delivering->value => 'Your driver is on the way!',
            OrderStatus::Delivered->value => 'Your order has been delivered. Enjoy!',
            OrderStatus::Rejected->value => 'The restaurant was unable to accept your order.',
            OrderStatus::Expired->value => 'Your order expired because the restaurant did not respond.',
            OrderStatus::Cancelled->value => 'Your order has been cancelled.',
            default => 'Your order status has been updated.',
        };
    }
}
