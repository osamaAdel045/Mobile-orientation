<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'uuid' => (string) Str::uuid(),
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => UserRole::from($data['role']),
            'phone' => $data['phone'] ?? null,
            'status' => UserStatus::PendingVerification,
        ]);

        $tokens = $this->issueTokenPair($user);

        return ['user' => $user, ...$tokens];
    }

    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw new \RuntimeException('Invalid credentials.');
        }

        if ($user->status === UserStatus::PendingVerification) {
            throw new \RuntimeException('Email not verified. Please check your inbox.');
        }

        if ($user->status === UserStatus::Suspended || $user->status === UserStatus::Deactivated) {
            throw new \RuntimeException('Account is '.$user->status->value.'. Contact support.');
        }

        // For restaurant/driver: check if rejected or still pending verification
        if (in_array($user->role, [UserRole::Restaurant, UserRole::Driver], true)) {
            if ($user->status === UserStatus::Rejected) {
                throw new \RuntimeException('Your registration was not approved.');
            }
            if ($user->status === UserStatus::PendingVerification) {
                throw new \RuntimeException('Your account is under review.');
            }
        }

        $tokens = $this->issueTokenPair($user);

        return ['user' => $user, ...$tokens];
    }

    public function refresh(string $refreshToken): array
    {
        $tokenHash = hash('sha256', $refreshToken);
        $token = RefreshToken::where('token_hash', $tokenHash)->first();

        if (! $token || $token->isRevoked()) {
            // Token reuse detection: revoke all user tokens
            if ($token && $token->isRevoked()) {
                RefreshToken::where('user_id', $token->user_id)->update(['revoked_at' => now()]);
            }
            throw new \RuntimeException('Invalid or expired refresh token.');
        }

        if ($token->isExpired()) {
            $token->revoke();
            throw new \RuntimeException('Refresh token has expired.');
        }

        $token->revoke();

        $user = $token->user;

        return $this->issueTokenPair($user);
    }

    public function logout(string $refreshToken): void
    {
        $tokenHash = hash('sha256', $refreshToken);
        RefreshToken::where('token_hash', $tokenHash)->update(['revoked_at' => now()]);
    }

    public function sendPasswordReset(string $email): void
    {
        $user = User::where('email', $email)->first();
        if (! $user) {
            return; // Don't reveal whether email exists
        }

        // Generate reset token (in production: email it)
        $token = Str::random(64);
        cache()->put('password_reset:'.$token, $user->id, now()->addHour());
    }

    public function resetPassword(string $resetToken, string $newPassword): void
    {
        $userId = cache()->pull('password_reset:'.$resetToken);

        if (! $userId) {
            throw new \RuntimeException('Invalid or expired reset token.');
        }

        $user = User::findOrFail($userId);
        $user->password = $newPassword;
        $user->save();

        // Revoke all refresh tokens
        RefreshToken::where('user_id', $user->id)->update(['revoked_at' => now()]);
    }

    private function issueTokenPair(User $user): array
    {
        $accessToken = JWTAuth::fromUser($user);
        $refreshToken = Str::random(64);

        RefreshToken::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $refreshToken),
            'expires_at' => now()->addDays(7),
        ]);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in' => config('jwt.ttl') * 60,
        ];
    }
}
