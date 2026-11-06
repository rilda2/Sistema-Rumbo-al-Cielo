/**
 * Política de Reservas
 *
 * Reglas de negocio (tomadas de reservation_policy.dart de la APK):
 *  - No se reserva en fechas pasadas, sábados, domingos ni feriados.
 *  - Reservar para HOY: hasta las 09:00 inclusive (09:01 ya no).
 *  - Cancelar para HOY: solo antes de las 09:00 (desde las 09:00 ya no).
 *  - La entrega solo se marca el día del almuerzo, de 12:00 a 14:00.
 *
 * Los horarios son parámetros: más adelante pueden venir de la tabla 'configuracion'.
 * Todas las fechas son texto 'YYYY-MM-DD' para evitar problemas de zona horaria.
 */

const aMinutos = (hhmm) => {
    const [h, m] = String(hhmm).split(':').map(Number);
    return h * 60 + (m || 0);
};

const etiqueta = (minutos) => {
    const h = String(Math.floor(minutos / 60)).padStart(2, '0');
    const m = String(minutos % 60).padStart(2, '0');
    return `${h}:${m}`;
};

const normalizarFecha = (fecha) => String(fecha || '').split('T')[0].trim();

const fechaLocalDe = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const esFinDeSemana = (fecha) => {
    const [y, m, d] = fecha.split('-').map(Number);
    const dia = new Date(y, m - 1, d).getDay();
    return dia === 0 || dia === 6;
};

const permitido = () => ({ permitido: true, mensaje: 'Operación permitida.' });
const denegado = (mensaje) => ({ permitido: false, mensaje });

export class ReservaPolicy {
    constructor({
        limiteReserva = '09:00',
        limiteCancelacion = '09:00',
        inicioEntrega = '12:00',
        finEntrega = '14:00',
    } = {}) {
        this.limiteReserva = aMinutos(limiteReserva);
        this.limiteCancelacion = aMinutos(limiteCancelacion);
        this.inicioEntrega = aMinutos(inicioEntrega);
        this.finEntrega = aMinutos(finEntrega);
    }

    /**
     * @param {string} fecha 'YYYY-MM-DD'
     * @param {Date} ahora
     * @param {Array<string|{fecha:string, motivo?:string}>} feriados
     */
    puedeReservar(fecha, ahora = new Date(), feriados = []) {
        const objetivo = normalizarFecha(fecha);
        const hoy = fechaLocalDe(ahora);

        if (!objetivo) return denegado('Debes seleccionar una fecha.');

        if (objetivo < hoy) {
            return denegado('No es posible reservar para fechas pasadas.');
        }

        if (esFinDeSemana(objetivo)) {
            return denegado('El restaurante no brinda servicio los fines de semana.');
        }

        const feriado = feriados.find((f) => {
            const fechaFeriado = typeof f === 'string' ? f : f?.fecha;
            return normalizarFecha(fechaFeriado) === objetivo;
        });
        if (feriado) {
            const motivo = typeof feriado === 'string' ? '' : feriado.motivo;
            return denegado(`Día sin atención${motivo ? `: ${motivo}` : ' (feriado institucional)'}.`);
        }

        const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
        if (objetivo === hoy && minutosActuales > this.limiteReserva) {
            return denegado(
                `Las reservas para el almuerzo de hoy cerraron a las ${etiqueta(this.limiteReserva)}.`
            );
        }

        return permitido();
    }

    puedeCancelar(fecha, ahora = new Date()) {
        const objetivo = normalizarFecha(fecha);
        const hoy = fechaLocalDe(ahora);

        if (objetivo < hoy) {
            return denegado('No es posible cancelar una reserva de días pasados.');
        }

        const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
        if (objetivo === hoy && minutosActuales >= this.limiteCancelacion) {
            return denegado(
                `El plazo para cancelar el almuerzo de hoy venció a las ${etiqueta(this.limiteCancelacion)}.`
            );
        }

        return permitido();
    }

    puedeEntregar(fecha, ahora = new Date()) {
        const objetivo = normalizarFecha(fecha);
        const hoy = fechaLocalDe(ahora);

        if (objetivo !== hoy) {
            return denegado('La entrega solo puede registrarse el día del almuerzo.');
        }

        const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
        if (minutosActuales < this.inicioEntrega || minutosActuales >= this.finEntrega) {
            return denegado(
                `La entrega está habilitada únicamente de ${etiqueta(this.inicioEntrega)} a ${etiqueta(this.finEntrega)}.`
            );
        }

        return permitido();
    }
}