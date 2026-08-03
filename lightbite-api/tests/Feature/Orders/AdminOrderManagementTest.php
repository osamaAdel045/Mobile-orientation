<?php

declare(strict_types=1);

namespace Tests\Feature\Orders;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOrderManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $customer;
    private User $driver;
    private User $owner;
    private Restaurant $restaurant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->customer = User::factory()->customer()->create();
        $this->driver = User::factory()->driver()->create();
        $this->owner = User::factory()->restaurant()->create();
        $this->restaurant = Restaurant::factory()->create([
            'owner_id' => $this->owner->id,
            'status' => \App\Enums\RestaurantStatus::Active,
        ]);
    }

    private function createOrder(array $attrs = []): Order
    {
        return Order::create(array_merge([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'order_number' => 'LB-'.now()->format('Ymd').'-00001',
            'customer_id' => $this->customer->id,
            'restaurant_id' => $this->restaurant->id,
            'driver_id' => $this->driver->id,
            'status' => OrderStatus::Delivered,
            'subtotal_fils' => 5000,
            'delivery_fee_fils' => 500,
            'tax_fils' => 275,
            'total_fils' => 5775,
            'commission_fils' => 600,
            'idempotency_key' => (string) \Illuminate\Support\Str::uuid(),
            'delivery_address_snapshot' => ['address' => 'Test Address', 'lat' => 25.0, 'lng' => 55.0],
            'estimated_delivery_min' => 30,
        ], $attrs));
    }

    // ─── List & Filter ────────────────────────────────────

    public function test_admin_can_list_orders(): void
    {
        $this->createOrder();

        $response = $this->actingAs($this->admin, 'api')
            ->getJson('/api/v1/admin/orders');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page', 'total', 'last_page']);
    }

    public function test_admin_can_filter_orders_by_status(): void
    {
        $this->createOrder(['order_number' => 'LB-001', 'status' => OrderStatus::Pending]);
        $this->createOrder(['order_number' => 'LB-002', 'status' => OrderStatus::Delivered]);

        $response = $this->actingAs($this->admin, 'api')
            ->getJson('/api/v1/admin/orders?status=pending');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('pending', $data[0]['status']);
    }

    public function test_admin_can_search_orders(): void
    {
        $this->createOrder(['order_number' => 'LB-FINDME-001']);

        $response = $this->actingAs($this->admin, 'api')
            ->getJson('/api/v1/admin/orders?search=FINDME');

        $response->assertStatus(200);
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_admin_can_filter_orders_by_date_range(): void
    {
        $this->createOrder();

        $response = $this->actingAs($this->admin, 'api')
            ->getJson('/api/v1/admin/orders?date_from='.now()->subDay()->format('Y-m-d').'&date_to='.now()->addDay()->format('Y-m-d'));

        $response->assertStatus(200);
        $this->assertNotEmpty($response->json('data'));
    }

    // ─── Order Detail ─────────────────────────────────────

    public function test_admin_can_view_order_detail(): void
    {
        $order = $this->createOrder();

        $response = $this->actingAs($this->admin, 'api')
            ->getJson("/api/v1/admin/orders/{$order->uuid}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['uuid', 'order_number', 'status', 'customer', 'restaurant', 'items', 'timeline', 'payment', 'delivery_address'],
            ]);
    }

    // ─── Cancel ───────────────────────────────────────────

    public function test_admin_can_cancel_pending_order(): void
    {
        $order = $this->createOrder(['status' => OrderStatus::Pending]);

        $response = $this->actingAs($this->admin, 'api')
            ->postJson("/api/v1/admin/orders/{$order->uuid}/cancel", ['reason' => 'Test cancel.']);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertEquals('cancelled', $order->fresh()->status->value);
    }

    public function test_cannot_cancel_delivered_order(): void
    {
        $order = $this->createOrder(['status' => OrderStatus::Delivered]);

        $response = $this->actingAs($this->admin, 'api')
            ->postJson("/api/v1/admin/orders/{$order->uuid}/cancel", ['reason' => 'Test.']);

        $response->assertStatus(422);
    }

    // ─── Refund ───────────────────────────────────────────

    public function test_admin_can_refund_order(): void
    {
        $order = $this->createOrder(['status' => OrderStatus::Delivered]);
        // Create a captured payment for the order
        \App\Models\Payment::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'order_id' => $order->id,
            'stripe_payment_intent_id' => 'pi_test_'. \Illuminate\Support\Str::random(16),
            'amount_fils' => $order->total_fils,
            'status' => \App\Enums\PaymentStatus::Captured,
        ]);

        $response = $this->actingAs($this->admin, 'api')
            ->postJson("/api/v1/admin/orders/{$order->uuid}/refund", ['reason' => 'Wrong items.']);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'refunded');

        $this->assertEquals('refunded', $order->fresh()->status->value);
    }

    public function test_admin_can_partial_refund_order(): void
    {
        $order = $this->createOrder(['status' => OrderStatus::Delivered]);
        \App\Models\Payment::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'order_id' => $order->id,
            'stripe_payment_intent_id' => 'pi_test_'. \Illuminate\Support\Str::random(16),
            'amount_fils' => $order->total_fils,
            'status' => \App\Enums\PaymentStatus::Captured,
        ]);

        $response = $this->actingAs($this->admin, 'api')
            ->postJson("/api/v1/admin/orders/{$order->uuid}/refund", [
                'amount_fils' => 2000, // AED 20.00 partial
                'reason' => 'Missing item.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.payment_status', 'partially_refunded');
    }

    // ─── Reassign ─────────────────────────────────────────

    public function test_admin_can_reassign_driver(): void
    {
        $order = $this->createOrder(['status' => OrderStatus::Assigned]);
        $newDriver = User::factory()->driver()->create();

        $response = $this->actingAs($this->admin, 'api')
            ->postJson("/api/v1/admin/orders/{$order->uuid}/reassign", [
                'driver_uuid' => $newDriver->uuid,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'assigned');

        $this->assertEquals($newDriver->id, $order->fresh()->driver_id);
    }

    public function test_admin_can_unassign_driver(): void
    {
        $order = $this->createOrder(['status' => OrderStatus::Assigned]);

        $response = $this->actingAs($this->admin, 'api')
            ->postJson("/api/v1/admin/orders/{$order->uuid}/reassign", []);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'ready');

        $this->assertNull($order->fresh()->driver_id);
    }

    // ─── Internal Notes ───────────────────────────────────

    public function test_admin_can_add_internal_note(): void
    {
        $order = $this->createOrder();

        $response = $this->actingAs($this->admin, 'api')
            ->postJson("/api/v1/admin/orders/{$order->uuid}/note", [
                'note' => 'Customer called — driver was late.',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('order_status_log', [
            'order_id' => $order->id,
            'changed_by_type' => 'admin',
        ]);
    }

    public function test_empty_note_is_rejected(): void
    {
        $order = $this->createOrder();

        $response = $this->actingAs($this->admin, 'api')
            ->postJson("/api/v1/admin/orders/{$order->uuid}/note", ['note' => '']);

        $response->assertStatus(422);
    }

    // ─── Auth ────────────────────────────────────────────

    public function test_non_admin_cannot_manage_orders(): void
    {
        $order = $this->createOrder();

        $endpoints = [
            ['GET', "/api/v1/admin/orders"],
            ['GET', "/api/v1/admin/orders/{$order->uuid}"],
            ['POST', "/api/v1/admin/orders/{$order->uuid}/cancel"],
            ['POST', "/api/v1/admin/orders/{$order->uuid}/refund"],
            ['POST', "/api/v1/admin/orders/{$order->uuid}/reassign"],
            ['POST', "/api/v1/admin/orders/{$order->uuid}/note"],
        ];

        foreach ($endpoints as [$method, $url]) {
            $response = $this->actingAs($this->customer, 'api')->json($method, $url);
            $this->assertEquals(403, $response->status(), "{$method} {$url} should return 403");
        }
    }
}
