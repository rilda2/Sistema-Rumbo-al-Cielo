import 'package:restaurante_app/features/descuentos/domain/entities/detalle_cierre_entity.dart';

class DetalleCierreModel {
  static DetalleCierreEntity fromJson(Map<String, dynamic> json) {
    return DetalleCierreEntity(
      idDetalle: json['id_detalle'] is int
          ? json['id_detalle'] as int
          : int.tryParse(json['id_detalle']?.toString() ?? ''),
      idCierre: json['id_cierre'] is int
          ? json['id_cierre'] as int
          : int.tryParse(json['id_cierre']?.toString() ?? ''),
      idEmpleado: json['id_empleado']?.toString() ?? '',
      empleadoNombre: json['empleado_nombre']?.toString() ?? 'Empleado',
      empleadoCi: json['empleado_ci']?.toString() ?? 'N/A',
      tipoReserva: json['tipo_reserva']?.toString() ?? 'esporadico',
      cantidadCobrable: (json['cantidad_cobrable'] as num?)?.toInt() ?? 0,
      precioUnitario: (json['precio_unitario'] as num?)?.toDouble() ?? 18.0,
      totalDescontar: (json['total_descontar'] as num?)?.toDouble() ?? 0.0,
      descuentoManual: (json['descuento_manual'] as num?)?.toDouble() ?? 0.0,
      cumpleAntiguedad: json['cumple_antiguedad'] == true,
      antiguedadMeses: (json['antiguedad_meses'] as num?)?.toInt() ?? 0,
      estadoDescuento: json['estado_descuento']?.toString() ?? 'Pendiente',
    );
  }

  static Map<String, dynamic> toJson(DetalleCierreEntity entity, int? idCierre) {
    return {
      if (idCierre != null) 'id_cierre': idCierre,
      'id_empleado': entity.idEmpleado,
      'tipo_reserva': entity.tipoReserva,
      'cantidad_cobrable': entity.cantidadCobrable,
      'precio_unitario': entity.precioUnitario,
      'total_descontar': entity.totalDescontar,
      'estado_descuento': entity.estadoDescuento,
    };
  }
}
