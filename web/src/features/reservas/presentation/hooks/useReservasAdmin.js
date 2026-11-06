import { useState, useEffect, useCallback, useRef } from 'react';
import { reservaPolicy, getReservasPorFechaUseCase, marcarEntregaUseCase } from '../../di';

function hoyLocal() {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

/**
 * Hook: useReservasAdmin
 * Reservas de un día (todas las personas) y marcado de entrega.
 */
export function useReservasAdmin() {
    const [fecha, setFecha] = useState(hoyLocal);
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const ultimaConsulta = useRef(0);

    const cargar = useCallback(async () => {
        const consulta = ++ultimaConsulta.current;
        try {
            setLoading(true);
            setError(null);
            const data = await getReservasPorFechaUseCase.execute(fecha);
            // Si el usuario cambió de día mientras cargaba, se descarta esta respuesta
            if (consulta === ultimaConsulta.current) setReservas(data);
        } catch (err) {
            if (consulta === ultimaConsulta.current) {
                setError(err.message || 'No se pudieron cargar las reservas.');
            }
        } finally {
            if (consulta === ultimaConsulta.current) setLoading(false);
        }
    }, [fecha]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const cambiarDia = useCallback((delta) => {
        setFecha((actual) => {
            const [y, m, d] = actual.split('-').map(Number);
            const nueva = new Date(y, m - 1, d + delta);
            return `${nueva.getFullYear()}-${String(nueva.getMonth() + 1).padStart(2, '0')}-${String(nueva.getDate()).padStart(2, '0')}`;
        });
    }, []);

    const irAHoy = useCallback(() => setFecha(hoyLocal()), []);

    // Lanza el error: la pantalla decide cómo mostrarlo
    const entregar = useCallback(
        async (idReserva) => {
            await marcarEntregaUseCase.execute(idReserva);
            await cargar();
        },
        [cargar]
    );

    const evaluarEntrega = useCallback(
        (fechaReserva) => reservaPolicy.puedeEntregar(fechaReserva, new Date()),
        []
    );

    return { fecha, setFecha, cambiarDia, irAHoy, reservas, loading, error, cargar, entregar, evaluarEntrega };
}