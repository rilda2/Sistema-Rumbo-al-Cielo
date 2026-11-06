/**
 * Public API del Módulo Reportes
 */

// Presentación
export { default as ReportesPage } from './presentation/pages/ReportesPage';
export { useReportes } from './presentation/hooks/useReportes';
export { default as ReporteDescuentosHU14 } from './presentation/components/ReporteDescuentosHU14';
export { default as ReporteConsumoHU15 } from './presentation/components/ReporteConsumoHU15';
export { default as ReporteEmpleadoHU16 } from './presentation/components/ReporteEmpleadoHU16';
export { default as ReporteMetricasGenerales } from './presentation/components/ReporteMetricasGenerales';
export { default as TablaAsistenciasUsuarios } from './presentation/components/TablaAsistenciasUsuarios';

// Dominio - Entidades
export { CierreMensualEntity } from './domain/entities/CierreMensualEntity';
export { DetalleCierreEntity } from './domain/entities/DetalleCierreEntity';
export { ReporteConsumoEntity } from './domain/entities/ReporteConsumoEntity';
export { ReporteDetalleEmpleadoEntity } from './domain/entities/ReporteDetalleEmpleadoEntity';

// Dominio - Repositorios
export { IReportesRepository } from './domain/repositories/IReportesRepository';

// Casos de Uso e Inyección de Dependencias
export {
  generarReporteDescuentosUseCase,
  guardarCierreMensualUseCase,
  aplicarDescuentoManualUseCase,
  generarReporteConsumoMensualUseCase,
  generarReporteDetalleEmpleadoUseCase,
  getHistorialAsistenciaUseCase,
  supabaseReportesRepository,
} from './di';
