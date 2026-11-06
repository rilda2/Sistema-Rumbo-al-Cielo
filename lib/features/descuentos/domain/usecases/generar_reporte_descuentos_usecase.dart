import 'package:restaurante_app/features/descuentos/domain/entities/cierre_mensual_entity.dart';
import 'package:restaurante_app/features/descuentos/domain/entities/detalle_cierre_entity.dart';
import 'package:restaurante_app/features/descuentos/domain/repositories/i_descuentos_repository.dart';

class GenerarReporteDescuentosUseCase {
  final IDescuentosRepository repository;

  GenerarReporteDescuentosUseCase(this.repository);

  Future<({CierreMensualEntity cierre, List<DetalleCierreEntity> detalles, Map<String, dynamic> config})>
      execute({required int? mes, required int? year}) async {
    // Criterio de Aceptación HU12:
    // "Dado que no se selecciona período,
    //  Cuando presiona Generar reporte,
    //  Entonces el sistema muestra 'Debe seleccionar un período válido'."
    if (mes == null || year == null || mes < 1 || mes > 12 || year < 2020) {
      throw Exception('Debe seleccionar un período válido');
    }

    return await repository.calcularCierreMensual(mes: mes, year: year);
  }
}
