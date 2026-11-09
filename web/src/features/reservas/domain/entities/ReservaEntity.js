/**
 * Entidad de Dominio: ReservaEntity
 *
 * Representa un almuerzo reservado por un empleado, para sí mismo o para un familiar.
 * Sin dependencias de React ni de Supabase.
 */
export class ReservaEntity {
    constructor({
        id,
        idUsuario,
        idFamiliar = null,
        fecha,
        dishName = '',
        platoPrincipal = null,
        sopaNombre = null,
        entradaNombre = null,
        esAlmuerzoCompleto = true,
        categoriaMenu = 'almuerzo_completo',
        estado = 'confirmada',
        tipo = 'diaria',
        esPension = false,
        esObligatoria = false,
        costoAplicado = 0,
        recogido = false,
        notas = null,
        createdAt = null,
        empleadoNombre = '',
        empleadoCi = '',
        beneficiarioNombre = '',
    }) {
        this.id = id;
        this.idUsuario = idUsuario;
        this.idFamiliar = idFamiliar;
        this.fecha = fecha;
        this.dishName = dishName;
        this.platoPrincipal = platoPrincipal;
        this.sopaNombre = sopaNombre;
        this.entradaNombre = entradaNombre;
        this.esAlmuerzoCompleto = esAlmuerzoCompleto;
        this.categoriaMenu = categoriaMenu;
        this.estado = estado;
        this.tipo = tipo;
        this.esPension = esPension;
        this.esObligatoria = esObligatoria;
        this.costoAplicado = costoAplicado;
        this.recogido = recogido;
        this.notas = notas;
        this.createdAt = createdAt;
        this.empleadoNombre = empleadoNombre;
        this.empleadoCi = empleadoCi;
        this.beneficiarioNombre = beneficiarioNombre;
    }

    get estaActiva() {
        const e = (this.estado || '').toLowerCase();
        return e === 'confirmada' || e === 'activa';
    }

    get estaCancelada() {
        return (this.estado || '').toLowerCase() === 'cancelada';
    }

    get estaEntregada() {
        return (this.estado || '').toLowerCase() === 'entregada';
    }

    get esParaFamiliar() {
        return this.idFamiliar !== null && this.idFamiliar !== undefined;
    }

    get nombreBeneficiario() {
        return this.beneficiarioNombre || this.empleadoNombre || 'Sin nombre';
    }
}