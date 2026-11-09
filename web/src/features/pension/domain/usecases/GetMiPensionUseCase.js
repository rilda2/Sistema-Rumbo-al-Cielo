/**
 * Caso de Uso: pensiones del titular y sus familiares en un mes,
 * con el contador de almuerzos para las pensiones confirmadas.
 * @returns {Promise<Array<{pension, almuerzosVigentes:number|null, cancelables:number|null}>>}
 */
export class GetMiPensionUseCase {
    constructor({ pensionRepository, policy }) {
        if (!pensionRepository || !policy) {
            throw new Error('GetMiPensionUseCase requiere pensionRepository y policy');
        }
        this.pensionRepository = pensionRepository;
        this.policy = policy;
    }

    async execute({ idUsuario, year, mes }) {
        const pensiones = await this.pensionRepository.getPensionesDeUsuario({ idUsuario, year, mes });

        return Promise.all(
            pensiones.map(async (pension) => {
                if (!pension.esConfirmada) {
                    return { pension, almuerzosVigentes: null, cancelables: null };
                }
                const almuerzosVigentes = await this.pensionRepository.contarAlmuerzosVigentes({
                    idUsuario: pension.idUsuario, idFamiliar: pension.idFamiliar, year, mes,
                });
                return {
                    pension,
                    almuerzosVigentes,
                    cancelables: this.policy.almuerzosCancelables(almuerzosVigentes),
                };
            })
        );
    }
}