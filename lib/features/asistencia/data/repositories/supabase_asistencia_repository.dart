import 'package:flutter/foundation.dart';
import 'package:restaurante_app/core/config/supabase_config.dart';
import 'package:restaurante_app/features/asistencia/data/models/asistencia_model.dart';
import 'package:restaurante_app/features/asistencia/domain/entities/asistencia_entity.dart';
import 'package:restaurante_app/features/asistencia/domain/entities/qr_asistencia_result.dart';
import 'package:restaurante_app/features/asistencia/domain/repositories/i_asistencia_repository.dart';

class SupabaseAsistenciaRepository implements IAsistenciaRepository {
  @override
  Future<QrAsistenciaResult> validarYRegistrarPorQr(String qrRaw) async {
    final client = SupabaseConfig.client;

    // Normalizar payload QR
    String cleanId = qrRaw.trim();
    if (cleanId.toLowerCase().startsWith('reserva:')) {
      cleanId = cleanId.substring(8).trim();
    }
    if (cleanId.startsWith('#')) {
      cleanId = cleanId.substring(1).trim();
    }

    final int? numericReservaId = int.tryParse(cleanId);

    if (client == null) {
      // Modo sin conexión o demo
      return QrAsistenciaResult(
        status: QrAsistenciaStatus.exito,
        mensaje: 'Asistencia registrada con éxito (Modo local)',
        idReserva: cleanId,
        usuarioNombre: 'Usuario Demo',
        platoNombre: 'Almuerzo del día',
        fecha: DateTime.now(),
      );
    }

    try {
      // 1. Consultar reserva en vista_reservas_completas o tabla reserva
      Map<String, dynamic>? reservaData;

      if (numericReservaId != null) {
        final viewRes = await client
            .from('vista_reservas_completas')
            .select()
            .eq('id_reserva', numericReservaId)
            .maybeSingle();
        if (viewRes != null) {
          reservaData = Map<String, dynamic>.from(viewRes);
        } else {
          final tblRes = await client
              .from('reserva')
              .select()
              .eq('id_reserva', numericReservaId)
              .maybeSingle();
          if (tblRes != null) {
            reservaData = Map<String, dynamic>.from(tblRes);
          }
        }
      } else {
        // Fallback por string / id alternativo
        final tblRes = await client
            .from('reserva')
            .select()
            .eq('id_usuario', cleanId)
            .maybeSingle();
        if (tblRes != null) {
          reservaData = Map<String, dynamic>.from(tblRes);
        }
      }

      if (reservaData == null) {
        return const QrAsistenciaResult(
          status: QrAsistenciaStatus.noExiste,
          mensaje: 'No existe reserva activa con este código',
        );
      }

      final String idUsuario = reservaData['id_usuario']?.toString() ?? '';
      final String estado =
          (reservaData['estado']?.toString() ?? '').toUpperCase();
      final bool recogido = reservaData['recogido'] == true;
      final String usuarioNombre = reservaData['empleado_nombre']?.toString() ??
          reservaData['usuario_nombre']?.toString() ??
          'Empleado';
      final String platoNombre =
          reservaData['plato_nombre']?.toString() ?? 'Almuerzo Institucional';

      // Parsear fecha de la reserva
      DateTime fechaReserva;
      final rawFecha = reservaData['fecha'];
      if (rawFecha is DateTime) {
        fechaReserva = rawFecha;
      } else if (rawFecha is String) {
        fechaReserva = DateTime.tryParse(rawFecha) ?? DateTime.now();
      } else {
        fechaReserva = DateTime.now();
      }

      final now = DateTime.now();
      final dateOnlyReserva =
          DateTime(fechaReserva.year, fechaReserva.month, fechaReserva.day);
      final dateOnlyToday = DateTime(now.year, now.month, now.day);

      // Criterio de Aceptación HU11:
      // "Dado que el empleado intenta usar una ficha virtual expirada,
      //  Cuando el encargado la escanea,
      //  Entonces el sistema muestra el mensaje 'Ficha Virtual Expirada'"
      if (dateOnlyReserva.isBefore(dateOnlyToday)) {
        return QrAsistenciaResult(
          status: QrAsistenciaStatus.fichaExpirada,
          mensaje: 'Ficha Virtual Expirada',
          idReserva: cleanId,
          usuarioNombre: usuarioNombre,
          platoNombre: platoNombre,
          fecha: fechaReserva,
        );
      }

      // Si está cancelada
      if (estado == 'CANCELADA') {
        return QrAsistenciaResult(
          status: QrAsistenciaStatus.cancelada,
          mensaje: 'La reserva asociada está cancelada',
          idReserva: cleanId,
          usuarioNombre: usuarioNombre,
          platoNombre: platoNombre,
          fecha: fechaReserva,
        );
      }

      // Criterio de Aceptación HU11:
      // "Dado que el empleado intenta registrar la misma ficha más de una vez,
      //  Cuando el encargado la valida,
      //  Entonces el sistema muestra el mensaje 'Registrado Multiples veces'"
      if (recogido) {
        return QrAsistenciaResult(
          status: QrAsistenciaStatus.registradoMultiplesVeces,
          mensaje: 'Registrado Multiples veces',
          idReserva: cleanId,
          usuarioNombre: usuarioNombre,
          platoNombre: platoNombre,
          fecha: fechaReserva,
          yaRegistrado: true,
        );
      }

      // También verificar en tabla asistencia para mayor consistencia
      if (numericReservaId != null) {
        final existingAsistencia = await client
            .from('asistencia')
            .select()
            .eq('id_reserva', numericReservaId)
            .eq('asistio', true)
            .maybeSingle();

        if (existingAsistencia != null) {
          // Marcar recogido en reserva por si estaba desfasado
          await client
              .from('reserva')
              .update({'recogido': true, 'estado': 'ENTREGADA'})
              .eq('id_reserva', numericReservaId);

          return QrAsistenciaResult(
            status: QrAsistenciaStatus.registradoMultiplesVeces,
            mensaje: 'Registrado Multiples veces',
            idReserva: cleanId,
            usuarioNombre: usuarioNombre,
            platoNombre: platoNombre,
            fecha: fechaReserva,
            yaRegistrado: true,
          );
        }
      }

      // Criterio de Aceptación HU11:
      // "Dado que existen reservas confirmadas,
      //  Cuando el empleado muestra su ficha virtual al encargado,
      //  Entonces el encargado registra su asistencia."
      final todayStr =
          "${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";
      final timeStr =
          "${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}:${now.second.toString().padLeft(2, '0')}";

      // 1. Insertar en tabla asistencia
      final payloadAsistencia = {
        'id_usuario': idUsuario,
        if (numericReservaId != null) 'id_reserva': numericReservaId,
        'fecha': todayStr,
        'hora_marcado': timeStr,
        'asistio': true,
        'observacion': 'Asistencia registrada vía escaneo QR (HU11)',
        'creado_en': now.toUtc().toIso8601String(),
      };

      await client.from('asistencia').insert(payloadAsistencia);

      // 2. Actualizar reserva a recogido = true y estado = 'ENTREGADA'
      if (numericReservaId != null) {
        await client.from('reserva').update({
          'recogido': true,
          'estado': 'ENTREGADA',
        }).eq('id_reserva', numericReservaId);
      }

      return QrAsistenciaResult(
        status: QrAsistenciaStatus.exito,
        mensaje: 'Asistencia registrada con éxito',
        idReserva: cleanId,
        usuarioNombre: usuarioNombre,
        platoNombre: platoNombre,
        fecha: fechaReserva,
      );
    } catch (e) {
      debugPrint('⚠️ Error en validarYRegistrarPorQr: $e');
      return QrAsistenciaResult(
        status: QrAsistenciaStatus.error,
        mensaje: 'Error al procesar asistencia: $e',
      );
    }
  }

