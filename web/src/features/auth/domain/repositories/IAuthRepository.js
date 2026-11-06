/**
 * Contrato de Repositorio: IAuthRepository
 * 
 * Principio SOLID - DIP (Inversión de Dependencias):
 * La capa de Dominio define QUÉ necesita del almacenamiento o proveedor de autenticación,
 * pero no le importa CÓMO se realiza (si es Supabase, Firebase, mock de pruebas, etc.).
 * 
 * Cualquier implementación concreta en la capa DATA debe respetar este contrato.
 */
export class IAuthRepository {
  /**
   * Inicia sesión con correo y contraseña
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: import('../entities/User').User, session: object }>}
   */
  async login(email, password) {
    throw new Error('Método login() no implementado en IAuthRepository');
  }

  /**
   * Cierra la sesión activa
   * @returns {Promise<void>}
   */
  async logout() {
    throw new Error('Método logout() no implementado en IAuthRepository');
  }

  /**
   * Obtiene la sesión y usuario actual
   * @returns {Promise<{ user: import('../entities/User').User | null, session: object | null }>}
   */
  async getCurrentSession() {
    throw new Error('Método getCurrentSession() no implementado en IAuthRepository');
  }

  /**
   * Obtiene el perfil del usuario por su ID
   * @param {string} userId
   * @returns {Promise<import('../entities/User').User | null>}
   */
  async getProfile(userId) {
    throw new Error('Método getProfile() no implementado en IAuthRepository');
  }

  /**
   * Suscribe a cambios en el estado de autenticación
   * @param {function({ user: import('../entities/User').User | null, session: object | null }): void} callback
   * @returns {{ unsubscribe: function(): void }}
   */
  onAuthStateChange(callback) {
    throw new Error('Método onAuthStateChange() no implementado en IAuthRepository');
  }
}
