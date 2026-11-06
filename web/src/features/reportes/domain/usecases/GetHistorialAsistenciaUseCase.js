/**
 * Caso de Uso: GetHistorialAsistenciaUseCase
 * Consulta la tabla asistencia de los usuarios ordenada por fecha.
 */
export class GetHistorialAsistenciaUseCase {
  constructor(reportesRepository) {
    this.reportesRepository = reportesRepository;
  }

  async execute(params = {}) {
    return await this.reportesRepository.getHistorialAsistencia(params);
  }
}
