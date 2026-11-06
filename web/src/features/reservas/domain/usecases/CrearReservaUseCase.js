import { AppError } from '../../../../core/errors/AppError';
import { armarCombo } from '../policies/armarCombo';

/**
 * Crea una reserva aplicando, en orden:
 *  1. Política de horarios (pasado, fin de semana, feriado, límite de las 9:00).
 *  2. Menú publicado y con platos.
 *  3. Una sola reserva activa por persona y día.
 *  4. Precio: Bs 15 si el titular tiene pensión activa ese mes; si no, Bs 18.
 *
 * NOTA sobre el precio: por ahora la pensión se aplica solo al titular.
 * Los familiares pagan tarifa diaria hasta que definamos la pensión de familiares.
 */
export class CrearReservaUseCase {
    /**
     * @param {object} deps
     * @param {import('../repositories/IReservaRepository').IReservaRepository} deps.reservaRepository
     * @param {import('../policies/ReservaPolicy').ReservaPolicy} deps.policy
     * @param {() => Promise<Array<{fecha:string, motivo?:string}>>} deps.obtenerFeriados
     */
    constructor({ reservaRepository, policy, obtenerFeriados }) {
        if (!reservaRepository || !policy) {
            throw new Error('CrearReservaUseCase requiere reservaRepository y policy');
        }
        this.reservaRepository = reservaRepository;
        this.policy = policy;
        this.obtenerFeriados = obtenerFeriados || (async () => []);
    }

    async execute(
        { idUsuario, idFamiliar = null, fecha, menu, idPlatoPrincipal = null, notas = '' },
        ahora = new Date()
    ) {
        const fechaLimpia = String(fecha || '').split('T')[0].trim();

        if (!idUsuario) throw new AppError('No se pudo identificar al usuario.', 'VALIDATION_ERROR');
        if (!fechaLimpia) throw new AppError('Debes seleccionar una fecha.', 'VALIDATION_ERROR');

        // 1. Política de horarios
        const feriados = await this.obtenerFeriados();
        const chequeo = this.policy.puedeReservar(fechaLimpia, ahora, feriados);
        if (!chequeo.permitido) throw new AppError(chequeo.mensaje, 'POLICY_ERROR');

        // 2. Menú publicado
        const publicado = menu && (menu.estado_publicacion === true || menu.estado_publicacion === 'Publicado');
        if (!publicado) {
            throw new AppError('El menú de ese día aún no está publicado.', 'MENU_NOT_PUBLISHED');
        }
        if (!Array.isArray(menu.platos) || menu.platos.length === 0) {
            throw new AppError('El menú de ese día no tiene platos asignados.', 'MENU_EMPTY');
        }

        // 3. Sin duplicados
        const yaExiste = await this.reservaRepository.existeReservaActiva({
            idUsuario,
            idFamiliar,
            fecha: fechaLimpia,
        });
        if (yaExiste) {
            throw new AppError(
                idFamiliar
                    ? 'Este familiar ya tiene una reserva activa para ese día.'
                    : 'Ya tienes una reserva activa para ese día.',
                'DUPLICATE_RESERVA'
            );
        }

        // 4. Combo y precio
        const combo = armarCombo(menu.platos, idPlatoPrincipal);
        const tarifas = await this.reservaRepository.getTarifas();
        const esPension = idFamiliar
            ? false
            : await this.reservaRepository.tienePensionActiva(idUsuario, fechaLimpia);
        const costoAplicado = esPension ? tarifas.precioPension : tarifas.precioEsporadico;

        return await this.reservaRepository.crearReserva({
            idUsuario,
            idFamiliar,
            fecha: fechaLimpia,
            ...combo,
            tipo: esPension ? 'pension' : 'diaria',
            esPension,
            costoAplicado,
            notas: String(notas || '').trim() || null,
        });
    }
}