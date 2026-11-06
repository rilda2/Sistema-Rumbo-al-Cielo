/**
 * Caso de Uso: GenerarReporteDetalleEmpleadoUseCase (HU16)
 * 
 * Criterios de Aceptación:
 * 1. Dado que el encargado no selecciona ningún empleado, Entonces muestra "Debe seleccionar un empleado".
 * 2. Si existen consumos, genera desglose individual con familiares asociados.
 * 3. Si no existen registros de consumo, Entonces muestra "No hay datos disponibles".
 */
export class GenerarReporteDetalleEmpleadoUseCase {
  constructor(reportesRepository) {
    this.reportesRepository = reportesRepository;
  }

  async execute({ id_usuario, mes, year }) {
    if (!id_usuario) {
      throw new Error('Debe seleccionar un empleado');
    }

    if (!mes || !year) {
      throw new Error('Debe seleccionar un período');
    }

    const detalle = await this.reportesRepository.getReporteDetalleEmpleado({
      id_usuario,
      mes: Number(mes),
      year: Number(year),
    });

    if (!detalle || !detalle.reservas || detalle.reservas.length === 0) {
      const error = new Error('No hay datos disponibles');
      error.isNoData = true;
      throw error;
    }

    return detalle;
  }
}
