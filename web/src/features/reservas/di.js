import { SupabaseReservaRepository } from './data/repositories/SupabaseReservaRepository';
import { ReservaPolicy } from './domain/policies/ReservaPolicy';

import { GetMisReservasUseCase } from './domain/usecases/GetMisReservasUseCase';
import { GetReservasPorFechaUseCase } from './domain/usecases/GetReservasPorFechaUseCase';
import { CrearReservaUseCase } from './domain/usecases/CrearReservaUseCase';
import { CancelarReservaUseCase } from './domain/usecases/CancelarReservaUseCase';
import { MarcarEntregaUseCase } from './domain/usecases/MarcarEntregaUseCase';
import { AsignarPlatosReservasPensionUseCase } from './domain/usecases/AsignarPlatosReservasPensionUseCase';
// Los feriados los aporta el módulo Calendario (tabla excepcion_calendario)
import { getExcepcionesUseCase } from '../calendario/di';

/**
 * Composition Root / Contenedor de Inyección de Dependencias para el Módulo Reservas
 */
const reservaRepository = new SupabaseReservaRepository();

// Horarios por defecto: reservar y cancelar hasta las 09:00, entregar de 12:00 a 14:00.
// Para probar entregas fuera de horario, usa temporalmente:
// new ReservaPolicy({ inicioEntrega: '00:00', finEntrega: '23:59' })
export const asignarPlatosReservasPensionUseCase = new AsignarPlatosReservasPensionUseCase({ reservaRepository });
export const reservaPolicy = new ReservaPolicy();

export const obtenerFeriados = async () => await getExcepcionesUseCase.execute();

export const getMisReservasUseCase = new GetMisReservasUseCase(reservaRepository);
export const getReservasPorFechaUseCase = new GetReservasPorFechaUseCase(reservaRepository);
export const crearReservaUseCase = new CrearReservaUseCase({
    reservaRepository,
    policy: reservaPolicy,
    obtenerFeriados,
});
export const cancelarReservaUseCase = new CancelarReservaUseCase({
    reservaRepository,
    policy: reservaPolicy,
});
export const marcarEntregaUseCase = new MarcarEntregaUseCase({
    reservaRepository,
    policy: reservaPolicy,
});

export const obtenerFamiliares = (idUsuario) => reservaRepository.getFamiliaresDeUsuario(idUsuario);