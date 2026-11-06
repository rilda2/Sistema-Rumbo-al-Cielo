import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:restaurante_app/features/asistencia/data/repositories/supabase_asistencia_repository.dart';
import 'package:restaurante_app/features/asistencia/domain/repositories/i_asistencia_repository.dart';
import 'package:restaurante_app/features/asistencia/domain/usecases/validar_y_registrar_asistencia_qr_usecase.dart';

final asistenciaRepositoryProvider = Provider<IAsistenciaRepository>((ref) {
  return SupabaseAsistenciaRepository();
});

final validarAsistenciaQrUseCaseProvider =
    Provider<ValidarYRegistrarAsistenciaQrUseCase>((ref) {
  final repo = ref.watch(asistenciaRepositoryProvider);
  return ValidarYRegistrarAsistenciaQrUseCase(repo);
});
