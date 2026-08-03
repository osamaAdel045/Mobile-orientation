import 'package:dartz/dartz.dart';
import 'package:lightbite_app/core/errors/failures.dart';
import '../entities/restaurant.dart';
import '../repositories/home_repository.dart';

class SearchRestaurants {
  SearchRestaurants(this._repo);

  final HomeRepository _repo;

  Future<Either<Failure, List<Restaurant>>> call(String query, {String? cuisine}) async {
    return _repo.searchRestaurants(query, cuisine: cuisine);
  }
}
