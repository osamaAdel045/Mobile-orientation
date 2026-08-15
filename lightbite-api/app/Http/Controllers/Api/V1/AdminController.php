<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\DisputeStatus;
use App\Enums\RestaurantStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Dispute;
use App\Models\Order;
use App\Models\OrderStatusLog;
use App\Models\Restaurant;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    /**
     * WebSocket channel authorization for the admin panel.
     *
     * The admin SPA authenticates with a JWT bearer token, but Laravel's
     * default /broadcasting/auth route uses the session guard. This custom
     * endpoint reuses Laravel's Pusher/Reverb broadcaster to produce the
     * signature, so it stays byte-for-byte compatible with Reverb.
     */
    public function broadcastAuth(Request $request)
    {
        $this->authorizeAdmin();

        $channel = $request->input('channel_name', '');
        if (! str_starts_with($channel, 'private-admin')) {
            abort(403, 'Channel not permitted.');
        }

        // Resolve the authenticated admin for the channel callback using the API (JWT) guard.
        // PusherBroadcaster::auth() returns an array that Laravel serializes to JSON.
        $request->setUserResolver(fn () => $request->user('api'));

        return Broadcast::connection('reverb')->auth($request);
    }

    public function pendingRestaurants(): JsonResponse { $this->authorizeAdmin();
        $data = Restaurant::where('status', RestaurantStatus::PendingVerification)->latest()->get()->map(fn ($r) => [
            'uuid' => $r->uuid, 'name' => $r->name, 'cuisine_types' => $r->cuisine_types,
            'address' => $r->address, 'phone' => $r->phone,
            'owner_name' => $r->owner->name, 'owner_email' => $r->owner->email,
            'description' => $r->description,
            'trade_license_url' => $r->trade_license_path ? Storage::url($r->trade_license_path) : null,
            'food_safety_cert_url' => $r->food_safety_cert_path ? Storage::url($r->food_safety_cert_path) : null,
            'logo_url' => $r->logo_path ? Storage::url($r->logo_path) : null,
            'created_at' => $r->created_at->toISOString(),
        ]);
        return response()->json(['data' => $data]);
    }

    public function verifyRestaurant(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $r = Restaurant::where('uuid', $uuid)->firstOrFail();
        $action = $request->input('action');
        if ($action === 'approve') {
            $r->update(['status' => RestaurantStatus::Active]);
            $r->owner->update(['status' => UserStatus::Verified]);
            return response()->json(['data' => ['status' => 'active', 'message' => 'Restaurant approved.']]);
        }
        $reason = $request->input('reason', '');
        $r->update(['status' => RestaurantStatus::Rejected]);
        $r->owner->update(['status' => UserStatus::Rejected]);
        AuditLog::create(['user_id' => $request->user()->id, 'action' => 'restaurant.rejected', 'resource_type' => 'restaurant', 'resource_id' => $r->id, 'new_values' => ['reason' => $reason], 'ip_address' => $request->ip()]);
        return response()->json(['data' => ['status' => 'rejected', 'message' => 'Restaurant rejected.']]);
    }

    public function pendingDrivers(): JsonResponse { $this->authorizeAdmin();
        $data = User::where('role', 'driver')->where('status', UserStatus::PendingVerification)->latest()->get()->map(fn ($d) => [
            'uuid' => $d->uuid, 'name' => $d->name, 'email' => $d->email, 'phone' => $d->phone,
            'status' => $d->status->value,
            'license_url' => $d->license_path ? Storage::url($d->license_path) : null,
            'vehicle_registration_url' => $d->vehicle_registration_path ? Storage::url($d->vehicle_registration_path) : null,
            'insurance_url' => $d->insurance_path ? Storage::url($d->insurance_path) : null,
            'photo_url' => $d->photo_path ? Storage::url($d->photo_path) : null,
            'created_at' => $d->created_at->toISOString(),
        ]);
        return response()->json(['data' => $data]);
    }

    public function verifyDriver(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $d = User::where('uuid', $uuid)->where('role', 'driver')->firstOrFail();
        $action = $request->input('action');
        if ($action === 'approve') {
            $d->update(['status' => UserStatus::Verified]);
            return response()->json(['data' => ['status' => 'verified', 'message' => 'Driver approved.']]);
        }
        $reason = $request->input('reason', '');
        $d->update(['status' => UserStatus::Rejected]);
        AuditLog::create(['user_id' => $request->user()->id, 'action' => 'driver.rejected', 'resource_type' => 'driver', 'resource_id' => $d->id, 'new_values' => ['reason' => $reason], 'ip_address' => $request->ip()]);
        return response()->json(['data' => ['status' => 'rejected', 'message' => 'Driver rejected: '.$reason]]);
    }

    public function disputes(Request $request): JsonResponse { $this->authorizeAdmin();
        $q = Dispute::with(['order', 'customer']);
        if ($request->status) $q->where('status', $request->status);
        $disputes = $q->latest()->paginate(20);
        return response()->json(
            $disputes->through(fn ($d) => [
                'uuid' => $d->uuid, 'order_uuid' => $d->order->uuid, 'order_number' => $d->order->order_number,
                'customer_name' => $d->customer->name, 'reason' => $d->reason, 'description' => $d->description,
                'status' => $d->status->value, 'created_at' => $d->created_at->toISOString(),
            ])
        );
    }

    public function resolveDispute(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $dispute = Dispute::where('uuid', $uuid)->firstOrFail();
        $resolution = $request->input('resolution');
        $note = $request->input('note', '');
        $partialAmount = $request->input('partial_amount_fils');

        if ($resolution === 'refund') {
            // Process actual Stripe refund
            $paymentService = app(PaymentService::class);
            $payment = $dispute->order->payment;

            if ($payment && in_array($payment->status->value, ['captured', 'partially_refunded'])) {
                $refundAmount = $partialAmount ?? $payment->amount_fils;
                $paymentService->refund($payment, $refundAmount, $note ?: 'Dispute resolved with refund.');
            }

            $dispute->update([
                'status' => $partialAmount ? DisputeStatus::ResolvedRefunded : DisputeStatus::ResolvedRefunded,
                'resolution_note' => $note,
                'resolved_by' => $request->user()->id,
            ]);

            // Log admin action
            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'dispute.refunded',
                'resource_type' => 'dispute',
                'resource_id' => $dispute->id,
                'new_values' => ['resolution' => 'refund', 'note' => $note, 'amount_fils' => $partialAmount ?? $payment?->amount_fils],
                'ip_address' => $request->ip(),
            ]);

            return response()->json(['data' => ['status' => 'resolved_refunded', 'message' => 'Dispute resolved with refund.']]);
        }

        $dispute->update([
            'status' => DisputeStatus::Denied,
            'resolution_note' => $note,
            'resolved_by' => $request->user()->id,
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'dispute.denied',
            'resource_type' => 'dispute',
            'resource_id' => $dispute->id,
            'new_values' => ['resolution' => 'denied', 'note' => $note],
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['data' => ['status' => 'denied', 'message' => 'Dispute denied.']]);
    }

    // ─── Order Management ─────────────────────────────────

    public function orders(Request $request): JsonResponse { $this->authorizeAdmin();
        $q = Order::with(['customer', 'restaurant', 'driver', 'statusLog']);

        if ($status = $request->input('status')) {
            $q->where('status', $status);
        }
        if ($search = $request->input('search')) {
            $q->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('restaurant', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }
        if ($restaurant = $request->input('restaurant')) {
            $q->whereHas('restaurant', fn ($q) => $q->where('name', 'like', "%{$restaurant}%"));
        }
        if ($dateFrom = $request->input('date_from')) {
            $q->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $q->whereDate('created_at', '<=', $dateTo);
        }

        $orders = $q->latest()->paginate(20);

        return response()->json(
            $orders->through(fn ($o) => [
                'uuid'            => $o->uuid,
                'order_number'    => $o->order_number,
                'status'          => $o->status->value,
                'customer_name'   => $o->customer->name,
                'restaurant_name' => $o->restaurant->name,
                'driver_name'     => $o->driver?->name,
                'driver_uuid'     => $o->driver?->uuid,
                'total'           => number_format($o->total_fils / 100, 2),
                'created_at'      => $o->created_at->toISOString(),
                'status_at'       => $o->statusLog->sortByDesc('created_at')->first()?->created_at?->toISOString() ?? $o->updated_at->toISOString(),
            ])
        );
    }

    public function orderDetail(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $o = Order::where('uuid', $uuid)->with(['customer', 'restaurant', 'driver.driverLocation', 'items', 'statusLog', 'payment'])->firstOrFail();

        return response()->json([
            'data' => [
                'uuid'            => $o->uuid,
                'order_number'    => $o->order_number,
                'status'          => $o->status->value,
                'customer'        => ['uuid' => $o->customer->uuid, 'name' => $o->customer->name, 'email' => $o->customer->email, 'phone' => $o->customer->phone],
                'restaurant'      => ['uuid' => $o->restaurant->uuid, 'name' => $o->restaurant->name, 'phone' => $o->restaurant->phone],
                'driver'          => $o->driver ? [
                    'uuid'    => $o->driver->uuid,
                    'name'    => $o->driver->name,
                    'phone'   => $o->driver->phone,
                    'lat'     => $o->driver->driverLocation?->lat,
                    'lng'     => $o->driver->driverLocation?->lng,
                    'bearing' => $o->driver->driverLocation?->bearing,
                ] : null,
                'subtotal'        => number_format($o->subtotal_fils / 100, 2),
                'delivery_fee'    => number_format($o->delivery_fee_fils / 100, 2),
                'tax'             => number_format($o->tax_fils / 100, 2),
                'total'           => number_format($o->total_fils / 100, 2),
                'commission'      => number_format($o->commission_fils / 100, 2),
                'driver_earnings' => $o->driver_earnings_fils ? number_format($o->driver_earnings_fils / 100, 2) : null,
                'items'           => $o->items->map(fn ($i) => ['name' => $i->name, 'quantity' => $i->quantity, 'unit_price' => number_format($i->unit_price_fils / 100, 2), 'special_instructions' => $i->special_instructions]),
                'timeline'        => $o->statusLog->sortBy('created_at')->values()->map(fn ($l) => ['from' => $l->from_status, 'to' => $l->to_status, 'by' => $l->changed_by_type, 'note' => $l->note, 'at' => $l->created_at->toISOString()]),
                'payment'         => $o->payment ? ['status' => $o->payment->status->value, 'amount' => number_format($o->payment->amount_fils / 100, 2), 'stripe_id' => $o->payment->stripe_payment_intent_id] : null,
                'delivery_address'=> $o->delivery_address_snapshot,
                'customer_note'   => $o->customer_note,
                'created_at'      => $o->created_at->toISOString(),
            ],
        ]);
    }

    public function cancelOrder(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $o = Order::where('uuid', $uuid)->firstOrFail();
        $reason = $request->input('reason', 'Cancelled by admin.');

        if (!in_array($o->status->value, ['pending', 'confirmed', 'preparing', 'ready'])) {
            return response()->json(['message' => 'Order cannot be cancelled in '.$o->status->value.' status.'], 422);
        }

        $o->update(['status' => \App\Enums\OrderStatus::Cancelled]);

        // Refund via Stripe
        if ($o->payment && in_array($o->payment->status->value, ['pre_authorized', 'captured'])) {
            app(PaymentService::class)->refund($o->payment, $o->payment->amount_fils, $reason);
        }

        AuditLog::create(['user_id' => $request->user()->id, 'action' => 'order.cancelled', 'resource_type' => 'order', 'resource_id' => $o->id, 'new_values' => ['reason' => $reason], 'ip_address' => $request->ip()]);

        return response()->json(['data' => ['status' => 'cancelled', 'message' => 'Order cancelled and refunded.']]);
    }

    public function refundOrder(Request $request, string $uuid): JsonResponse
    {
        $this->authorizeAdmin();
        $o = Order::where('uuid', $uuid)->firstOrFail();
        $amountFils = $request->input('amount_fils'); // null = full refund
        $reason = $request->input('reason', 'Refunded by admin.');

        if (! $o->payment || ! in_array($o->payment->status->value, ['captured', 'partially_refunded'])) {
            return response()->json(['message' => 'Order payment cannot be refunded in '.($o->payment?->status->value ?? 'no-payment').' status.'], 422);
        }

        $refundAmount = $amountFils ?? $o->payment->amount_fils;
        $isPartial = $refundAmount < $o->payment->amount_fils;

        app(PaymentService::class)->refund($o->payment, $refundAmount, $reason);

        if ($isPartial) {
            // Keep order status — only partial refund
            AuditLog::create([
                'user_id' => $request->user()->id, 'action' => 'order.partial_refund',
                'resource_type' => 'order', 'resource_id' => $o->id,
                'new_values' => ['amount_fils' => $refundAmount, 'reason' => $reason],
                'ip_address' => $request->ip(),
            ]);

            return response()->json(['data' => ['message' => 'Partial refund of AED '.number_format($refundAmount / 100, 2).' processed.', 'payment_status' => 'partially_refunded']]);
        }

        // Full refund — mark order as refunded
        $o->update(['status' => \App\Enums\OrderStatus::Refunded]);

        AuditLog::create([
            'user_id' => $request->user()->id, 'action' => 'order.refunded',
            'resource_type' => 'order', 'resource_id' => $o->id,
            'new_values' => ['amount_fils' => $refundAmount, 'reason' => $reason],
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['data' => ['status' => 'refunded', 'message' => 'Order fully refunded.']]);
    }

    public function reassignOrder(Request $request, string $uuid): JsonResponse
    {
        $this->authorizeAdmin();
        $o = Order::where('uuid', $uuid)->firstOrFail();
        $newDriverUuid = $request->input('driver_uuid');

        if (! in_array($o->status->value, ['assigned', 'picked_up', 'delivering'])) {
            return response()->json(['message' => 'Order cannot be reassigned in '.$o->status->value.' status.'], 422);
        }

        $oldDriverId = $o->driver_id;

        if ($newDriverUuid) {
            $newDriver = User::where('uuid', $newDriverUuid)->where('role', 'driver')->firstOrFail();
            $o->update(['driver_id' => $newDriver->id, 'status' => \App\Enums\OrderStatus::Assigned]);
        } else {
            // Unassign — return to ready for re-dispatch
            $o->update(['driver_id' => null, 'status' => \App\Enums\OrderStatus::Ready]);
        }

        AuditLog::create([
            'user_id' => $request->user()->id, 'action' => 'order.driver_reassigned',
            'resource_type' => 'order', 'resource_id' => $o->id,
            'old_values' => ['driver_id' => $oldDriverId],
            'new_values' => ['driver_id' => $o->driver_id],
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['data' => ['message' => $newDriverUuid ? 'Driver reassigned.' : 'Order unassigned and returned to ready pool.', 'status' => $o->status->value]]);
    }

    public function addOrderNote(Request $request, string $uuid): JsonResponse
    {
        $this->authorizeAdmin();
        $o = Order::where('uuid', $uuid)->firstOrFail();
        $note = $request->input('note');

        if (! $note || trim($note) === '') {
            return response()->json(['message' => 'Note is required.'], 422);
        }

        // Log the note as a status log entry (without changing status)
        \App\Models\OrderStatusLog::create([
            'order_id' => $o->id,
            'from_status' => $o->status->value,
            'to_status' => $o->status->value,
            'changed_by_type' => 'admin',
            'changed_by_id' => $request->user()->id,
            'note' => '[ADMIN NOTE] '.$note,
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id, 'action' => 'order.note_added',
            'resource_type' => 'order', 'resource_id' => $o->id,
            'new_values' => ['note' => $note],
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['data' => ['message' => 'Note added to order.']], 201);
    }

    // ─── User Management ─────────────────────────────────

    public function users(Request $request): JsonResponse { $this->authorizeAdmin();
        $q = User::query()->with('restaurant:id,owner_id,name,status');

        if ($role = $request->input('role')) {
            $q->where('role', $role);
        }
        if ($status = $request->input('status')) {
            $q->where('status', $status);
        }
        if ($search = $request->input('search')) {
            $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $q->latest()->paginate(20);

        return response()->json(
            $users->through(fn ($u) => [
                'uuid'       => $u->uuid,
                'name'       => $u->name,
                'email'      => $u->email,
                'phone'      => $u->phone,
                'role'       => $u->role->value,
                'status'     => $u->status->value,
                'photo_url'  => $u->photo_path ? Storage::url($u->photo_path) : null,
                'restaurant' => $u->restaurant ? ['name' => $u->restaurant->name, 'status' => $u->restaurant->status->value] : null,
                'created_at' => $u->created_at->toISOString(),
            ])
        );
    }

    public function userDetail(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $u = User::where('uuid', $uuid)->firstOrFail();

        $base = [
            'uuid'       => $u->uuid,
            'name'       => $u->name,
            'email'      => $u->email,
            'phone'      => $u->phone,
            'role'       => $u->role->value,
            'status'     => $u->status->value,
            'photo_url'  => $u->photo_path ? Storage::url($u->photo_path) : null,
            'locale'     => $u->locale,
            'created_at' => $u->created_at->toISOString(),
        ];

        // Role-specific data
        if ($u->isCustomer()) {
            $base['addresses'] = $u->addresses()->get()->map(fn ($a) => [
                'uuid' => $a->uuid, 'label' => $a->label, 'address' => $a->address,
                'lat' => $a->lat, 'lng' => $a->lng, 'is_default' => $a->is_default,
            ]);
            $base['stats'] = [
                'total_orders'   => $u->customerOrders()->count(),
                'total_spent'    => number_format($u->customerOrders()->whereIn('status', ['delivered'])->sum('total_fils') / 100, 2),
                'disputes_filed' => Dispute::where('customer_id', $u->id)->count(),
            ];
            $base['recent_orders'] = $u->customerOrders()->with('restaurant')->latest()->limit(5)->get()->map(fn ($o) => [
                'uuid'         => $o->uuid,
                'order_number' => $o->order_number,
                'status'       => $o->status->value,
                'restaurant'   => $o->restaurant?->name,
                'total'        => number_format($o->total_fils / 100, 2),
                'created_at'   => $o->created_at->toISOString(),
            ]);
        }

        if ($u->isDriver()) {
            $base['documents'] = [
                'license_url'             => $u->license_path ? Storage::url($u->license_path) : null,
                'vehicle_registration_url' => $u->vehicle_registration_path ? Storage::url($u->vehicle_registration_path) : null,
                'insurance_url'           => $u->insurance_path ? Storage::url($u->insurance_path) : null,
            ];
            $base['driver_location'] = $u->driverLocation ? [
                'lat'       => $u->driverLocation->lat,
                'lng'       => $u->driverLocation->lng,
                'is_online' => $u->driverLocation->is_online,
            ] : null;
            $base['stats'] = [
                'total_deliveries' => $u->driverOrders()->where('status', 'delivered')->count(),
                'total_earnings'   => number_format($u->driverOrders()->whereNotNull('driver_earnings_fils')->sum('driver_earnings_fils') / 100, 2),
                'disputes_involved' => Dispute::whereHas('order', fn ($q) => $q->where('driver_id', $u->id))->count(),
            ];
            $base['recent_deliveries'] = $u->driverOrders()->with('restaurant')->latest()->limit(5)->get()->map(fn ($o) => [
                'uuid'         => $o->uuid,
                'order_number' => $o->order_number,
                'restaurant'   => $o->restaurant?->name,
                'earnings'     => $o->driver_earnings_fils ? number_format($o->driver_earnings_fils / 100, 2) : null,
                'delivered_at' => $o->updated_at->toISOString(),
            ]);
        }

        if ($u->isRestaurant()) {
            $restaurant = $u->restaurant;
            $base['restaurant'] = $restaurant ? [
                'uuid'         => $restaurant->uuid,
                'name'         => $restaurant->name,
                'status'       => $restaurant->status->value,
                'cuisine'      => $restaurant->cuisine_types,
                'address'      => $restaurant->address,
                'phone'        => $restaurant->phone,
                'commission'   => $restaurant->commission_rate,
                'accepting'    => $restaurant->is_accepting_orders,
            ] : null;
            $base['stats'] = $restaurant ? [
                'total_orders' => $restaurant->orders()->count(),
                'avg_rating'   => round($restaurant->ratings()->avg('stars') ?? 0, 1),
                'menu_items'   => $restaurant->menuItems()->count(),
            ] : null;
        }

        return response()->json(['data' => $base]);
    }

    public function suspendUser(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $u = User::where('uuid', $uuid)->firstOrFail();
        $reason = $request->input('reason', '');

        $u->update(['status' => UserStatus::Suspended]);

        // If restaurant owner, suspend the restaurant too
        if ($u->isRestaurant() && $u->restaurant) {
            $u->restaurant->update(['status' => RestaurantStatus::Suspended]);
        }

        AuditLog::create([
            'user_id'      => $request->user()->id,
            'action'       => 'user.suspended',
            'resource_type'=> 'user',
            'resource_id'  => $u->id,
            'new_values'   => ['reason' => $reason],
            'ip_address'   => $request->ip(),
        ]);

        return response()->json(['data' => ['status' => 'suspended', 'message' => 'User suspended.']]);
    }

    public function unsuspendUser(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $u = User::where('uuid', $uuid)->firstOrFail();

        $u->update(['status' => UserStatus::Verified]);

        // If restaurant owner, reactivate the restaurant too
        if ($u->isRestaurant() && $u->restaurant) {
            $u->restaurant->update(['status' => RestaurantStatus::Active]);
        }

        AuditLog::create([
            'user_id'      => $request->user()->id,
            'action'       => 'user.unsuspended',
            'resource_type'=> 'user',
            'resource_id'  => $u->id,
            'ip_address'   => $request->ip(),
        ]);

        return response()->json(['data' => ['status' => 'verified', 'message' => 'User reactivated.']]);
    }

    public function deactivateUser(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $u = User::where('uuid', $uuid)->firstOrFail();
        $reason = $request->input('reason', '');

        $u->update(['status' => UserStatus::Deactivated]);

        // If restaurant owner, permanently close the restaurant
        if ($u->isRestaurant() && $u->restaurant) {
            $u->restaurant->update(['status' => RestaurantStatus::PermanentlyClosed]);
        }

        AuditLog::create([
            'user_id'      => $request->user()->id,
            'action'       => 'user.deactivated',
            'resource_type'=> 'user',
            'resource_id'  => $u->id,
            'new_values'   => ['reason' => $reason],
            'ip_address'   => $request->ip(),
        ]);

        return response()->json(['data' => ['status' => 'deactivated', 'message' => 'User permanently deactivated.']]);
    }

    // ─── Platform Settings ─────────────────────────────────

    public function getSettings(Request $request): JsonResponse { $this->authorizeAdmin();
        $config = \App\Models\AppConfig::whereIn('key', [
            'commission_rate', 'delivery_base_fee', 'delivery_per_km', 'delivery_included_km',
            'driver_base_pay', 'driver_per_km', 'tax_rate', 'min_order', 'driver_timeout', 'order_expiry',
        ])->get()->pluck('value', 'key')->toArray();

        $defaults = [
            'commission_rate'       => 12,
            'delivery_base_fee'     => 5,
            'delivery_per_km'       => 1.5,
            'delivery_included_km'  => 3,
            'driver_base_pay'       => 8,
            'driver_per_km'         => 2,
            'tax_rate'              => 5,
            'min_order'             => 20,
            'driver_timeout'        => 30,
            'order_expiry'          => 2,
        ];

        return response()->json(['data' => array_merge($defaults, $config)]);
    }

    public function updateSettings(Request $request): JsonResponse { $this->authorizeAdmin();
        $valid = $request->validate([
            'commission_rate'       => 'numeric|min:0|max:50',
            'delivery_base_fee'     => 'numeric|min:0',
            'delivery_per_km'       => 'numeric|min:0',
            'delivery_included_km'  => 'numeric|min:0',
            'driver_base_pay'       => 'numeric|min:0',
            'driver_per_km'         => 'numeric|min:0',
            'tax_rate'              => 'numeric|min:0|max:30',
            'min_order'             => 'numeric|min:0',
            'driver_timeout'        => 'integer|min:5|max:120',
            'order_expiry'          => 'integer|min:1|max:30',
        ]);

        foreach ($valid as $key => $value) {
            \App\Models\AppConfig::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'description' => "Platform configuration: {$key}"]
            );
        }

        AuditLog::create([
            'user_id'      => $request->user()->id,
            'action'       => 'settings.updated',
            'resource_type'=> 'platform_settings',
            'new_values'   => $valid,
            'ip_address'   => $request->ip(),
        ]);

        return response()->json(['data' => ['message' => 'Settings updated.']]);
    }

    // ─── Restaurant Management (All) ────────────────────────

    public function allRestaurants(Request $request): JsonResponse { $this->authorizeAdmin();
        $q = Restaurant::with('owner')->latest();

        if ($status = $request->input('status')) {
            $q->where('status', $status);
        }
        if ($search = $request->input('search')) {
            $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('cuisine_types', 'like', "%{$search}%");
            });
        }

        $restaurants = $q->paginate(20);

        return response()->json(
            $restaurants->through(fn ($r) => [
                'uuid'         => $r->uuid,
                'name'         => $r->name,
                'owner_name'   => $r->owner->name,
                'cuisine'      => $r->cuisine_types,
                'status'       => $r->status->value,
                'phone'        => $r->phone,
                'accepting'    => $r->is_accepting_orders,
                'commission'   => $r->commission_rate,
                'created_at'   => $r->created_at->toISOString(),
            ])
        );
    }

    public function restaurantDetail(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $r = Restaurant::where('uuid', $uuid)->with(['owner', 'hours', 'categories', 'menuItems'])->firstOrFail();

        return response()->json([
            'data' => [
                'uuid'            => $r->uuid,
                'name'            => $r->name,
                'description'     => $r->description,
                'cuisine'         => $r->cuisine_types,
                'phone'           => $r->phone,
                'address'         => $r->address,
                'lat'             => $r->lat,
                'lng'             => $r->lng,
                'status'          => $r->status->value,
                'commission'      => $r->commission_rate,
                'accepting'       => $r->is_accepting_orders,
                'prep_avg_min'    => $r->prep_avg_time_min,
                'logo_url'        => $r->logo_path ? Storage::url($r->logo_path) : null,
                'trade_license_url'=> $r->trade_license_path ? Storage::url($r->trade_license_path) : null,
                'food_safety_url' => $r->food_safety_cert_path ? Storage::url($r->food_safety_cert_path) : null,
                'owner'           => ['uuid' => $r->owner->uuid, 'name' => $r->owner->name, 'email' => $r->owner->email, 'status' => $r->owner->status->value],
                'hours'           => $r->hours->map(fn ($h) => ['day' => $h->day_of_week, 'open' => $h->open_time, 'close' => $h->close_time, 'closed' => $h->is_closed]),
                'stats'           => [
                    'total_orders'   => $r->orders()->count(),
                    'orders_today'   => $r->orders()->whereDate('created_at', today())->count(),
                    'avg_rating'     => round($r->ratings()->avg('stars') ?? 0, 1),
                    'menu_items'     => $r->menuItems()->count(),
                    'revenue_today'  => number_format($r->orders()->whereDate('created_at', today())->where('status', 'delivered')->sum('total_fils') / 100, 2),
                ],
                'created_at' => $r->created_at->toISOString(),
            ],
        ]);
    }

    public function updateRestaurant(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $r = Restaurant::where('uuid', $uuid)->firstOrFail();

        $valid = $request->validate([
            'commission_rate' => 'numeric|min:0|max:1',
            'is_accepting_orders' => 'boolean',
            'status' => 'string',
        ]);

        $r->update($valid);

        AuditLog::create(['user_id' => $request->user()->id, 'action' => 'restaurant.updated', 'resource_type' => 'restaurant', 'resource_id' => $r->id, 'new_values' => $valid, 'ip_address' => $request->ip()]);

        return response()->json(['data' => ['message' => 'Restaurant updated.']]);
    }

    public function suspendRestaurant(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $r = Restaurant::where('uuid', $uuid)->firstOrFail();
        $reason = $request->input('reason', '');

        $r->update(['status' => RestaurantStatus::Suspended]);
        $r->owner->update(['status' => UserStatus::Suspended]);

        AuditLog::create(['user_id' => $request->user()->id, 'action' => 'restaurant.suspended', 'resource_type' => 'restaurant', 'resource_id' => $r->id, 'new_values' => ['reason' => $reason], 'ip_address' => $request->ip()]);

        return response()->json(['data' => ['message' => 'Restaurant suspended.']]);
    }

    public function unsuspendRestaurant(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $r = Restaurant::where('uuid', $uuid)->firstOrFail();
        $r->update(['status' => RestaurantStatus::Active]);
        $r->owner->update(['status' => UserStatus::Verified]);

        AuditLog::create(['user_id' => $request->user()->id, 'action' => 'restaurant.unsuspended', 'resource_type' => 'restaurant', 'resource_id' => $r->id, 'ip_address' => $request->ip()]);

        return response()->json(['data' => ['message' => 'Restaurant reactivated.']]);
    }

    // ─── Driver Management (All) ────────────────────────────

    public function allDrivers(Request $request): JsonResponse { $this->authorizeAdmin();
        $q = User::where('role', 'driver');

        if ($status = $request->input('status')) {
            $q->where('status', $status);
        }
        if ($online = $request->input('online')) {
            $q->whereHas('driverLocation', fn ($q) => $q->where('is_online', $online === 'true' || $online === '1'));
        }
        if ($search = $request->input('search')) {
            $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $drivers = $q->with('driverLocation')->latest()->paginate(20);

        return response()->json(
            $drivers->through(fn ($d) => [
                'uuid'            => $d->uuid,
                'name'            => $d->name,
                'email'           => $d->email,
                'phone'           => $d->phone,
                'status'          => $d->status->value,
                'is_online'       => $d->driverLocation?->is_online ?? false,
                'deliveries'      => $d->driverOrders()->where('status', 'delivered')->count(),
                'active_delivery' => $d->driverOrders()->whereIn('status', ['assigned', 'picked_up', 'delivering'])->count(),
                'created_at'      => $d->created_at->toISOString(),
            ])
        );
    }

    // ─── Dispute Detail ──────────────────────────────────────

    public function disputeDetail(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $d = Dispute::where('uuid', $uuid)->with(['order.items', 'order.restaurant', 'order.driver', 'order.statusLog', 'order.payment', 'customer'])->firstOrFail();

        return response()->json([
            'data' => [
                'uuid'          => $d->uuid,
                'reason'        => $d->reason,
                'description'   => $d->description,
                'status'        => $d->status->value,
                'photos'        => $d->photos ? array_map(fn ($p) => Storage::url($p), $d->photos) : [],
                'resolution_note'=> $d->resolution_note,
                'customer'      => ['name' => $d->customer->name, 'email' => $d->customer->email, 'phone' => $d->customer->phone],
                'order'         => [
                    'uuid'         => $d->order->uuid,
                    'order_number' => $d->order->order_number,
                    'status'       => $d->order->status->value,
                    'total'        => number_format($d->order->total_fils / 100, 2),
                    'items'        => $d->order->items->map(fn ($i) => ['name' => $i->name, 'qty' => $i->quantity, 'price' => number_format($i->unit_price_fils / 100, 2)]),
                    'restaurant'   => $d->order->restaurant?->name,
                    'driver'       => $d->order->driver ? ['name' => $d->order->driver->name, 'phone' => $d->order->driver->phone] : null,
                    'timeline'     => $d->order->statusLog->sortBy('created_at')->values()->map(fn ($l) => ['from' => $l->from_status, 'to' => $l->to_status, 'by' => $l->changed_by_type, 'note' => $l->note, 'at' => $l->created_at->toISOString()]),
                    'payment'      => $d->order->payment ? ['status' => $d->order->payment->status->value, 'amount' => number_format($d->order->payment->amount_fils / 100, 2)] : null,
                ],
                'created_at'    => $d->created_at->toISOString(),
            ],
        ]);
    }

    // ─── Cart Monitoring ─────────────────────────────────────

    public function activeCarts(Request $request): JsonResponse { $this->authorizeAdmin();
        $carts = \App\Models\Cart::with(['customer:id,uuid,name,email', 'restaurant:id,uuid,name'])
            ->where('expires_at', '>', now())
            ->withCount('items')
            ->latest()
            ->paginate(20);

        return response()->json(
            $carts->through(fn ($c) => [
                'uuid'            => $c->uuid,
                'customer'        => $c->customer?->name ?? 'Unknown',
                'customer_email'  => $c->customer?->email,
                'restaurant'      => $c->restaurant?->name ?? 'No restaurant',
                'items_count'     => $c->items_count,
                'expires_at'      => $c->expires_at->toISOString(),
                'created_at'      => $c->created_at->toISOString(),
            ])
        );
    }

    public function abandonedCarts(Request $request): JsonResponse { $this->authorizeAdmin();
        $cutoff = now()->subHours(12);
        $carts = \App\Models\Cart::with(['customer:id,uuid,name,email'])
            ->where('expires_at', '<', now())
            ->where('updated_at', '>', $cutoff)
            ->withCount('items')
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $carts->through(fn ($c) => [
                'uuid'       => $c->uuid,
                'customer'   => $c->customer?->name ?? 'Unknown',
                'email'      => $c->customer?->email,
                'items_count'=> $c->items_count,
                'expired_at' => $c->expires_at->toISOString(),
                'updated_at' => $c->updated_at->toISOString(),
            ]),
            'meta' => ['total' => $carts->total()],
        ]);
    }

    // ─── System Health ───────────────────────────────────────

    public function systemHealth(Request $request): JsonResponse { $this->authorizeAdmin();
        $dbOk = true; $cacheOk = true; $queueOk = true;
        try { \Illuminate\Support\Facades\DB::connection()->getPdo(); } catch (\Throwable) { $dbOk = false; }
        try { \Illuminate\Support\Facades\Cache::set('health_check', 1, 10); \Illuminate\Support\Facades\Cache::get('health_check'); } catch (\Throwable) { $cacheOk = false; }

        $queueSize = \Illuminate\Support\Facades\DB::table('jobs')->count();
        $failedJobs = \Illuminate\Support\Facades\DB::table('failed_jobs')->count();
        $totalUsers = User::count();
        $totalOrders = \App\Models\Order::count();
        $todayOrders = \App\Models\Order::whereDate('created_at', today())->count();
        $totalRevenue = \App\Models\Order::whereIn('status', ['delivered', 'resolved', 'refunded'])->sum('total_fils');
        $pushTokens = \App\Models\PushToken::count();
        $activeCarts = \App\Models\Cart::where('expires_at', '>', now())->count();
        $abandonedCarts = \App\Models\Cart::where('expires_at', '<', now())->where('updated_at', '>', now()->subDays(7))->count();

        return response()->json([
            'data' => [
                'health' => [
                    'database' => $dbOk ? 'ok' : 'down',
                    'cache'    => $cacheOk ? 'ok' : 'down',
                    'queue'    => 'ok',
                ],
                'queue' => ['pending' => $queueSize, 'failed' => $failedJobs],
                'stats' => [
                    'total_users'      => $totalUsers,
                    'total_orders'     => $totalOrders,
                    'today_orders'     => $todayOrders,
                    'total_revenue'    => number_format($totalRevenue / 100, 2),
                    'push_tokens'      => $pushTokens,
                    'active_carts'     => $activeCarts,
                    'abandoned_carts'  => $abandonedCarts,
                ],
            ],
        ]);
    }

    // ─── Analytics ───────────────────────────────────────────

    public function analytics(Request $request): JsonResponse { $this->authorizeAdmin();
        $days = (int) ($request->input('days', 30));

        // Revenue trend
        $revenue = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $d = now()->subDays($i);
            $rev = Order::whereDate('created_at', $d)->whereIn('status', ['delivered', 'resolved', 'refunded'])->sum('total_fils');
            $cnt = Order::whereDate('created_at', $d)->count();
            $revenue[] = ['date' => $d->format('Y-m-d'), 'revenue' => (int) round($rev / 100), 'orders' => $cnt];
        }

        // Customer acquisition
        $signups = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $d = now()->subDays($i);
            $signups[] = ['date' => $d->format('Y-m-d'), 'count' => User::whereDate('created_at', $d)->count()];
        }

        // Driver utilization (deliveries per driver per day)
        $driverUtil = [];
        for ($i = $days - 1; $i >= 0; $i -= max(1, (int) ($days / 14))) {
            $d = now()->subDays($i);
            $deliveries = Order::whereDate('created_at', $d)->where('status', 'delivered')->whereNotNull('driver_id')->count();
            $activeDrivers = Order::whereDate('created_at', $d)->where('status', 'delivered')->whereNotNull('driver_id')->distinct('driver_id')->count('driver_id');
            $driverUtil[] = ['date' => $d->format('Y-m-d'), 'deliveries' => $deliveries, 'active_drivers' => $activeDrivers, 'avg_per_driver' => $activeDrivers > 0 ? round($deliveries / $activeDrivers, 1) : 0];
        }

        // Top metrics
        $totalRevenue = Order::whereIn('status', ['delivered', 'resolved', 'refunded'])->sum('total_fils');
        $totalOrders = Order::count();
        $avgOrderValue = $totalOrders > 0 ? (int) round($totalRevenue / $totalOrders / 100) : 0;
        $cancelRate = $totalOrders > 0 ? round(Order::whereIn('status', ['cancelled', 'rejected', 'expired'])->count() / $totalOrders * 100, 1) : 0;
        $disputeRate = $totalOrders > 0 ? round(Dispute::count() / $totalOrders * 100, 1) : 0;
        $totalCustomers = User::where('role', 'customer')->count();
        $totalDrivers = User::where('role', 'driver')->count();
        $totalRestaurants = Restaurant::count();
        $avgDeliveryMin = (int) round(Order::whereNotNull('actual_delivery_min')->avg('actual_delivery_min') ?? 0);

        return response()->json([
            'data' => [
                'revenue_trend'    => $revenue,
                'signup_trend'     => $signups,
                'driver_util'      => $driverUtil,
                'metrics'          => [
                    'total_revenue'      => number_format($totalRevenue / 100, 2),
                    'total_orders'       => $totalOrders,
                    'avg_order_value'    => $avgOrderValue,
                    'cancel_rate'        => $cancelRate,
                    'dispute_rate'       => $disputeRate,
                    'total_customers'    => $totalCustomers,
                    'total_drivers'      => $totalDrivers,
                    'total_restaurants'  => $totalRestaurants,
                    'avg_delivery_min'   => $avgDeliveryMin,
                ],
            ],
        ]);
    }

    // ─── Admin Roles & Security ──────────────────────────────

    public function adminUsers(Request $request): JsonResponse { $this->authorizeAdmin();
        $admins = User::where('role', 'admin')->latest()->paginate(20);

        return response()->json(
            $admins->through(fn ($u) => [
                'uuid'       => $u->uuid,
                'name'       => $u->name,
                'email'      => $u->email,
                'admin_role' => $u->admin_role ?? 'admin',
                'status'     => $u->status->value,
                'created_at' => $u->created_at->toISOString(),
            ])
        );
    }

    public function updateAdminUser(Request $request, string $uuid): JsonResponse { $this->authorizeAdmin();
        $u = User::where('uuid', $uuid)->where('role', 'admin')->firstOrFail();

        $valid = $request->validate(['admin_role' => 'required|in:super_admin,admin,support,read_only']);
        $u->update(['admin_role' => $valid['admin_role']]);

        AuditLog::create(['user_id' => $request->user()->id, 'action' => 'admin.role_updated', 'resource_type' => 'admin_user', 'resource_id' => $u->id, 'new_values' => $valid, 'ip_address' => $request->ip()]);

        return response()->json(['data' => ['message' => 'Admin role updated.']]);
    }

    public function createAdminUser(Request $request): JsonResponse { $this->authorizeAdmin();
        $valid = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'required|min:8',
            'admin_role' => 'required|in:super_admin,admin,support,read_only',
        ]);

        $u = User::create([
            'uuid'       => (string) \Illuminate\Support\Str::uuid(),
            'name'       => $valid['name'],
            'email'      => $valid['email'],
            'password'   => bcrypt($valid['password']),
            'role'       => UserRole::Admin,
            'admin_role' => $valid['admin_role'],
            'status'     => UserStatus::Verified,
            'email_verified_at' => now(),
        ]);

        AuditLog::create(['user_id' => $request->user()->id, 'action' => 'admin.created', 'resource_type' => 'admin_user', 'resource_id' => $u->id, 'new_values' => ['email' => $valid['email'], 'admin_role' => $valid['admin_role']], 'ip_address' => $request->ip()]);

        return response()->json(['data' => ['uuid' => $u->uuid, 'message' => 'Admin user created.']], 201);
    }

    public function ipWhitelist(Request $request): JsonResponse { $this->authorizeAdmin();
        $ips = \App\Models\AppConfig::get('admin_ip_whitelist', []);
        return response()->json(['data' => ['ips' => $ips]]);
    }

    public function updateIpWhitelist(Request $request): JsonResponse { $this->authorizeAdmin();
        $valid = $request->validate(['ips' => 'required|array', 'ips.*' => 'ip']);
        \App\Models\AppConfig::set('admin_ip_whitelist', $valid['ips'], 'Admin panel IP whitelist');

        AuditLog::create(['user_id' => $request->user()->id, 'action' => 'settings.ip_whitelist.updated', 'resource_type' => 'platform_settings', 'new_values' => $valid, 'ip_address' => $request->ip()]);

        return response()->json(['data' => ['message' => 'IP whitelist updated.', 'ips' => $valid['ips']]]);
    }

    // ─── Audit Log ───────────────────────────────────────────

    public function auditLogs(Request $request): JsonResponse { $this->authorizeAdmin();
        $q = AuditLog::with('user');

        if ($action = $request->input('action')) {
            $q->where('action', 'like', "%{$action}%");
        }
        if ($admin = $request->input('admin')) {
            $q->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$admin}%"));
        }
        if ($dateFrom = $request->input('date_from')) {
            $q->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $q->whereDate('created_at', '<=', $dateTo);
        }
        if ($search = $request->input('search')) {
            $q->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('resource_type', 'like', "%{$search}%");
            });
        }

        $logs = $q->latest()->paginate(30);

        return response()->json(
            $logs->through(fn ($l) => [
                'id'            => $l->id,
                'action'        => $l->action,
                'user'          => $l->user?->name ?? 'System',
                'resource_type' => $l->resource_type,
                'resource_id'   => $l->resource_id,
                'new_values'    => $l->new_values,
                'ip_address'    => $l->ip_address,
                'created_at'    => $l->created_at->toISOString(),
            ])
        );
    }

    // ─── Dashboard Sub-Endpoints (independent refresh) ────────

    public function revenueChart(Request $request): JsonResponse
    {
        $this->authorizeAdmin();
        $days = (int) ($request->input('days', 7));

        $data = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $rev = Order::whereDate('created_at', $date)
                ->whereIn('status', ['delivered', 'resolved', 'refunded'])
                ->sum('total_fils');
            $data[] = ['date' => $date->format('M d'), 'revenue' => (int) round($rev / 100)];
        }

        return response()->json(['data' => $data]);
    }

    public function orderVolume(Request $request): JsonResponse
    {
        $this->authorizeAdmin();
        $days = (int) ($request->input('days', 7));

        $data = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $data[] = [
                'date' => $date->format('M d'),
                'total' => Order::whereDate('created_at', $date)->count(),
                'delivered' => Order::whereDate('created_at', $date)->where('status', 'delivered')->count(),
                'cancelled' => Order::whereDate('created_at', $date)->whereIn('status', ['cancelled', 'rejected', 'expired'])->count(),
            ];
        }

        return response()->json(['data' => $data]);
    }

    public function topRestaurants(Request $request): JsonResponse
    {
        $this->authorizeAdmin();
        $days = (int) ($request->input('days', 7));

        $top = Restaurant::withCount(['orders' => function ($q) use ($days) {
            $q->whereBetween('created_at', [now()->subDays($days)->startOfDay(), now()->endOfDay()]);
        }])->orderByDesc('orders_count')->limit(5)->get()->map(fn ($r) => [
            'uuid' => $r->uuid,
            'name' => $r->name,
            'order_count' => $r->orders_count,
            'cuisine' => $r->cuisine_types[0] ?? '',
            'revenue' => number_format($r->orders()->whereBetween('created_at', [now()->subDays($days)->startOfDay(), now()->endOfDay()])->where('status', 'delivered')->sum('total_fils') / 100, 2),
        ]);

        return response()->json(['data' => $top]);
    }

    public function recentActivity(Request $request): JsonResponse
    {
        $this->authorizeAdmin();
        $limit = (int) ($request->input('limit', 20));

        $auditLogs = AuditLog::with('user')->latest()->limit($limit)->get()->map(fn ($log) => [
            'action' => $log->action,
            'user' => $log->user?->name ?? 'System',
            'resource_type' => $log->resource_type,
            'timestamp' => $log->created_at->diffForHumans(),
            'iso_timestamp' => $log->created_at->toISOString(),
        ])->toArray();

        $orderLogs = OrderStatusLog::with('order')->latest()->limit($limit)->get()->map(fn ($log) => [
            'action' => 'order.'.$log->to_status,
            'user' => ucfirst($log->changed_by_type),
            'resource_type' => 'order',
            'detail' => $log->order?->order_number ?? '',
            'timestamp' => $log->created_at->diffForHumans(),
            'iso_timestamp' => $log->created_at->toISOString(),
        ])->toArray();

        $feed = collect([...$auditLogs, ...$orderLogs])
            ->sortByDesc('iso_timestamp')
            ->take($limit)
            ->values()
            ->toArray();

        return response()->json(['data' => $feed]);
    }

    private function authorizeAdmin(): void { abort_if(! request()->user()?->isAdmin(), 403); }
}
