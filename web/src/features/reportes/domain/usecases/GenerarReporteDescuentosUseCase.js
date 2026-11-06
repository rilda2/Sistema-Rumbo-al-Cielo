/**
 * Caso de Uso: GenerarReporteDescuentosUseCase (HU14)
 * 
 * Criterios de Aceptación:
 * 1. Dado que no se selecciona período, Entonces muestra "Debe seleccionar un período válido".
 * 2. Valida antigüedad del pensionado para aplicar tarifa con descuento o tarifa normal.
 */
export class GenerarReporteDescuentosUseCase {
  constructor(reportesRepository) {
    this.reportesRepository = reportesRepository;
  }

  async execute({ mes, year }) {
    if (!mes || !year || Number(mes) < 1 || Number(mes) > 12) {
      throw new Error('Debe seleccionar un período válido');
    }

    const resultado = await this.reportesRepository.calcularCierreMensual({
      mes: Number(mes),
      year: Number(year),
    });

    return resultado;
  }
}
