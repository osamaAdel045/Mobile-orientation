import 'package:lightbite_app/core/bloc/base_cubit.dart';
import 'package:lightbite_app/features/driver/home/domain/usecases/manage_delivery.dart';
import 'history_state.dart';

class HistoryCubit extends BaseCubit<HistoryState> {
  HistoryCubit(this._manageDelivery) : super(const HistoryInitial());
  final ManageDelivery _manageDelivery;

  Future<void> loadHistory() async {
    emit(const HistoryLoading());
    final result = await _manageDelivery.getEarnings();
    result.fold(
      (failure) => emit(HistoryError(failure.message)),
      (earnings) => emit(HistoryLoaded(
        totalDeliveries: earnings.weekTrips,
        weekTrips: earnings.weekTrips,
      )),
    );
  }
}
