import 'package:restaurante_app/features/descuentos/domain/entities/cierre_mensual_entity.dart';
import 'package:restaurante_app/features/descuentos/domain/entities/detalle_cierre_entity.dart';

abstract class IDescuentosRepository {
  Future<Map<String, dynamic>> getConfiguracion();

  Future<({CierreMensualEntity cierre, List<DetalleCierreEntity> detalles, Map<String, dynamic> config})>
      calcularCierreMensual({required int mes, required int year});

  Future<Map<String, dynamic>> guardarCierreMensual({
    required CierreMensualEntity cierre,
    required List<DetalleCierreEntity> detalles,
  });
}
