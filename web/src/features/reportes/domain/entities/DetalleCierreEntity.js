/**
 * Entidad de Dominio: DetalleCierreEntity
 * Representa la línea de liquidación y cobro de un empleado para un cierre mensual.
 * 
 * Regla de Clean Architecture: Cero dependencias de infraestructura.
 */
export class DetalleCierreEntity {
  constructor({
    id_detalle = null,
    id_cierre = null,
    id_empleado,
    empleado_nombre = '',
    empleado_ci = '',
    tipo_reserva = 'esporadico', // 'pension' | 'esporadico'
    cantidad_cobrable = 0,
    precio_unitario = 0,
    total_descontar = 0,
    descuento_manual = 0,
    cumple_antiguedad = false,
    antiguedad_meses = 0,
    estado_descuento = 'Pendiente', // 'Pendiente' | 'Enviado Planilla' | 'Descontado'
    created_at = null,
  }) {
    this.id_detalle = id_detalle;
    this.id_cierre = id_cierre;
    this.id_empleado = id_empleado;
    this.empleado_nombre = empleado_nombre;
    this.empleado_ci = empleado_ci;
    this.tipo_reserva = tipo_reserva;
    this.cantidad_cobrable = Number(cantidad_cobrable) || 0;
    this.precio_unitario = Number(precio_unitario) || 0;
    this.total_descontar = Number(total_descontar) || 0;
    this.descuento_manual = Number(descuento_manual) || 0;
    this.cumple_antiguedad = Boolean(cumple_antiguedad);
    this.antiguedad_meses = Number(antiguedad_meses) || 0;
    this.estado_descuento = estado_descuento;
    this.created_at = created_at;
  }

  aplicarDescuentoManual(nuevoTotal) {
    const totalOriginal = this.cantidad_cobrable * this.precio_unitario;
    this.total_descontar = Math.max(0, Number(nuevoTotal));
    this.descuento_manual = Math.max(0, totalOriginal - this.total_descontar);
  }
}
