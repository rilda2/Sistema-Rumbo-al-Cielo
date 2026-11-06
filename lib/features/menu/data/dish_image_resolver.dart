import 'package:restaurante_app/core/config/supabase_config.dart';
import 'package:restaurante_app/features/menu/domain/bolivian_dish_entity.dart';

String resolveDatabaseDishImage(
  String? rawPath, {
  String? dishName,
  int? dishId,
}) {
  return SupabaseConfig.publicDishImageUrl(rawPath) ??
      resolveDishImageUrl(rawPath, dishName: dishName, dishId: dishId);
}
