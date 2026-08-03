import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/restaurant_repository.dart';
import 'menu_state.dart';

class MenuCubit extends Cubit<MenuState> {
  MenuCubit(this._repository) : super(const MenuInitial());

  final RestaurantRepository _repository;

  Future<void> loadMenu(String restaurantUuid) async {
    emit(const MenuLoading());
    try {
      final menu = await _repository.getMenu(restaurantUuid);
      emit(MenuLoaded(menu));
    } catch (e) {
      emit(MenuError(e.toString()));
    }
  }
}
