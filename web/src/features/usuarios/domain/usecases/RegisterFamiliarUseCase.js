import { AppError } from '../../../../core/errors/AppError';
import { FamiliarEntity } from '../entities/FamiliarEntity';

/**
 * Caso de Uso: RegisterFamiliarUseCase
 * 
 * Regla de Clean Architecture:
 * - Valida las reglas de negocio para los dependientes de un empleado.
 */
export class RegisterFamiliarUseCase {
  /**
   * @param {import('../repositories/IFamiliarRepository').IFamiliarRepository} familiarRepository
   */
  constructor(familiarRepository) {
    if (!familiarRepository) {
      throw new Error('RegisterFamiliarUseCase requiere IFamiliarRepository');
    }
    this.familiarRepository = familiarRepository;
  }

  async execute({ id_usuario, parentesco, nombre, apellidos, telefono }) {
    if (!id_usuario) {
      throw new AppError('Debe asociarse a un empleado válido.', 'VALIDATION_ERROR');
    }

    const cleanNombre = (nombre || '').trim();
    const cleanApellidos = (apellidos || '').trim();
    const cleanTelefono = (telefono || '').trim();

    if (!cleanNombre) {
      throw new AppError('El nombre del familiar es obligatorio.', 'VALIDATION_ERROR');
    }
    if (!cleanApellidos) {
      throw new AppError('Los apellidos del familiar son obligatorios.', 'VALIDATION_ERROR');
    }
    if (!FamiliarEntity.isValidParentesco(parentesco)) {
      throw new AppError(`El parentesco "${parentesco}" no es válido. Debe ser Esposa, Esposo, Hijo o Hija.`, 'VALIDATION_ERROR');
    }

    return await this.familiarRepository.registerFamiliar({
      id_usuario,
      parentesco,
      nombre: cleanNombre,
      apellidos: cleanApellidos,
      telefono: cleanTelefono,
    });
  }
}
