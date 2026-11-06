/**
 * Contrato de Repositorio: IReservaRepository
 *
 * El dominio define QUÉ necesita; la capa data decide CÓMO (Supabase).
 */
export class IReservaRepository {
    /** @returns {Promise<import('../entities/ReservaEntity').ReservaEntity[]>} */
    async getReservasDeUsuario(idUsuario) {
        throw new Error('Método getReservasDeUsuario() no implementado');
    }

    /** @param {string} fecha 'YYYY-MM-DD' */
    async getReservasPorFecha(fecha) {
        throw new Error('Método getReservasPorFecha() no implementado');
    }

    async getReservaById(idReserva) {
        throw new Error('Método getReservaById() no implementado');
    }

    /** @returns {Promise<Array<{idFamiliar:number, parentesco:string, nombre:string}>>} */
    async getFamiliaresDeUsuario(idUsuario) {
        throw new Error('Método getFamiliaresDeUsuario() no implementado');
    }

    /** @returns {Promise<{precioEsporadico:number, precioPension:number}>} */
    async getTarifas() {
        throw new Error('Método getTarifas() no implementado');
    }

    /** @returns {Promise<boolean>} */
    async tienePensionActiva(idUsuario, fecha) {
        throw new Error('Método tienePensionActiva() no implementado');
    }

    /** @returns {Promise<boolean>} */
    async existeReservaActiva({ idUsuario, idFamiliar, fecha }) {
        throw new Error('Método existeReservaActiva() no implementado');
    }

    async crearReserva(datos) {
        throw new Error('Método crearReserva() no implementado');
    }

    async cancelarReserva(idReserva) {
        throw new Error('Método cancelarReserva() no implementado');
    }

    async marcarEntrega(idReserva) {
        throw new Error('Método marcarEntrega() no implementado');
    }
}