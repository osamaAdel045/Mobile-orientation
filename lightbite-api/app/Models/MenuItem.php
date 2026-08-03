<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MenuItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid', 'restaurant_id', 'category_id', 'name', 'description',
        'price_fils', 'image_path', 'is_available', 'prep_time_minutes', 'sort_order',
    ];

    protected function casts(): array
    {
        return ['is_available' => 'boolean'];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(MenuCategory::class);
    }
}
