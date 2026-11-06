import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:restaurante_app/features/admin/presentation/admin_screen.dart';
import 'package:restaurante_app/features/auth/data/supabase_auth_repository.dart';
import 'package:restaurante_app/features/auth/domain/user_profile.dart';
import 'package:restaurante_app/features/auth/presentation/providers/auth_provider.dart';

class TestAuthNotifier extends AuthNotifier {
  final UserProfile? user;
  TestAuthNotifier(this.user);

  @override
  UserProfile? build() => user;
}

void main() {
  group('Validaciones de formulario y Feedback Visual (Nuevo Empleado)', () {
    testWidgets('Formulario rechaza campos vacíos y muestra SnackBar con fondo rojo', (tester) async {
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

      // Abrir modal de Registrar Empleado
      final fab = find.widgetWithText(FloatingActionButton, 'Registrar Empleado');
      expect(fab, findsOneWidget);
      await tester.tap(fab);
      await tester.pumpAndSettle();

      // Modal abierto
      expect(find.text('Registrar Nuevo Empleado'), findsOneWidget);

      // Presionar Registrar con campos vacíos
      final submitBtn = find.text('Registrar y Asociar Familiares');
      expect(submitBtn, findsOneWidget);
      await tester.ensureVisible(submitBtn);
      await tester.pumpAndSettle();
      await tester.tap(submitBtn);
      await tester.pumpAndSettle();

      // Debe mostrar SnackBar con fondo rojo y mensaje de error claro
      expect(find.byType(SnackBar), findsOneWidget);
      final snackBar = tester.widget<SnackBar>(find.byType(SnackBar));
      expect(snackBar.backgroundColor, equals(Colors.red));
      expect(
        find.text('No se permite guardar al empleado con campos vacíos. Completa todos los campos obligatorios.'),
        findsOneWidget,
      );

      // El modal no debe cerrarse cuando falla la validación
      expect(find.text('Registrar Nuevo Empleado'), findsOneWidget);
    });

    testWidgets('Campos numéricos (CI y Teléfono) tienen FilteringTextInputFormatter.digitsOnly', (tester) async {
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

      await tester.tap(find.widgetWithText(FloatingActionButton, 'Registrar Empleado'));
      await tester.pumpAndSettle();

      // Verificar campo CI
      final ciFieldFinder = find.widgetWithText(TextField, 'Cédula de Identidad (CI)');
      expect(ciFieldFinder, findsOneWidget);
      final ciField = tester.widget<TextField>(ciFieldFinder);
      expect(ciField.keyboardType, equals(TextInputType.number));
      expect(
        ciField.inputFormatters!.any((f) => f == FilteringTextInputFormatter.digitsOnly),
        isTrue,
      );

      // Verificar campo Teléfono
      final telFieldFinder = find.widgetWithText(TextField, 'Teléfono');
      expect(telFieldFinder, findsOneWidget);
      final telField = tester.widget<TextField>(telFieldFinder);
      expect(telField.keyboardType, equals(TextInputType.number));
      expect(
        telField.inputFormatters!.any((f) => f == FilteringTextInputFormatter.digitsOnly),
        isTrue,
      );
    });

    testWidgets('Registro exitoso muestra SnackBar verde de confirmación', (tester) async {
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

      await tester.tap(find.widgetWithText(FloatingActionButton, 'Registrar Empleado'));
      await tester.pumpAndSettle();

      // Llenar campos válidos
      await tester.enterText(
        find.widgetWithText(TextField, 'Nombres'),
        'Rodrigo',
      );
      await tester.enterText(
        find.widgetWithText(TextField, 'Apellidos'),
        'Morales',
      );
      await tester.enterText(
        find.widgetWithText(TextField, 'Cédula de Identidad (CI)'),
        '8765432',
      );
      await tester.enterText(
        find.widgetWithText(TextField, 'Teléfono'),
        '71234567',
      );
      await tester.enterText(
        find.widgetWithText(TextField, 'Correo Institucional'),
        'rodrigo.morales@institucion.gob.bo',
      );
      await tester.enterText(
        find.widgetWithText(TextField, 'Departamento / Área'),
        'Tecnología',
      );

      final submitBtn = find.text('Registrar y Asociar Familiares');
      await tester.ensureVisible(submitBtn);
      await tester.pumpAndSettle();
      await tester.tap(submitBtn);
      await tester.pumpAndSettle();

      // Debe mostrar SnackBar verde con mensaje de éxito
      expect(find.byType(SnackBar), findsOneWidget);
      final snackBar = tester.widget<SnackBar>(find.byType(SnackBar));
      expect(snackBar.backgroundColor, equals(Colors.green));
      expect(find.text('Empleado registrado con éxito en Supabase.'), findsOneWidget);
    });

    testWidgets('Ingreso de correo inválido muestra advertencia en la ventana en foco', (tester) async {
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

      await tester.tap(find.widgetWithText(FloatingActionButton, 'Registrar Empleado'));
      await tester.pumpAndSettle();

      // Llenar campos con correo inválido
      await tester.enterText(find.widgetWithText(TextField, 'Nombres'), 'Carlos');
      await tester.enterText(find.widgetWithText(TextField, 'Apellidos'), 'Mamani');
      await tester.enterText(find.widgetWithText(TextField, 'Cédula de Identidad (CI)'), '1234567');
      await tester.enterText(find.widgetWithText(TextField, 'Teléfono'), '77712345');
      await tester.enterText(find.widgetWithText(TextField, 'Correo Institucional'), 'correo-invalido');
      await tester.enterText(find.widgetWithText(TextField, 'Departamento / Área'), 'Sistemas');

      final submitBtn = find.text('Registrar y Asociar Familiares');
      await tester.ensureVisible(submitBtn);
      await tester.pumpAndSettle();
      await tester.tap(submitBtn);
      await tester.pumpAndSettle();

      // Advertencia visible directamente en la ventana en foco
      expect(find.byType(SnackBar), findsOneWidget);
      expect(
        find.text('Por favor ingresa un correo electrónico institucional válido.'),
        findsOneWidget,
      );
      expect(
        find.text('Atención: Por favor ingresa un correo electrónico institucional válido.'),
        findsOneWidget,
      );
    });
  });
}
