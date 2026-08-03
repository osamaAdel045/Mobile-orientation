import 'package:dartz/dartz.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import '../entities/restaurant.dart';

abstract class HomeRepository {
  Future<Either<Failure, List<Restaurant>>> getNearbyRestaurants(double lat, double lng);
  Future<Either<Failure, List<Restaurant>>> searchRestaurants(String query, {String? cuisine});
}
