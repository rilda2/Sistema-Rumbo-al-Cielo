/**
 * Política de Pensión
 *
 * Reglas de negocio:
 *  - Solo se solicita/cancela una pensión ANTES de que inicie el mes.
 *  - Un comensal pensionado paga Bs 15 por almuerzo (esporádico: Bs 18).
 *  - Al confirmarse, se programan 10 almuerzos OBLIGATORIOS (no cancelables): se cobran
 *    aunque no asista. Desde el almuerzo 11 el pensionado reserva y cancela libremente.
 *  - Los días de atención son los de DIAS_ATENCION_DEFAULT (lunes a jueves), sin feriados.
 *
 * Todas las fechas son texto 'YYYY-MM-DD' para evitar problemas de zona horaria.
 */
import { DIAS_ATENCION_DEFAULT } from '../../../reservas/domain/policies/ReservaPolicy';

const permitido = (mensaje = 'Operación permitida.') => ({ permitido: true, mensaje });
const denegado = (mensaje) => ({ permitido: false, mensaje });

const pad = (n) => String(n).padStart(2, '0');
const fechaLocalDe = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const normalizarFecha = (f) => String(f || '').split('T')[0].trim();

export class PensionPolicy {
    constructor({
        diasMinimos = 10,
        precioPension = 15,
        precioEsporadico = 18,
        diasAtencion = DIAS_ATENCION_DEFAULT,
    } = {}) {
        this.diasMinimos = diasMinimos;
        this.precioPension = precioPension;
        this.precioEsporadico = precioEsporadico;
        this.diasAtencion = diasAtencion; // 0 = domingo ... 6 = sábado
    }

    /** Próximo mes calendario: { year, mes } con mes 1..12 */
    mesSiguiente(ahora = new Date()) {
        const d = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);
        return { year: d.getFullYear(), mes: d.getMonth() + 1 };
    }

    mesYaInicio(year, mes, ahora = new Date()) {
        return fechaLocalDe(ahora) >= `${year}-${pad(mes)}-01`;
    }

    puedeSolicitar({ year, mes }, ahora = new Date(), pensionExistente = null) {
        if (!year || !mes) return denegado('Debes seleccionar un mes.');

        if (this.mesYaInicio(year, mes, ahora)) {
            return denegado('El mes ya inició: solo puedes pensionarte antes de que comience.');
        }

        if (pensionExistente?.esVigente) {
            return denegado(
                pensionExistente.esPendiente
                    ? 'Ya tienes una solicitud pendiente de confirmación para este mes.'
                    : 'Ya estás pensionado en este mes.'
            );
        }

        return permitido();
    }

    puedeCancelar(pension, ahora = new Date()) {
        if (!pension) return denegado('No se encontró la pensión.');
        if (!pension.esVigente) return denegado('Esta pensión no está activa.');
        if (this.mesYaInicio(pension.year, pension.mes, ahora)) {
            return denegado('El mes ya inició: la pensión ya no puede cancelarse.');
        }
        return permitido();
    }

    /** Fechas 'YYYY-MM-DD' de atención del mes, sin feriados. */
    diasHabilesDelMes(year, mes, feriados = []) {
        const sinAtencion = new Set(
            feriados.map((f) => normalizarFecha(typeof f === 'string' ? f : f?.fecha))
        );
        const ultimoDia = new Date(year, mes, 0).getDate();
        const fechas = [];

        for (let d = 1; d <= ultimoDia; d++) {
            const diaSemana = new Date(year, mes - 1, d).getDay();
            if (!this.diasAtencion.includes(diaSemana)) continue;
            const fecha = `${year}-${pad(mes)}-${pad(d)}`;
            if (sinAtencion.has(fecha)) continue;
            fechas.push(fecha);
        }
        return fechas;
    }

    /** Resumen estimado para mostrar al empleado antes de solicitar. */
    calcularResumen(year, mes, feriados = []) {
        const fechas = this.diasHabilesDelMes(year, mes, feriados);
        return {
            fechas,
            diasHabiles: fechas.length,
            precioPorDia: this.precioPension,
            almuerzosObligatorios: this.diasMinimos,
            pagoMinimo: this.diasMinimos * this.precioPension,
            ahorroPorDia: this.precioEsporadico - this.precioPension,
        };
    }

    /** Almuerzos adicionales (los que exceden los obligatorios) que sí puede cancelar. */
    almuerzosCancelables(vigentes) {
        return Math.max(0, Number(vigentes) - this.diasMinimos);
    }

    puedeCancelarAlmuerzo(vigentes) {
        if (Number(vigentes) <= this.diasMinimos) {
            return denegado(
                `Este almuerzo es uno de los ${this.diasMinimos} obligatorios de tu pensión: ` +
                'se cobra aunque no asistas.'
            );
        }
        return permitido();
    }
}