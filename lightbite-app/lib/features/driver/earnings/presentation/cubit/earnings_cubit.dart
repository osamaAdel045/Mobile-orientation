import 'package:lightbite_app/core/bloc/base_cubit.dart';
import 'package:lightbite_app/features/driver/home/domain/usecases/manage_delivery.dart';
import 'earnings_state.dart';

class EarningsCubit extends BaseCubit<EarningsState> {
  EarningsCubit(this._manageDelivery) : super(const EarningsInitial());
  final ManageDelivery _manageDelivery;

  Future<void> loadEarnings() async {
    emit(const EarningsLoading());
    final result = await _manageDelivery.getEarnings();
    result.fold(
      (failure) => emit(EarningsError(failure.message)),
      (earnings) => emit(EarningsLoaded(earnings)),
    );
  }
}
