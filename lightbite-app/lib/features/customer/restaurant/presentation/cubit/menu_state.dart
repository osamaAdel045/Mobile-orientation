import '../../domain/entities/restaurant_menu.dart';

sealed class MenuState {
  const MenuState();
}

class MenuInitial extends MenuState {
  const MenuInitial();
}

class MenuLoading extends MenuState {
  const MenuLoading();
}

class MenuLoaded extends MenuState {
  const MenuLoaded(this.menu);

  final RestaurantMenu menu;
}

class MenuError extends MenuState {
  const MenuError(this.message);

  final String message;
}
