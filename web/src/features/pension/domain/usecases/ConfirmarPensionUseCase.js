import { AppError } from '../../../../core/errors/AppError';

/** Caso de Uso (admin): confirma la solicitud y genera las reservas del mes. */
export class ConfirmarPensionUseCase {
    constructor({ pensionRepository }) {
        if (!pensionRepository) throw new Error('ConfirmarPensionUseCase requiere pensionRepository');
        this.pensionRepository = pensionRepository;
    }

    async execute({ idPension }) {
        const pension = await this.pensionRepository.getPensionPorId(idPension);
        if (!pension) throw new AppError('Pensión no encontrada.', 'NOT_FOUND');
        if (!pension.esPendiente) throw new AppError('La solicitud ya fue procesada.', 'VALIDATION_ERROR');

        return this.pensionRepository.confirmarPension(idPension); // { reservasCreadas }
    }
}