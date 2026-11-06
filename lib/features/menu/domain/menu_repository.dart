import 'package:restaurante_app/features/menu/domain/daily_menu_entity.dart';
import 'package:restaurante_app/features/menu/domain/menu_entity.dart';

abstract class MenuRepository {
  Future<List<Dish>> getDailyMenu();
  Future<DailyMenu> getDailyMenuStructure(DateTime date);
  Future<void> toggleFavorite(String dishId);
  Future<void> addDish(Dish dish);
}
