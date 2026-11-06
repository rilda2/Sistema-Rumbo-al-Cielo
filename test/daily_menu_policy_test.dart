import 'package:flutter_test/flutter_test.dart';
import 'package:restaurante_app/features/menu/data/mock_menu_repository.dart';
import 'package:restaurante_app/features/menu/domain/daily_menu_policy.dart';
import 'package:restaurante_app/features/menu/domain/menu_entity.dart';

void main() {
  group('DailyMenuPolicy Business Rules (Almuerzo Completo, Vegetariano, Especial, Postre Solo Jueves)', () {
    const entrada = Dish(
      id: 'ent-1',
      name: 'Ensalada César',
      description: 'Entrada fresca',
      imageUrl: 'assets/silpancho.png',
      category: 'Entrada',
    );

    const sopa = Dish(
      id: 'sop-1',
      name: 'Sopa de Maní',
      description: 'Sopa tradicional',
      imageUrl: 'assets/silpancho.png',
      category: 'Sopa',
    );

    const segundo = Dish(
      id: 'seg-1',
      name: 'Silpancho Cochabambino',
      description: 'Segundo plato fuerte',
      imageUrl: 'assets/silpancho.png',
      category: 'Plato Fuerte',
    );

    const vegetariano = Dish(
      id: 'veg-1',
      name: 'Quinua Real con Vegetales',
      description: 'Plato vegetariano diario',
      imageUrl: 'assets/silpancho.png',
      category: 'Vegetariano',
    );

    const especial = Dish(
      id: 'esp-1',
      name: 'Pique Macho Especial',
      description: 'Plato especial del día',
      imageUrl: 'assets/silpancho.png',
      category: 'Especial',
    );

    const postre = Dish(
      id: 'pos-1',
      name: 'Budín de Pan',
      description: 'Postre casero',
      imageUrl: 'assets/silpancho.png',
      category: 'Postre',
    );

    test('Regla isDessertDay: Solo es true los días Jueves (DateTime.thursday == 4)', () {
      final monday = DateTime(2026, 10, 12); // Lunes
      final tuesday = DateTime(2026, 10, 13); // Martes
      final wednesday = DateTime(2026, 10, 14); // Miércoles
      final thursday = DateTime(2026, 10, 15); // Jueves
      final friday = DateTime(2026, 10, 16); // Viernes
      final saturday = DateTime(2026, 10, 17); // Sábado
      final sunday = DateTime(2026, 10, 18); // Domingo

      expect(DailyMenuPolicy.isDessertDay(monday), isFalse);
      expect(DailyMenuPolicy.isDessertDay(tuesday), isFalse);
      expect(DailyMenuPolicy.isDessertDay(wednesday), isFalse);
      expect(DailyMenuPolicy.isDessertDay(thursday), isTrue);
      expect(DailyMenuPolicy.isDessertDay(friday), isFalse);
      expect(DailyMenuPolicy.isDessertDay(saturday), isFalse);
      expect(DailyMenuPolicy.isDessertDay(sunday), isFalse);
    });

    test('Regla buildDailyMenu en un día NO jueves: Omite el postre (postre es null)', () {
      final monday = DateTime(2026, 10, 12); // Lunes

      final menu = DailyMenuPolicy.buildDailyMenu(
        date: monday,
        entrada: entrada,
        sopa: sopa,
        segundo: segundo,
        platoVegetariano: vegetariano,
        platoEspecial: especial,
        postre: postre, // Enviamos postre pero al ser lunes debe ser omitido
      );

      expect(menu.almuerzoCompleto.entrada, equals(entrada));
      expect(menu.almuerzoCompleto.sopa, equals(sopa));
      expect(menu.almuerzoCompleto.segundo, equals(segundo));
      expect(menu.platoVegetariano, equals(vegetariano));
      expect(menu.platoEspecial, equals(especial));
      expect(menu.postre, isNull);
      expect(menu.hasDessert, isFalse);
      expect(menu.allDishes.length, equals(5));
    });

    test('Regla buildDailyMenu en día Jueves: Conserva el postre (hasDessert == true)', () {
      final thursday = DateTime(2026, 10, 15); // Jueves

      final menu = DailyMenuPolicy.buildDailyMenu(
        date: thursday,
        entrada: entrada,
        sopa: sopa,
        segundo: segundo,
        platoVegetariano: vegetariano,
        platoEspecial: especial,
        postre: postre,
      );

      expect(menu.almuerzoCompleto.entrada, equals(entrada));
      expect(menu.almuerzoCompleto.sopa, equals(sopa));
      expect(menu.almuerzoCompleto.segundo, equals(segundo));
      expect(menu.platoVegetariano, equals(vegetariano));
      expect(menu.platoEspecial, equals(especial));
      expect(menu.postre, equals(postre));
      expect(menu.hasDessert, isTrue);
      expect(menu.allDishes.length, equals(6));
      expect(menu.allDishes.contains(postre), isTrue);
    });

    test('Regla validateMenu: Valida correctamente la composición del menú', () {
      final thursday = DateTime(2026, 10, 15); // Jueves
      final validThursdayMenu = DailyMenuPolicy.buildDailyMenu(
        date: thursday,
        entrada: entrada,
        sopa: sopa,
        segundo: segundo,
        platoVegetariano: vegetariano,
        platoEspecial: especial,
        postre: postre,
      );
      expect(DailyMenuPolicy.validateMenu(validThursdayMenu), isTrue);

      final wednesday = DateTime(2026, 10, 14); // Miércoles
      final validWednesdayMenu = DailyMenuPolicy.buildDailyMenu(
        date: wednesday,
        entrada: entrada,
        sopa: sopa,
        segundo: segundo,
        platoVegetariano: vegetariano,
        platoEspecial: especial,
        postre: postre,
      );
      expect(DailyMenuPolicy.validateMenu(validWednesdayMenu), isTrue);
      expect(validWednesdayMenu.postre, isNull);
    });

    test('MockMenuRepository cumple la estructura de menú diario', () async {
      final repo = MockMenuRepository();
      final thursdayMenu = await repo.getDailyMenuStructure(DateTime(2026, 10, 15));
      expect(thursdayMenu.hasDessert, isTrue);
      expect(thursdayMenu.postre, isNotNull);

      final fridayMenu = await repo.getDailyMenuStructure(DateTime(2026, 10, 16));
      expect(fridayMenu.hasDessert, isFalse);
      expect(fridayMenu.postre, isNull);
    });
  });
}
