import { AppError } from '../../../../core/errors/AppError';

export class CancelarReservaUseCase {
    constructor({ reservaRepository, policy }) {
        if (!reservaRepository || !policy) {
            throw new Error('CancelarReservaUseCase requiere reservaRepository y policy');
        }
        this.reservaRepository = reservaRepository;
        this.policy = policy;
    }

    async execute(idReserva, ahora = new Date()) {
        if (!idReserva) throw new AppError('Falta el identificador de la reserva.', 'VALIDATION_ERROR');

        const reserva = await this.reservaRepository.getReservaById(idReserva);
        if (!reserva) throw new AppError('No se encontró la reserva.', 'NOT_FOUND');

        if (!reserva.estaActiva) {
            throw new AppError('Solo se pueden cancelar reservas activas.', 'INVALID_STATE');
        }

        const chequeo = this.policy.puedeCancelar(reserva.fecha, ahora);
        if (!chequeo.permitido) throw new AppError(chequeo.mensaje, 'POLICY_ERROR');

        return await this.reservaRepository.cancelarReserva(idReserva);
    }
}
