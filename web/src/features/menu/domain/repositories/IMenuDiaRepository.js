/**
 * Contrato de Repositorio: IMenuDiaRepository
 * 
 * Principio SOLID - DIP (Inversión de Dependencias):
 * Define el contrato de persistencia para los menús del día y la asignación semanal de platos.
 */
export class IMenuDiaRepository {
  /**
   * Obtiene todos los menú del día registrados
   * @returns {Promise<import('../entities/MenuDiaEntity').MenuDiaEntity[]>}
   */
  async getMenuDias() {
    throw new Error('Método getMenuDias() no implementado en IMenuDiaRepository');
  }

  /**
   * Obtiene todos los menús del día con sus platos vinculados
   * @returns {Promise<import('../entities/MenuDiaEntity').MenuDiaEntity[]>}
   */
  async getMenuDiasConPlatos() {
    throw new Error('Método getMenuDiasConPlatos() no implementado en IMenuDiaRepository');
  }

  /**
   * Guarda o actualiza un menú diario con sus platos asignados
   * @param {{ id_menu?: string|number, fecha: string, estado_publicacion: boolean, platosIds: number[] }} data
   * @returns {Promise<import('../entities/MenuDiaEntity').MenuDiaEntity>}
   */
  async guardarMenuCompleto(data) {
    throw new Error('Método guardarMenuCompleto() no implementado en IMenuDiaRepository');
  }

  /**
   * Guarda el menú de varios días de la semana de manera atómica
   * @param {Array<{ fecha: string, estado_publicacion: boolean, platos_ids: number[] }>} dias
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async guardarMenuSemanal(dias) {
    throw new Error('Método guardarMenuSemanal() no implementado en IMenuDiaRepository');
  }

  /**
   * Elimina un menú del día por su id
   * @param {string|number} id_menu
   * @returns {Promise<boolean>}
   */
  async deleteMenu(id_menu) {
    throw new Error('Método deleteMenu() no implementado en IMenuDiaRepository');
  }
}
