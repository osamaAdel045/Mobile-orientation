<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Str;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Refund;
use Stripe\Stripe;

class PaymentService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function preAuthorize(User $customer, int $amountFils, string $idempotencyKey, ?string $paymentMethodId = null): Payment
    {
        // Test mode: create mock payment without Stripe
        if (app()->environment('testing') || ! config('services.stripe.secret')) {
            return Payment::create([
                'uuid' => (string) Str::uuid(),
                'stripe_payment_intent_id' => 'pi_test_'.Str::random(16),
                'amount_fils' => $amountFils,
                'status' => PaymentStatus::PreAuthorized,
            ]);
        }

        try {
            $intent = PaymentIntent::create([
                'amount' => $amountFils,
                'currency' => 'aed',
                'customer' => $this->getStripeCustomerId($customer),
                'payment_method' => $paymentMethodId ?? 'pm_card_visa',
                'capture_method' => 'manual',
                'confirm' => true,
            ], [
                'idempotency_key' => "preauth_{$idempotencyKey}",
            ]);
        } catch (ApiErrorException $e) {
            throw new \RuntimeException('Payment failed: '.$e->getMessage());
        }

        return Payment::create([
            'uuid' => (string) Str::uuid(),
            'stripe_payment_intent_id' => $intent->id,
            'amount_fils' => $amountFils,
            'status' => PaymentStatus::PreAuthorized,
        ]);
    }

    public function capture(Payment $payment): Payment
    {
        if ($this->isTestMode()) {
            $payment->update(['status' => PaymentStatus::Captured]);

            return $payment;
        }

        try {
            $intent = PaymentIntent::retrieve($payment->stripe_payment_intent_id);
            $intent->capture();
        } catch (ApiErrorException $e) {
            throw new \RuntimeException('Capture failed: '.$e->getMessage());
        }

        $payment->update(['status' => PaymentStatus::Captured]);

        return $payment;
    }

    public function void(Payment $payment): Payment
    {
        if (! $this->isTestMode()) {
            try {
                $intent = PaymentIntent::retrieve($payment->stripe_payment_intent_id);
                if ($intent->status === 'requires_capture') {
                    $intent->cancel();
                }
            } catch (ApiErrorException) {
                // Already processed — ignore
            }
        }

        $payment->update(['status' => PaymentStatus::Voided]);

        return $payment;
    }

    public function refund(Payment $payment, int $amountFils, string $reason = ''): Payment
    {
        if (! $this->isTestMode()) {
            try {
                Refund::create([
                    'payment_intent' => $payment->stripe_payment_intent_id,
                    'amount' => $amountFils,
                    'reason' => 'requested_by_customer',
                ]);
            } catch (ApiErrorException $e) {
                throw new \RuntimeException('Refund failed: '.$e->getMessage());
            }
        }

        $status = $amountFils >= $payment->amount_fils
            ? PaymentStatus::Refunded
            : PaymentStatus::PartiallyRefunded;

        $payment->update([
            'status' => $status,
            'refund_amount_fils' => $amountFils,
            'refund_reason' => $reason,
        ]);

        return $payment;
    }

    private function isTestMode(): bool
    {
        return app()->environment('testing') || ! config('services.stripe.secret');
    }

    private function getStripeCustomerId(User $user): ?string
    {
        // In production: create/lookup Stripe Customer
        // For Phase 1: use a test customer
        return null;
    }
}
