import { AppError } from '../../../../core/errors/AppError';

/**
 * Caso de Uso: el empleado solicita pensión (para sí o para un familiar).
 * Queda 'Pendiente' hasta que el administrador la confirme.
 */
export class SolicitarPensionUseCase {
    constructor({ pensionRepository, policy }) {
        if (!pensionRepository || !policy) {
            throw new Error('SolicitarPensionUseCase requiere pensionRepository y policy');
        }
        this.pensionRepository = pensionRepository;
        this.policy = policy;
    }

    async execute({ idUsuario, idFamiliar = null, esFamiliar = false, year, mes, ahora = new Date() }) {
        if (!idUsuario) throw new AppError('Usuario no identificado.', 'VALIDATION_ERROR');
        if (esFamiliar && !idFamiliar) throw new AppError('Debe seleccionar un familiar.', 'VALIDATION_ERROR');

        const comensalFamiliar = esFamiliar ? idFamiliar : null;
        const existente = await this.pensionRepository.getPension({
            idUsuario, idFamiliar: comensalFamiliar, year, mes,
        });

        const chequeo = this.policy.puedeSolicitar({ year, mes }, ahora, existente);
        if (!chequeo.permitido) throw new AppError(chequeo.mensaje, 'VALIDATION_ERROR');

        return this.pensionRepository.solicitarPension({
            idUsuario, idFamiliar: comensalFamiliar, year, mes,
        });
    }
}