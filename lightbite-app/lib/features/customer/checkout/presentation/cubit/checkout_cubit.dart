import 'package:lightbite_app/core/bloc/base_cubit.dart';
import 'package:lightbite_app/features/customer/address/domain/entities/address.dart';
import 'package:lightbite_app/features/customer/address/domain/usecases/manage_addresses.dart';
import 'checkout_state.dart';

class CheckoutCubit extends BaseCubit<CheckoutState> {
  CheckoutCubit(this._manageAddresses) : super(const CheckoutInitial());

  final ManageAddresses _manageAddresses;

  Future<void> loadAddresses() async {
    emit(const CheckoutLoading());
    final result = await _manageAddresses.getAll();
    result.fold(
      (failure) => emit(CheckoutError(failure.message)),
      (addresses) {
        final defaultAddr = addresses.isNotEmpty
            ? (addresses.firstWhere((a) => a.isDefault, orElse: () => addresses.first))
            : null;
        emit(CheckoutReady(
          addresses: addresses,
          selectedAddressUuid: defaultAddr?.uuid,
        ));
      },
    );
  }

  void selectAddress(String uuid) {
    state.maybeWhen(
      ready: (addresses, _, placing) =>
          emit(CheckoutReady(addresses: addresses, selectedAddressUuid: uuid, placing: placing)),
      orElse: () {},
    );
  }

  void setPlacing(bool value) {
    state.maybeWhen(
      ready: (addresses, selected, _) =>
          emit(CheckoutReady(addresses: addresses, selectedAddressUuid: selected, placing: value)),
      orElse: () {},
    );
  }
}
