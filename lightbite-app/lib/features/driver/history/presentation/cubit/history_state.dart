import 'package:equatable/equatable.dart';

sealed class HistoryState extends Equatable {
  const HistoryState();
}

class HistoryInitial extends HistoryState { const HistoryInitial(); @override List<Object?> get props => []; }
class HistoryLoading extends HistoryState { const HistoryLoading(); @override List<Object?> get props => []; }
class HistoryLoaded extends HistoryState {
  const HistoryLoaded({required this.totalDeliveries, this.weekTrips = 0});
  final int totalDeliveries; final int weekTrips;
  @override List<Object?> get props => [totalDeliveries, weekTrips];
  HistoryLoaded copyWith({int? totalDeliveries, int? weekTrips}) => HistoryLoaded(totalDeliveries: totalDeliveries ?? this.totalDeliveries, weekTrips: weekTrips ?? this.weekTrips);
}
class HistoryError extends HistoryState { const HistoryError(this.message); final String message; @override List<Object?> get props => [message]; }
