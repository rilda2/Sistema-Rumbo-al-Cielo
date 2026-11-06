import 'package:flutter_test/flutter_test.dart';
import 'package:restaurante_app/features/menu/data/dish_category_resolver.dart';

void main() {
  test('clasifica la lista de Supabase por tipo y nombre', () {
    expect(resolveDishCategory(type: 'REGULAR', name: 'Sopa de mani'), 'Sopa');
    expect(
      resolveDishCategory(type: 'VEGETARIANO', name: 'Ensalada fresca del día'),
      'Entrada',
    );
    expect(
      resolveDishCategory(type: 'VEGETARIANO', name: 'Milanesa de soya'),
      'Vegetariano',
    );
    expect(resolveDishCategory(type: 'REGULAR', name: 'Silpancho'), 'Segundo');
  });
}
