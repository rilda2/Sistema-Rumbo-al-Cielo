/**
 * Caso de Uso: AplicarDescuentoManualUseCase (HU14)
 * Permite ajustar manualmente el descuento de un empleado específico.
 * 
 * Criterio de Aceptación:
 * Al confirmar, retorna la confirmación "Descuento aplicado correctamente".
 */
export class AplicarDescuentoManualUseCase {
  execute({ detalle, nuevoTotal }) {
    if (!detalle) {
      throw new Error('Debe especificar el registro a modificar.');
    }

    const valor = Number(nuevoTotal);
    if (isNaN(valor) || valor < 0) {
      throw new Error('El monto ingresado no es válido.');
    }

    detalle.aplicarDescuentoManual(valor);

    return {
      success: true,
      mensaje: 'Descuento aplicado correctamente',
      detalle,
    };
  }
}
