import 'package:flutter/foundation.dart';
import 'package:restaurante_app/core/config/supabase_config.dart';
import 'package:restaurante_app/features/descuentos/data/models/cierre_mensual_model.dart';
import 'package:restaurante_app/features/descuentos/data/models/detalle_cierre_model.dart';
import 'package:restaurante_app/features/descuentos/domain/entities/cierre_mensual_entity.dart';
import 'package:restaurante_app/features/descuentos/domain/entities/detalle_cierre_entity.dart';
import 'package:restaurante_app/features/descuentos/domain/repositories/i_descuentos_repository.dart';

class SupabaseDescuentosRepository implements IDescuentosRepository {
  @override
  Future<Map<String, dynamic>> getConfiguracion() async {
    final client = SupabaseConfig.client;
    if (client == null) {
      return {'precio_esporadico': 18.0, 'precio_pension': 15.0, 'dias_minimos': 10};
    }

    try {
      final res = await client.from('configuracion').select().limit(1).maybeSingle();
      if (res != null) {
        return {
          'precio_esporadico': (res['precio_esporadico'] as num?)?.toDouble() ?? 18.0,
          'precio_pension': (res['precio_pension'] as num?)?.toDouble() ?? 15.0,
          'dias_minimos': (res['dias_minimos'] as num?)?.toInt() ?? 10,
        };
      }
    } catch (e) {
      debugPrint('ℹ️ Usando configuración por defecto: $e');
    }
    return {'precio_esporadico': 18.0, 'precio_pension': 15.0, 'dias_minimos': 10};
  }

