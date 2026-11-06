/**
 * Caso de Uso: GuardarCierreMensualUseCase (HU14)
 * Persiste los datos calculados en cierre_mensual, detalle_cierre y liquidacion_mes.
 */
export class GuardarCierreMensualUseCase {
  constructor(reportesRepository) {
    this.reportesRepository = reportesRepository;
  }

  async execute({ cierre, detalles }) {
    if (!cierre || !detalles) {
      throw new Error('Datos de cierre incompletos.');
    }

    return await this.reportesRepository.guardarCierreMensual({ cierre, detalles });
  }
}
