import { AppError } from '../../../../core/errors/AppError';

export class GetReservasPorFechaUseCase {
    constructor(reservaRepository) {
        if (!reservaRepository) throw new Error('GetReservasPorFechaUseCase requiere IReservaRepository');
        this.reservaRepository = reservaRepository;
    }

    async execute(fecha) {
        const limpia = String(fecha || '').split('T')[0].trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(limpia)) {
            throw new AppError('La fecha debe tener el formato YYYY-MM-DD.', 'VALIDATION_ERROR');
        }
        return await this.reservaRepository.getReservasPorFecha(limpia);
    }
}