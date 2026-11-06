import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:restaurante_app/features/admin/data/supabase_admin_repository.dart';
import 'package:restaurante_app/features/admin/presentation/admin_screen.dart';
import 'package:restaurante_app/features/auth/data/supabase_auth_repository.dart';
import 'package:restaurante_app/features/auth/domain/user_profile.dart';
import 'package:restaurante_app/features/auth/presentation/providers/auth_provider.dart';
import 'package:restaurante_app/features/familiares/data/supabase_family_repository.dart';
import 'package:restaurante_app/features/reservas/data/supabase_reservation_repository.dart';

class TestAuthNotifier extends AuthNotifier {
  final UserProfile? user;
  TestAuthNotifier(this.user);

  @override
  UserProfile? build() => user;
}

void main() {
  group('Limpieza de datos de prueba (Empleado, Administrador, Cocina)', () {
    setUp(() {
      SupabaseFamilyRepository.resetMockFamilyStore();
    });

    test('clearTestData en SupabaseAdminRepository elimina empleados demo', () async {
      final repo = SupabaseAdminRepository();
      final before = await repo.getEmployees();
      expect(before.any((e) => e.id == 'demo-user-123'), isTrue);

      final result = await repo.clearTestData();
      expect(result['success'], isTrue);

      final after = await repo.getEmployees();
      expect(after.any((e) => e.id == 'demo-user-123'), isFalse);
      expect(after.any((e) => e.id == 'demo-emp-002'), isFalse);
      expect(after.any((e) => e.id == 'demo-emp-003'), isFalse);
      expect(after.any((e) => e.id == 'demo-emp-004'), isFalse);
    });

    test('clearTestReservations elimina reservas asociadas a cuentas de prueba', () async {
      final resRepo = SupabaseReservationRepository();
      final reservationsBefore = await resRepo.getUserReservations('demo-user-123');
      expect(reservationsBefore.isNotEmpty, isTrue);

      resRepo.clearTestReservations();
      final reservationsAfter = await resRepo.getUserReservations('demo-user-123');
      expect(reservationsAfter.isEmpty, isTrue);
    });

    test('clearMockFamilyStore elimina familiares asociados a empleado demo', () async {
      final famRepo = SupabaseFamilyRepository();
      final familyBefore = await famRepo.getFamilyMembers('demo-user-123');
      expect(familyBefore.isNotEmpty, isTrue);

      SupabaseFamilyRepository.clearMockFamilyStore('demo-user-123');
      final familyAfter = await famRepo.getFamilyMembers('demo-user-123');
      expect(familyAfter.isEmpty, isTrue);
    });

    testWidgets('AdminScreen: Botón Limpiar Datos de Prueba solicita confirmación y muestra SnackBar de éxito', (tester) async {
      tester.view.physicalSize = const Size(800, 1200);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider.overrideWith(
              () => TestAuthNotifier(SupabaseAuthRepository.demoAdmin),
            ),
          ],
          child: const MaterialApp(
            home: AdminScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Botón en AppBar
      final cleanBtn = find.byTooltip('Limpiar Datos de Prueba');
      expect(cleanBtn, findsOneWidget);
      await tester.tap(cleanBtn);
      await tester.pumpAndSettle();

      // Diálogo de confirmación
      expect(find.text('Limpiar Datos de Prueba'), findsWidgets);
      expect(
        find.text(
          '¿Estás seguro de que deseas eliminar permanentemente todos los registros y cuentas de prueba correspondientes a "empleado", "administrador" y "cocina" en Supabase?',
        ),
        findsOneWidget,
      );

      // Confirmar eliminación
      final confirmBtn = find.widgetWithText(ElevatedButton, 'Sí, Eliminar');
      expect(confirmBtn, findsOneWidget);
      await tester.tap(confirmBtn);
      await tester.pumpAndSettle();

      // SnackBar verde de éxito
      expect(find.byType(SnackBar), findsOneWidget);
      final snackBar = tester.widget<SnackBar>(find.byType(SnackBar));
      expect(snackBar.backgroundColor, equals(Colors.green));
      expect(
        find.text('Datos de prueba eliminados con éxito de Supabase.'),
        findsOneWidget,
      );
    });
  });
}
