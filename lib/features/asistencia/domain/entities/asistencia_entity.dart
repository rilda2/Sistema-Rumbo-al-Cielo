class AsistenciaEntity {
  final int? idAsistencia;
  final String idUsuario;
  final int? idReserva;
  final DateTime fecha;
  final String horaMarcado;
  final bool asistio;
  final String? observacion;
  final String? usuarioNombre;
  final String? usuarioCi;
  final String? platoNombre;

  const AsistenciaEntity({
    this.idAsistencia,
    required this.idUsuario,
    this.idReserva,
    required this.fecha,
    required this.horaMarcado,
    this.asistio = true,
    this.observacion,
    this.usuarioNombre,
    this.usuarioCi,
    this.platoNombre,
  });
}
