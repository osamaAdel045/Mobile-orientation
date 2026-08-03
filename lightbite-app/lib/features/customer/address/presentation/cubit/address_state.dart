import 'package:equatable/equatable.dart';
import 'package:lightbite_app/features/customer/address/domain/entities/address.dart';

sealed class AddressState extends Equatable {
  const AddressState();
  R maybeWhen<R>({R Function(List<Address> a)? loaded, R Function()? loading, R Function()? saving, R Function(String m)? error, required R Function() orElse}) =>
    switch (this) { AddressLoaded(:final addresses) => loaded?.call(addresses) ?? orElse(), AddressLoading() => loading?.call() ?? orElse(), AddressSaving() => saving?.call() ?? orElse(), AddressError(:final message) => error?.call(message) ?? orElse(), _ => orElse() };
}
class AddressInitial extends AddressState { const AddressInitial(); @override List<Object?> get props => []; }
class AddressLoading extends AddressState { const AddressLoading(); @override List<Object?> get props => []; }
class AddressSaving extends AddressState { const AddressSaving(); @override List<Object?> get props => []; }
class AddressLoaded extends AddressState { const AddressLoaded(this.addresses); final List<Address> addresses; @override List<Object?> get props => [addresses]; }
class AddressError extends AddressState { const AddressError(this.message); final String message; @override List<Object?> get props => [message]; }
