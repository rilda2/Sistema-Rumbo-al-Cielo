/**
 * Contrato de Repositorio: ICuentaRepository
 * 
 * Principio SOLID - DIP:
 * Define las operaciones que la cuenta del usuario requiere para actualizar sus credenciales y perfil.
 */
export class ICuentaRepository {
  /**
   * Actualiza los datos personales del usuario logueado
   * @param {string} id_usuario
   * @param {{ nombres: string, apellidos: string, telefono: string }} data
   * @returns {Promise<void>}
   */
  async updatePerfil(id_usuario, data) {
    throw new Error('Método updatePerfil() no implementado en ICuentaRepository');
  }

  /**
   * Actualiza la contraseña del usuario en auth
   * @param {string} newPassword
   * @returns {Promise<void>}
   */
  async updatePassword(newPassword) {
    throw new Error('Método updatePassword() no implementado en ICuentaRepository');
  }
}
