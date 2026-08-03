import 'dart:async';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:lightbite_app/core/bloc/base_cubit.dart';
import 'package:lightbite_app/core/bus/app_events.dart';
import 'package:lightbite_app/core/bus/event_bus.dart';
import 'package:lightbite_app/features/auth/domain/repositories/auth_repository.dart';
import 'package:lightbite_app/features/auth/domain/usecases/login_user.dart';
import 'package:lightbite_app/features/auth/domain/usecases/register_user.dart';
import 'auth_state.dart';

class AuthCubit extends BaseCubit<AuthState> with HydratedMixin<AuthState> {
  AuthCubit({
    required AuthRepository authRepo,
    LoginUser? loginUseCase,
    RegisterUser? registerUseCase,
  })  : _authRepo = authRepo,
        _loginUseCase = loginUseCase ?? LoginUser(authRepo),
        _registerUseCase = registerUseCase ?? RegisterUser(authRepo),
        super(const AuthInitial()) {
    hydrate();
    _sessionSub = appBus.on<SessionExpiredEvent>().listen((_) => logout());
  }

  final AuthRepository _authRepo;
  final LoginUser _loginUseCase;
  final RegisterUser _registerUseCase;

  late final StreamSubscription<SessionExpiredEvent> _sessionSub;

  Future<void> checkAuth() async {
    final user = await _authRepo.checkAuth();
    if (user != null) {
      emit(AuthAuthenticated(user));
    }
  }

  Future<void> login(String email, String password) async {
    emit(const AuthLoading());
    final result = await _loginUseCase(LoginParams(email: email, password: password));
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  Future<void> logout() async {
    await _authRepo.logout();
    emit(const AuthInitial());
  }

  Future<void> register(String name, String email, String password, String role) async {
    emit(const AuthLoading());
    final result = await _registerUseCase(RegisterParams(
      name: name, email: email, password: password, role: role,
    ));
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  @override
  Future<void> close() {
    _sessionSub.cancel();
    return super.close();
  }

  @override
  AuthState? fromJson(Map<String, dynamic> json) => null;

  @override
  Map<String, dynamic>? toJson(AuthState state) => null;
}
