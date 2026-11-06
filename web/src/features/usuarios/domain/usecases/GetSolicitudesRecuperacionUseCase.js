/**
 * Caso de Uso: GetSolicitudesRecuperacionUseCase
 * 
 * Regla de Clean Architecture:
 * - Consulta las solicitudes de recuperación de contraseña de forma desacoplada.
 */
export class GetSolicitudesRecuperacionUseCase {
  /**
   * @param {import('../repositories/IUsuarioRepository').IUsuarioRepository} usuarioRepository
   */
  constructor(usuarioRepository) {
    if (!usuarioRepository) {
      throw new Error('GetSolicitudesRecuperacionUseCase requiere una instancia de IUsuarioRepository');
    }
    this.usuarioRepository = usuarioRepository;
  }

  async execute() {
    return await this.usuarioRepository.getSolicitudesRecuperacion();
  }
}
