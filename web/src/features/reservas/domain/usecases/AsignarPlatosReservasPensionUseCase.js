import { armarCombo } from '../policies/armarCombo';

/**
 * Caso de Uso: asigna el plato del menú publicado a las reservas de pensión
 * que se generaron sin plato (dish_name vacío) para esos días.
 * Se ejecuta cuando el administrador guarda/publica el menú semanal.
 */
export class AsignarPlatosReservasPensionUseCase {
    /** @param {{ reservaRepository: import('../repositories/IReservaRepository').IReservaRepository }} deps */
    constructor({ reservaRepository }) {
        if (!reservaRepository) {
            throw new Error('AsignarPlatosReservasPensionUseCase requiere reservaRepository');
        }
        this.reservaRepository = reservaRepository;
    }

    /**
     * @param {{ dias: Array<{ fecha: string, publicado: boolean, platos: Array<{id_plato:number, nombre:string, categoria:string}> }> }} datos
     * @returns {Promise<number>} cantidad de reservas actualizadas
     */
    async execute({ dias = [] }) {
        let actualizadas = 0;

        for (const { fecha, publicado, platos } of dias) {
            if (!publicado || !Array.isArray(platos) || platos.length === 0) continue;
            const combo = armarCombo(platos);
            actualizadas += await this.reservaRepository.asignarComboAReservasPension(fecha, combo);
        }
        return actualizadas;
    }
}