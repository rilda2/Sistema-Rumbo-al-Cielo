import { supabase } from '../../lib/supabaseClient';
import { SupabaseReportesRepository } from './data/repositories/SupabaseReportesRepository';
import { GenerarReporteDescuentosUseCase } from './domain/usecases/GenerarReporteDescuentosUseCase';
import { GuardarCierreMensualUseCase } from './domain/usecases/GuardarCierreMensualUseCase';
import { AplicarDescuentoManualUseCase } from './domain/usecases/AplicarDescuentoManualUseCase';
import { GenerarReporteConsumoMensualUseCase } from './domain/usecases/GenerarReporteConsumoMensualUseCase';
import { GenerarReporteDetalleEmpleadoUseCase } from './domain/usecases/GenerarReporteDetalleEmpleadoUseCase';
import { GetHistorialAsistenciaUseCase } from './domain/usecases/GetHistorialAsistenciaUseCase';

/**
 * Contenedor de Inyección de Dependencias (DIP) para el Módulo Reportes.
 */
export const supabaseReportesRepository = new SupabaseReportesRepository(supabase);

export const generarReporteDescuentosUseCase = new GenerarReporteDescuentosUseCase(supabaseReportesRepository);
export const guardarCierreMensualUseCase = new GuardarCierreMensualUseCase(supabaseReportesRepository);
export const aplicarDescuentoManualUseCase = new AplicarDescuentoManualUseCase();
export const generarReporteConsumoMensualUseCase = new GenerarReporteConsumoMensualUseCase(supabaseReportesRepository);
export const generarReporteDetalleEmpleadoUseCase = new GenerarReporteDetalleEmpleadoUseCase(supabaseReportesRepository);
export const getHistorialAsistenciaUseCase = new GetHistorialAsistenciaUseCase(supabaseReportesRepository);
