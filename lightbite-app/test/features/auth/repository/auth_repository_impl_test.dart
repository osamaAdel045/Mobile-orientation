import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lightbite_app/core/domain/entities/auth_user.dart';
import 'package:lightbite_app/core/constants/app_enums.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import 'package:lightbite_app/features/auth/data/datasources/auth_local_datasource.dart';
import 'package:lightbite_app/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:lightbite_app/features/auth/data/models/auth_models.dart';
import 'package:lightbite_app/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:lightbite_app/features/auth/domain/repositories/auth_repository.dart';
import 'package:mocktail/mocktail.dart';

class MockAuthRemoteDataSource extends Mock implements AuthRemoteDataSource {}
class MockAuthLocalDataSource extends Mock implements AuthLocalDataSource {}

const testUser = AuthUser(
  uuid: 'u1',
  name: 'Test',
  email: 'test@lightbite.com',
  role: UserRole.customer,
  status: AuthStatus.verified,
);

final testUserModel = AuthUserModel(
  uuid: 'u1',
  name: 'Test',
  email: 'test@lightbite.com',
  role: 'customer',
  status: 'verified',
);

final testResponse = AuthResponseModel(
  user: testUserModel,
  accessToken: 'access-123',
  refreshToken: 'refresh-456',
);

void main() {
  late MockAuthRemoteDataSource mockRemote;
  late MockAuthLocalDataSource mockLocal;
  late AuthRepository repo;

  setUpAll(() {
    registerFallbackValue(testUser);
    registerFallbackValue(testResponse);
  });

  setUp(() {
    mockRemote = MockAuthRemoteDataSource();
    mockLocal = MockAuthLocalDataSource();
    repo = AuthRepositoryImpl(mockRemote, mockLocal);
  });

  group('AuthRepositoryImpl', () {
    test('checkAuth returns user when token and cached user exist', () async {
      when(() => mockLocal.getToken()).thenAnswer((_) async => 'token');
      when(() => mockLocal.getUser()).thenAnswer((_) async => testUser);

      final result = await repo.checkAuth();
      expect(result, testUser);
    });

    test('checkAuth returns null when no token', () async {
      when(() => mockLocal.getToken()).thenAnswer((_) async => null);

      final result = await repo.checkAuth();
      expect(result, isNull);
    });

    test('checkAuth returns null when token is empty', () async {
      when(() => mockLocal.getToken()).thenAnswer((_) async => '');

      final result = await repo.checkAuth();
      expect(result, isNull);
    });

    test('login saves tokens and user, returns Right(user)', () async {
      when(() => mockRemote.login('test@lightbite.com', 'password'))
          .thenAnswer((_) async => testResponse);
      when(() => mockLocal.saveToken('access-123')).thenAnswer((_) async {});
      when(() => mockLocal.saveRefreshToken('refresh-456'))
          .thenAnswer((_) async {});
      when(() => mockLocal.saveUser(any())).thenAnswer((_) async {});

      final result = await repo.login('test@lightbite.com', 'password');

      expect(result.isRight(), true);
      result.fold(
        (_) => fail('Expected Right, got Left'),
        (user) {
          expect(user.uuid, 'u1');
          expect(user.email, 'test@lightbite.com');
        },
      );
      verify(() => mockLocal.saveToken('access-123')).called(1);
      verify(() => mockLocal.saveRefreshToken('refresh-456')).called(1);
      verify(() => mockLocal.saveUser(any())).called(1);
    });

    test('logout clears all local data', () async {
      when(() => mockLocal.clearAll()).thenAnswer((_) async {});

      await repo.logout();

      verify(() => mockLocal.clearAll()).called(1);
    });
  });
}
