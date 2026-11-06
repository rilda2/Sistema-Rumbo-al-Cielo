import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveMenuSemanalUseCase } from '../../src/features/menu/domain/usecases/SaveMenuSemanalUseCase';
import { AppError } from '../../src/core/errors/AppError';

describe('SaveMenuSemanalUseCase (Pruebas Unitarias)', () => {
  let mockMenuDiaRepository;
  let useCase;

  beforeEach(() => {
    // 1. Creamos un repositorio simulado (mock)
    mockMenuDiaRepository = {
      guardarMenuSemanal: vi.fn(),
    };

    // 2. Inyectamos el mock al caso de uso
    useCase = new SaveMenuSemanalUseCase(mockMenuDiaRepository);
  });

  it('debe lanzar error si no se pasa ningún día o el arreglo está vacío', async () => {
    await expect(useCase.execute([])).rejects.toThrow(
      'Debe proporcionar al menos un día para guardar en el menú semanal.'
    );
  });

  it('debe lanzar error si algún día no tiene fecha asignada', async () => {
    const diasInvalidos = [
      { fecha: null, platos_ids: [1, 2] }
    ];

    await expect(useCase.execute(diasInvalidos)).rejects.toThrow(
      'Cada día del menú debe tener una fecha válida.'
    );
  });

  it('debe rechazar la publicación de un día si no tiene platos asignados', async () => {
    const diasSinPlatos = [
      {
        fecha: '2026-10-30',
        estado_publicacion: true, // Se quiere publicar...
        platos_ids: [],           // ...pero no tiene platos
      },
    ];

    await expect(useCase.execute(diasSinPlatos)).rejects.toThrow(
      'El día 2026-10-30 no puede publicarse sin tener platos asignados.'
    );

    // Aseguramos que nunca se intentó guardar en el repositorio
    expect(mockMenuDiaRepository.guardarMenuSemanal).not.toHaveBeenCalled();
  });

  it('debe guardar el menú semanal exitosamente cuando los datos son válidos', async () => {
    const diasValidos = [
      {
        fecha: '2026-10-30',
        estado_publicacion: true,
        platos_ids: ['plato-uuid-1', 'plato-uuid-2'],
      },
    ];

    const respuestaEsperada = { success: true, count: 1 };
    mockMenuDiaRepository.guardarMenuSemanal.mockResolvedValue(respuestaEsperada);

    const resultado = await useCase.execute(diasValidos);

    // Verificamos que se llamó al repositorio con los parámetros exactos
    expect(mockMenuDiaRepository.guardarMenuSemanal).toHaveBeenCalledTimes(1);
    expect(mockMenuDiaRepository.guardarMenuSemanal).toHaveBeenCalledWith(diasValidos);
    expect(resultado).toEqual(respuestaEsperada);
  });
});