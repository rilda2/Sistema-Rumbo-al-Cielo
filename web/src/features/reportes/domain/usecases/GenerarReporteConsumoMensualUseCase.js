/**
 * Caso de Uso: GenerarReporteConsumoMensualUseCase (HU15)
 * 
 * Criterios de Aceptación:
 * 1. Dado que no selecciona mes, Entonces muestra "Debe seleccionar un mes".
 * 2. Genera consumos de empleados y familiares.
 * 3. Si se solicita desglose por área, agrupa consumos por área institucional.
 */
export class GenerarReporteConsumoMensualUseCase {
  constructor(reportesRepository) {
    this.reportesRepository = reportesRepository;
  }

  async execute({ mes, year, agrupadoPorArea = false }) {
    if (!mes) {
      throw new Error('Debe seleccionar un mes');
    }

    if (!year) {
      throw new Error('Debe seleccionar un año');
    }

    const reportes = await this.reportesRepository.getReporteMensualConsumo({
      mes: Number(mes),
      year: Number(year),
      agrupadoPorArea,
    });

    return reportes;
  }
}
