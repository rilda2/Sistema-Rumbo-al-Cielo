import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:restaurante_app/features/auth/data/supabase_auth_repository.dart';
import 'package:restaurante_app/features/auth/domain/user_profile.dart';
import 'package:restaurante_app/features/auth/presentation/providers/auth_provider.dart';
import 'package:restaurante_app/main.dart';
import 'package:restaurante_app/features/reservas/domain/holiday_entity.dart';
import 'package:restaurante_app/features/reservas/domain/usecases/reservation_policy.dart';

class TestAuthNotifier extends AuthNotifier {
  final UserProfile? initialUser;
  TestAuthNotifier([this.initialUser]);

  @override
  UserProfile? build() => initialUser;
}

void main() {
  group('ReservationPolicy Business Rules', () {
    final policy = ReservationPolicy();
    final holiday = Holiday(
      id: 'h1',
      date: DateTime(2026, 5, 1),
      name: 'Día del Trabajo',
    );
    final holidays = [holiday];

    test('Regla 1: No se puede reservar en días pasados', () {
      final now = DateTime(2026, 10, 12, 8, 0); // Lunes 8:00 AM
      final pastDate = DateTime(2026, 10, 11); // Ayer

      final result = policy.checkCanReserve(pastDate, now, holidays: holidays);
      expect(result.isAllowed, isFalse);
      expect(result.message, contains('pasadas'));
    });

    test('Regla 2: No se puede reservar en fines de semana (sábado/domingo)', () {
      final now = DateTime(2026, 10, 12, 8, 0); // Lunes 8:00 AM
      final saturday = DateTime(2026, 10, 17); // Sábado

      final result = policy.checkCanReserve(saturday, now, holidays: holidays);
      expect(result.isAllowed, isFalse);
      expect(result.message, contains('fines de semana'));
    });

    test('Regla 3: No se puede reservar en feriados oficiales', () {
      final now = DateTime(2026, 4, 20, 8, 0);
      final holidayDate = DateTime(2026, 5, 1); // Feriado Día del Trabajo

      final result =
          policy.checkCanReserve(holidayDate, now, holidays: holidays);
      expect(result.isAllowed, isFalse);
      expect(result.message, contains('Día del Trabajo'));
    });

    test('Regla 4: Mismo día antes de las 9:00 AM -> Permitido reservar', () {
      final now = DateTime(2026, 10, 13, 8, 45); // Martes 8:45 AM
      final today = DateTime(2026, 10, 13);

      final result = policy.checkCanReserve(today, now, holidays: holidays);
      expect(result.isAllowed, isTrue);
    });

    test('Regla 4: Mismo día exactamente a las 9:00 AM -> Permitido reservar', () {
      final now = DateTime(2026, 10, 13, 9, 0); // Martes 9:00 AM en punto
      final today = DateTime(2026, 10, 13);

      final result = policy.checkCanReserve(today, now, holidays: holidays);
      expect(result.isAllowed, isTrue);
    });

    test('Regla 4: Mismo día después de las 9:00 AM (9:01) -> Bloqueado', () {
      final now = DateTime(2026, 10, 13, 9, 1); // Martes 9:01 AM
      final today = DateTime(2026, 10, 13);

      final result = policy.checkCanReserve(today, now, holidays: holidays);
      expect(result.isAllowed, isFalse);
      expect(result.message, contains('9:00 AM'));
    });

    test('Regla Cancelación: Mismo día antes de las 8:59 AM -> Permitido', () {
      final now = DateTime(2026, 10, 13, 8, 30);
      final today = DateTime(2026, 10, 13);

      final result = policy.checkCanCancel(today, now);
      expect(result.isAllowed, isTrue);
    });

    test('Regla Cancelación: Mismo día a partir de las 9:00 AM -> Bloqueado', () {
      final now = DateTime(2026, 10, 13, 9, 0);
      final today = DateTime(2026, 10, 13);

      final result = policy.checkCanCancel(today, now);
      expect(result.isAllowed, isFalse);
      expect(result.message, contains('8:59 AM'));
    });

    test('Regla Días Futuros: Días laborables futuros siempre permitidos', () {
      final now = DateTime(2026, 10, 13, 14, 0); // Martes 2:00 PM
      final futureWorkday = DateTime(2026, 10, 14); // Miércoles

      final result =
          policy.checkCanReserve(futureWorkday, now, holidays: holidays);
      expect(result.isAllowed, isTrue);
    });
  });

  testWidgets('App muestra LoginScreen por defecto cuando no hay sesión iniciada', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: RestauranteApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Iniciar Sesión'), findsWidgets);
    expect(find.text('Correo electrónico'), findsOneWidget);
    expect(find.text('Contraseña'), findsOneWidget);
    expect(find.text('Ingresar al Sistema'), findsOneWidget);
  });

  testWidgets('App muestra MainLayout cuando usuario está autenticado como Empleado', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authProvider.overrideWith(
            () => TestAuthNotifier(SupabaseAuthRepository.demoEmpleado),
          ),
        ],
        child: const RestauranteApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Menú del Día'), findsOneWidget);
    expect(find.text('Menú'), findsOneWidget);
    expect(find.text('Calendario'), findsOneWidget);
    expect(find.text('Reservas'), findsOneWidget);
    expect(find.text('Perfil'), findsOneWidget);
  });
}
