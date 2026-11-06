class DetalleCierreEntity {
  final int? idDetalle;
  final int? idCierre;
  final String idEmpleado;
  final String empleadoNombre;
  final String empleadoCi;
  final String tipoReserva; // 'pension' o 'esporadico'
  final int cantidadCobrable;
  final double precioUnitario;
  double totalDescontar;
  double descuentoManual;
  final bool cumpleAntiguedad;
  final int antiguedadMeses;
  String estadoDescuento; // 'Pendiente', 'Aprobado', 'Aplicado', 'Rechazado'

  DetalleCierreEntity({
    this.idDetalle,
    this.idCierre,
    required this.idEmpleado,
    required this.empleadoNombre,
    required this.empleadoCi,
    required this.tipoReserva,
    required this.cantidadCobrable,
    required this.precioUnitario,
    required this.totalDescontar,
    this.descuentoManual = 0.0,
    this.cumpleAntiguedad = false,
    this.antiguedadMeses = 0,
    this.estadoDescuento = 'Pendiente',
  });

  /// Permite modificar manualmente el descuento según HU12
  void aplicarDescuentoManual(double nuevoTotal) {
    descuentoManual = totalDescontar - nuevoTotal;
    totalDescontar = nuevoTotal;
    estadoDescuento = 'Aprobado';
  }
}
