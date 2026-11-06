import 'package:restaurante_app/features/asistencia/domain/entities/asistencia_entity.dart';
import 'package:restaurante_app/features/asistencia/domain/entities/qr_asistencia_result.dart';

abstract class IAsistenciaRepository {
  Future<QrAsistenciaResult> validarYRegistrarPorQr(String qrRaw);
  Future<List<AsistenciaEntity>> getHistorialAsistencia({DateTime? fecha});
  Future<void> registrarAsistenciaManual({
    required String idUsuario,
    int? idReserva,
    required DateTime fecha,
    bool asistio = true,
    String? observacion,
  });
}
