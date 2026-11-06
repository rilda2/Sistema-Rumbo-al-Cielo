import 'package:flutter_test/flutter_test.dart';
import 'package:restaurante_app/features/asistencia/domain/entities/asistencia_entity.dart';
import 'package:restaurante_app/features/asistencia/domain/entities/qr_asistencia_result.dart';
import 'package:restaurante_app/features/asistencia/domain/repositories/i_asistencia_repository.dart';
import 'package:restaurante_app/features/asistencia/domain/usecases/validar_y_registrar_asistencia_qr_usecase.dart';
import 'package:restaurante_app/features/descuentos/domain/entities/cierre_mensual_entity.dart';
import 'package:restaurante_app/features/descuentos/domain/entities/detalle_cierre_entity.dart';
import 'package:restaurante_app/features/descuentos/domain/repositories/i_descuentos_repository.dart';
import 'package:restaurante_app/features/descuentos/domain/usecases/aplicar_descuento_manual_usecase.dart';
import 'package:restaurante_app/features/descuentos/domain/usecases/generar_reporte_descuentos_usecase.dart';

class MockAsistenciaRepository implements IAsistenciaRepository {
  @override
  Future<QrAsistenciaResult> validarYRegistrarPorQr(String qrRaw) async {
    final clean = qrRaw.replaceAll('reserva:', '').replaceAll('#', '').trim();
    if (clean == 'expirada') {
      return const QrAsistenciaResult(
        status: QrAsistenciaStatus.fichaExpirada,
        mensaje: 'Ficha Virtual Expirada',
      );
    }
    if (clean == 'duplicada') {
      return const QrAsistenciaResult(
        status: QrAsistenciaStatus.registradoMultiplesVeces,
        mensaje: 'Registrado Multiples veces',
        yaRegistrado: true,
      );
    }
    return QrAsistenciaResult(
      status: QrAsistenciaStatus.exito,
      mensaje: 'Asistencia registrada con éxito',
      idReserva: clean,
      usuarioNombre: 'Carlos Mamani',
      platoNombre: 'Silpancho Cochabambino',
      fecha: DateTime.now(),
    );
  }

  @override
  Future<List<AsistenciaEntity>> getHistorialAsistencia({DateTime? fecha}) async {
    return [];
  }

  @override
  Future<void> registrarAsistenciaManual({
    required String idUsuario,
    int? idReserva,
    required DateTime fecha,
    bool asistio = true,
    String? observacion,
  }) async {}
}

class MockDescuentosRepository implements IDescuentosRepository {
  @override
  Future<Map<String, dynamic>> getConfiguracion() async {
    return {'precio_esporadico': 18.0, 'precio_pension': 15.0, 'dias_minimos': 10};
  }

  @override
  Future<({CierreMensualEntity cierre, List<DetalleCierreEntity> detalles, Map<String, dynamic> config})>
      calcularCierreMensual({required int mes, required int year}) async {
    return (
      cierre: CierreMensualEntity(
        mes: mes,
        year: year,
        fechaGeneracion: DateTime.now(),
        totalGeneral: 300.0,
      ),
      detalles: [
        DetalleCierreEntity(
          idEmpleado: 'emp-1',
          empleadoNombre: 'Juan Pérez',
          empleadoCi: '123456',
          tipoReserva: 'pension',
          cantidadCobrable: 20,
          precioUnitario: 15.0,
          totalDescontar: 300.0,
          cumpleAntiguedad: true,
          antiguedadMeses: 3,
        ),
      ],
      config: {'precio_esporadico': 18.0, 'precio_pension': 15.0, 'dias_minimos': 10},
    );
  }

  @override
  Future<Map<String, dynamic>> guardarCierreMensual({
    required CierreMensualEntity cierre,
    required List<DetalleCierreEntity> detalles,
  }) async {
    return {'success': true, 'id_cierre': 1};
  }
}

void main() {
  group('HU11: Registro de Asistencia por Código QR', () {
    late ValidarYRegistrarAsistenciaQrUseCase useCase;

    setUp(() {
      useCase = ValidarYRegistrarAsistenciaQrUseCase(MockAsistenciaRepository());
    });

    test('Rechaza código QR vacío', () async {
      final res = await useCase.execute('   ');
      expect(res.status, QrAsistenciaStatus.error);
      expect(res.isSuccess, isFalse);
    });

    test('Criterio HU11: Ficha Virtual Expirada', () async {
      final res = await useCase.execute('reserva:expirada');
      expect(res.status, QrAsistenciaStatus.fichaExpirada);
      expect(res.mensaje, 'Ficha Virtual Expirada');
      expect(res.isSuccess, isFalse);
    });

    test('Criterio HU11: Registrado Multiples veces', () async {
      final res = await useCase.execute('reserva:duplicada');
      expect(res.status, QrAsistenciaStatus.registradoMultiplesVeces);
      expect(res.mensaje, 'Registrado Multiples veces');
      expect(res.yaRegistrado, isTrue);
    });

    test('Criterio HU11: Registro exitoso de asistencia', () async {
      final res = await useCase.execute('reserva:123');
      expect(res.status, QrAsistenciaStatus.exito);
      expect(res.mensaje, 'Asistencia registrada con éxito');
      expect(res.isSuccess, isTrue);
      expect(res.usuarioNombre, 'Carlos Mamani');
    });
  });

  group('HU12: Reporte de Descuentos y Cobros', () {
    late GenerarReporteDescuentosUseCase generarReporteUseCase;
    late AplicarDescuentoManualUseCase aplicarDescuentoUseCase;

    setUp(() {
      generarReporteUseCase =
          GenerarReporteDescuentosUseCase(MockDescuentosRepository());
      aplicarDescuentoUseCase = AplicarDescuentoManualUseCase();
    });

    test('Criterio HU12: Validación de período válido', () async {
      expect(
        () => generarReporteUseCase.execute(mes: null, year: 2026),
        throwsA(isA<Exception>().having(
          (e) => e.toString(),
          'mensaje',
          contains('Debe seleccionar un período válido'),
        )),
      );

      expect(
        () => generarReporteUseCase.execute(mes: 13, year: 2026),
        throwsA(isA<Exception>().having(
          (e) => e.toString(),
          'mensaje',
          contains('Debe seleccionar un período válido'),
        )),
      );
    });

    test('Criterio HU12: Cálculo de cobros y tarifas de pensión según antigüedad', () async {
      final res = await generarReporteUseCase.execute(mes: 10, year: 2026);
      expect(res.cierre.mes, 10);
      expect(res.detalles.length, 1);
      expect(res.detalles.first.tipoReserva, 'pension');
      expect(res.detalles.first.precioUnitario, 15.0);
      expect(res.detalles.first.cumpleAntiguedad, isTrue);
    });

    test('Criterio HU12: Ajuste de descuento manual con confirmación exacta', () {
      final detalle = DetalleCierreEntity(
        idEmpleado: 'emp-1',
        empleadoNombre: 'Juan Pérez',
        empleadoCi: '123456',
        tipoReserva: 'pension',
        cantidadCobrable: 10,
        precioUnitario: 15.0,
        totalDescontar: 150.0,
      );

      final resultado = aplicarDescuentoUseCase.execute(
        detalle: detalle,
        nuevoTotal: 100.0,
      );

      expect(resultado.success, isTrue);
      expect(resultado.mensaje, 'Descuento aplicado correctamente');
      expect(resultado.detalle.totalDescontar, 100.0);
      expect(resultado.detalle.descuentoManual, 50.0);
      expect(resultado.detalle.estadoDescuento, 'Aprobado');
    });
  });
}
