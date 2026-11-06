import 'package:restaurante_app/features/asistencia/domain/entities/qr_asistencia_result.dart';
import 'package:restaurante_app/features/asistencia/domain/repositories/i_asistencia_repository.dart';

class ValidarYRegistrarAsistenciaQrUseCase {
  final IAsistenciaRepository repository;

  ValidarYRegistrarAsistenciaQrUseCase(this.repository);

  Future<QrAsistenciaResult> execute(String qrRaw) async {
    final cleanQr = qrRaw.trim();
    if (cleanQr.isEmpty) {
      return const QrAsistenciaResult(
        status: QrAsistenciaStatus.error,
        mensaje: 'El código QR está vacío',
      );
    }

    return await repository.validarYRegistrarPorQr(cleanQr);
  }
}
