import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: RegisterUsuarioUseCase
 * 
 * Regla de Clean Architecture:
 * - Contiene las reglas de negocio para el alta de usuarios en el restaurante.
 * - Verifica completitud de datos, formato de email, y restricciones de dominio.
 */
export class RegisterUsuarioUseCase {
  /**
   * @param {import('../repositories/IUsuarioRepository').IUsuarioRepository} usuarioRepository
   */
  constructor(usuarioRepository) {
    if (!usuarioRepository) {
      throw new Error('RegisterUsuarioUseCase requiere IUsuarioRepository');
    }
    this.usuarioRepository = usuarioRepository;
  }

  async execute(userData) {
    const { nombre, nombres, apellidos, ci_codigo, telefono, email, password, rol } = userData;
    const cleanNombre = (nombre || nombres || '').trim();
    const cleanApellidos = (apellidos || '').trim();
    const cleanCi = (ci_codigo || '').trim();
    const cleanTelefono = (telefono || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const validRoles = ['Administrador', 'Empleado', 'Institucion'];

    if (!cleanNombre) {
      throw new AppError('El nombre del usuario es obligatorio.', 'VALIDATION_ERROR');
    }
    if (!cleanApellidos) {
      throw new AppError('Los apellidos del usuario son obligatorios.', 'VALIDATION_ERROR');
    }
    if (!cleanCi) {
      throw new AppError('El número de C.I. es obligatorio.', 'VALIDATION_ERROR');
    }
    if (!cleanEmail) {
      throw new AppError('El correo electrónico es obligatorio.', 'VALIDATION_ERROR');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new AppError('El correo electrónico ingresado no tiene un formato válido.', 'VALIDATION_ERROR');
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      throw new AppError('La contraseña debe tener un mínimo de 6 caracteres.', 'VALIDATION_ERROR');
    }
    if (!validRoles.includes(rol)) {
      throw new AppError(`El rol debe ser uno de los siguientes: ${validRoles.join(', ')}`, 'VALIDATION_ERROR');
    }

    // 1. Validar unicidad previa con el repositorio
    const uniqueness = await this.usuarioRepository.checkUniqueness({
      ci_codigo: cleanCi,
      email: cleanEmail,
      telefono: cleanTelefono,
    });

    if (!uniqueness.isCiAvailable) {
      throw new AppError(`El número de C.I. "${cleanCi}" ya se encuentra registrado.`, 'DUPLICATE_CI');
    }
    if (!uniqueness.isEmailAvailable) {
      throw new AppError(`El correo electrónico "${cleanEmail}" ya está en uso.`, 'DUPLICATE_EMAIL');
    }
    if (cleanTelefono && !uniqueness.isPhoneAvailable) {
      throw new AppError(`El teléfono "${cleanTelefono}" ya se encuentra registrado.`, 'DUPLICATE_PHONE');
    }

    // 2. Ejecutar registro
    return await this.usuarioRepository.registerUsuario({
      nombre: cleanNombre,
      apellidos: cleanApellidos,
      ci_codigo: cleanCi,
      telefono: cleanTelefono,
      email: cleanEmail,
      password: cleanPassword,
      rol,
    });
  }
}
