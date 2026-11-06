import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePlatoUseCase } from '../../src/features/menu/domain/usecases/CreatePlatoUseCase';

describe('CreatePlatoUseCase (Pruebas Unitarias)', () => {
  let mockPlatoRepository;
  let useCase;

  beforeEach(() => {
    mockPlatoRepository = {
      createPlato: vi.fn(),
    };
    useCase = new CreatePlatoUseCase(mockPlatoRepository);
  });

  it('debe fallar si el nombre del plato está vacío o contiene solo espacios', async () => {
    await expect(useCase.execute({ nombre: '   ' })).rejects.toThrow(
      'El nombre del plato es obligatorio.'
    );
  });

  it('debe fallar si el nombre del plato tiene menos de 3 caracteres', async () => {
    await expect(useCase.execute({ nombre: 'Ar' })).rejects.toThrow(
      'El nombre del plato debe tener al menos 3 caracteres.'
    );
  });

  it('debe recortar espacios en blanco y guardar el plato correctamente', async () => {
    const platoInput = {
      nombre: '  Lomo Saltado  ',
      descripcion: ' Plato tradicional con carne y papas fritas ',
    };

    mockPlatoRepository.createPlato.mockResolvedValue({ id: '1', nombre: 'Lomo Saltado' });

    await useCase.execute(platoInput);

    expect(mockPlatoRepository.createPlato).toHaveBeenCalledWith(
      {
        nombre: 'Lomo Saltado',
        descripcion: 'Plato tradicional con carne y papas fritas',
      },
      null
    );
  });
});