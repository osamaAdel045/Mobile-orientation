<?php

use App\Models\Order;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Admin real-time channel — every admin receives order/driver broadcast events.
// Note: pattern omits the "private-" prefix (Laravel normalizes it before matching).
Broadcast::channel('admin', function ($user) {
    return $user !== null && $user->isAdmin();
});

// Order status updates — customers and restaurant owners subscribe to their own channel.
Broadcast::channel('private-orders.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Driver job offers — a driver only receives offers addressed to them.
Broadcast::channel('private-driver.{driverId}', function ($user, $driverId) {
    return (int) $user->id === (int) $driverId;
});

// Live delivery tracking — only the customer of an order may watch its driver's location.
Broadcast::channel('private-delivery.{orderUuid}', function ($user, $orderUuid) {
    return Order::where('uuid', $orderUuid)->value('customer_id') === $user->id;
});
