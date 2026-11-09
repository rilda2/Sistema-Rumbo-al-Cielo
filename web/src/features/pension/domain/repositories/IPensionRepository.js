/**
 * Contrato del repositorio de Pensiones (Clean Architecture).
 * Implementación concreta: SupabasePensionRepository (capa data).
 */
export class IPensionRepository {
    /** @returns {Promise<import('../entities/PensionEntity').PensionEntity|null>} */
    async getPension({ idUsuario, idFamiliar, year, mes }) { throw new Error('No implementado'); }

    /** @returns {Promise<import('../entities/PensionEntity').PensionEntity|null>} */
    async getPensionPorId(idPension) { throw new Error('No implementado'); }

    /** Pensiones del titular y sus familiares en un mes. @returns {Promise<PensionEntity[]>} */
    async getPensionesDeUsuario({ idUsuario, year, mes }) { throw new Error('No implementado'); }

    /** Listado para el administrador. estado opcional. @returns {Promise<PensionEntity[]>} */
    async getPensionesAdmin({ year, mes, estado = null }) { throw new Error('No implementado'); }

    /**
     * Crea la solicitud en estado 'Pendiente'. Si ya existía una fila Cancelada/Rechazada
     * del mismo comensal y mes, la reutiliza (el índice único no permite duplicar).
     */
    async solicitarPension({ idUsuario, idFamiliar, year, mes }) { throw new Error('No implementado'); }

    /** RPC cancelar_pension. */
    async cancelarPension(idPension) { throw new Error('No implementado'); }

    /** RPC confirmar_pension (genera las reservas). @returns {Promise<{reservasCreadas:number}>} */
    async confirmarPension(idPension) { throw new Error('No implementado'); }

    async rechazarPension(idPension) { throw new Error('No implementado'); }

    /** Reservas de pensión no canceladas del comensal en el mes. @returns {Promise<number>} */
    async contarAlmuerzosVigentes({ idUsuario, idFamiliar, year, mes }) { throw new Error('No implementado'); }
}