import 'package:restaurante_app/features/menu/domain/daily_menu_entity.dart';
import 'package:restaurante_app/features/menu/domain/daily_menu_policy.dart';
import 'package:restaurante_app/features/menu/domain/menu_entity.dart';
import 'package:restaurante_app/features/menu/domain/menu_repository.dart';

class MockMenuRepository implements MenuRepository {
  static const Dish entradaMock = Dish(
    id: 'ent-1',
    name: 'Ensalada César Fresca',
    description:
        'Lechuga romana crujiente, crutones de ajo, queso parmesano rallado y aderezo césar casero.',
    imageUrl:
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
    price: 6.00,
    category: 'Entrada',
    calories: 180,
  );

  static const Dish sopaMock = Dish(
    id: 'sop-1',
    name: 'Sopa de Maní Tradicional',
    description:
        'Sopa espesa y aromática a base de maní licuado, verduras selectas, carne tierna y fideos tostados.',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500',
    price: 12.00,
    category: 'Sopa',
    calories: 520,
    isFavorite: true,
  );

  static const Dish segundoMock = Dish(
    id: 'seg-1',
    name: 'Silpancho Cochabambino',
    description:
        'Carne apanada sobre cama de arroz blanco y papas doradas con huevo estrellado y sarza fresca.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
    price: 18.00,
    category: 'Segundo',
    calories: 780,
    isFavorite: true,
  );

  static const Dish segundoAlternativoMock = Dish(
    id: 'seg-2',
    name: 'Majadito Cruceño',
    description: 'Arroz con charque, plátano maduro y huevo criollo.',
    imageUrl: 'assets/images/03_charque_kan.jpg',
    price: 18.00,
    category: 'Segundo',
    calories: 720,
  );

  static const Dish segundoEspecialMock = Dish(
    id: 'seg-3',
    name: 'Falso Conejo',
    description: 'Segundo de carne apanada en ají amarillo con arvejas.',
    imageUrl: 'assets/images/05_chicharron.jpg',
    price: 18.00,
    category: 'Segundo',
    calories: 690,
  );

  static const Dish sopaAlternativaMock = Dish(
    id: 'sop-2',
    name: 'Chairo Paceño',
    description: 'Sopa andina con chuño, chalona, trigo y hierbabuena.',
    imageUrl: 'assets/images/08_crema_de_quinua.jpg',
    price: 18.00,
    category: 'Sopa',
    calories: 510,
  );

  static const Dish ensaladaMock = Dish(
    id: 'ent-2',
    name: 'Ensalada Fresca del Día',
    description: 'Hojas verdes, tomate, zanahoria y aderezo de la casa.',
    imageUrl: 'assets/images/11_tortilla_de_verduras.jpg',
    price: 18.00,
    category: 'Entrada',
    calories: 160,
  );

  static const Dish vegetarianoMock = Dish(
    id: 'veg-1',
    name: 'Quinua Real con Champiñones y Palta',
    description:
        'Quinua perlada al wok con verduras salteadas al oliva, hongos dorados y láminas de palta fresca.',
    imageUrl:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
    price: 16.00,
    category: 'Vegetariano',
    calories: 460,
  );

  static const Dish especialMock = Dish(
    id: 'esp-1',
    name: 'Pique Macho Especial',
    description:
        'Trozos selectos de lomo saltados con salchichas vienesas, papas crocantes, huevo duro y locoto.',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500',
    price: 24.00,
    category: 'Especial',
    calories: 890,
  );

  static const Dish postreMock = Dish(
    id: 'pos-1',
    name: 'Budín de Pan Casero con Caramelo',
    description:
        'Exclusivo postre de los jueves: budín horneado artesanal bañado en caramelo con canela y pasas.',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500',
    price: 7.00,
    category: 'Postre',
    calories: 320,
  );

  final List<Dish> _allDishes = [
    entradaMock,
    sopaMock,
    segundoMock,
    vegetarianoMock,
    especialMock,
    postreMock,
  ];

  @override
  Future<DailyMenu> getDailyMenuStructure(DateTime date) async {
    final variant = date.weekday % 3;
    final seconds = [segundoMock, segundoAlternativoMock, segundoEspecialMock];
    final soups = [sopaMock, sopaAlternativaMock, sopaMock];
    final combos = List.generate(
      3,
      (index) => AlmuerzoCompleto(
        entrada: ensaladaMock,
        sopa: soups[(variant + index) % soups.length],
        segundo: seconds[(variant + index) % seconds.length],
      ),
    );
    return DailyMenuPolicy.buildDailyMenu(
      date: date,
      entrada: combos.first.entrada,
      sopa: combos.first.sopa,
      segundo: combos.first.segundo,
      platoVegetariano: vegetarianoMock,
      platoEspecial: especialMock,
      postre: postreMock,
      almuerzosCompletos: combos,
    );
  }

  @override
  Future<List<Dish>> getDailyMenu() async {
    final today = DateTime.now();
    final dailyStructure = await getDailyMenuStructure(today);
    return dailyStructure.allDishes;
  }

  @override
  Future<void> toggleFavorite(String dishId) async {
    final index = _allDishes.indexWhere((d) => d.id == dishId);
    if (index != -1) {
      final current = _allDishes[index];
      _allDishes[index] = current.copyWith(isFavorite: !current.isFavorite);
    }
  }

  @override
  Future<void> addDish(Dish dish) async {
    _allDishes.add(dish);
  }
}
