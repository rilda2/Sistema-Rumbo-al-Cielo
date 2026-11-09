import { AppError } from '../../../../core/errors/AppError';

/** Caso de Uso: cancelar una pensión (solo antes de que inicie el mes). */
export class CancelarPensionUseCase {
    constructor({ pensionRepository, policy }) {
        if (!pensionRepository || !policy) {
            throw new Error('CancelarPensionUseCase requiere pensionRepository y policy');
        }
        this.pensionRepository = pensionRepository;
        this.policy = policy;
    }

    async execute({ idPension, ahora = new Date() }) {
        const pension = await this.pensionRepository.getPensionPorId(idPension);
        const chequeo = this.policy.puedeCancelar(pension, ahora);
        if (!chequeo.permitido) throw new AppError(chequeo.mensaje, 'VALIDATION_ERROR');

        await this.pensionRepository.cancelarPension(idPension);
    }
}