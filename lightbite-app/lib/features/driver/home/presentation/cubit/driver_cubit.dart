import 'dart:async';
import 'package:lightbite_app/core/bloc/base_cubit.dart';
import 'package:lightbite_app/features/driver/home/domain/usecases/manage_delivery.dart';
import 'driver_state.dart';

class DriverCubit extends BaseCubit<DriverState> {
  DriverCubit(this._manageDelivery) : super(const DriverOffline());

  final ManageDelivery _manageDelivery;
  Timer? _offerTimer;
  Timer? _pollTimer;
  int _pollIntervalSeconds = 5;
  static const int _maxPollIntervalSeconds = 60;

  @override
  Future<void> close() {
    _offerTimer?.cancel();
    _pollTimer?.cancel();
    return super.close();
  }

  bool get _isOnline => state.maybeWhen(
        waiting: (_) => true,
        orElse: () => false,
      );

  Future<void> toggleOnline() async {
    final result = await _manageDelivery.toggleOnline(!_isOnline);
    result.fold(
      (failure) => emit(DriverError(failure.message)),
      (_) {
        if (_isOnline) {
          _offerTimer?.cancel();
          _pollTimer?.cancel();
          emit(const DriverOffline());
        } else {
          _pollIntervalSeconds = 5;
          emit(const DriverWaiting());
          _pollForJobs();
        }
      },
    );
  }

  void _pollForJobs() {
    _pollTimer?.cancel();
    _pollTimer = Timer(
      Duration(seconds: _pollIntervalSeconds),
      _doPoll,
    );
  }

  Future<void> _doPoll() async {
    if (isClosed) return;
    final isWaiting = state.maybeWhen(
      waiting: (_) => true,
      orElse: () => false,
    );
    if (!isWaiting) return;

    final result = await _manageDelivery.pollForJob();
    result.fold(
      (_) {
        _pollIntervalSeconds = (_pollIntervalSeconds * 2).clamp(5, _maxPollIntervalSeconds);
        _pollForJobs();
      },
      (job) {
        if (job != null) {
          _pollIntervalSeconds = 5;
          emit(DriverJobOffered(job, 30));
          _startJobTimer();
        } else {
          _pollIntervalSeconds = (_pollIntervalSeconds * 2).clamp(5, _maxPollIntervalSeconds);
          emit(const DriverWaiting());
          _pollForJobs();
        }
      },
    );
  }

  void _startJobTimer() {
    _offerTimer?.cancel();
    var seconds = 30;
    _offerTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      seconds--;
      if (seconds <= 0) {
        timer.cancel();
        emit(const DriverWaiting());
        _pollForJobs();
      } else {
        final job = state.maybeWhen(
          jobOffered: (j, _) => j,
          orElse: () => null,
        );
        if (job != null) {
          emit(DriverJobOffered(job, seconds));
        } else {
          timer.cancel();
        }
      }
    });
  }

  Future<void> acceptJob() async {
    final job = state.maybeWhen(jobOffered: (j, _) => j, orElse: () => null);
    if (job == null) return;

    final result = await _manageDelivery.acceptJob(job.orderUuid);
    result.fold(
      (_) {
        emit(const DriverWaiting());
        _pollForJobs();
      },
      (_) {
        _offerTimer?.cancel();
        emit(DriverOnDelivery(job: job, phase: 'pickup'));
      },
    );
  }

  Future<void> declineJob() async {
    final job = state.maybeWhen(jobOffered: (j, _) => j, orElse: () => null);
    if (job == null) return;

    await _manageDelivery.declineJob(job.orderUuid);
    _offerTimer?.cancel();
    emit(const DriverWaiting());
    _pollForJobs();
  }

  Future<void> confirmPickup() async {
    final job = state.maybeWhen(onDelivery: (j, _) => j, orElse: () => null);
    if (job == null) return;

    final result = await _manageDelivery.confirmPickup(job.orderUuid);
    result.fold(
      (failure) => emit(DriverError(failure.message)),
      (_) => emit(DriverOnDelivery(job: job, phase: 'picked_up')),
    );
  }

  Future<void> startDelivery() async {
    final job = state.maybeWhen(onDelivery: (j, _) => j, orElse: () => null);
    if (job == null) return;

    final result = await _manageDelivery.startDelivery(job.orderUuid);
    result.fold(
      (failure) => emit(DriverError(failure.message)),
      (_) => emit(DriverOnDelivery(job: job, phase: 'delivery')),
    );
  }

  Future<void> confirmDelivery() async {
    final job = state.maybeWhen(onDelivery: (j, _) => j, orElse: () => null);
    if (job == null) return;

    final result = await _manageDelivery.confirmDelivery(job.orderUuid);
    result.fold(
      (failure) => emit(DriverError(failure.message)),
      (_) => emit(const DriverOffline()),
    );
  }

  Future<void> loadEarnings() async {
    final result = await _manageDelivery.getEarnings();
    result.fold(
      (_) {},
      (earnings) => state.when(
        offline: (_) => emit(DriverOffline(earnings: earnings)),
        waiting: (_) => emit(DriverWaiting(earnings: earnings)),
        jobOffered: (_, __) => {},
        onDelivery: (_, __) => {},
        error: (_) => {},
      ),
    );
  }
}
