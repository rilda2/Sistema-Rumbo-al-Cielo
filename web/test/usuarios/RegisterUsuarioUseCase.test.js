import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUsuarioUseCase } from '../../src/features/usuarios/domain/usecases/RegisterUsuarioUseCase';

describe('RegisterUsuarioUseCase (Pruebas Unitarias)', () => {
  let mockUsuarioRepository;
  let useCase;

  beforeEach(() => {
    mockUsuarioRepository = {
      checkUniqueness: vi.fn(),
      registerUsuario: vi.fn(),
    };
    useCase = new RegisterUsuarioUseCase(mockUsuarioRepository);
  });

  it('debe fallar si el nombre está vacío', async () => {
    await expect(
      useCase.execute({
        nombre: '   ',
        apellidos: 'Pérez',
        ci_codigo: '1234567',
        telefono: '70012345',
        email: 'juan@example.com',
        password: 'password123',
        rol: 'Empleado',
      })
    ).rejects.toThrow('El nombre del usuario es obligatorio.');
  });

  it('debe fallar si los apellidos están vacíos', async () => {
    await expect(
      useCase.execute({
        nombre: 'Juan',
        apellidos: '   ',
        ci_codigo: '1234567',
        telefono: '70012345',
        email: 'juan@example.com',
        password: 'password123',
        rol: 'Empleado',
      })
    ).rejects.toThrow('Los apellidos del usuario son obligatorios.');
  });

  it('debe fallar si el CI está vacío', async () => {
    await expect(
      useCase.execute({
        nombre: 'Juan',
        apellidos: 'Pérez',
        ci_codigo: '   ',
        telefono: '70012345',
        email: 'juan@example.com',
        password: 'password123',
        rol: 'Empleado',
      })
    ).rejects.toThrow('El número de C.I. es obligatorio.');
  });

  it('debe fallar si el email es inválido', async () => {
    await expect(
      useCase.execute({
        nombre: 'Juan',
        apellidos: 'Pérez',
        ci_codigo: '1234567',
        telefono: '70012345',
        email: 'correo-invalido',
        password: 'password123',
        rol: 'Empleado',
      })
    ).rejects.toThrow('El correo electrónico ingresado no tiene un formato válido.');
  });

  it('debe fallar si la contraseña tiene menos de 6 caracteres', async () => {
    await expect(
      useCase.execute({
        nombre: 'Juan',
        apellidos: 'Pérez',
        ci_codigo: '1234567',
        telefono: '70012345',
        email: 'juan@example.com',
        password: '123',
        rol: 'Empleado',
      })
    ).rejects.toThrow('La contraseña debe tener un mínimo de 6 caracteres.');
  });

  it('debe fallar si el rol es inválido', async () => {
    await expect(
      useCase.execute({
        nombre: 'Juan',
        apellidos: 'Pérez',
        ci_codigo: '1234567',
        telefono: '70012345',
        email: 'juan@example.com',
        password: 'password123',
        rol: 'SuperAdmin',
      })
    ).rejects.toThrow('El rol debe ser uno de los siguientes: Administrador, Empleado, Institucion');
  });

  it('debe fallar si el CI ya se encuentra registrado (duplicado)', async () => {
    mockUsuarioRepository.checkUniqueness.mockResolvedValue({
      isCiAvailable: false,
      isEmailAvailable: true,
      isPhoneAvailable: true,
    });

    await expect(
      useCase.execute({
        nombre: 'Juan',
        apellidos: 'Pérez',
        ci_codigo: '1234567',
        telefono: '70012345',
        email: 'juan@example.com',
        password: 'password123',
        rol: 'Empleado',
      })
    ).rejects.toThrow('El número de C.I. "1234567" ya se encuentra registrado.');
  });

  it('debe fallar si el correo electrónico ya está en uso (duplicado)', async () => {
    mockUsuarioRepository.checkUniqueness.mockResolvedValue({
      isCiAvailable: true,
      isEmailAvailable: false,
      isPhoneAvailable: true,
    });

    await expect(
      useCase.execute({
        nombre: 'Juan',
        apellidos: 'Pérez',
        ci_codigo: '1234567',
        telefono: '70012345',
        email: 'juan@example.com',
        password: 'password123',
        rol: 'Empleado',
      })
    ).rejects.toThrow('El correo electrónico "juan@example.com" ya está en uso.');
  });

  it('debe registrar el usuario exitosamente cuando todos los datos son válidos', async () => {
    mockUsuarioRepository.checkUniqueness.mockResolvedValue({
      isCiAvailable: true,
      isEmailAvailable: true,
      isPhoneAvailable: true,
    });

    const expectedUser = {
      id_usuario: 'user-123',
      nombre: 'Juan Carlos',
      apellidos: 'Pérez Gómez',
      ci_codigo: '1234567',
      telefono: '70012345',
      email: 'juan@example.com',
      rol: 'Empleado',
    };

    mockUsuarioRepository.registerUsuario.mockResolvedValue(expectedUser);

    const result = await useCase.execute({
      nombre: '  Juan Carlos  ',
      apellidos: '  Pérez Gómez  ',
      ci_codigo: ' 1234567 ',
      telefono: ' 70012345 ',
      email: '  Juan@Example.COM  ',
      password: ' password123 ',
      rol: 'Empleado',
    });

    expect(mockUsuarioRepository.checkUniqueness).toHaveBeenCalledWith({
      ci_codigo: '1234567',
      email: 'juan@example.com',
      telefono: '70012345',
    });

    expect(mockUsuarioRepository.registerUsuario).toHaveBeenCalledWith({
      nombre: 'Juan Carlos',
      apellidos: 'Pérez Gómez',
      ci_codigo: '1234567',
      telefono: '70012345',
      email: 'juan@example.com',
      password: 'password123',
      rol: 'Empleado',
    });

    expect(result).toEqual(expectedUser);
  });
});

