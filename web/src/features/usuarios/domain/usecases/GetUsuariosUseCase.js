/**
 * Caso de Uso: GetUsuariosUseCase
 */
export class GetUsuariosUseCase {
  /**
   * @param {import('../repositories/IUsuarioRepository').IUsuarioRepository} usuarioRepository
   */
  constructor(usuarioRepository) {
    if (!usuarioRepository) {
      throw new Error('GetUsuariosUseCase requiere IUsuarioRepository');
    }
    this.usuarioRepository = usuarioRepository;
  }

  async execute() {
    return await this.usuarioRepository.getUsuarios();
  }
}
