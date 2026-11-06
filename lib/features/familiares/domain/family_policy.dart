import 'package:restaurante_app/features/familiares/domain/familiar_entity.dart';

/// Reglas de negocio para familiares de empleados en el restaurante institucional.
/// Regla principal: Cada empleado puede tener hasta 3 familiares habilitados
/// para utilizar los servicios del restaurante.
class FamilyPolicy {
  /// Límite máximo de familiares permitidos por empleado.
  static const int maxFamilyMembersPerEmployee = 3;

  /// Determina si un empleado puede registrar o habilitar un nuevo familiar.
  static bool canAddFamilyMember(int currentCount) {
    return currentCount < maxFamilyMembersPerEmployee;
  }

  /// Valida que la lista de familiares cumpla con la restricción de hasta 3 familiares activos.
  static bool validateFamilyLimit(List<Familiar> members) {
    final activeCount = members.where((m) => m.activo).length;
    return activeCount <= maxFamilyMembersPerEmployee;
  }

  /// Filtra y retorna únicamente los familiares activos respetando el límite máximo de 3.
  static List<Familiar> enforceLimit(List<Familiar> members) {
    final activeMembers = members.where((m) => m.activo).toList();
    if (activeMembers.length > maxFamilyMembersPerEmployee) {
      return activeMembers.sublist(0, maxFamilyMembersPerEmployee);
    }
    return activeMembers;
  }

  /// Valida si un familiar específico pertenece a los autorizados para usar el servicio.
  static bool isFamilyMemberAuthorized({
    required String familiarId,
    required List<Familiar> employeeFamilyMembers,
  }) {
    final allowed = enforceLimit(employeeFamilyMembers);
    return allowed.any((f) => f.id == familiarId && f.activo);
  }
}
