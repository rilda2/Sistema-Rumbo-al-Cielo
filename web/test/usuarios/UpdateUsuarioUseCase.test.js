import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateUsuarioUseCase } from '../../src/features/usuarios/domain/usecases/UpdateUsuarioUseCase';

describe('UpdateUsuarioUseCase (Pruebas Unitarias)', () => {
  let mockUsuarioRepository;
  let useCase;

  beforeEach(() => {
    mockUsuarioRepository = {
      checkUniqueness: vi.fn(),
      updateUsuario: vi.fn(),
    };
    useCase = new UpdateUsuarioUseCase(mockUsuarioRepository);
  });

  it('debe fallar si no se proporciona id_usuario', async () => {
    await expect(
      useCase.execute('', {
        nombre: 'Carlos',
        apellidos: 'Mamani',
        ci_codigo: '8765432',
      })
    ).rejects.toThrow('Se requiere el identificador de usuario.');
  });

  it('debe fallar si el nombre está vacío', async () => {
    await expect(
      useCase.execute('user-1', {
        nombre: '   ',
        apellidos: 'Mamani',
        ci_codigo: '8765432',
      })
    ).rejects.toThrow('El nombre del usuario es obligatorio.');
  });

  it('debe fallar si los apellidos están vacíos', async () => {
    await expect(
      useCase.execute('user-1', {
        nombre: 'Carlos',
        apellidos: '   ',
        ci_codigo: '8765432',
      })
    ).rejects.toThrow('Los apellidos del usuario son obligatorios.');
  });

  it('debe fallar si el CI está vacío', async () => {
    await expect(
      useCase.execute('user-1', {
        nombre: 'Carlos',
        apellidos: 'Mamani',
        ci_codigo: '   ',
      })
    ).rejects.toThrow('El número de C.I. es obligatorio.');
  });

  it('debe fallar si el rol es inválido', async () => {
    await expect(
      useCase.execute('user-1', {
        nombre: 'Carlos',
        apellidos: 'Mamani',
        ci_codigo: '8765432',
        rol: 'SuperAdminInvalido',
      })
    ).rejects.toThrow('El rol debe ser uno de los siguientes: Administrador, Empleado, Institucion');
  });

  it('debe fallar si el C.I. ya pertenece a otro usuario diferente', async () => {
    mockUsuarioRepository.checkUniqueness.mockResolvedValue({
      isCiAvailable: false,
      isPhoneAvailable: true,
    });

    await expect(
      useCase.execute('user-1', {
        nombre: 'Carlos',
        apellidos: 'Mamani',
        ci_codigo: '8765432',
        telefono: '76543210',
        rol: 'Empleado',
      })
    ).rejects.toThrow('El número de C.I. "8765432" ya se encuentra registrado por otro usuario.');

    expect(mockUsuarioRepository.checkUniqueness).toHaveBeenCalledWith({
      ci_codigo: '8765432',
      telefono: '76543210',
      excludeUserId: 'user-1',
    });
  });

  it('debe fallar si el teléfono ya pertenece a otro usuario diferente', async () => {
    mockUsuarioRepository.checkUniqueness.mockResolvedValue({
      isCiAvailable: true,
      isPhoneAvailable: false,
    });

    await expect(
      useCase.execute('user-1', {
        nombre: 'Carlos',
        apellidos: 'Mamani',
        ci_codigo: '8765432',
        telefono: '76543210',
        rol: 'Empleado',
      })
    ).rejects.toThrow('El teléfono "76543210" ya se encuentra registrado por otro usuario.');
  });

  it('debe actualizar los datos correctamente recortando espacios en blanco', async () => {
    mockUsuarioRepository.checkUniqueness.mockResolvedValue({
      isCiAvailable: true,
      isPhoneAvailable: true,
    });

    const expectedUser = {
      id_usuario: 'user-1',
      nombre: 'Carlos Eduardo',
      apellidos: 'Mamani Flores',
      ci_codigo: '8765432',
      telefono: '76543210',
      rol: 'Institucion',
    };

    mockUsuarioRepository.updateUsuario.mockResolvedValue(expectedUser);

    const result = await useCase.execute('user-1', {
      nombre: '  Carlos Eduardo  ',
      apellidos: '  Mamani Flores  ',
      ci_codigo: ' 8765432 ',
      telefono: ' 76543210 ',
      rol: 'Institucion',
    });

    expect(mockUsuarioRepository.updateUsuario).toHaveBeenCalledWith('user-1', {
      nombre: 'Carlos Eduardo',
      nombres: 'Carlos Eduardo',
      apellidos: 'Mamani Flores',
      ci_codigo: '8765432',
      telefono: '76543210',
      rol: 'Institucion',
    });

    expect(result).toEqual(expectedUser);
  });
});

