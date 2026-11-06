/**
 * Contrato de Repositorio: IPlatoRepository
 * 
 * Principio SOLID - DIP (Inversión de Dependencias):
 * Define el contrato de persistencia para el catálogo de platos.
 */
export class IPlatoRepository {
  /**
   * Obtiene la lista completa de platos
   * @returns {Promise<import('../entities/PlatoEntity').PlatoEntity[]>}
   */
  async getPlatos() {
    throw new Error('Método getPlatos() no implementado en IPlatoRepository');
  }

  /**
   * Obtiene un plato por su identificador
   * @param {string|number} id_plato
   * @returns {Promise<import('../entities/PlatoEntity').PlatoEntity>}
   */
  async getPlatoById(id_plato) {
    throw new Error('Método getPlatoById() no implementado en IPlatoRepository');
  }

  /**
   * Crea un nuevo plato con soporte opcional de subida de imagen
   * @param {object} platoData { nombre, descripcion }
   * @param {File|Blob|null} imageFile
   * @returns {Promise<import('../entities/PlatoEntity').PlatoEntity>}
   */
  async createPlato(platoData, imageFile = null) {
    throw new Error('Método createPlato() no implementado en IPlatoRepository');
  }

  /**
   * Actualiza un plato existente
   * @param {string|number} id_plato
   * @param {object} updateData
   * @param {File|Blob|null} newImageFile
   * @param {boolean} removeCurrentImage
   * @param {string|null} currentImageUrl
   * @returns {Promise<import('../entities/PlatoEntity').PlatoEntity>}
   */
  async updatePlato(id_plato, updateData, newImageFile = null, removeCurrentImage = false, currentImageUrl = null) {
    throw new Error('Método updatePlato() no implementado en IPlatoRepository');
  }

  /**
   * Elimina un plato y su imagen
   * @param {string|number} id_plato
   * @param {string|null} currentImageUrl
   * @returns {Promise<boolean>}
   */
  async deletePlato(id_plato, currentImageUrl = null) {
    throw new Error('Método deletePlato() no implementado en IPlatoRepository');
  }
}
