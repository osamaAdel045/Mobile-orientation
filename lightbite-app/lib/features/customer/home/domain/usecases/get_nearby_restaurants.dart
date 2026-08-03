import 'package:dartz/dartz.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import '../entities/restaurant.dart';
import '../repositories/home_repository.dart';

class GetNearbyRestaurants {
  GetNearbyRestaurants(this._repo);

  final HomeRepository _repo;

  Future<Either<Failure, List<Restaurant>>> call(double lat, double lng) async {
    return _repo.getNearbyRestaurants(lat, lng);
  }
}
