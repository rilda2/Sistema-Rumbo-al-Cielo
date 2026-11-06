import 'package:restaurante_app/features/descuentos/domain/entities/cierre_mensual_entity.dart';

class CierreMensualModel {
  static CierreMensualEntity fromJson(Map<String, dynamic> json) {
    DateTime parseDate(dynamic val) {
      if (val is DateTime) return val;
      if (val is String) {
        return DateTime.tryParse(val) ?? DateTime.now();
      }
      return DateTime.now();
    }

    return CierreMensualEntity(
      idCierre: json['id_cierre'] is int
          ? json['id_cierre'] as int
          : int.tryParse(json['id_cierre']?.toString() ?? ''),
      mes: json['mes'] is int
          ? json['mes'] as int
          : (int.tryParse(json['mes']?.toString() ?? '') ?? DateTime.now().month),
      year: json['year'] is int
          ? json['year'] as int
          : (int.tryParse(json['year']?.toString() ?? '') ?? DateTime.now().year),
      fechaGeneracion: parseDate(json['fecha_generacion']),
      totalGeneral: (json['total_general'] as num?)?.toDouble() ?? 0.0,
      cerrado: json['cerrado'] == true || json['cerrado'] == 'true',
    );
  }

  static Map<String, dynamic> toJson(CierreMensualEntity entity) {
    final dateStr =
        "${entity.fechaGeneracion.year.toString().padLeft(4, '0')}-${entity.fechaGeneracion.month.toString().padLeft(2, '0')}-${entity.fechaGeneracion.day.toString().padLeft(2, '0')}";

    return {
      'mes': entity.mes,
      'year': entity.year,
      'fecha_generacion': dateStr,
      'total_general': entity.totalGeneral,
      'cerrado': entity.cerrado,
    };
  }
}
