import { IReportesRepository } from '../../domain/repositories/IReportesRepository';
import { CierreMensualEntity } from '../../domain/entities/CierreMensualEntity';
import { DetalleCierreEntity } from '../../domain/entities/DetalleCierreEntity';
import { ReporteConsumoEntity } from '../../domain/entities/ReporteConsumoEntity';
import { ReporteDetalleEmpleadoEntity } from '../../domain/entities/ReporteDetalleEmpleadoEntity';
import { CierreMensualModel } from '../models/CierreMensualModel';
import { DetalleCierreModel } from '../models/DetalleCierreModel';

/**
 * Implementación de Infraestructura: SupabaseReportesRepository
 * Implementa IReportesRepository comunicándose con la base de datos Supabase.
 */
export class SupabaseReportesRepository extends IReportesRepository {
  constructor(supabaseClient) {
    super();
    this.supabase = supabaseClient;
  }

  /**
   * Obtiene la configuración de precios y reglas del sistema
   */
  async getConfiguracion() {
    try {
      const { data, error } = await this.supabase
        .from('configuracion')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[SupabaseReportesRepository] Error al leer configuración, usando defaults:', error.message);
      }

      return {
        precio_esporadico: data?.precio_esporadico || 18,
        precio_pension: data?.precio_pension || 15,
        dias_minimos: data?.dias_minimos || 10,
      };
    } catch {
      return { precio_esporadico: 18, precio_pension: 15, dias_minimos: 10 };
    }
  }

  /**
   * Obtiene todos los usuarios elegibles para el reporte
   */
  async getUsuarios() {
    const { data, error } = await this.supabase
      .from('vista_usuarios')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Obtiene métricas generales con datos reales de la base de datos
   */
  async getMetricasGenerales() {
    const usuarios = await this.getUsuarios();

    // 1. Almuerzos en la última semana (últimos 7 días)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: almuerzosSemana, error: semErr } = await this.supabase
      .from('reserva')
      .select('*', { count: 'exact', head: true })
      .gte('fecha', sevenDaysAgo)
      .neq('estado', 'CANCELADA');

    if (semErr) console.warn('[SupabaseReportesRepository] Error almuerzos semana:', semErr.message);

    // 2. Tasa de asistencia real (asistencias efectivas vs reservas confirmadas/recogidas)
    const { count: totalAsistencias, error: asisErr } = await this.supabase
      .from('asistencia')
      .select('*', { count: 'exact', head: true })
      .eq('asistio', true);

    const { count: totalReservasValidas, error: resErr } = await this.supabase
      .from('reserva')
      .select('*', { count: 'exact', head: true })
      .neq('estado', 'CANCELADA');

    let tasaAsistencia = 100;
    if (totalReservasValidas && totalReservasValidas > 0) {
      tasaAsistencia = Math.min(100, Math.round(((totalAsistencias || 0) / totalReservasValidas) * 100 * 10) / 10);
    } else if (totalAsistencias && totalAsistencias > 0) {
      tasaAsistencia = 100;
    }

    return {
      totalUsuarios: usuarios.length,
      usuarios,
      almuerzosSemana: almuerzosSemana || 0,
      tasaAsistencia: tasaAsistencia || 100,
    };
  }

  /**
   * HU14: Calcula el cierre mensual con cobros y tarifas según antigüedad
   */
  async calcularCierreMensual({ mes, year }) {
    const config = await this.getConfiguracion();
    const usuarios = await this.getUsuarios();

    // Rango de fechas del mes seleccionado
    const startDate = new Date(Date.UTC(year, mes - 1, 1, 0, 0, 0)).toISOString();
    const endDate = new Date(Date.UTC(year, mes, 0, 23, 59, 59, 999)).toISOString();

    // 1. Obtener reservas confirmadas en el mes
    const { data: reservas, error: resError } = await this.supabase
      .from('vista_reservas_completas')
      .select('*')
      .gte('fecha', startDate)
      .lte('fecha', endDate)
      .neq('estado', 'CANCELADA');

    if (resError) throw resError;

    // 2. Obtener historial de pensiones para calcular antigüedad
    const { data: historialPensiones, error: pensError } = await this.supabase
      .from('pension')
      .select('*');

    if (pensError) {
      console.warn('[SupabaseReportesRepository] Error al leer pensiones:', pensError.message);
    }

    const pensiones = historialPensiones || [];

    // Agrupar reservas por empleado titular (id_usuario)
    const consumosPorUsuario = {};
    (reservas || []).forEach((r) => {
      const uid = r.id_usuario;
      if (!uid) return;
      if (!consumosPorUsuario[uid]) {
        consumosPorUsuario[uid] = {
          total: 0,
          titular: 0,
          familiares: 0,
          esPension: false,
        };
      }
      consumosPorUsuario[uid].total += 1;
      if (r.id_familiar) {
        consumosPorUsuario[uid].familiares += 1;
      } else {
        consumosPorUsuario[uid].titular += 1;
      }
      if (r.es_pension) {
        consumosPorUsuario[uid].esPension = true;
      }
    });

    const detalles = [];
    let granTotal = 0;

    usuarios.forEach((u) => {
      const uid = u.id_usuario;
      const consumo = consumosPorUsuario[uid] || { total: 0, titular: 0, familiares: 0, esPension: false };

      // Solo procesar si tiene consumos o es empleado registrado con actividad
      if (consumo.total === 0) return;

      // Evaluar antigüedad del pensionado (HU14):
      // Si se registró como pensionado varias veces en el año o años previos,
      // o si tiene registros previos de pensión en la tabla pension.
      const registrosPensionUsuario = pensiones.filter((p) => p.id_usuario === uid);
      const antiguedadMeses = registrosPensionUsuario.length;
      
      // Es pensionado si tiene registro para este mes o consumió más de días mínimos
      const esPensionadoEsteMes = registrosPensionUsuario.some((p) => p.mes === mes && p.year === year) || consumo.esPension;
      
      // Cumple antigüedad si tiene al menos 1 registro anterior o cumple los días mínimos
      const cumpleAntiguedad = esPensionadoEsteMes && (antiguedadMeses > 1 || consumo.total >= config.dias_minimos);

      let tipoReserva = 'esporadico';
      let precioUnitario = config.precio_esporadico;

      if (esPensionadoEsteMes && cumpleAntiguedad) {
        tipoReserva = 'pension';
        precioUnitario = config.precio_pension;
      } else {
        // Cobra tarifa normal si no cumple antigüedad (HU14)
        tipoReserva = 'esporadico';
        precioUnitario = config.precio_esporadico;
      }

      const totalDescontar = consumo.total * precioUnitario;
      granTotal += totalDescontar;

      detalles.push(
        new DetalleCierreEntity({
          id_empleado: uid,
          empleado_nombre: u.nombre_completo || `${u.nombre || ''} ${u.apellidos || ''}`.trim(),
          empleado_ci: u.ci_codigo || 'N/A',
          tipo_reserva: tipoReserva,
          cantidad_cobrable: consumo.total,
          precio_unitario: precioUnitario,
          total_descontar: totalDescontar,
          descuento_manual: 0,
          cumple_antiguedad: cumpleAntiguedad,
          antiguedad_meses: antiguedadMeses,
          estado_descuento: 'Pendiente',
        })
      );
    });

    const cierre = new CierreMensualEntity({
      mes,
      year,
      fecha_generacion: new Date().toISOString().split('T')[0],
      total_general: granTotal,
      cerrado: false,
    });

    return { cierre, detalles, config };
  }

  /**
   * Guarda de forma persistente el cierre en cierre_mensual, detalle_cierre y liquidacion_mes
   */
  async guardarCierreMensual({ cierre, detalles }) {
    // 1. Insertar Cabecera en cierre_mensual
    const cierrePayload = CierreMensualModel.toDatabase({
      ...cierre,
      cerrado: true,
    });

    const { data: cierreGuardado, error: cierreErr } = await this.supabase
      .from('cierre_mensual')
      .insert(cierrePayload)
      .select()
      .single();

    if (cierreErr) throw cierreErr;

    const idCierreGenerado = cierreGuardado?.id_cierre;

    // 2. Insertar Detalle en detalle_cierre vinculando con idCierreGenerado
    if (detalles && detalles.length > 0) {
      const detalleRows = detalles.map((d) => DetalleCierreModel.toDetalleCierreDatabase(d, idCierreGenerado));
      const { error: detErr } = await this.supabase
        .from('detalle_cierre')
        .insert(detalleRows);

      if (detErr) {
        console.warn('[SupabaseReportesRepository] Advertencia al insertar detalle_cierre:', detErr.message);
      }
    }

    return {
      success: true,
      id_cierre: idCierreGenerado,
      mensaje: 'Cierre mensual guardado y confirmado exitosamente.',
    };
  }

  /**
   * HU15: Reporte mensual de consumo institucional (empleados y familiares)
   */
  async getReporteMensualConsumo({ mes, year, agrupadoPorArea = false }) {
    const usuarios = await this.getUsuarios();
    const startDate = new Date(Date.UTC(year, mes - 1, 1, 0, 0, 0)).toISOString();
    const endDate = new Date(Date.UTC(year, mes, 0, 23, 59, 59, 999)).toISOString();

    const { data: reservas, error: resError } = await this.supabase
      .from('vista_reservas_completas')
      .select('*')
      .gte('fecha', startDate)
      .lte('fecha', endDate)
      .neq('estado', 'CANCELADA');

    if (resError) throw resError;

    // Agrupar consumos
    const reporteMap = new Map();

    usuarios.forEach((u) => {
      reporteMap.set(u.id_usuario, {
        id_usuario: u.id_usuario,
        empleado_nombre: u.nombre_completo || `${u.nombre || ''} ${u.apellidos || ''}`.trim(),
        empleado_ci: u.ci_codigo || 'N/A',
        rol: u.rol || 'Empleado',
        area: u.rol === 'Administrador' ? 'Dirección General' : (u.rol === 'Institucion' ? 'Área Institucional' : 'Operaciones y Planta'),
        consumos_titular: 0,
        monto_titular: 0,
        consumos_familiares: 0,
        monto_familiares: 0,
        total_almuerzos: 0,
        monto_total: 0,
        familiaresMap: new Map(),
      });
    });

    (reservas || []).forEach((r) => {
      const item = reporteMap.get(r.id_usuario);
      if (!item) return;

      const costo = Number(r.costo_aplicado) || 0;
      item.total_almuerzos += 1;
      item.monto_total += costo;

      if (r.id_familiar) {
        item.consumos_familiares += 1;
        item.monto_familiares += costo;

        const famKey = r.id_familiar;
        if (!item.familiaresMap.has(famKey)) {
          item.familiaresMap.set(famKey, {
            id_familiar: famKey,
            nombre: r.familiar_nombre || 'Familiar Registrado',
            parentesco: r.familiar_parentesco || 'Familiar',
            cantidad: 0,
            monto: 0,
          });
        }
        const fam = item.familiaresMap.get(famKey);
        fam.cantidad += 1;
        fam.monto += costo;
      } else {
        item.consumos_titular += 1;
        item.monto_titular += costo;
      }
    });

    // Convertir a entidades y filtrar solo los que tengan consumos
    const resultados = [];
    reporteMap.forEach((val) => {
      if (val.total_almuerzos > 0) {
        resultados.push(
          new ReporteConsumoEntity({
            id_usuario: val.id_usuario,
            empleado_nombre: val.empleado_nombre,
            empleado_ci: val.empleado_ci,
            rol: val.rol,
            area: val.area,
            consumos_titular: val.consumos_titular,
            monto_titular: val.monto_titular,
            consumos_familiares: val.consumos_familiares,
            monto_familiares: val.monto_familiares,
            total_almuerzos: val.total_almuerzos,
            monto_total: val.monto_total,
            familiares: Array.from(val.familiaresMap.values()),
          })
        );
      }
    });

    if (agrupadoPorArea) {
      // Agrupar por área institucional
      const agrupados = {};
      resultados.forEach((r) => {
        if (!agrupados[r.area]) {
          agrupados[r.area] = [];
        }
        agrupados[r.area].push(r);
      });
      return agrupados;
    }

    return resultados;
  }

  /**
   * HU16: Reporte detallado de consumos por empleado y familiares
   */
  async getReporteDetalleEmpleado({ id_usuario, mes, year }) {
    const startDate = new Date(Date.UTC(year, mes - 1, 1, 0, 0, 0)).toISOString();
    const endDate = new Date(Date.UTC(year, mes, 0, 23, 59, 59, 999)).toISOString();

    // Obtener datos del empleado
    const { data: usuario, error: uErr } = await this.supabase
      .from('vista_usuarios')
      .select('*')
      .eq('id_usuario', id_usuario)
      .single();

    if (uErr) throw uErr;

    // Obtener todas las reservas del empleado y sus familiares en el mes
    const { data: reservas, error: resErr } = await this.supabase
      .from('vista_reservas_completas')
      .select('*')
      .eq('id_usuario', id_usuario)
      .gte('fecha', startDate)
      .lte('fecha', endDate)
      .neq('estado', 'CANCELADA')
      .order('fecha', { ascending: true });

    if (resErr) throw resErr;

    const listado = reservas || [];

    let totalTitular = 0;
    let montoTitular = 0;
    let totalFamiliares = 0;
    let montoFamiliares = 0;

    const reservasMapeadas = listado.map((r) => {
      const costo = Number(r.costo_aplicado) || 0;
      const isFamiliar = Boolean(r.id_familiar);

      if (isFamiliar) {
        totalFamiliares += 1;
        montoFamiliares += costo;
      } else {
        totalTitular += 1;
        montoTitular += costo;
      }

      return {
        id_reserva: r.id_reserva,
        fecha: r.fecha,
        plato_nombre: r.plato_nombre || 'Almuerzo Estándar',
        plato_tipo: r.plato_tipo || 'General',
        es_pension: Boolean(r.es_pension),
        beneficiario: isFamiliar
          ? `${r.familiar_nombre || 'Familiar'} (${r.familiar_parentesco || 'Familiar'})`
          : 'Titular',
        es_familiar: isFamiliar,
        costo: costo,
      };
    });

    return new ReporteDetalleEmpleadoEntity({
      id_usuario,
      empleado_nombre: usuario?.nombre_completo || `${usuario?.nombre || ''} ${usuario?.apellidos || ''}`.trim(),
      empleado_ci: usuario?.ci_codigo || 'N/A',
      rol: usuario?.rol || 'Empleado',
      reservas: reservasMapeadas,
      resumen: {
        total_titular: totalTitular,
        monto_titular: montoTitular,
        total_familiares: totalFamiliares,
        monto_familiares: montoFamiliares,
        total_almuerzos: totalTitular + totalFamiliares,
        monto_total: montoTitular + montoFamiliares,
      },
    });
  }

  /**
   * Obtiene la tabla asistencia de los usuarios ordenada por fecha
   */
  async getHistorialAsistencia({ fechaInicio, fechaFin, id_usuario } = {}) {
    let query = this.supabase
      .from('asistencia')
      .select('*')
      .order('fecha', { ascending: false })
      .order('hora_marcado', { ascending: false });

    if (fechaInicio) query = query.gte('fecha', fechaInicio);
    if (fechaFin) query = query.lte('fecha', fechaFin);
    if (id_usuario) query = query.eq('id_usuario', id_usuario);

    const { data: asistencias, error } = await query;
    if (error) throw error;

    // Obtener información de usuarios para enriquecer con nombre y CI
    const usuarios = await this.getUsuarios();
    const userMap = new Map();
    usuarios.forEach((u) => {
      userMap.set(u.id_usuario, u);
    });

    return (asistencias || []).map((a) => {
      const u = userMap.get(a.id_usuario);
      return {
        id_asistencia: a.id_asistencia,
        id_usuario: a.id_usuario,
        id_reserva: a.id_reserva,
        fecha: a.fecha,
        hora_marcado: a.hora_marcado,
        asistio: Boolean(a.asistio),
        observacion: a.observacion || '',
        creado_en: a.creado_en,
        empleado_nombre: u ? (u.nombre_completo || `${u.nombre || ''} ${u.apellidos || ''}`.trim()) : 'Usuario no registrado',
        empleado_ci: u?.ci_codigo || 'N/A',
        rol: u?.rol || 'Empleado',
      };
    });
  }
}
