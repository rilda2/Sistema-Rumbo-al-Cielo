import 'package:restaurante_app/features/descuentos/domain/entities/cierre_mensual_entity.dart';
import 'package:restaurante_app/features/descuentos/domain/entities/detalle_cierre_entity.dart';
import 'package:restaurante_app/features/descuentos/domain/repositories/i_descuentos_repository.dart';

class GuardarCierreMensualUseCase {
  final IDescuentosRepository repository;

  GuardarCierreMensualUseCase(this.repository);

  Future<Map<String, dynamic>> execute({
    required CierreMensualEntity cierre,
    required List<DetalleCierreEntity> detalles,
  }) async {
    return await repository.guardarCierreMensual(
      cierre: cierre,
      detalles: detalles,
    );
  }
}
