<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->latest()->get()->map(fn ($a) => [
            'uuid' => $a->uuid,
            'label' => $a->label,
            'address' => $a->address,
            'apartment' => $a->apartment,
            'lat' => $a->lat,
            'lng' => $a->lng,
            'is_default' => $a->is_default,
        ]);

        return response()->json(['data' => $addresses]);
    }

    public function store(Request $request): JsonResponse
    {
        $valid = $request->validate([
            'label' => 'required|string|max:50',
            'address' => 'required|string|max:500',
            'apartment' => 'nullable|string|max:50',
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'is_default' => 'boolean',
        ]);

        $count = $request->user()->addresses()->count();
        if ($count >= 10) {
            return response()->json(['message' => 'Maximum 10 addresses allowed.'], 422);
        }

        // If this is the first address or marked as default, unset other defaults
        if ($count === 0 || ($valid['is_default'] ?? false)) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address = $request->user()->addresses()->create([
            'uuid' => (string) Str::uuid(),
            'label' => $valid['label'],
            'address' => $valid['address'],
            'apartment' => $valid['apartment'] ?? null,
            'lat' => $valid['lat'],
            'lng' => $valid['lng'],
            'is_default' => $count === 0 || ($valid['is_default'] ?? false),
        ]);

        return response()->json([
            'data' => [
                'uuid' => $address->uuid,
                'label' => $address->label,
                'address' => $address->address,
                'apartment' => $address->apartment,
                'lat' => $address->lat,
                'lng' => $address->lng,
                'is_default' => $address->is_default,
            ],
        ], 201);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $address = $request->user()->addresses()->where('uuid', $uuid)->firstOrFail();

        $valid = $request->validate([
            'label' => 'string|max:50',
            'address' => 'string|max:500',
            'apartment' => 'nullable|string|max:50',
            'lat' => 'numeric|between:-90,90',
            'lng' => 'numeric|between:-180,180',
            'is_default' => 'boolean',
        ]);

        if ($valid['is_default'] ?? false) {
            $request->user()->addresses()->where('uuid', '!=', $uuid)->update(['is_default' => false]);
        }

        $address->update($valid);

        return response()->json([
            'data' => [
                'uuid' => $address->uuid,
                'label' => $address->label,
                'address' => $address->address,
                'apartment' => $address->apartment,
                'lat' => $address->lat,
                'lng' => $address->lng,
                'is_default' => $address->is_default,
            ],
        ]);
    }

    public function destroy(Request $request, string $uuid): JsonResponse
    {
        $address = $request->user()->addresses()->where('uuid', $uuid)->firstOrFail();

        if ($address->is_default) {
            return response()->json(['message' => 'Cannot delete default address. Set another address as default first.'], 422);
        }

        $address->delete();

        return response()->json(null, 204);
    }
}
