import 'package:equatable/equatable.dart';
import 'package:lightbite_app/features/customer/address/domain/entities/address.dart';

sealed class CheckoutState extends Equatable {
  const CheckoutState();
  R maybeWhen<R>({R Function(List<Address> a, String? s, bool p)? ready, R Function(String m)? error, required R Function() orElse}) =>
    switch (this) { CheckoutReady(:final addresses, :final selectedAddressUuid, :final placing) => ready?.call(addresses, selectedAddressUuid, placing) ?? orElse(), CheckoutError(:final message) => error?.call(message) ?? orElse(), _ => orElse() };
}
class CheckoutInitial extends CheckoutState { const CheckoutInitial(); @override List<Object?> get props => []; }
class CheckoutLoading extends CheckoutState { const CheckoutLoading(); @override List<Object?> get props => []; }
class CheckoutError extends CheckoutState { const CheckoutError(this.message); final String message; @override List<Object?> get props => [message]; }
class CheckoutReady extends CheckoutState {
  const CheckoutReady({required this.addresses, this.selectedAddressUuid, this.placing = false});
  final List<Address> addresses; final String? selectedAddressUuid; final bool placing;
  @override List<Object?> get props => [addresses, selectedAddressUuid, placing];
  CheckoutReady copyWith({List<Address>? addresses, String? selectedAddressUuid, bool? placing}) =>
      CheckoutReady(addresses: addresses ?? this.addresses, selectedAddressUuid: selectedAddressUuid ?? this.selectedAddressUuid, placing: placing ?? this.placing);
}