  @override
  Future<({CierreMensualEntity cierre, List<DetalleCierreEntity> detalles, Map<String, dynamic> config})>
      calcularCierreMensual({required int mes, required int year}) async {
    final config = await getConfiguracion();
    final double precioEsporadico = config['precio_esporadico'] as double;
    final double precioPension = config['precio_pension'] as double;
    final int diasMinimos = config['dias_minimos'] as int;

    final client = SupabaseConfig.client;
    if (client == null) {
      // Mock data para testing / demo
      final detallesMock = [
        DetalleCierreEntity(
          idEmpleado: 'emp-1',
          empleadoNombre: 'Juan Carlos Pérez',
          empleadoCi: '4839201-LP',
          tipoReserva: 'pension',
          cantidadCobrable: 18,
          precioUnitario: precioPension,
          totalDescontar: 18 * precioPension,
          cumpleAntiguedad: true,
          antiguedadMeses: 4,
          estadoDescuento: 'Pendiente',
        ),
        DetalleCierreEntity(
          idEmpleado: 'emp-2',
          empleadoNombre: 'María Elena Flores',
          empleadoCi: '6102938-CB',
          tipoReserva: 'esporadico',
          cantidadCobrable: 6,
          precioUnitario: precioEsporadico,
          totalDescontar: 6 * precioEsporadico,
          cumpleAntiguedad: false,
          antiguedadMeses: 0,
          estadoDescuento: 'Pendiente',
        ),
      ];

      final totalGeneral =
          detallesMock.fold<double>(0.0, (acc, item) => acc + item.totalDescontar);

      return (
        cierre: CierreMensualEntity(
          mes: mes,
          year: year,
          fechaGeneracion: DateTime.now(),
          totalGeneral: totalGeneral,
          cerrado: false,
        ),
        detalles: detallesMock,
        config: config,
      );
    }

    // Rango de fechas del mes seleccionado
    final startDate = DateTime.utc(year, mes, 1, 0, 0, 0).toIso8601String();
    final lastDayOfMonth = DateTime.utc(year, mes + 1, 0).day;
    final endDate =
        DateTime.utc(year, mes, lastDayOfMonth, 23, 59, 59).toIso8601String();

    // 1. Obtener reservas confirmadas en el mes
    final reservasResponse = await client
        .from('vista_reservas_completas')
        .select()
        .gte('fecha', startDate)
        .lte('fecha', endDate)
        .neq('estado', 'CANCELADA');

    final List<dynamic> reservasList = (reservasResponse as List? ?? []);

    // 2. Obtener historial de pensiones para calcular antigüedad
    final pensionesResponse = await client.from('pension').select();
    final List<dynamic> pensionesList = (pensionesResponse as List? ?? []);

    // 3. Obtener lista de usuarios para nombres y CIs
    final usuariosResponse = await client.from('vista_usuarios').select();
    final List<dynamic> usuariosList = (usuariosResponse as List? ?? []);
    final Map<String, Map<String, dynamic>> usuariosMap = {};
    for (final u in usuariosList) {
      if (u is Map) {
        final map = Map<String, dynamic>.from(u);
        final uid = map['id_usuario']?.toString();
        if (uid != null) {
          usuariosMap[uid] = map;
        }
      }
    }

    // Agrupar reservas por empleado titular (id_usuario)
    final Map<String, ({int total, bool esPension, String nombre, String ci})> consumosPorUsuario = {};

    for (final item in reservasList) {
      if (item is! Map) continue;
      final r = Map<String, dynamic>.from(item);
      final uid = r['id_usuario']?.toString();
      if (uid == null || uid.isEmpty) continue;

      final empNombre = r['empleado_nombre']?.toString() ??
          usuariosMap[uid]?['nombre_completo']?.toString() ??
          'Empleado';
      final empCi = r['empleado_ci']?.toString() ??
          usuariosMap[uid]?['ci_codigo']?.toString() ??
          'N/A';
      final bool esPension = r['es_pension'] == true;

      if (!consumosPorUsuario.containsKey(uid)) {
        consumosPorUsuario[uid] = (
          total: 1,
          esPension: esPension,
          nombre: empNombre,
          ci: empCi,
        );
      } else {
        final current = consumosPorUsuario[uid]!;
        consumosPorUsuario[uid] = (
          total: current.total + 1,
          esPension: current.esPension || esPension,
          nombre: current.nombre.isNotEmpty ? current.nombre : empNombre,
          ci: current.ci.isNotEmpty ? current.ci : empCi,
        );
      }
    }

    final List<DetalleCierreEntity> detalles = [];
    double granTotal = 0.0;

    consumosPorUsuario.forEach((uid, consumo) {
      // Filtrar historial de pensiones del usuario
      final userPensiones = pensionesList.where((p) {
        if (p is! Map) return false;
        return p['id_usuario']?.toString() == uid;
      }).toList();

      final int antiguedadMeses = userPensiones.length;
      final bool esPensionadoEsteMes = userPensiones.any((p) {
            if (p is! Map) return false;
            final pMes = p['mes'];
            final pYear = p['year'];
            return (pMes == mes || pMes?.toString() == mes.toString()) &&
                (pYear == year || pYear?.toString() == year.toString());
          }) ||
          consumo.esPension;

      // Criterios de Aceptación HU12:
      // "Dado que un pensionado se registró varias veces a lo largo del año o en años anteriores,
      //  Cuando el sistema valida su antigüedad,
      //  Entonces se habilita el beneficio de descuento en sus cobros."
      // "Dado que el pensionado no cumple con la antigüedad mínima,
      //  Cuando se genera la Factura,
      //  Entonces el sistema cobra la tarifa normal sin descuento."
      final bool cumpleAntiguedad = esPensionadoEsteMes &&
          (antiguedadMeses > 1 || consumo.total >= diasMinimos);

      String tipoReserva = 'esporadico';
      double precioUnitario = precioEsporadico;

      if (esPensionadoEsteMes && cumpleAntiguedad) {
        tipoReserva = 'pension';
        precioUnitario = precioPension;
      } else {
        tipoReserva = 'esporadico';
        precioUnitario = precioEsporadico;
      }

      final double totalDescontar = consumo.total * precioUnitario;
      granTotal += totalDescontar;

      detalles.add(
        DetalleCierreEntity(
          idEmpleado: uid,
          empleadoNombre: consumo.nombre,
          empleadoCi: consumo.ci,
          tipoReserva: tipoReserva,
          cantidadCobrable: consumo.total,
          precioUnitario: precioUnitario,
          totalDescontar: totalDescontar,
          cumpleAntiguedad: cumpleAntiguedad,
          antiguedadMeses: antiguedadMeses,
          estadoDescuento: 'Pendiente',
        ),
      );
    });

    detalles.sort((a, b) => a.empleadoNombre.compareTo(b.empleadoNombre));

    final cierre = CierreMensualEntity(
      mes: mes,
      year: year,
      fechaGeneracion: DateTime.now(),
      totalGeneral: granTotal,
      cerrado: false,
    );

    return (cierre: cierre, detalles: detalles, config: config);
  }

  @override
  Future<Map<String, dynamic>> guardarCierreMensual({
    required CierreMensualEntity cierre,
    required List<DetalleCierreEntity> detalles,
  }) async {
    final client = SupabaseConfig.client;
    if (client == null) {
      return {'success': true, 'mensaje': 'Cierre guardado localmente (Demo)'};
    }

    try {
      // 1. Insertar Cabecera en cierre_mensual
      final cierrePayload = CierreMensualModel.toJson(cierre.copyWith(cerrado: true));

      final cierreGuardado = await client
          .from('cierre_mensual')
          .insert(cierrePayload)
          .select()
          .single();

      final int? idCierreGenerado = cierreGuardado['id_cierre'] is int
          ? cierreGuardado['id_cierre'] as int
          : int.tryParse(cierreGuardado['id_cierre']?.toString() ?? '');

      // 2. Insertar Detalle en detalle_cierre
      if (detalles.isNotEmpty && idCierreGenerado != null) {
        final detalleRows =
            detalles.map((d) => DetalleCierreModel.toJson(d, idCierreGenerado)).toList();

        await client.from('detalle_cierre').insert(detalleRows);
      }

      return {
        'success': true,
        'id_cierre': idCierreGenerado,
        'mensaje': 'Cierre mensual guardado y confirmado exitosamente.',
      };
    } catch (e) {
      debugPrint('⚠️ Error guardando cierre mensual en Supabase: $e');
      throw Exception('Error al guardar cierre mensual: $e');
    }
  }
}
