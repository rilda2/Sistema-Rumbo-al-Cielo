class CierreMensualEntity {
  final int? idCierre;
  final int mes;
  final int year;
  final DateTime fechaGeneracion;
  final double totalGeneral;
  final bool cerrado;

  const CierreMensualEntity({
    this.idCierre,
    required this.mes,
    required this.year,
    required this.fechaGeneracion,
    this.totalGeneral = 0.0,
    this.cerrado = false,
  });

  CierreMensualEntity copyWith({
    int? idCierre,
    int? mes,
    int? year,
    DateTime? fechaGeneracion,
    double? totalGeneral,
    bool? cerrado,
  }) {
    return CierreMensualEntity(
      idCierre: idCierre ?? this.idCierre,
      mes: mes ?? this.mes,
      year: year ?? this.year,
      fechaGeneracion: fechaGeneracion ?? this.fechaGeneracion,
      totalGeneral: totalGeneral ?? this.totalGeneral,
      cerrado: cerrado ?? this.cerrado,
    );
  }
}
