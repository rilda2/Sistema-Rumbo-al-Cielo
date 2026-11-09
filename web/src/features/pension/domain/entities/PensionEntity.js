/**
 * Entidad de Dominio: PensionEntity
 *
 * Representa la solicitud/membresía de pensión mensual de UN comensal
 * (el titular o uno de sus familiares) para un mes y año.
 *
 * Estados: 'Pendiente' (solicitada por el empleado) -> 'Confirmada' (admin)
 *          o 'Rechazada' (admin) o 'Cancelada' (empleado, antes de iniciar el mes).
 */
export class PensionEntity {
    constructor({
        id,
        idUsuario,
        idFamiliar = null,
        mes,
        year,
        estado = 'Pendiente',
        activo = true,
        fechaSolicitud = null,
        fechaConfirmacion = null,
        confirmadoPor = null,
        titularNombre = '',
        beneficiarioNombre = '',
    }) {
        this.id = id;
        this.idUsuario = idUsuario;
        this.idFamiliar = idFamiliar;
        this.mes = Number(mes);
        this.year = Number(year);
        this.estado = estado;
        this.activo = activo;
        this.fechaSolicitud = fechaSolicitud;
        this.fechaConfirmacion = fechaConfirmacion;
        this.confirmadoPor = confirmadoPor;
        this.titularNombre = titularNombre;
        this.beneficiarioNombre = beneficiarioNombre;
    }

    get esPendiente() { return this.estado === 'Pendiente'; }
    get esConfirmada() { return this.estado === 'Confirmada'; }
    get esRechazada() { return this.estado === 'Rechazada'; }
    get esCancelada() { return this.estado === 'Cancelada'; }

    /** Vigente = solicitud en curso o ya confirmada (bloquea una nueva solicitud). */
    get esVigente() { return this.esPendiente || this.esConfirmada; }

    get esParaFamiliar() { return this.idFamiliar !== null && this.idFamiliar !== undefined; }
}