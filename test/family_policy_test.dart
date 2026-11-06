import 'package:flutter_test/flutter_test.dart';
import 'package:restaurante_app/features/familiares/data/supabase_family_repository.dart';
import 'package:restaurante_app/features/familiares/domain/familiar_entity.dart';
import 'package:restaurante_app/features/familiares/domain/family_policy.dart';

void main() {
  group('FamilyPolicy Business Rules (Hasta 3 familiares por empleado)', () {
    test('Regla: El límite máximo de familiares por empleado es exactamente 3', () {
      expect(FamilyPolicy.maxFamilyMembersPerEmployee, equals(3));
    });

    test('Regla canAddFamilyMember: Permite registrar si tiene menos de 3 familiares', () {
      expect(FamilyPolicy.canAddFamilyMember(0), isTrue);
      expect(FamilyPolicy.canAddFamilyMember(1), isTrue);
      expect(FamilyPolicy.canAddFamilyMember(2), isTrue);
      expect(FamilyPolicy.canAddFamilyMember(3), isFalse);
      expect(FamilyPolicy.canAddFamilyMember(4), isFalse);
    });

    test('Regla validateFamilyLimit: Valida listas de familiares activos', () {
      final twoMembers = [
        const Familiar(
          id: '1',
          empleadoId: 'emp-1',
          ci: '12345',
          nombres: 'Hijo',
          apellidos: 'Uno',
          parentesco: 'Hijo',
          activo: true,
        ),
        const Familiar(
          id: '2',
          empleadoId: 'emp-1',
          ci: '12346',
          nombres: 'Hija',
          apellidos: 'Dos',
          parentesco: 'Hija',
          activo: true,
        ),
      ];
      expect(FamilyPolicy.validateFamilyLimit(twoMembers), isTrue);

      final threeMembers = [
        ...twoMembers,
        const Familiar(
          id: '3',
          empleadoId: 'emp-1',
          ci: '12347',
          nombres: 'Esposa',
          apellidos: 'Tres',
          parentesco: 'Cónyuge',
          activo: true,
        ),
      ];
      expect(FamilyPolicy.validateFamilyLimit(threeMembers), isTrue);

      final fourMembers = [
        ...threeMembers,
        const Familiar(
          id: '4',
          empleadoId: 'emp-1',
          ci: '12348',
          nombres: 'Padre',
          apellidos: 'Cuatro',
          parentesco: 'Padre',
          activo: true,
        ),
      ];
      expect(FamilyPolicy.validateFamilyLimit(fourMembers), isFalse);
    });

    test('Regla enforceLimit: Si una lista tiene más de 3 familiares activos, trunca a 3', () {
      final fourMembers = List.generate(
        5,
        (i) => Familiar(
          id: 'fam-$i',
          empleadoId: 'emp-1',
          ci: '100$i',
          nombres: 'Familiar',
          apellidos: '#$i',
          parentesco: 'Hijo',
          activo: true,
        ),
      );

      final limited = FamilyPolicy.enforceLimit(fourMembers);
      expect(limited.length, equals(3));
      expect(limited.first.id, equals('fam-0'));
      expect(limited.last.id, equals('fam-2'));
    });

    test('Regla isFamilyMemberAuthorized: Solo autoriza familiares activos dentro del límite de 3', () {
      final members = [
        const Familiar(
          id: 'f-1',
          empleadoId: 'emp-1',
          ci: '1',
          nombres: 'A',
          apellidos: 'B',
          parentesco: 'Hijo',
          activo: true,
        ),
        const Familiar(
          id: 'f-2',
          empleadoId: 'emp-1',
          ci: '2',
          nombres: 'C',
          apellidos: 'D',
          parentesco: 'Hija',
          activo: true,
        ),
        const Familiar(
          id: 'f-3',
          empleadoId: 'emp-1',
          ci: '3',
          nombres: 'E',
          apellidos: 'F',
          parentesco: 'Cónyuge',
          activo: true,
        ),
        const Familiar(
          id: 'f-4',
          empleadoId: 'emp-1',
          ci: '4',
          nombres: 'G',
          apellidos: 'H',
          parentesco: 'Padre',
          activo: true,
        ),
      ];

      // f-1, f-2, f-3 están autorizados
      expect(
        FamilyPolicy.isFamilyMemberAuthorized(
          familiarId: 'f-1',
          employeeFamilyMembers: members,
        ),
        isTrue,
      );
      expect(
        FamilyPolicy.isFamilyMemberAuthorized(
          familiarId: 'f-3',
          employeeFamilyMembers: members,
        ),
        isTrue,
      );
      // f-4 excede el cupo de 3 familiares
      expect(
        FamilyPolicy.isFamilyMemberAuthorized(
          familiarId: 'f-4',
          employeeFamilyMembers: members,
        ),
        isFalse,
      );
    });

    test('SupabaseFamilyRepository: Retorna los familiares precargados para empleado registrado', () async {
      final repo = SupabaseFamilyRepository();
      final family = await repo.getFamilyMembers('demo-user-123');

      expect(family.length, equals(3));
      expect(family.any((f) => f.nombres == 'Sofía'), isTrue);
      expect(family.any((f) => f.nombres == 'Mateo'), isTrue);
      expect(family.any((f) => f.nombres == 'Carmen'), isTrue);

      final canUse = await repo.canUseRestaurantService('demo-user-123', 'fam-1');
      expect(canUse, isTrue);
    });

    test('SupabaseFamilyRepository: No asigna familiares por defecto a un empleado nuevo', () async {
      final repo = SupabaseFamilyRepository();

      final family = await repo.getFamilyMembers('new-employee-id');

      expect(family, isEmpty);
    });
  });
}
