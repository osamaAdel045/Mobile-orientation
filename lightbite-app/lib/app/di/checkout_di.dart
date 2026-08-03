import 'package:lightbite_app/features/customer/checkout/presentation/cubit/checkout_cubit.dart';
import 'package:lightbite_app/features/customer/address/domain/usecases/manage_addresses.dart';
import 'injection_container.dart';

void registerCheckout() {
  sl.registerFactory<CheckoutCubit>(() => CheckoutCubit(sl<ManageAddresses>()));
}
