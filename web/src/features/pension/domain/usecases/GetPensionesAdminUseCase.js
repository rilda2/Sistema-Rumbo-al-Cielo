/** Caso de Uso (admin): pensiones de un mes, con contador de almuerzos de las confirmadas. */
export class GetPensionesAdminUseCase {
    constructor({ pensionRepository, policy }) {
        if (!pensionRepository || !policy) {
            throw new Error('GetPensionesAdminUseCase requiere pensionRepository y policy');
        }
        this.pensionRepository = pensionRepository;
        this.policy = policy;
    }

    async execute({ year, mes, estado = null }) {
        const pensiones = await this.pensionRepository.getPensionesAdmin({ year, mes, estado });

        return Promise.all(
            pensiones.map(async (pension) => {
                if (!pension.esConfirmada) return { pension, almuerzosVigentes: null };
                const almuerzosVigentes = await this.pensionRepository.contarAlmuerzosVigentes({
                    idUsuario: pension.idUsuario, idFamiliar: pension.idFamiliar, year, mes,
                });
                return { pension, almuerzosVigentes };
            })
        );
    }
}