import { AppError } from '../../../../core/errors/AppError';

/** Caso de Uso (admin): rechaza una solicitud pendiente. */
export class RechazarPensionUseCase {
    constructor({ pensionRepository }) {
        if (!pensionRepository) throw new Error('RechazarPensionUseCase requiere pensionRepository');
        this.pensionRepository = pensionRepository;
    }

    async execute({ idPension }) {
        const pension = await this.pensionRepository.getPensionPorId(idPension);
        if (!pension) throw new AppError('Pensión no encontrada.', 'NOT_FOUND');
        if (!pension.esPendiente) throw new AppError('La solicitud ya fue procesada.', 'VALIDATION_ERROR');

        await this.pensionRepository.rechazarPension(idPension);
    }
}