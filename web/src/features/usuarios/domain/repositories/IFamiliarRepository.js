/**
 * Contrato de Repositorio: IFamiliarRepository
 * 
 * Principio SOLID - DIP (Inversión de Dependencias):
 * Define el contrato de persistencia para familiares/dependientes de empleados.
 */
export class IFamiliarRepository {
  /**
   * Obtiene la lista de familiares de un empleado
   * @param {string} id_usuario
   * @returns {Promise<import('../entities/FamiliarEntity').FamiliarEntity[]>}
   */
  async getFamiliaresByUsuario(id_usuario) {
    throw new Error('Método getFamiliaresByUsuario() no implementado en IFamiliarRepository');
  }

  /**
   * Registra un nuevo familiar vinculado a un empleado
   * @param {{ id_usuario: string, parentesco: string, nombre: string, apellidos: string, telefono?: string }} familiarData
   * @returns {Promise<import('../entities/FamiliarEntity').FamiliarEntity>}
   */
  async registerFamiliar(familiarData) {
    throw new Error('Método registerFamiliar() no implementado en IFamiliarRepository');
  }

  /**
   * Elimina un familiar por su id_persona e id_usuario
   * @param {string} id_persona
   * @param {string} id_usuario
   * @returns {Promise<void>}
   */
  async deleteFamiliar(id_persona, id_usuario) {
    throw new Error('Método deleteFamiliar() no implementado en IFamiliarRepository');
  }
}
