/**
 * Entidad de Dominio: ReporteConsumoEntity (HU15)
 * Representa el resumen mensual de consumos por empleado y sus familiares registrados,
 * con soporte para agrupación institucional y por área.
 */
export class ReporteConsumoEntity {
  constructor({
    id_usuario,
    empleado_nombre = '',
    empleado_ci = '',
    rol = 'Empleado',
    area = 'Operaciones',
    consumos_titular = 0,
    monto_titular = 0,
    consumos_familiares = 0,
    monto_familiares = 0,
    total_almuerzos = 0,
    monto_total = 0,
    familiares = [],
  }) {
    this.id_usuario = id_usuario;
    this.empleado_nombre = empleado_nombre;
    this.empleado_ci = empleado_ci;
    this.rol = rol;
    this.area = area;
    this.consumos_titular = Number(consumos_titular) || 0;
    this.monto_titular = Number(monto_titular) || 0;
    this.consumos_familiares = Number(consumos_familiares) || 0;
    this.monto_familiares = Number(monto_familiares) || 0;
    this.total_almuerzos = Number(total_almuerzos) || 0;
    this.monto_total = Number(monto_total) || 0;
    this.familiares = familiares;
  }
}
