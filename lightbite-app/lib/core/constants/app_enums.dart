/// Central enum definitions replacing magic strings throughout the app.
enum UserRole {
  customer,
  driver;

  static UserRole fromString(String value) {
    switch (value.toLowerCase()) {
      case 'driver':
        return UserRole.driver;
      case 'customer':
      default:
        return UserRole.customer;
    }
  }

  String get apiValue => name;
}

enum AuthStatus {
  verified,
  pending,
  suspended;

  static AuthStatus fromString(String value) {
    switch (value.toLowerCase()) {
      case 'pending':
        return AuthStatus.pending;
      case 'suspended':
        return AuthStatus.suspended;
      case 'verified':
      default:
        return AuthStatus.verified;
    }
  }
}

enum OrderStatus {
  pending,
  confirmed,
  preparing,
  ready,
  assigned,
  pickedUp,
  delivering,
  delivered,
  cancelled,
  rejected,
  expired,
  refunded,
  resolved;

  static OrderStatus fromString(String value) {
    // Maps snake_case API values to enum cases
    switch (value.toLowerCase()) {
      case 'pending':
        return OrderStatus.pending;
      case 'confirmed':
        return OrderStatus.confirmed;
      case 'preparing':
        return OrderStatus.preparing;
      case 'ready':
        return OrderStatus.ready;
      case 'assigned':
        return OrderStatus.assigned;
      case 'picked_up':
        return OrderStatus.pickedUp;
      case 'delivering':
        return OrderStatus.delivering;
      case 'delivered':
        return OrderStatus.delivered;
      case 'cancelled':
        return OrderStatus.cancelled;
      case 'rejected':
        return OrderStatus.rejected;
      case 'expired':
        return OrderStatus.expired;
      case 'refunded':
        return OrderStatus.refunded;
      case 'resolved':
        return OrderStatus.resolved;
      default:
        return OrderStatus.pending;
    }
  }

  /// Whether this status means the order is still in progress.
  bool get isActive => ![
        OrderStatus.delivered,
        OrderStatus.cancelled,
        OrderStatus.rejected,
        OrderStatus.expired,
        OrderStatus.refunded,
        OrderStatus.resolved,
      ].contains(this);

  /// API-ready string representation.
  String get apiValue {
    switch (this) {
      case OrderStatus.pickedUp:
        return 'picked_up';
      default:
        return name;
    }
  }

  /// Human-readable display label.
  String get label => name.replaceAll(RegExp(r'([A-Z])'), r'_\1').toLowerCase();

  /// Index in the standard progress timeline (0-7).
  int get progressIndex {
    const steps = [
      OrderStatus.pending,
      OrderStatus.confirmed,
      OrderStatus.preparing,
      OrderStatus.ready,
      OrderStatus.assigned,
      OrderStatus.pickedUp,
      OrderStatus.delivering,
      OrderStatus.delivered,
    ];
    return steps.indexOf(this);
  }
}
