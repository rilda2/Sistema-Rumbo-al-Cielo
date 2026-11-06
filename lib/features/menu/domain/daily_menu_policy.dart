import 'package:restaurante_app/features/menu/domain/daily_menu_entity.dart';
import 'package:restaurante_app/features/menu/domain/menu_entity.dart';

/// Reglas de negocio para la conformación del menú diario:
/// 1. Almuerzo completo: incluye la sopa del día como entrada y un segundo.
/// 2. Un plato vegetariano por día.
/// 3. Un plato especial por día.
/// 4. El postre SOLO se sirve los días Jueves (DateTime.thursday).
class DailyMenuPolicy {
  /// Verifica si la fecha corresponde al día de postre (Jueves).
  static bool isDessertDay(DateTime date) {
    return date.weekday == DateTime.thursday;
  }

  /// Construye el menú diario aplicando estrictamente las reglas de negocio.
  /// Si la fecha no es jueves, cualquier postre es omitido (null).
  static DailyMenu buildDailyMenu({
    required DateTime date,
    required Dish entrada,
    required Dish sopa,
    required Dish segundo,
    required Dish platoVegetariano,
    required Dish platoEspecial,
    Dish? postre,
    List<AlmuerzoCompleto>? almuerzosCompletos,
  }) {
    final isThursday = isDessertDay(date);
    return DailyMenu(
      date: date,
      almuerzoCompleto: AlmuerzoCompleto(
        entrada: entrada,
        sopa: sopa,
        segundo: segundo,
      ),
      almuerzosCompletos: almuerzosCompletos ?? const [],
      platoVegetariano: platoVegetariano,
      platoEspecial: platoEspecial,
      postre: isThursday ? postre : null,
    );
  }

  /// Valida que una estructura de menú cumpla todas las reglas requeridas.
  static bool validateMenu(DailyMenu menu) {
    if (menu.almuerzoCompleto.sopa.name.trim().isEmpty) return false;
    if (menu.almuerzoCompleto.segundo.name.trim().isEmpty) return false;
    if (menu.platoVegetariano.name.trim().isEmpty) return false;
    if (menu.platoEspecial.name.trim().isEmpty) return false;

    // Regla del postre: solo jueves
    if (isDessertDay(menu.date)) {
      return menu.postre != null;
    } else {
      return menu.postre == null;
    }
  }
}
