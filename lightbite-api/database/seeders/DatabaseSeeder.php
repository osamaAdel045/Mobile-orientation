<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\DisputeStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\RestaurantStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Dispute;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Rating;
use App\Models\Restaurant;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        $admin = User::create([
            'uuid' => (string) Str::uuid(), 'name' => 'Layla Admin',
            'email' => 'admin@lightbite.com', 'password' => bcrypt('SecureP4ss!'),
            'role' => UserRole::Admin, 'status' => UserStatus::Verified,
            'email_verified_at' => now(), 'phone' => '+971501111111',
        ]);

        // Customers
        $customers = [];
        foreach (['Sarah Chen', 'Omar Ali', 'Fatima Hassan', 'James Wilson', 'Noor Ahmed'] as $i => $name) {
            $customers[] = $u = User::create([
                'uuid' => (string) Str::uuid(), 'name' => $name,
                'email' => strtolower(str_replace(' ', '.', $name)).'@email.com',
                'password' => bcrypt('SecureP4ss!'), 'role' => UserRole::Customer,
                'status' => UserStatus::Verified, 'email_verified_at' => now(),
                'phone' => '+97150'.random_int(1000000, 9999999),
            ]);
            UserAddress::create([
                'user_id' => $u->id, 'uuid' => (string) Str::uuid(), 'label' => 'home',
                'address' => 'Dubai Marina, Tower '.($i + 1),
                'lat' => 25.0800 + ($i * 0.002), 'lng' => 55.1400 + ($i * 0.002), 'is_default' => true,
            ]);
        }

        // Restaurants + menus
        $restaurantDefs = [
            ['name' => 'Spice Route', 'cuisine' => ['lebanese', 'middle_eastern'], 'status' => RestaurantStatus::Active],
            ['name' => 'Sushi Zen', 'cuisine' => ['japanese', 'asian'], 'status' => RestaurantStatus::Active],
            ['name' => 'Pasta Paradise', 'cuisine' => ['italian'], 'status' => RestaurantStatus::Active],
            ['name' => 'Beirut Bistro', 'cuisine' => ['lebanese', 'mediterranean'], 'status' => RestaurantStatus::PendingVerification],
            ['name' => 'Tandoori House', 'cuisine' => ['indian'], 'status' => RestaurantStatus::PendingVerification],
            ['name' => 'Dragon Wok', 'cuisine' => ['chinese'], 'status' => RestaurantStatus::Rejected],
            ['name' => 'Burger Lab', 'cuisine' => ['american'], 'status' => RestaurantStatus::Active, 'paused' => true],
            ['name' => 'Green Bowl', 'cuisine' => ['healthy', 'vegan'], 'status' => RestaurantStatus::Inactive],
        ];

        $restaurants = [];
        $allMenuItems = [];
        foreach ($restaurantDefs as $rd) {
            $owner = User::create([
                'uuid' => (string) Str::uuid(), 'name' => $rd['name'].' Owner',
                'email' => strtolower(str_replace(' ', '.', $rd['name'])).'@lightbite.com',
                'password' => bcrypt('SecureP4ss!'), 'role' => UserRole::Restaurant,
                'status' => match ($rd['status']) {
                    RestaurantStatus::PendingVerification => UserStatus::PendingVerification,
                    RestaurantStatus::Rejected => UserStatus::Rejected,
                    default => UserStatus::Verified,
                },
                'email_verified_at' => now(), 'phone' => '+9714'.random_int(1000000, 9999999),
            ]);

            $r = Restaurant::create([
                'uuid' => (string) Str::uuid(), 'owner_id' => $owner->id, 'name' => $rd['name'],
                'description' => fake()->sentence(10), 'cuisine_types' => $rd['cuisine'],
                'phone' => '+9714'.random_int(1000000, 9999999), 'address' => fake()->address(),
                'lat' => 25.05 + (random_int(0, 100) / 1000), 'lng' => 55.10 + (random_int(0, 100) / 1000),
                'status' => $rd['status'], 'is_accepting_orders' => ! ($rd['paused'] ?? false),
                'prep_avg_time_min' => random_int(15, 35), 'commission_rate' => 0.120,
            ]);
            $restaurants[] = $r;

            $menuMap = ['Appetizers' => ['Hummus' => 1800, 'Spring Rolls' => 2200, 'Garlic Bread' => 1600, 'Bruschetta' => 1900],
                'Mains' => ['Grilled Chicken' => 3500, 'Mixed Grill' => 5500, 'Pasta Alfredo' => 3200, 'Shawarma Plate' => 3000, 'Biryani' => 3800],
                'Desserts' => ['Chocolate Cake' => 2500, 'Tiramisu' => 2800, 'Baklava' => 2200],
                'Drinks' => ['Water' => 500, 'Soft Drink' => 800, 'Fresh Juice' => 1200, 'Coffee' => 1500]];
            foreach ($menuMap as $catName => $items) {
                $cat = $r->categories()->create(['name' => $catName, 'sort_order' => array_search($catName, array_keys($menuMap)) + 1]);
                foreach ($items as $foodName => $price) {
                    $allMenuItems[$rd['name']][] = MenuItem::create([
                        'uuid' => (string) Str::uuid(), 'restaurant_id' => $r->id, 'category_id' => $cat->id,
                        'name' => $foodName, 'description' => fake()->sentence(5), 'price_fils' => $price,
                        'is_available' => random_int(0, 10) > 1,
                    ]);
                }
            }
        }

        // Drivers
        $drivers = [];
        foreach ([
            ['Khalid Mohammed', UserStatus::Verified], ['Ahmed Ibrahim', UserStatus::Verified],
            ['Rashid Khan', UserStatus::Verified], ['Mohammed Ali', UserStatus::PendingVerification],
            ['Bilal Hassan', UserStatus::PendingVerification], ['Tariq Mahmoud', UserStatus::Rejected],
        ] as $dd) {
            $drivers[] = User::create([
                'uuid' => (string) Str::uuid(), 'name' => $dd[0],
                'email' => strtolower(str_replace(' ', '.', $dd[0])).'@driver.com',
                'password' => bcrypt('SecureP4ss!'), 'role' => UserRole::Driver,
                'status' => $dd[1], 'email_verified_at' => now(),
                'phone' => '+97155'.random_int(1000000, 9999999),
            ]);
        }

        // Orders
        $statuses = [
            OrderStatus::Delivered, OrderStatus::Delivered, OrderStatus::Delivered, OrderStatus::Delivered,
            OrderStatus::Confirmed, OrderStatus::Preparing, OrderStatus::Pending, OrderStatus::Pending,
            OrderStatus::Ready, OrderStatus::Delivering, OrderStatus::Delivering,
            OrderStatus::Rejected, OrderStatus::Cancelled, OrderStatus::Disputed, OrderStatus::Disputed,
        ];

        $orders = [];
        foreach ($statuses as $i => $status) {
            $cust = $customers[array_rand($customers)];
            $rest = $restaurants[0]; if ($i > 9) $rest = $restaurants[1];
            $items = $allMenuItems[$rest->name];
            if (empty($items)) continue;

            $sub = 0; $oi = [];
            for ($j = 0; $j < random_int(1, 3); $j++) {
                $p = $items[array_rand($items)]; $q = random_int(1, 2);
                $sub += $p->price_fils * $q; $oi[] = ['item' => $p, 'qty' => $q];
            }
            $df = 500; $tx = (int) round(($sub + $df) * 0.05);
            $drv = in_array($status, [OrderStatus::Assigned, OrderStatus::Delivering, OrderStatus::Delivered, OrderStatus::Disputed]) ? $drivers[array_rand(array_slice($drivers, 0, 3))] : null;

            $o = Order::create([
                'uuid' => (string) Str::uuid(), 'order_number' => 'LB-'.now()->subDays(rand(0,3))->format('Ymd').'-'.str_pad((string)($i+1), 5, '0', STR_PAD_LEFT),
                'customer_id' => $cust->id, 'restaurant_id' => $rest->id, 'driver_id' => $drv?->id,
                'status' => $status, 'subtotal_fils' => $sub, 'delivery_fee_fils' => $df,
                'tax_fils' => $tx, 'total_fils' => $sub + $df + $tx,
                'commission_fils' => (int) round($sub * 0.12),
                'driver_earnings_fils' => $drv ? (800 + random_int(200, 600)) : null,
                'idempotency_key' => (string) Str::uuid(),
                'delivery_address_snapshot' => ['label' => 'home', 'address' => $cust->addresses()->first()?->address ?? 'Dubai'],
                'estimated_delivery_min' => random_int(25, 45),
                'created_at' => now()->subDays(rand(0,3))->subHours(rand(0,23)),
            ]);
            $orders[] = $o;
            foreach ($oi as $oiData) {
                OrderItem::create(['order_id' => $o->id, 'menu_item_id' => $oiData['item']->id, 'name' => $oiData['item']->name, 'quantity' => $oiData['qty'], 'unit_price_fils' => $oiData['item']->price_fils]);
            }

            // Create payment for each order
            $payStatus = match($status) {
                OrderStatus::Rejected, OrderStatus::Cancelled, OrderStatus::Expired => PaymentStatus::Voided,
                OrderStatus::Delivered, OrderStatus::Disputed => PaymentStatus::Captured,
                default => PaymentStatus::PreAuthorized,
            };
            Payment::create([
                'uuid' => (string) Str::uuid(),
                'order_id' => $o->id,
                'stripe_payment_intent_id' => 'pi_test_'.Str::random(16),
                'amount_fils' => $o->total_fils,
                'status' => $payStatus,
            ]);
        }

        // Ratings
        foreach ($orders as $o) {
            if ($o->status === OrderStatus::Delivered && random_int(0, 1)) {
                Rating::create(['order_id' => $o->id, 'customer_id' => $o->customer_id, 'restaurant_id' => $o->restaurant_id, 'stars' => random_int(3, 5), 'review_text' => random_int(0, 1) ? fake()->sentence(8) : null]);
            }
        }

        // Disputes
        if (isset($orders[13])) Dispute::create(['uuid' => (string) Str::uuid(), 'order_id' => $orders[13]->id, 'customer_id' => $orders[13]->customer_id, 'reason' => 'not_delivered', 'description' => 'Order marked delivered but never received.', 'status' => DisputeStatus::Open, 'created_at' => now()->subHours(2)]);
        if (isset($orders[14])) Dispute::create(['uuid' => (string) Str::uuid(), 'order_id' => $orders[14]->id, 'customer_id' => $orders[14]->customer_id, 'reason' => 'missing_items', 'description' => 'Dessert was missing from the order.', 'status' => DisputeStatus::Open, 'created_at' => now()->subHours(4)]);

        echo "Seeded: admin, 5 customers, 8 restaurants, 6 drivers, ".count($orders)." orders, 2 disputes\n";
    }
}
