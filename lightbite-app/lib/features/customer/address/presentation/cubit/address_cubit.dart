import 'package:lightbite_app/core/bloc/base_cubit.dart';
import 'package:lightbite_app/features/customer/address/domain/usecases/manage_addresses.dart';
import 'address_state.dart';

class AddressCubit extends BaseCubit<AddressState> {
  AddressCubit(this._manageAddresses) : super(const AddressInitial());

  final ManageAddresses _manageAddresses;

  Future<void> loadAddresses() async {
    emit(const AddressLoading());
    final result = await _manageAddresses.getAll();
    result.fold(
      (failure) => emit(AddressError(failure.message)),
      (addresses) => emit(AddressLoaded(addresses)),
    );
  }

  Future<void> createAddress({required String label, required String address, required bool isDefault, double? lat, double? lng}) async {
    emit(const AddressSaving());
    final result = await _manageAddresses.create(label: label, address: address, isDefault: isDefault, lat: lat, lng: lng);
    result.fold(
      (failure) => emit(AddressError(failure.message)),
      (_) => loadAddresses(),
    );
  }

  Future<void> deleteAddress(String uuid) async {
    final result = await _manageAddresses.delete(uuid);
    result.fold(
      (failure) => emit(AddressError(failure.message)),
      (_) => loadAddresses(),
    );
  }
}
