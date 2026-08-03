import 'package:flutter_bloc/flutter_bloc.dart';

/// Base class for all Cubits in the application.
///
/// Provides a safe [emit] that silently no-ops when the cubit is closed,
/// preventing `StateError` crashes that occur when emitting after [close].
///
/// All feature Cubits should extend this instead of [Cubit] directly.
abstract class BaseCubit<S> extends Cubit<S> {
  BaseCubit(super.initialState);

  @override
  void emit(S state) {
    if (!isClosed) {
      super.emit(state);
    }
  }
}
