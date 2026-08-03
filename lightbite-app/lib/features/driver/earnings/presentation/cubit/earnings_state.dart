import 'package:equatable/equatable.dart';
import 'package:lightbite_app/features/driver/home/domain/entities/driver_job.dart';

sealed class EarningsState extends Equatable { const EarningsState(); }
class EarningsInitial extends EarningsState { const EarningsInitial(); @override List<Object?> get props => []; }
class EarningsLoading extends EarningsState { const EarningsLoading(); @override List<Object?> get props => []; }
class EarningsError extends EarningsState { const EarningsError(this.message); final String message; @override List<Object?> get props => [message]; }
class EarningsLoaded extends EarningsState { const EarningsLoaded(this.earnings); final DriverEarnings earnings; @override List<Object?> get props => [earnings]; }
