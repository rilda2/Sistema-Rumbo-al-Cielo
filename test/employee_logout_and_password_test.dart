import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:restaurante_app/features/admin/data/supabase_admin_repository.dart';
import 'package:restaurante_app/features/auth/data/supabase_auth_repository.dart';
import 'package:restaurante_app/features/auth/presentation/profile_screen.dart';
import 'package:restaurante_app/features/auth/presentation/providers/auth_provider.dart';
import 'package:restaurante_app/features/familiares/data/supabase_family_repository.dart';
import 'package:restaurante_app/features/reservas/data/supabase_reservation_repository.dart';
import 'package:restaurante_app/features/reservas/domain/reservation_entity.dart';
import 'package:restaurante_app/main.dart';

void main() {
  group('Cerrar Sesión & Cambiar Contraseña (Seguridad & Persistencia)', () {
    setUp(() {
      SupabaseFamilyRepository.resetMockFamilyStore();
    });

    testWidgets('Cerrar Sesión desde EmployeeScreen solicita confirmación y redirige a LoginScreen', (tester) async {
      tester.view.physicalSize = const Size(800, 1200);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      late final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(SupabaseAuthRepository()),
        ],
      );
      addTearDown(container.dispose);

      // Iniciar sesión con empleado demo
      container.read(authProvider.notifier).setDemoUser(SupabaseAuthRepository.demoEmpleado);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const RestauranteApp(),
        ),
      );
      await tester.pumpAndSettle();

      // Navegar a la pestaña Reservas (EmployeeScreen)
      final reservasTab = find.text('Reservas');
      expect(reservasTab, findsOneWidget);
      await tester.tap(reservasTab);
      await tester.pumpAndSettle();

      // Verificar que estamos en la pantalla del empleado
      expect(find.text('Reservas de Comedor'), findsOneWidget);

      // Botón de logout en la AppBar
      final logoutBtn = find.byTooltip('Cerrar Sesión');
      expect(logoutBtn, findsOneWidget);

      // 1. Probar cancelación en el diálogo
      await tester.tap(logoutBtn);
      await tester.pumpAndSettle();

      expect(find.text('Cerrar Sesión'), findsWidgets);
      expect(
        find.text(
          '¿Estás seguro de que deseas cerrar sesión y salir del sistema de forma segura?',
        ),
        findsOneWidget,
      );

      final cancelBtn = find.widgetWithText(TextButton, 'Cancelar');
      expect(cancelBtn, findsOneWidget);
      await tester.tap(cancelBtn);
      await tester.pumpAndSettle();

      // La sesión debe seguir activa
      expect(container.read(authProvider), isNotNull);
      expect(find.text('Reservas de Comedor'), findsOneWidget);

      // 2. Probar confirmación de logout
      await tester.tap(logoutBtn);
      await tester.pumpAndSettle();

      final confirmBtn = find.widgetWithText(ElevatedButton, 'Cerrar Sesión');
      expect(confirmBtn, findsOneWidget);
      await tester.tap(confirmBtn);
      await tester.pumpAndSettle();

      // Verificar que el estado del auth provider ahora es null y se muestra LoginScreen
      expect(container.read(authProvider), isNull);
      expect(find.text('Ingresar al Sistema'), findsOneWidget);
      expect(find.text('Correo electrónico'), findsOneWidget);
    });

    testWidgets('Cerrar Sesión desde ProfileScreen solicita confirmación y limpia la sesión', (tester) async {
      tester.view.physicalSize = const Size(800, 1200);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      late final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(SupabaseAuthRepository()),
        ],
      );
      addTearDown(container.dispose);

      container.read(authProvider.notifier).setDemoUser(SupabaseAuthRepository.demoEmpleado);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(
            home: ProfileScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Encontrar el botón de cerrar sesión en ProfileScreen (hacer scroll si es necesario)
      final logoutButton = find.widgetWithText(OutlinedButton, 'Cerrar Sesión');
      await tester.ensureVisible(logoutButton);
      await tester.pumpAndSettle();
      await tester.tap(logoutButton);
      await tester.pumpAndSettle();

      // Confirmar logout
      expect(find.text('Cerrar Sesión'), findsWidgets);
      final confirmBtn = find.widgetWithText(ElevatedButton, 'Cerrar Sesión');
      await tester.tap(confirmBtn);
      await tester.pumpAndSettle();

      // Verificar que la sesión en el Provider es nula
      expect(container.read(authProvider), isNull);
    });

    testWidgets('Cambiar Contraseña: Valida campos vacíos con SnackBar rojo', (tester) async {
      tester.view.physicalSize = const Size(800, 1200);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      late final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(SupabaseAuthRepository()),
        ],
      );
      addTearDown(container.dispose);

      container.read(authProvider.notifier).setDemoUser(SupabaseAuthRepository.demoEmpleado);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(
            home: ProfileScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Abrir modal de cambiar contraseña
      final changePasswordTile = find.text('Cambiar Contraseña');
      await tester.ensureVisible(changePasswordTile);
      await tester.pumpAndSettle();
      await tester.tap(changePasswordTile);
      await tester.pumpAndSettle();

      expect(find.text('Ingresa tu nueva contraseña para actualizar tus credenciales de acceso institucional.'), findsOneWidget);

      // Pulsar directamente "Actualizar Contraseña" sin ingresar datos
      final updateBtn = find.widgetWithText(ElevatedButton, 'Actualizar Contraseña');
      await tester.ensureVisible(updateBtn);
      await tester.tap(updateBtn);
      await tester.pump();

      // Debe mostrar SnackBar rojo de validación
      expect(find.byType(SnackBar), findsOneWidget);
      final snackBar = tester.widget<SnackBar>(find.byType(SnackBar));
      expect(snackBar.backgroundColor, equals(Colors.red));
      expect(find.text('Por favor completa ambos campos de contraseña.'), findsOneWidget);
    });

    testWidgets('Cambiar Contraseña: Valida longitud mínima de 6 caracteres con SnackBar rojo', (tester) async {
      tester.view.physicalSize = const Size(800, 1200);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      late final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(SupabaseAuthRepository()),
        ],
      );
      addTearDown(container.dispose);

      container.read(authProvider.notifier).setDemoUser(SupabaseAuthRepository.demoEmpleado);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(
            home: ProfileScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      final changePasswordTile = find.text('Cambiar Contraseña');
      await tester.ensureVisible(changePasswordTile);
      await tester.pumpAndSettle();
      await tester.tap(changePasswordTile);
      await tester.pumpAndSettle();

      // Ingresar 4 caracteres (menor a 6)
      final textFields = find.byType(TextField);
      await tester.enterText(textFields.at(0), '1234');
      await tester.enterText(textFields.at(1), '1234');
      await tester.pump();

      final updateBtn = find.widgetWithText(ElevatedButton, 'Actualizar Contraseña');
      await tester.ensureVisible(updateBtn);
      await tester.tap(updateBtn);
      await tester.pump();

      expect(find.byType(SnackBar), findsOneWidget);
      final snackBar = tester.widget<SnackBar>(find.byType(SnackBar));
      expect(snackBar.backgroundColor, equals(Colors.red));
      expect(find.text('La nueva contraseña debe tener al menos 6 caracteres.'), findsOneWidget);
    });

    testWidgets('Cambiar Contraseña: Valida que ambas contraseñas coincidan con SnackBar rojo', (tester) async {
      tester.view.physicalSize = const Size(800, 1200);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      late final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(SupabaseAuthRepository()),
        ],
      );
      addTearDown(container.dispose);

      container.read(authProvider.notifier).setDemoUser(SupabaseAuthRepository.demoEmpleado);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(
            home: ProfileScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      final changePasswordTile = find.text('Cambiar Contraseña');
      await tester.ensureVisible(changePasswordTile);
      await tester.pumpAndSettle();
      await tester.tap(changePasswordTile);
      await tester.pumpAndSettle();

      // Ingresar contraseñas diferentes
      final textFields = find.byType(TextField);
      await tester.enterText(textFields.at(0), 'password123');
      await tester.enterText(textFields.at(1), 'password999');
      await tester.pump();

      final updateBtn = find.widgetWithText(ElevatedButton, 'Actualizar Contraseña');
      await tester.ensureVisible(updateBtn);
      await tester.tap(updateBtn);
      await tester.pump();

      expect(find.byType(SnackBar), findsOneWidget);
      final snackBar = tester.widget<SnackBar>(find.byType(SnackBar));
      expect(snackBar.backgroundColor, equals(Colors.red));
      expect(find.text('Las contraseñas no coinciden. Por favor verifícalas.'), findsOneWidget);
    });

    testWidgets('Cambiar Contraseña: Con datos válidos muestra SnackBar verde de éxito y cierra modal', (tester) async {
      tester.view.physicalSize = const Size(800, 1200);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      late final container = ProviderContainer(
        overrides: [
          authRepositoryProvider.overrideWithValue(SupabaseAuthRepository()),
        ],
      );
      addTearDown(container.dispose);

      container.read(authProvider.notifier).setDemoUser(SupabaseAuthRepository.demoEmpleado);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(
            home: ProfileScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      final changePasswordTile = find.text('Cambiar Contraseña');
      await tester.ensureVisible(changePasswordTile);
      await tester.pumpAndSettle();
      await tester.tap(changePasswordTile);
      await tester.pumpAndSettle();

      // Ingresar contraseñas válidas e idénticas
      final textFields = find.byType(TextField);
      await tester.enterText(textFields.at(0), 'NuevaClaveSegura2026!');
      await tester.enterText(textFields.at(1), 'NuevaClaveSegura2026!');
      await tester.pump();

      final updateBtn = find.widgetWithText(ElevatedButton, 'Actualizar Contraseña');
      await tester.ensureVisible(updateBtn);
      await tester.tap(updateBtn);
      await tester.pumpAndSettle();

      // Modal cerrado
      expect(find.text('Actualizar Contraseña Institucional'), findsNothing);

      // SnackBar verde de éxito
      expect(find.byType(SnackBar), findsOneWidget);
      final snackBar = tester.widget<SnackBar>(find.byType(SnackBar));
      expect(snackBar.backgroundColor, equals(Colors.green));
      expect(
        find.text('Contraseña actualizada con éxito. Tu sesión y datos permanecen seguros.'),
        findsOneWidget,
      );
    });

    test('Requisito Crítico: Actualización de contraseña NO altera sesión ni rompe guardado en BD', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final employee = SupabaseAuthRepository.demoEmpleado;
      container.read(authProvider.notifier).setDemoUser(employee);

      // Estado previo a la actualización
      final userBefore = container.read(authProvider);
      expect(userBefore, isNotNull);
      expect(userBefore!.id, equals(employee.id));
      expect(userBefore.email, equals(employee.email));
      expect(userBefore.role, equals(employee.role));

      // Actualizar contraseña
      final updateSuccess = await container
          .read(authProvider.notifier)
          .updatePassword('NuevaSuperPassword2026');
      expect(updateSuccess, isTrue);

      // 1. Verificar que el usuario y su sesión siguen 100% íntegros
      final userAfter = container.read(authProvider);
      expect(userAfter, isNotNull);
      expect(userAfter!.id, equals(employee.id));
      expect(userAfter.email, equals(employee.email));
      expect(userAfter.role, equals(employee.role));
      expect(userAfter.department, equals(employee.department));

      // 2. Verificar que las operaciones de guardado en base de datos siguen funcionando perfectamente
      final reservationRepo = SupabaseReservationRepository();
      final newReservation = Reservation(
        id: 'res-test-post-pwd-${DateTime.now().millisecondsSinceEpoch}',
        userId: userAfter.id,
        userName: userAfter.fullName,
        date: DateTime.now().add(const Duration(days: 1)),
        dishName: 'Picante Mixto Chuquisaqueño',
        notes: 'Reserva creada tras cambio seguro de clave',
        price: userAfter.isPensioner ? 15.0 : 18.0,
        createdAt: DateTime.now(),
      );
      await reservationRepo.createReservation(newReservation);

      // 3. Consultar las reservas del usuario para confirmar la persistencia
      final userReservations = await reservationRepo.getUserReservations(userAfter.id);
      expect(userReservations.any((r) => r.id == newReservation.id), isTrue);

      // 4. Verificar guardado de registros administrativos sin colisión ni pérdida de integridad
      final adminRepo = SupabaseAdminRepository();
      final newEmp = await adminRepo.createEmployee(
        ci: '99887766',
        nombres: 'Verificación',
        apellidos: 'Post Cambio Clave',
        email: 'verificacion.clave@institucion.gob.bo',
        telefono: '77665544',
        departamento: 'Seguridad Informática',
        hasMonthlyPlan: true,
      );

      expect(newEmp.id, isNotEmpty);
      final employeesList = await adminRepo.getEmployees();
      expect(employeesList.any((e) => e.email == 'verificacion.clave@institucion.gob.bo'), isTrue);
    });
  });
}
