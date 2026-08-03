import 'package:equatable/equatable.dart';
import '../../../../core/constants/app_enums.dart';
import '../../../../core/domain/entities/auth_user.dart';
import '../../../../core/utils/valid_data.dart';

class AuthUserModel extends Equatable {
  const AuthUserModel({
    required this.uuid,
    required this.name,
    required this.email,
    required this.role,
    this.status,
  });

  final String uuid;
  final String name;
  final String email;
  final String role;
  final String? status;

  factory AuthUserModel.fromJson(Map<String, dynamic> json) => AuthUserModel(
        uuid: validateString(json['uuid']),
        name: validateString(json['name']),
        email: validateString(json['email']),
        role: validateString(json['role']),
        status: json['status'] != null
            ? validateString(json['status'])
            : null,
      );

  Map<String, dynamic> toJson() => {
        'uuid': uuid,
        'name': name,
        'email': email,
        'role': role,
        'status': status,
      };

  @override
  List<Object?> get props => [uuid, name, email, role, status];

  AuthUser toEntity() => AuthUser(
        uuid: uuid,
        name: name,
        email: email,
        role: UserRole.fromString(role),
        status: AuthStatus.fromString(status ?? ''),
      );
}

class AuthResponseModel extends Equatable {
  const AuthResponseModel({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
  });

  final AuthUserModel user;
  final String accessToken;
  final String refreshToken;

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) =>
      AuthResponseModel(
        user: AuthUserModel.fromJson(
            validateMap<String, dynamic>(json['user'])),
        accessToken: validateString(json['access_token']),
        refreshToken: validateString(json['refresh_token']),
      );

  Map<String, dynamic> toJson() => {
        'user': user.toJson(),
        'access_token': accessToken,
        'refresh_token': refreshToken,
      };

  @override
  List<Object?> get props => [user, accessToken, refreshToken];
}
