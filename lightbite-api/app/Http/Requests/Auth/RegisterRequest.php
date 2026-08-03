<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'regex:/[A-Z]/', 'regex:/[0-9]/', 'confirmed'],
            'role' => ['required', 'string', Rule::in(['customer', 'restaurant', 'driver'])],
            'phone' => ['nullable', 'string', 'max:20'],
            'restaurant_name' => ['required_if:role,restaurant', 'string', 'max:255'],
            'cuisine_types' => ['required_if:role,restaurant', 'array', 'min:1'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        $errors = $validator->errors();

        // Map email uniqueness to 409
        if ($errors->has('email') && collect($errors->get('email'))->contains(fn ($m) => str_contains($m, 'taken'))) {
            throw new HttpResponseException(response()->json([
                'error' => ['code' => 'EMAIL_TAKEN', 'message' => 'An account with this email already exists.'],
                'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
            ], Response::HTTP_CONFLICT));
        }

        throw new HttpResponseException(response()->json([
            'error' => [
                'code' => 'VALIDATION_ERROR',
                'message' => 'The given data was invalid.',
                'details' => collect($errors->messages())->map(fn ($msgs, $field) => [
                    'field' => $field,
                    'message' => $msgs[0],
                ])->values()->toArray(),
            ],
            'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
        ], Response::HTTP_UNPROCESSABLE_ENTITY));
    }
}
