import { AppError } from '../../../../core/errors/AppError';

export class GetMisReservasUseCase {
    constructor(reservaRepository) {
        if (!reservaRepository) throw new Error('GetMisReservasUseCase requiere IReservaRepository');
        this.reservaRepository = reservaRepository;
    }

    async execute(idUsuario) {
        if (!idUsuario) {
            throw new AppError('No se pudo identificar al usuario.', 'VALIDATION_ERROR');
        }
        return await this.reservaRepository.getReservasDeUsuario(idUsuario);
    }
}