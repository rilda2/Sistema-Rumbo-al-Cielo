import 'package:restaurante_app/features/menu/domain/menu_entity.dart';

/// Representa el combo único que se ofrece al empleado:
/// 1. Sopa del día (entrada)
/// 2. Segundo
class AlmuerzoCompleto {
  /// Se conserva para compatibilidad con datos antiguos. Ya no se muestra
  /// como una opción independiente del combo.
  final Dish entrada;
  final Dish sopa;
  final Dish segundo;
  final double precio;

  const AlmuerzoCompleto({
    required this.entrada,
    required this.sopa,
    required this.segundo,
    this.precio = 18.0,
  });

  String get sopaDelDia => sopa.name;

  String get summary => '${sopa.name} + ${segundo.name}';
}

/// Representa la oferta del menú para una fecha determinada:
/// - Almuerzo completo (ensalada, sopa del día y segundo)
/// - 1 Plato vegetariano por día
/// - 1 Plato especial por día
/// - Postre: Disponible ÚNICAMENTE los días Jueves.
class DailyMenu {
  final DateTime date;
  final List<AlmuerzoCompleto> almuerzosCompletos;
  final AlmuerzoCompleto almuerzoCompleto;
  final Dish platoVegetariano;
  final Dish platoEspecial;
  final Dish? postre; // Solo presente si date.weekday == DateTime.thursday

  const DailyMenu({
    required this.date,
    required this.almuerzoCompleto,
    this.almuerzosCompletos = const [],
    required this.platoVegetariano,
    required this.platoEspecial,
    this.postre,
  });

  List<AlmuerzoCompleto> get opcionesAlmuerzo =>
      almuerzosCompletos.isEmpty ? [almuerzoCompleto] : almuerzosCompletos;

  /// Regla de negocio: El postre se sirve única y exclusivamente los jueves.
  bool get hasDessert => date.weekday == DateTime.thursday && postre != null;

  /// Retorna la lista de todos los platos disponibles hoy
  List<Dish> get allDishes {
    final list = [
      // Compatibilidad con consumidores antiguos del modelo. La pantalla
      // presenta la sopa como entrada del combo, no como categoría separada.
      for (final combo in opcionesAlmuerzo) ...[
        combo.entrada,
        combo.sopa,
        combo.segundo,
      ],
      platoVegetariano,
      platoEspecial,
    ];
    if (hasDessert && postre != null) {
      list.add(postre!);
    }
    return list;
  }
}