  @override
  Future<List<AsistenciaEntity>> getHistorialAsistencia({DateTime? fecha}) async {
    final client = SupabaseConfig.client;
    if (client == null) return const [];

    try {
      var query = client.from('asistencia').select();
      if (fecha != null) {
        final dateStr =
            "${fecha.year.toString().padLeft(4, '0')}-${fecha.month.toString().padLeft(2, '0')}-${fecha.day.toString().padLeft(2, '0')}";
        query = query.eq('fecha', dateStr);
      }

      final data = await query.order('hora_marcado', ascending: false);
      final list = List<Map<String, dynamic>>.from(data as List);
      return list.map(AsistenciaModel.fromJson).toList();
    } catch (e) {
      debugPrint('⚠️ Error al obtener historial de asistencia: $e');
      return const [];
    }
  }

  @override
  Future<void> registrarAsistenciaManual({
    required String idUsuario,
    int? idReserva,
    required DateTime fecha,
    bool asistio = true,
    String? observacion,
  }) async {
    final client = SupabaseConfig.client;
    if (client == null) return;

    final now = DateTime.now();
    final dateStr =
        "${fecha.year.toString().padLeft(4, '0')}-${fecha.month.toString().padLeft(2, '0')}-${fecha.day.toString().padLeft(2, '0')}";
    final timeStr =
        "${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}:${now.second.toString().padLeft(2, '0')}";

    final record = {
      'id_usuario': idUsuario,
      if (idReserva != null) 'id_reserva': idReserva,
      'fecha': dateStr,
      'hora_marcado': timeStr,
      'asistio': asistio,
      if (observacion != null) 'observacion': observacion,
      'creado_en': now.toUtc().toIso8601String(),
    };

    await client.from('asistencia').insert(record);

    if (idReserva != null) {
      await client
          .from('reserva')
          .update({'recogido': true, 'estado': 'ENTREGADA'})
          .eq('id_reserva', idReserva);
    }
  }
}
