import 'package:restaurante_app/features/familiares/domain/familiar_entity.dart';

abstract class FamilyRepository {
  /// Obtiene los familiares registrados para un empleado, respetando el límite de 3.
  Future<List<Familiar>> getFamilyMembers(String empleadoId);

  /// Verifica si un familiar está habilitado para reservar/consumir.
  Future<bool> canUseRestaurantService(String empleadoId, String familiarId);
}
