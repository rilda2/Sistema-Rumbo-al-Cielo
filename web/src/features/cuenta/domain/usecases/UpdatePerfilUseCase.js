import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: UpdatePerfilUseCase
 * 
 * Regla de Clean Architecture:
 * - Valida completitud de datos personales antes de persistir.
 */
export class UpdatePerfilUseCase {
  /**
   * @param {import('../repositories/ICuentaRepository').ICuentaRepository} cuentaRepository
   */
  constructor(cuentaRepository) {
    if (!cuentaRepository) {
      throw new Error('UpdatePerfilUseCase requiere ICuentaRepository');
    }
    this.cuentaRepository = cuentaRepository;
  }

  async execute(id_usuario, { nombres, apellidos, telefono }) {
    if (!id_usuario) {
      throw new AppError('Se requiere el identificador de usuario.', 'VALIDATION_ERROR');
    }

    const cleanNombres = (nombres || '').trim();
    const cleanApellidos = (apellidos || '').trim();
    const cleanTelefono = (telefono || '').trim();

    if (!cleanNombres) {
      throw new AppError('El nombre no puede estar vacío.', 'VALIDATION_ERROR');
    }

    return await this.cuentaRepository.updatePerfil(id_usuario, {
      nombres: cleanNombres,
      apellidos: cleanApellidos,
      telefono: cleanTelefono,
    });
  }
}
