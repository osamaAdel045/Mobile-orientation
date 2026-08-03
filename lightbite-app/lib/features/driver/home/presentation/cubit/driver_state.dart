import 'package:equatable/equatable.dart';
import 'package:lightbite_app/features/driver/home/domain/entities/driver_job.dart';

sealed class DriverState extends Equatable {
  const DriverState();
  R when<R>({required R Function(DriverEarnings? e) offline, required R Function(DriverEarnings? e) waiting, required R Function(DriverJob j, int s) jobOffered, required R Function(DriverJob j, String p) onDelivery, required R Function(String m) error}) =>
    switch (this) { DriverOffline(:final earnings) => offline(earnings), DriverWaiting(:final earnings) => waiting(earnings), DriverJobOffered(:final job, :final secondsLeft) => jobOffered(job, secondsLeft), DriverOnDelivery(:final job, :final phase) => onDelivery(job, phase), DriverError(:final message) => error(message) };
  R maybeWhen<R>({R Function(DriverEarnings? e)? offline, R Function(DriverEarnings? e)? waiting, R Function(DriverJob j, int s)? jobOffered, R Function(DriverJob j, String p)? onDelivery, R Function(String m)? error, required R Function() orElse}) =>
    switch (this) { DriverOffline(:final earnings) => offline?.call(earnings) ?? orElse(), DriverWaiting(:final earnings) => waiting?.call(earnings) ?? orElse(), DriverJobOffered(:final job, :final secondsLeft) => jobOffered?.call(job, secondsLeft) ?? orElse(), DriverOnDelivery(:final job, :final phase) => onDelivery?.call(job, phase) ?? orElse(), DriverError(:final message) => error?.call(message) ?? orElse() };
}
class DriverOffline extends DriverState { const DriverOffline({this.earnings}); final DriverEarnings? earnings; @override List<Object?> get props => [earnings]; }
class DriverWaiting extends DriverState { const DriverWaiting({this.earnings}); final DriverEarnings? earnings; @override List<Object?> get props => [earnings]; }
class DriverJobOffered extends DriverState { const DriverJobOffered(this.job, this.secondsLeft); final DriverJob job; final int secondsLeft; @override List<Object?> get props => [job, secondsLeft]; }
class DriverOnDelivery extends DriverState { const DriverOnDelivery({required this.job, required this.phase}); final DriverJob job; final String phase; @override List<Object?> get props => [job, phase]; }
class DriverError extends DriverState { const DriverError(this.message); final String message; @override List<Object?> get props => [message]; }
