enum QrAsistenciaStatus {
  exito,
  fichaExpirada,
  registradoMultiplesVeces,
  noExiste,
  cancelada,
  error,
}

class QrAsistenciaResult {
  final QrAsistenciaStatus status;
  final String mensaje;
  final String? idReserva;
  final String? usuarioNombre;
  final String? platoNombre;
  final DateTime? fecha;
  final bool yaRegistrado;

  const QrAsistenciaResult({
    required this.status,
    required this.mensaje,
    this.idReserva,
    this.usuarioNombre,
    this.platoNombre,
    this.fecha,
    this.yaRegistrado = false,
  });

  bool get isSuccess => status == QrAsistenciaStatus.exito;
}
