import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../auth';
import {
    pensionPolicy,
    obtenerFamiliares,
    obtenerFeriados,
    getMiPensionUseCase,
    solicitarPensionUseCase,
    cancelarPensionUseCase,
} from '../../di';

/**
 * Hook: usePension (vista del empleado)
 * Maneja el mes seleccionado (por defecto el próximo), el titular y sus familiares.
 */
export function usePension({ enabled = true } = {}) {
    const { user } = useAuth();
    const idUsuario = user?.id;

    const [periodo, setPeriodo] = useState(() => pensionPolicy.mesSiguiente());
    const [familiares, setFamiliares] = useState([]);
    const [feriados, setFeriados] = useState([]);
    const [items, setItems] = useState([]); // [{ pension, almuerzosVigentes, cancelables }]
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargar = useCallback(async () => {
        if (!enabled || !idUsuario) return;
        try {
            setLoading(true);
            setError(null);
            const [misItems, misFamiliares, misFeriados] = await Promise.all([
                getMiPensionUseCase.execute({ idUsuario, year: periodo.year, mes: periodo.mes }),
                obtenerFamiliares(idUsuario),
                obtenerFeriados().catch(() => []),
            ]);
            setItems(misItems);
            setFamiliares(misFamiliares);
            setFeriados(misFeriados);
        } catch (err) {
            setError(err.message || 'No se pudo cargar tu información de pensión.');
        } finally {
            setLoading(false);
        }
    }, [enabled, idUsuario, periodo.year, periodo.mes]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    // Titular + familiares, cada uno con su pensión del mes (si existe)
    const comensales = useMemo(() => {
        const base = [
            { clave: 'titular', idFamiliar: null, nombre: 'Tú', parentesco: null },
            ...familiares.map((f) => ({
                clave: `familiar-${f.idFamiliar}`,
                idFamiliar: f.idFamiliar,
                nombre: f.nombre,
                parentesco: f.parentesco,
            })),
        ];

        return base.map((c) => {
            const item = items.find((i) =>
                c.idFamiliar === null
                    ? i.pension.idFamiliar === null
                    : String(i.pension.idFamiliar) === String(c.idFamiliar)
            );
            const pension = item?.pension || null;
            return {
                ...c,
                pension,
                almuerzosVigentes: item?.almuerzosVigentes ?? null,
                cancelables: item?.cancelables ?? null,
                chequeoSolicitud: pensionPolicy.puedeSolicitar(periodo, new Date(), pension),
                chequeoCancelacion: pension ? pensionPolicy.puedeCancelar(pension, new Date()) : null,
            };
        });
    }, [familiares, items, periodo]);

    const resumen = useMemo(
        () => pensionPolicy.calcularResumen(periodo.year, periodo.mes, feriados),
        [periodo, feriados]
    );

    // solicitar y cancelar lanzan el error: la pantalla decide cómo mostrarlo
    const solicitar = useCallback(
        async (idFamiliar = null) => {
            await solicitarPensionUseCase.execute({
                idUsuario,
                idFamiliar,
                esFamiliar: idFamiliar !== null,
                year: periodo.year,
                mes: periodo.mes,
            });
            await cargar();
        },
        [idUsuario, periodo, cargar]
    );

    const cancelar = useCallback(
        async (idPension) => {
            await cancelarPensionUseCase.execute({ idPension });
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

    const irAlProximoMes = useCallback(() => setPeriodo(pensionPolicy.mesSiguiente()), []);

    const esMesProximo = useMemo(() => {
        const sig = pensionPolicy.mesSiguiente();
        return sig.year === periodo.year && sig.mes === periodo.mes;
    }, [periodo]);

    return {
        periodo,
        comensales,
        resumen,
        loading,
        error,
        esMesProximo,
        diasMinimos: pensionPolicy.diasMinimos,
        precioPension: pensionPolicy.precioPension,
        precioEsporadico: pensionPolicy.precioEsporadico,
        cargar,
        solicitar,
        cancelar,
        mesAnterior: () => moverMes(-1),
        mesSiguiente: () => moverMes(1),
        irAlProximoMes,
    };
}