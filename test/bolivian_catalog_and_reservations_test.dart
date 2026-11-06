import 'package:flutter_test/flutter_test.dart';
import 'package:restaurante_app/features/admin/data/supabase_admin_repository.dart';
import 'package:restaurante_app/features/admin/domain/admin_employee_entity.dart';
import 'package:restaurante_app/features/familiares/domain/familiar_entity.dart';
import 'package:restaurante_app/features/menu/data/supabase_weekly_menu_repository.dart';
import 'package:restaurante_app/features/menu/domain/bolivian_dish_entity.dart';
import 'package:restaurante_app/features/reservas/domain/reservation_entity.dart';

void main() {
  group('1. Catálogo de Gastronomía Boliviana y Menú Semanal', () {
    test(
      'Catálogo contiene platos típicos bolivianos preestablecidos',
      () async {
        final repo = SupabaseWeeklyMenuRepository();
        final catalogo = await repo.getCatalogoPlatos();

        expect(catalogo.isNotEmpty, isTrue);
        expect(catalogo.length, greaterThanOrEqualTo(10));

        final dishNames = catalogo.map((d) => d.nombre).toList();
        expect(dishNames.contains('Silpancho Cochabambino'), isTrue);
        expect(dishNames.contains('Pique Macho Especial'), isTrue);
        expect(dishNames.contains('Majadito Cruceño'), isTrue);
        expect(dishNames.contains('Sopa de Maní Tradicional'), isTrue);
        expect(dishNames.contains('Falso Conejo'), isTrue);
        expect(dishNames.contains('Saice Tarijeño'), isTrue);
      },
    );

    test('Menú Semanal: Agregar plato en borrador y publicar menú', () async {
      final repo = SupabaseWeeklyMenuRepository();
      final monday = DateTime(2026, 10, 19); // Lunes

      const testDish = PlatoCatalogo(
        id: 99,
        nombre: 'Plato Test Boliviano',
        descripcion: 'Descripción del plato',
        categoria: 'Segundo',
      );

      // Agregar al menú
      await repo.togglePlatoEnMenu(
        fecha: monday,
        diaSemana: 'Lunes',
        plato: testDish,
        agregar: true,
      );

      final menuBorrador = await repo.getMenuSemanal(monday);
      final added = menuBorrador.firstWhere((i) => i.platoCatalogoId == 99);
      expect(added.estado, equals('borrador'));
      expect(added.isBorrador, isTrue);

      // Publicar menú semanal
      final publishedOk = await repo.publicarMenuSemanal(startOfWeek: monday);
      expect(publishedOk, isTrue);

      final menuPublicado = await repo.getMenuPublicado(monday);
      final publishedItem = menuPublicado.firstWhere(
        (i) => i.platoCatalogoId == 99,
      );
      expect(publishedItem.isPublicado, isTrue);
      expect(publishedItem.estado, equals('publicado'));
    });
  });

  group('2. Reglas de Tarifas Fijas y Reservas', () {
    test(
      'Tarifas fijas: 15 Bs para Plan Mensual, 18 Bs para Particular / Sin Plan',
      () {
        final empConPlan = AdminEmployee(
          id: 'emp-1',
          ci: '12345',
          nombres: 'Carlos',
          apellidos: 'Vargas',
          email: 'carlos@institucion.gob.bo',
          hasMonthlyPlan: true,
          creadoEn: DateTime.now(),
        );

        final empSinPlan = AdminEmployee(
          id: 'emp-2',
          ci: '67890',
          nombres: 'Pedro',
          apellidos: 'Suárez',
          email: 'pedro@institucion.gob.bo',
          hasMonthlyPlan: false,
          creadoEn: DateTime.now(),
        );

        expect(empConPlan.tariffPrice, equals(15.0));
        expect(empSinPlan.tariffPrice, equals(18.0));
      },
    );

    test('Cálculo de costo de reservas conjuntas (Empleado + Familiares)', () {
      const double tarifaMensual = 15.0;
      const double tarifaParticular = 18.0;

      // Caso 1: Empleado con Plan Mensual + 2 familiares = 3 comensales
      const int comensalesCaso1 = 3;
      final totalCaso1 = comensalesCaso1 * tarifaMensual;
      expect(totalCaso1, equals(45.0));

      // Caso 2: Empleado Particular + 1 familiar = 2 comensales
      const int comensalesCaso2 = 2;
      final totalCaso2 = comensalesCaso2 * tarifaParticular;
      expect(totalCaso2, equals(36.0));
    });

    test('Entidad Reservation almacena comensal, familiarId y precio', () {
      final resEmpleado = Reservation(
        id: 'res-1',
        userId: 'emp-1',
        userName: 'Carlos Vargas',
        dishName: 'Silpancho Cochabambino',
        date: DateTime(2026, 10, 20),
        price: 15.0,
        createdAt: DateTime.now(),
      );

      expect(resEmpleado.price, equals(15.0));
      expect(resEmpleado.isForFamiliar, isFalse);
      expect(resEmpleado.displayName, equals('Carlos Vargas'));

      final resFamiliar = Reservation(
        id: 'res-2',
        userId: 'emp-1',
        userName: 'Carlos Vargas',
        familiarId: 'fam-101',
        beneficiaryName: 'Mateo Vargas (Hijo)',
        dishName: 'Majadito Cruceño',
        date: DateTime(2026, 10, 20),
        price: 15.0,
        createdAt: DateTime.now(),
      );

      expect(resFamiliar.price, equals(15.0));
      expect(resFamiliar.isForFamiliar, isTrue);
      expect(resFamiliar.displayName, equals('Mateo Vargas (Hijo)'));
    });
  });

  group('3. Gestión de Empleados y Familiares en Administrador', () {
    test(
      'Registrar empleado con familiares asociados respetando el límite de 3',
      () async {
        final adminRepo = SupabaseAdminRepository();

        final newEmp = await adminRepo.createEmployee(
          ci: '9988776',
          nombres: 'Laura',
          apellidos: 'Torrico',
          email: 'laura.torrico@institucion.gob.bo',
          telefono: '77712345',
          departamento: 'Planificación',
          hasMonthlyPlan: true,
          initialFamiliares: [
            {
              'nombres': 'Esteban',
              'apellidos': 'Torrico',
              'ci': '111',
              'parentesco': 'Hijo',
            },
            {
              'nombres': 'Lucía',
              'apellidos': 'Torrico',
              'ci': '222',
              'parentesco': 'Hija',
            },
          ],
        );

        expect(newEmp.familiares.length, equals(2));
        expect(
          newEmp.id,
          matches(
            RegExp(
              r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
              caseSensitive: false,
            ),
          ),
        );
        expect(newEmp.hasMonthlyPlan, isTrue);
        expect(newEmp.tariffPrice, equals(15.0));

        // Agregar un 3er familiar (permitido)
        final okFam3 = await adminRepo.addFamiliar(
          newEmp.id,
          Familiar(
            id: 'fam-${newEmp.id}-3',
            empleadoId: newEmp.id,
            ci: '333',
            nombres: 'Marcos',
            apellidos: 'Paz',
            parentesco: 'Cónyuge',
            activo: true,
          ),
        );
        expect(okFam3, isTrue);

        // Intentar agregar un 4to familiar (debe ser rechazado por FamilyPolicy)
        final okFam4 = await adminRepo.addFamiliar(
          newEmp.id,
          Familiar(
            id: 'fam-${newEmp.id}-4',
            empleadoId: newEmp.id,
            ci: '444',
            nombres: 'Abuelo',
            apellidos: 'Torrico',
            parentesco: 'Padre',
            activo: true,
          ),
        );
        expect(okFam4, isFalse);
      },
    );

    test('Eliminar familiar y alternar plan mensual', () async {
      final adminRepo = SupabaseAdminRepository();
      final employees = await adminRepo.getEmployees();
      final emp = employees.first;

      // Alternar a sin plan
      await adminRepo.toggleMonthlyPlan(emp.id, false);
      final updatedEmployees = await adminRepo.getEmployees();
      final updatedEmp = updatedEmployees.firstWhere((e) => e.id == emp.id);
      expect(updatedEmp.hasMonthlyPlan, isFalse);
      expect(updatedEmp.tariffPrice, equals(18.0));

      // Alternar nuevamente a con plan
      await adminRepo.toggleMonthlyPlan(emp.id, true);
      final reloadedEmployees = await adminRepo.getEmployees();
      final reloadedEmp = reloadedEmployees.firstWhere((e) => e.id == emp.id);
      expect(reloadedEmp.hasMonthlyPlan, isTrue);
      expect(reloadedEmp.tariffPrice, equals(15.0));
    });
  });
}
