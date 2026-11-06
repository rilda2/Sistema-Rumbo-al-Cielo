/**
 * Contrato de Repositorio: IUsuarioRepository
 * 
 * Principio SOLID - DIP (Inversión de Dependencias):
 * Define el contrato de operaciones con usuarios que requiere el Dominio.
 */
export class IUsuarioRepository {
  /**
   * Obtiene la lista completa de usuarios
   * @returns {Promise<import('../entities/UsuarioEntity').UsuarioEntity[]>}
   */
  async getUsuarios() {
    throw new Error('Método getUsuarios() no implementado en IUsuarioRepository');
  }

  /**
   * Registra un nuevo usuario/integrante en el sistema
   * @param {object} userData
   * @returns {Promise<import('../entities/UsuarioEntity').UsuarioEntity>}
   */
  async registerUsuario(userData) {
    throw new Error('Método registerUsuario() no implementado en IUsuarioRepository');
  }

  /**
   * Modifica el estado activo/inactivo de un usuario
   * @param {string} id_usuario
   * @param {boolean} nuevoEstado
   * @returns {Promise<void>}
   */
  async toggleEstado(id_usuario, nuevoEstado) {
    throw new Error('Método toggleEstado() no implementado en IUsuarioRepository');
  }

  /**
   * Actualiza los datos personales de un usuario (nombre, apellidos, telefono, ci_codigo, rol)
   * @param {string} id_usuario
   * @param {object} userData
   * @returns {Promise<import('../entities/UsuarioEntity').UsuarioEntity>}
   */
  async updateUsuario(id_usuario, userData) {
    throw new Error('Método updateUsuario() no implementado en IUsuarioRepository');
  }

  /**
   * Elimina un usuario permanentemente
   * @param {string} id_usuario
   * @returns {Promise<void>}
   */
  async deleteUsuario(id_usuario) {
    throw new Error('Método deleteUsuario() no implementado en IUsuarioRepository');
  }

  /**
   * Obtiene la lista de solicitudes de recuperación de contraseña
   * @returns {Promise<Array<object>>}
   */
  async getSolicitudesRecuperacion() {
    throw new Error('Método getSolicitudesRecuperacion() no implementado en IUsuarioRepository');
  }

  /**
   * Actualiza administrativamente la contraseña de un usuario
   * @param {string} id_usuario
   * @param {string} nuevo_password
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async cambiarPasswordUsuario(id_usuario, nuevo_password) {
    throw new Error('Método cambiarPasswordUsuario() no implementado en IUsuarioRepository');
  }
}

