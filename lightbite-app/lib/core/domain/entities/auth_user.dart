import '../../constants/app_enums.dart';

class AuthUser {
  final String uuid;
  final String name;
  final String email;
  final UserRole role;
  final AuthStatus status;

  const AuthUser({
    required this.uuid,
    required this.name,
    required this.email,
    required this.role,
    required this.status,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      uuid: json['uuid'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      role: UserRole.fromString(json['role'] as String? ?? 'customer'),
      status: AuthStatus.fromString(json['status'] as String? ?? 'verified'),
    );
  }

  Map<String, dynamic> toJson() => {
        'uuid': uuid,
        'name': name,
        'email': email,
        'role': role.apiValue,
        'status': status.name,
      };

  bool get isDriver => role == UserRole.driver;
  bool get isCustomer => role == UserRole.customer;
}
