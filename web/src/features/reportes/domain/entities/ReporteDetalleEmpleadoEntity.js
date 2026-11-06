/**
 * Entidad de Dominio: ReporteDetalleEmpleadoEntity (HU16)
 * Representa el desglose pormenorizado de consumos por fecha, plato y beneficiario.
 */
export class ReporteDetalleEmpleadoEntity {
  constructor({
    id_usuario,
    empleado_nombre = '',
    empleado_ci = '',
    rol = 'Empleado',
    reservas = [],
    resumen = {
      total_titular: 0,
      monto_titular: 0,
      total_familiares: 0,
      monto_familiares: 0,
      total_almuerzos: 0,
      monto_total: 0,
    },
  }) {
    this.id_usuario = id_usuario;
    this.empleado_nombre = empleado_nombre;
    this.empleado_ci = empleado_ci;
    this.rol = rol;
    this.reservas = reservas;
    this.resumen = resumen;
  }
}
