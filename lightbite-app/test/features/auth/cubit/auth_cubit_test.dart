import 'dart:io';
import 'package:bloc_test/bloc_test.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:lightbite_app/core/constants/app_enums.dart';
import 'package:lightbite_app/core/domain/entities/auth_user.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/features/auth/domain/repositories/auth_repository.dart';
import 'package:lightbite_app/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:lightbite_app/features/auth/presentation/cubit/auth_state.dart';
import 'package:mocktail/mocktail.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

const testUser = AuthUser(
  uuid: 'uuid-1',
  name: 'Test User',
  email: 'test@lightbite.com',
  role: UserRole.customer,
  status: AuthStatus.verified,
);

void main() {
  late MockAuthRepository mockRepo;

  setUp(() async {
    HydratedBloc.storage = await HydratedStorage.build(
      storageDirectory: HydratedStorageDirectory(
        Directory.systemTemp.createTempSync('hydrated_test_').path,
      ),
    );
    mockRepo = MockAuthRepository();
  });

  group('AuthCubit', () {
    test('initial state is AuthInitial()', () {
      final cubit = AuthCubit(authRepo: mockRepo);
      expect(cubit.state, const AuthInitial());
      cubit.close();
    });

    blocTest<AuthCubit, AuthState>(
      'checkAuth emits authenticated when user exists',
      build: () {
        when(() => mockRepo.checkAuth()).thenAnswer((_) async => testUser);
        return AuthCubit(authRepo: mockRepo);
      },
      act: (cubit) => cubit.checkAuth(),
      expect: () => [AuthAuthenticated(testUser)],
    );

    blocTest<AuthCubit, AuthState>(
      'checkAuth stays initial when no user',
      build: () {
        when(() => mockRepo.checkAuth()).thenAnswer((_) async => null);
        return AuthCubit(authRepo: mockRepo);
      },
      act: (cubit) => cubit.checkAuth(),
      expect: () => [],
      verify: (cubit) => expect(cubit.state, const AuthInitial()),
    );

    blocTest<AuthCubit, AuthState>(
      'login emits loading then authenticated on success',
      build: () {
        when(() => mockRepo.login(any(), any()))
            .thenAnswer((_) async => const Right(testUser));
        return AuthCubit(authRepo: mockRepo);
      },
      act: (cubit) => cubit.login('test@lightbite.com', 'password'),
      expect: () => [
        const AuthLoading(),
        AuthAuthenticated(testUser),
      ],
    );

    blocTest<AuthCubit, AuthState>(
      'login emits loading then error on failure',
      build: () {
        when(() => mockRepo.login(any(), any()))
            .thenAnswer((_) async => const Left(AuthFailure('Invalid credentials.')));
        return AuthCubit(authRepo: mockRepo);
      },
      act: (cubit) => cubit.login('bad@email.com', 'wrong'),
      expect: () => [
        const AuthLoading(),
        const AuthError('Invalid credentials.'),
      ],
    );

    blocTest<AuthCubit, AuthState>(
      'login emits loading then error on network failure',
      build: () {
        when(() => mockRepo.login(any(), any()))
            .thenAnswer((_) async => const Left(NetworkFailure()));
        return AuthCubit(authRepo: mockRepo);
      },
      act: (cubit) => cubit.login('test@lightbite.com', 'password'),
      expect: () => [
        const AuthLoading(),
        const AuthError('No internet connection. Check your network and try again.'),
      ],
    );

    blocTest<AuthCubit, AuthState>(
      'logout calls repo.logout and emits initial',
      build: () {
        when(() => mockRepo.logout()).thenAnswer((_) async {});
        when(() => mockRepo.checkAuth()).thenAnswer((_) async => testUser);
        return AuthCubit(authRepo: mockRepo);
      },
      seed: () => AuthAuthenticated(testUser),
      act: (cubit) => cubit.logout(),
      expect: () => [const AuthInitial()],
      verify: (_) => verify(() => mockRepo.logout()).called(1),
    );
  });
}
