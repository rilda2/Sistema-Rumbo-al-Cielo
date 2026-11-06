import 'package:restaurante_app/features/asistencia/domain/entities/asistencia_entity.dart';

class AsistenciaModel {
  static AsistenciaEntity fromJson(Map<String, dynamic> json) {
    DateTime parseDate(dynamic val) {
      if (val is DateTime) return val;
      if (val is String) {
        return DateTime.tryParse(val) ?? DateTime.now();
      }
      return DateTime.now();
    }

    return AsistenciaEntity(
      idAsistencia: json['id_asistencia'] is int
          ? json['id_asistencia'] as int
          : int.tryParse(json['id_asistencia']?.toString() ?? ''),
      idUsuario: json['id_usuario']?.toString() ?? '',
      idReserva: json['id_reserva'] is int
          ? json['id_reserva'] as int
          : int.tryParse(json['id_reserva']?.toString() ?? ''),
      fecha: parseDate(json['fecha']),
      horaMarcado: json['hora_marcado']?.toString() ?? '00:00:00',
      asistio: json['asistio'] == true || json['asistio'] == 'true',
      observacion: json['observacion']?.toString(),
      usuarioNombre: json['usuario_nombre']?.toString() ??
          json['empleado_nombre']?.toString() ??
          json['nombre_completo']?.toString(),
      usuarioCi: json['usuario_ci']?.toString() ?? json['empleado_ci']?.toString(),
      platoNombre: json['plato_nombre']?.toString(),
    );
  }

  static Map<String, dynamic> toJson(AsistenciaEntity entity) {
    final now = DateTime.now();
    final dateStr =
        "${entity.fecha.year.toString().padLeft(4, '0')}-${entity.fecha.month.toString().padLeft(2, '0')}-${entity.fecha.day.toString().padLeft(2, '0')}";

    return {
      if (entity.idAsistencia != null) 'id_asistencia': entity.idAsistencia,
      'id_usuario': entity.idUsuario,
      if (entity.idReserva != null) 'id_reserva': entity.idReserva,
      'fecha': dateStr,
      'hora_marcado': entity.horaMarcado,
      'asistio': entity.asistio,
      if (entity.observacion != null) 'observacion': entity.observacion,
      'creado_en': now.toUtc().toIso8601String(),
    };
  }
}
