/**
 * Contrato de Repositorio: ICalendarioRepository
 * 
 * Principio SOLID - DIP (Inversión de Dependencias):
 * Define el contrato de persistencia para el calendario y excepciones de atención.
 */
export class ICalendarioRepository {
  /**
   * Obtiene la lista completa de excepciones de calendario
   * @returns {Promise<import('../entities/ExcepcionCalendarioEntity').ExcepcionCalendarioEntity[]>}
   */
  async getExcepciones() {
    throw new Error('Método getExcepciones() no implementado en ICalendarioRepository');
  }

  /**
   * Verifica si existe una excepción para una fecha dada
   * @param {string} fecha - Formato 'YYYY-MM-DD'
   * @returns {Promise<boolean>}
   */
  async checkExcepcionExists(fecha) {
    throw new Error('Método checkExcepcionExists() no implementado en ICalendarioRepository');
  }

  /**
   * Registra una nueva excepción de atención en el calendario
   * @param {{ fecha: string, motivo: string, id_encargado: string }} data
   * @returns {Promise<import('../entities/ExcepcionCalendarioEntity').ExcepcionCalendarioEntity>}
   */
  async createExcepcion(data) {
    throw new Error('Método createExcepcion() no implementado en ICalendarioRepository');
  }

  /**
   * Elimina un día de excepción
   * @param {{ id_excepcion?: string, id?: string, fecha?: string }} excepcion
   * @returns {Promise<void>}
   */
  async deleteExcepcion(excepcion) {
    throw new Error('Método deleteExcepcion() no implementado en ICalendarioRepository');
  }
}
