import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../auth';
import {
    reservaPolicy,
    obtenerFeriados,
    getMisReservasUseCase,
    crearReservaUseCase,
    cancelarReservaUseCase,
    obtenerFamiliares,
} from '../../di';

/**
 * Hook: useReservas
 * @param {{ enabled?: boolean }} opciones  con enabled=false no consulta nada (p. ej. para el administrador)
 */
export function useReservas({ enabled = true } = {}) {
    const { user } = useAuth();
    const idUsuario = user?.id;

    const [reservas, setReservas] = useState([]);
    const [familiares, setFamiliares] = useState([]);
    const [feriados, setFeriados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargar = useCallback(async () => {
        if (!enabled || !idUsuario) return;
        try {
            setLoading(true);
            setError(null);
            const [misReservas, misFamiliares, misFeriados] = await Promise.all([
                getMisReservasUseCase.execute(idUsuario),
                obtenerFamiliares(idUsuario),
                obtenerFeriados().catch(() => []),
            ]);
            setReservas(misReservas);
            setFamiliares(misFamiliares);
            setFeriados(misFeriados);
        } catch (err) {
            setError(err.message || 'No se pudieron cargar tus reservas.');
        } finally {
            setLoading(false);
        }
    }, [enabled, idUsuario]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    // reservar y cancelar lanzan el error: la pantalla decide cómo mostrarlo
    const reservar = useCallback(
        async (datos) => {
            const reserva = await crearReservaUseCase.execute({ idUsuario, ...datos });
            await cargar();
            return reserva;
        },
        [idUsuario, cargar]
    );

    const cancelar = useCallback(
        async (idReserva) => {
            await cancelarReservaUseCase.execute(idReserva);
            await cargar();
        },
        [cargar]
    );

    const evaluarReserva = useCallback(
        (fecha) => reservaPolicy.puedeReservar(fecha, new Date(), feriados),
        [feriados]
    );

    const evaluarCancelacion = useCallback(
        (fecha) => reservaPolicy.puedeCancelar(fecha, new Date()),
        []
    );

    // { '2026-11-06': [reserva, reserva], ... } solo con reservas activas
    const activasPorFecha = useMemo(() => {
        const mapa = {};
        reservas
            .filter((r) => r.estaActiva)
            .forEach((r) => {
                (mapa[r.fecha] = mapa[r.fecha] || []).push(r);
            });
        return mapa;
    }, [reservas]);

    return {
        reservas,
        familiares,
        loading,
        error,
        activasPorFecha,
        cargar,
        reservar,
        cancelar,
        evaluarReserva,
        evaluarCancelacion,
    };
}