import { SupabasePensionRepository } from './data/repositories/SupabasePensionRepository';
import { PensionPolicy } from './domain/policies/PensionPolicy';

import { SolicitarPensionUseCase } from './domain/usecases/SolicitarPensionUseCase';
import { CancelarPensionUseCase } from './domain/usecases/CancelarPensionUseCase';
import { GetMiPensionUseCase } from './domain/usecases/GetMiPensionUseCase';
import { GetPensionesAdminUseCase } from './domain/usecases/GetPensionesAdminUseCase';
import { ConfirmarPensionUseCase } from './domain/usecases/ConfirmarPensionUseCase';
import { RechazarPensionUseCase } from './domain/usecases/RechazarPensionUseCase';

// Familiares y feriados los aportan los módulos Reservas y Calendario
import { obtenerFamiliares, obtenerFeriados } from '../reservas/di';

/**
 * Composition Root del módulo Pensión.
 * Valores por defecto: mínimo 10 almuerzos, Bs 15 pensionado / Bs 18 esporádico.
 * (La base de datos aplica el mínimo leyendo la tabla 'configuracion'.)
 */
const pensionRepository = new SupabasePensionRepository();

export const pensionPolicy = new PensionPolicy();

export const solicitarPensionUseCase = new SolicitarPensionUseCase({ pensionRepository, policy: pensionPolicy });
export const cancelarPensionUseCase = new CancelarPensionUseCase({ pensionRepository, policy: pensionPolicy });
export const getMiPensionUseCase = new GetMiPensionUseCase({ pensionRepository, policy: pensionPolicy });
export const getPensionesAdminUseCase = new GetPensionesAdminUseCase({ pensionRepository, policy: pensionPolicy });
export const confirmarPensionUseCase = new ConfirmarPensionUseCase({ pensionRepository });
export const rechazarPensionUseCase = new RechazarPensionUseCase({ pensionRepository });

export { obtenerFamiliares, obtenerFeriados };