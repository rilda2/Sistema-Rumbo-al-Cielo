import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    pensionPolicy,
    getPensionesAdminUseCase,
    confirmarPensionUseCase,
    rechazarPensionUseCase,
} from '../../di';

/**
 * Hook: usePensionesAdmin (vista del administrador)
 * Lista las pensiones del mes y permite confirmarlas o rechazarlas.
 */
export function usePensionesAdmin() {
    const [periodo, setPeriodo] = useState(() => pensionPolicy.mesSiguiente());
    const [filtro, setFiltro] = useState('Pendiente'); // 'Todas' | estado
    const [items, setItems] = useState([]); // [{ pension, almuerzosVigentes }]
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargar = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setItems(await getPensionesAdminUseCase.execute({ year: periodo.year, mes: periodo.mes }));
        } catch (err) {
            setError(err.message || 'No se pudieron cargar las pensiones.');
        } finally {
            setLoading(false);
        }
    }, [periodo.year, periodo.mes]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const conteos = useMemo(() => {
        const c = { Pendiente: 0, Confirmada: 0, Rechazada: 0, Cancelada: 0 };
        items.forEach(({ pension }) => {
            c[pension.estado] = (c[pension.estado] || 0) + 1;
        });
        return { ...c, Todas: items.length };
    }, [items]);

    const visibles = useMemo(
        () => (filtro === 'Todas' ? items : items.filter(({ pension }) => pension.estado === filtro)),
        [items, filtro]
    );

    // confirmar y rechazar lanzan el error: la pantalla decide cómo mostrarlo
    const confirmar = useCallback(
        async (idPension) => {
            const resultado = await confirmarPensionUseCase.execute({ idPension });
            await cargar();
            return resultado; // { reservasCreadas }
        },
        [cargar]
    );

    const rechazar = useCallback(
        async (idPension) => {
            await rechazarPensionUseCase.execute({ idPension });
            await cargar();
        },
        [cargar]
    );

    const moverMes = useCallback((delta) => {
        setPeriodo((p) => {
            const d = new Date(p.year, p.mes - 1 + delta, 1);
            return { year: d.getFullYear(), mes: d.getMonth() + 1 };
        });
    }, []);

    return {
        periodo,
        filtro,
        setFiltro,
        conteos,
        visibles,
        loading,
        error,
        diasMinimos: pensionPolicy.diasMinimos,
        cargar,
        confirmar,
        rechazar,
        mesAnterior: () => moverMes(-1),
        mesSiguiente: () => moverMes(1),
    };
}