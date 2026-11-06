import { DetalleCierreEntity } from '../../domain/entities/DetalleCierreEntity';

/**
 * Modelo de Datos: DetalleCierreModel
 * Mapea entre la base de datos Supabase ('detalle_cierre' y 'liquidacion_mes') y DetalleCierreEntity.
 */
export class DetalleCierreModel {
  static toEntity(record, usuario = {}) {
    if (!record) return null;
    return new DetalleCierreEntity({
      id_detalle: record.id_detalle,
      id_empleado: record.id_empleado || record.id_usuario,
      empleado_nombre: usuario.nombre_completo || `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim(),
      empleado_ci: usuario.ci_codigo || '',
      tipo_reserva: record.tipo_reserva || 'esporadico',
      cantidad_cobrable: record.cantidad_cobrable || record.cant_almuerzos_consum || 0,
      precio_unitario: record.precio_unitario || 0,
      total_descontar: record.total_descontar || record.monto_total || 0,
      estado_descuento: record.estado_descuento || 'Pendiente',
      created_at: record.created_at,
    });
  }

  static toDetalleCierreDatabase(entity, idCierre = null) {
    const payload = {
      id_empleado: entity.id_empleado,
      tipo_reserva: entity.tipo_reserva,
      cantidad_cobrable: Math.round(entity.cantidad_cobrable),
      precio_unitario: entity.precio_unitario,
      total_descontar: entity.total_descontar,
      estado_descuento: entity.estado_descuento || 'Pendiente',
    };
    if (idCierre || entity.id_cierre) {
      payload.id_cierre = idCierre || entity.id_cierre;
    }
    return payload;
  }
}
