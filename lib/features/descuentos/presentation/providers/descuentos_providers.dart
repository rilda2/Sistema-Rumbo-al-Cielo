import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:restaurante_app/features/descuentos/data/repositories/supabase_descuentos_repository.dart';
import 'package:restaurante_app/features/descuentos/domain/entities/cierre_mensual_entity.dart';
import 'package:restaurante_app/features/descuentos/domain/entities/detalle_cierre_entity.dart';
import 'package:restaurante_app/features/descuentos/domain/repositories/i_descuentos_repository.dart';
import 'package:restaurante_app/features/descuentos/domain/usecases/aplicar_descuento_manual_usecase.dart';
import 'package:restaurante_app/features/descuentos/domain/usecases/generar_reporte_descuentos_usecase.dart';
import 'package:restaurante_app/features/descuentos/domain/usecases/guardar_cierre_mensual_usecase.dart';

final descuentosRepositoryProvider = Provider<IDescuentosRepository>((ref) {
  return SupabaseDescuentosRepository();
});

final generarReporteDescuentosUseCaseProvider =
    Provider<GenerarReporteDescuentosUseCase>((ref) {
  final repo = ref.watch(descuentosRepositoryProvider);
  return GenerarReporteDescuentosUseCase(repo);
});

final aplicarDescuentoManualUseCaseProvider =
    Provider<AplicarDescuentoManualUseCase>((ref) {
  return AplicarDescuentoManualUseCase();
});

final guardarCierreMensualUseCaseProvider =
    Provider<GuardarCierreMensualUseCase>((ref) {
  final repo = ref.watch(descuentosRepositoryProvider);
  return GuardarCierreMensualUseCase(repo);
});

class DescuentosReporteState {
  final bool isGenerated;
  final bool isLoading;
  final String? error;
  final int? mes;
  final int? year;
  final CierreMensualEntity? cierre;
  final List<DetalleCierreEntity> detalles;
  final Map<String, dynamic> config;

  const DescuentosReporteState({
    this.isGenerated = false,
    this.isLoading = false,
    this.error,
    this.mes,
    this.year,
    this.cierre,
    this.detalles = const [],
    this.config = const {},
  });

  DescuentosReporteState copyWith({
    bool? isGenerated,
    bool? isLoading,
    String? error,
    int? mes,
    int? year,
    CierreMensualEntity? cierre,
    List<DetalleCierreEntity>? detalles,
    Map<String, dynamic>? config,
  }) {
    return DescuentosReporteState(
      isGenerated: isGenerated ?? this.isGenerated,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      mes: mes ?? this.mes,
      year: year ?? this.year,
      cierre: cierre ?? this.cierre,
      detalles: detalles ?? this.detalles,
      config: config ?? this.config,
    );
  }
}

class DescuentosNotifier extends Notifier<DescuentosReporteState> {
  @override
  DescuentosReporteState build() {
    return const DescuentosReporteState();
  }

  Future<void> generarReporte({required int? mes, required int? year}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final useCase = ref.read(generarReporteDescuentosUseCaseProvider);
      final resultado = await useCase.execute(mes: mes, year: year);

      state = state.copyWith(
        isGenerated: true,
        isLoading: false,
        error: null,
        mes: mes,
        year: year,
        cierre: resultado.cierre,
        detalles: resultado.detalles,
        config: resultado.config,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception: ', ''),
      );
      rethrow;
    }
  }

  void aplicarDescuentoManual({
    required DetalleCierreEntity detalle,
    required double nuevoTotal,
  }) {
    final useCase = ref.read(aplicarDescuentoManualUseCaseProvider);
    final res = useCase.execute(detalle: detalle, nuevoTotal: nuevoTotal);

    final updatedDetalles = List<DetalleCierreEntity>.from(state.detalles);
    final idx =
        updatedDetalles.indexWhere((d) => d.idEmpleado == detalle.idEmpleado);
    if (idx != -1) {
      updatedDetalles[idx] = res.detalle;
    }

    final newTotalGeneral = updatedDetalles.fold<double>(
      0.0,
      (acc, item) => acc + item.totalDescontar,
    );

    state = state.copyWith(
      detalles: updatedDetalles,
      cierre: state.cierre?.copyWith(totalGeneral: newTotalGeneral),
    );
  }

  Future<Map<String, dynamic>> guardarCierre() async {
    if (state.cierre == null) {
      throw Exception('No hay reporte generado para guardar.');
    }
    state = state.copyWith(isLoading: true);
    try {
      final useCase = ref.read(guardarCierreMensualUseCaseProvider);
      final res = await useCase.execute(
        cierre: state.cierre!,
        detalles: state.detalles,
      );
      state = state.copyWith(
        isLoading: false,
        cierre: state.cierre?.copyWith(cerrado: true),
      );
      return res;
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }

  void resetReporte() {
    state = const DescuentosReporteState();
  }
}

final descuentosNotifierProvider =
    NotifierProvider<DescuentosNotifier, DescuentosReporteState>(
  DescuentosNotifier.new,
);
