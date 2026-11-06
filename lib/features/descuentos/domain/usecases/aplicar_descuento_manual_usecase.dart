import 'package:restaurante_app/features/descuentos/domain/entities/detalle_cierre_entity.dart';

class AplicarDescuentoManualUseCase {
  ({bool success, String mensaje, DetalleCierreEntity detalle}) execute({
    required DetalleCierreEntity detalle,
    required double nuevoTotal,
  }) {
    if (nuevoTotal < 0) {
      throw Exception('El monto ingresado no es válido.');
    }

    detalle.aplicarDescuentoManual(nuevoTotal);

    // Criterio de Aceptación HU12:
    // "Dado que el administrador intenta aplicar descuento manualmente,
    //  Cuando presiona Confirmar,
    //  Entonces el sistema muestra mensaje 'Descuento aplicado correctamente'"
    return (
      success: true,
      mensaje: 'Descuento aplicado correctamente',
      detalle: detalle,
    );
  }
}
