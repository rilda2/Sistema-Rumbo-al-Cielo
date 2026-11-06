/**
 * Interfaz de Repositorio de Dominio: IReportesRepository
 * Aplica DIP (Dependency Inversion Principle).
 * Define las operaciones abstractas para la gestión de reportes contables y de consumo.
 */
export class IReportesRepository {
  /**
   * Obtiene la configuración de precios y reglas del sistema
   * @returns {Promise<{ precio_esporadico: number, precio_pension: number, dias_minimos: number }>}
   */
  async getConfiguracion() {
    throw new Error('Método getConfiguracion no implementado');
  }

  /**
   * Obtiene el listado de usuarios elegibles para el reporte
   * @returns {Promise<Array>}
   */
  async getUsuarios() {
    throw new Error('Método getUsuarios no implementado');
  }

  /**
   * Calcula cobros y valida antigüedad para HU14
   * @param {{ mes: number, year: number }} params
   * @returns {Promise<{ cierre: Object, detalles: Array }>}
   */
  async calcularCierreMensual({ mes, year }) {
    throw new Error('Método calcularCierreMensual no implementado');
  }

  /**
   * Guarda de forma persistente el cierre mensual en las tablas:
   * cierre_mensual, detalle_cierre y liquidacion_mes
   * @param {{ cierre: Object, detalles: Array }} payload
   * @returns {Promise<{ success: boolean, id_cierre: number }>}
   */
  async guardarCierreMensual({ cierre, detalles }) {
    throw new Error('Método guardarCierreMensual no implementado');
  }

  /**
   * Genera el reporte mensual de consumo agrupado por empleado y familiares (HU15)
   * @param {{ mes: number, year: number, agrupadoPorArea?: boolean }} params
   * @returns {Promise<Array>}
   */
  async getReporteMensualConsumo({ mes, year, agrupadoPorArea }) {
    throw new Error('Método getReporteMensualConsumo no implementado');
  }

  /**
   * Genera el desglose detallado de reservas de un empleado específico y sus familiares (HU16)
   * @param {{ id_usuario: string, mes: number, year: number }} params
   * @returns {Promise<Object>}
   */
  async getReporteDetalleEmpleado({ id_usuario, mes, year }) {
    throw new Error('Método getReporteDetalleEmpleado no implementado');
  }

  /**
   * Obtiene el registro de asistencias de los usuarios ordenado por fecha
   * @param {{ fechaInicio?: string, fechaFin?: string, id_usuario?: string }} params
   * @returns {Promise<Array>}
   */
  async getHistorialAsistencia(params) {
    throw new Error('Método getHistorialAsistencia no implementado');
  }
}
