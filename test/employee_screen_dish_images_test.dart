import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:restaurante_app/features/auth/data/supabase_auth_repository.dart';
import 'package:restaurante_app/features/auth/presentation/providers/auth_provider.dart';
import 'package:restaurante_app/features/menu/data/supabase_weekly_menu_repository.dart';
import 'package:restaurante_app/features/menu/domain/bolivian_dish_entity.dart';
import 'package:restaurante_app/features/menu/presentation/providers/weekly_menu_provider.dart';
import 'package:restaurante_app/features/reservas/presentation/employee_screen.dart';

void main() {
  group('1. Resolución y Entidades de Imágenes de Platos de Supabase', () {
    test('resolveDishImageUrl soporta URLs remotas (Supabase Storage / CDN)', () {
      const remoteUrl =
          'https://qnieqczrdyxyhpepjduj.supabase.co/storage/v1/object/public/platos/silpancho.jpg';
      expect(resolveDishImageUrl(remoteUrl), equals(remoteUrl));
    });

    test('resolveDishImageUrl resuelve nombres de archivo a assets/images/', () {
      expect(
        resolveDishImageUrl('01_silpancho.jpg'),
        equals('assets/images/01_silpancho.jpg'),
      );
      expect(
        resolveDishImageUrl('02_pique_macho.jpg'),
        equals('assets/images/02_pique_macho.jpg'),
      );
    });

    test('resolveDishImageUrl deduce imagen según nombre o ID del plato', () {
      expect(
        resolveDishImageUrl('', dishName: 'Silpancho Cochabambino'),
        equals('assets/images/01_silpancho.jpg'),
      );
      expect(
        resolveDishImageUrl(null, dishName: 'Pique Macho Especial'),
        equals('assets/images/02_pique_macho.jpg'),
      );
      expect(
        resolveDishImageUrl('assets/silpancho.png', dishId: 4),
        equals('assets/images/04_sopa_de_mani.jpg'),
      );
    });

    test('MenuSemanalItem.fromJson mapea imagen_url desde Supabase', () {
      final jsonDirect = {
        'id': 10,
        'fecha': '2026-10-20',
        'dia_semana': 'Martes',
        'plato_catalogo_id': 1,
        'plato_nombre': 'Silpancho Cochabambino',
        'plato_descripcion': 'Carne apanada tradicional',
        'plato_region': 'Cochabamba',
        'tipo_plato': 'Segundo',
        'estado': 'publicado',
        'imagen_url':
            'https://qnieqczrdyxyhpepjduj.supabase.co/storage/v1/object/public/platos/silpancho.jpg',
      };

      final itemDirect = MenuSemanalItem.fromJson(jsonDirect);
      expect(
        itemDirect.imagenUrl,
        equals(
          'https://qnieqczrdyxyhpepjduj.supabase.co/storage/v1/object/public/platos/silpancho.jpg',
        ),
      );

      final jsonJoined = {
        'id': 11,
        'fecha': '2026-10-20',
        'dia_semana': 'Martes',
        'plato_catalogo_id': 2,
        'plato_nombre': 'Pique Macho',
        'platos_catalogo': {
          'nombre': 'Pique Macho Especial',
          'descripcion': 'Lomo con papas y salchichas',
          'region': 'Cochabamba',
          'imagen_url': '02_pique_macho.jpg',
        },
      };

      final itemJoined = MenuSemanalItem.fromJson(jsonJoined);
      expect(itemJoined.imagenUrl, equals('assets/images/02_pique_macho.jpg'));
    });
  });

  group('2. Visualización de Imágenes de Platos en EmployeeScreen', () {
    testWidgets('EmployeeScreen muestra imágenes y badge de Supabase para los platos', (tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final today = DateTime.now();
      final monday = today.subtract(Duration(days: today.weekday - 1));

      final testMenu = [
        MenuSemanalItem(
          id: 1,
          fecha: today,
          diaSemana: 'Hoy',
          platoCatalogoId: 1,
          platoNombre: 'Silpancho Cochabambino',
          platoDescripcion: 'Carne apanada tierna con arroz y papas',
          platoRegion: 'Cochabamba',
          tipoPlato: 'Segundo',
          estado: 'publicado',
          imagenUrl: 'assets/images/01_silpancho.jpg',
        ),
        MenuSemanalItem(
          id: 2,
          fecha: today,
          diaSemana: 'Hoy',
          platoCatalogoId: 2,
          platoNombre: 'Pique Macho Especial',
          platoDescripcion: 'Trozos de lomo saltado con salchichas y papas',
          platoRegion: 'Cochabamba',
          tipoPlato: 'Segundo',
          estado: 'publicado',
          imagenUrl: 'assets/images/02_pique_macho.jpg',
        ),
      ];

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider.overrideWith(
              () => _StaticAuthNotifier(SupabaseAuthRepository.demoEmpleado),
            ),
            publishedWeeklyMenuProvider.overrideWith((ref) async => testMenu),
            selectedWeekProvider.overrideWith(() => _StaticWeekNotifier(monday)),
          ],
          child: const MaterialApp(
            home: EmployeeScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verificar que se carga el header del empleado
      expect(find.text('Reservas de Comedor'), findsOneWidget);

      // Verificar que se renderiza el badge de procedencia de Supabase
      expect(find.text('Supabase'), findsWidgets);

      // Verificar que se muestran widgets de imagen para el plato seleccionado
      expect(find.byType(Image), findsWidgets);

      // Verificar que el nombre y descripción del plato se muestran en el card
      expect(find.text('Silpancho Cochabambino'), findsWidgets);
      expect(find.text('Carne apanada tierna con arroz y papas'), findsOneWidget);

      // Verificar que el selector desplegable tiene el plato seleccionado
      expect(find.widgetWithText(DropdownButtonFormField<String>, 'Silpancho Cochabambino'), findsOneWidget);
    });

    test('SupabaseWeeklyMenuRepository: Mapea catálogo de platos con imagenUrl válida', () async {
      final repo = SupabaseWeeklyMenuRepository();
      final catalogo = await repo.getCatalogoPlatos();
      expect(catalogo.isNotEmpty, isTrue);

      for (final p in catalogo) {
        expect(p.imagenUrl.isNotEmpty, isTrue);
        expect(p.imagenUrl.contains('silpancho.png'), isFalse);
      }
    });

    test('SupabaseWeeklyMenuRepository: Retorna menú con imágenes asignadas en cada plato', () async {
      final repo = SupabaseWeeklyMenuRepository();
      final menu = await repo.getMenuPublicado(DateTime.now());
      expect(menu.isNotEmpty, isTrue);

      for (final item in menu) {
        expect(item.imagenUrl.isNotEmpty, isTrue);
        expect(item.imagenUrl.contains('silpancho.png'), isFalse);
      }
    });
  });
}

class _StaticAuthNotifier extends AuthNotifier {
  final dynamic _user;
  _StaticAuthNotifier(this._user);

  @override
  build() => _user;
}

class _StaticWeekNotifier extends SelectedWeekNotifier {
  final DateTime _week;
  _StaticWeekNotifier(this._week);

  @override
  DateTime build() => _week;
}
