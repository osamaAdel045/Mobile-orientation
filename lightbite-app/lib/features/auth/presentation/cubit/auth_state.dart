import 'package:equatable/equatable.dart';
import 'package:lightbite_app/core/domain/entities/auth_user.dart';

sealed class AuthState extends Equatable {
  const AuthState();
  R maybeWhen<R>({R Function()? initial, R Function()? loading, R Function(AuthUser user)? authenticated, R Function(String m)? error, required R Function() orElse}) =>
    switch (this) { AuthInitial() => initial?.call() ?? orElse(), AuthLoading() => loading?.call() ?? orElse(), AuthAuthenticated(:final user) => authenticated?.call(user) ?? orElse(), AuthError(:final message) => error?.call(message) ?? orElse() };
}
class AuthInitial extends AuthState { const AuthInitial(); @override List<Object?> get props => []; }
class AuthLoading extends AuthState { const AuthLoading(); @override List<Object?> get props => []; }
class AuthAuthenticated extends AuthState { const AuthAuthenticated(this.user); final AuthUser user; @override List<Object?> get props => [user]; }
class AuthError extends AuthState { const AuthError(this.message); final String message; @override List<Object?> get props => [message]; }
