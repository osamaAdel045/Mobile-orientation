<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RefreshRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->register($request->validated());

            return response()->json([
                'data' => [
                    'user' => [
                        'uuid' => $result['user']->uuid,
                        'name' => $result['user']->name,
                        'email' => $result['user']->email,
                        'role' => $result['user']->role->value,
                        'status' => $result['user']->status->value,
                        'created_at' => $result['user']->created_at->toISOString(),
                    ],
                    'access_token' => $result['access_token'],
                    'refresh_token' => $result['refresh_token'],
                    'expires_in' => $result['expires_in'],
                ],
                'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
            ], Response::HTTP_CREATED);
        } catch (\Throwable $e) {
            return $this->errorResponse($e);
        }
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login(
                $request->validated('email'),
                $request->validated('password'),
            );

            return response()->json([
                'data' => [
                    'user' => [
                        'uuid' => $result['user']->uuid,
                        'name' => $result['user']->name,
                        'email' => $result['user']->email,
                        'role' => $result['user']->role->value,
                        'status' => $result['user']->status->value,
                    ],
                    'access_token' => $result['access_token'],
                    'refresh_token' => $result['refresh_token'],
                    'expires_in' => $result['expires_in'],
                ],
                'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
            ]);
        } catch (\RuntimeException $e) {
            $code = match ($e->getMessage()) {
                'Invalid credentials.' => 'INVALID_CREDENTIALS',
                'Email not verified. Please check your inbox.' => 'EMAIL_NOT_VERIFIED',
                'Your account is under review.' => 'ACCOUNT_NOT_APPROVED',
                'Your registration was not approved.' => 'ACCOUNT_NOT_APPROVED',
                default => 'LOGIN_FAILED',
            };

            $status = match ($code) {
                'INVALID_CREDENTIALS' => Response::HTTP_UNAUTHORIZED,
                'EMAIL_NOT_VERIFIED', 'ACCOUNT_NOT_APPROVED' => Response::HTTP_FORBIDDEN,
                default => Response::HTTP_FORBIDDEN,
            };

            return response()->json([
                'error' => ['code' => $code, 'message' => $e->getMessage()],
                'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
            ], $status);
        }
    }

    public function refresh(RefreshRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->refresh($request->validated('refresh_token'));

            return response()->json([
                'data' => [
                    'access_token' => $result['access_token'],
                    'refresh_token' => $result['refresh_token'],
                    'expires_in' => $result['expires_in'],
                ],
                'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
            ]);
        } catch (\RuntimeException $e) {
            $code = str_contains($e->getMessage(), 'expired')
                ? 'INVALID_REFRESH_TOKEN'
                : 'TOKEN_REUSED';

            return response()->json([
                'error' => ['code' => $code, 'message' => $e->getMessage()],
                'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
            ], Response::HTTP_UNAUTHORIZED);
        }
    }

    public function logout(RefreshRequest $request): Response
    {
        $this->authService->logout($request->validated('refresh_token'));

        return response()->noContent();
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->sendPasswordReset($request->validated('email'));

        return response()->json([
            'data' => ['message' => 'If that email exists, a reset link has been sent.'],
            'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        try {
            $this->authService->resetPassword(
                $request->validated('token'),
                $request->validated('password'),
            );

            return response()->json([
                'data' => ['message' => 'Password has been reset. All sessions have been revoked.'],
                'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'error' => ['code' => 'INVALID_RESET_TOKEN', 'message' => $e->getMessage()],
                'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    private function errorResponse(\Throwable $e): JsonResponse
    {
        return response()->json([
            'error' => ['code' => 'INTERNAL_ERROR', 'message' => 'An unexpected error occurred.'],
            'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
        ], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}
