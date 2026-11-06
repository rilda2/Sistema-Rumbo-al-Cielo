import React, { useMemo, useState } from 'react';
import { useReservasAdmin } from '../hooks/useReservasAdmin';
import {
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Check,
    Users,
    Wallet,
    UtensilsCrossed,
    Clock,
} from 'lucide-react';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function fechaLarga(fecha) {
    const [y, m, d] = String(fecha).split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return `${DIAS[dt.getDay()]} ${d} de ${MESES[m - 1]} de ${y}`;
}

function EstadoBadge({ reserva }) {
    if (reserva.estaCancelada) {
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">Cancelada</span>;
    }
    if (reserva.estaEntregada) {
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Entregada</span>;
    }
    return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Pendiente</span>;
}

function Tarjeta({ icono: Icono, titulo, valor, color }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
            <div className={`p-2.5 rounded-lg ${color}`}>
                <Icono className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs font-medium text-slate-500">{titulo}</p>
                <p className="text-xl font-bold text-slate-900">{valor}</p>
            </div>
        </div>
    );
}

export default function ReservasDelDiaPage() {
    const { fecha, setFecha, cambiarDia, irAHoy, reservas, loading, error, cargar, entregar, evaluarEntrega } =
        useReservasAdmin();

    const [busqueda, setBusqueda] = useState('');
    const [entregandoId, setEntregandoId] = useState(null);
    const [mensaje, setMensaje] = useState(null); // { tipo: 'ok' | 'error', texto }

    const noCanceladas = useMemo(() => reservas.filter((r) => !r.estaCancelada), [reservas]);

    const resumen = useMemo(
        () => ({
            total: noCanceladas.length,
            pendientes: reservas.filter((r) => r.estaActiva).length,
            entregadas: reservas.filter((r) => r.estaEntregada).length,
            canceladas: reservas.filter((r) => r.estaCancelada).length,
            monto: noCanceladas.reduce((suma, r) => suma + Number(r.costoAplicado || 0), 0),
        }),
        [reservas, noCanceladas]
    );

    const porPlato = useMemo(() => {
        const mapa = new Map();
        noCanceladas.forEach((r) => {
            const clave = r.platoPrincipal || r.dishName || 'Sin plato';
            mapa.set(clave, (mapa.get(clave) || 0) + 1);
        });
        return Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
    }, [noCanceladas]);

    // Una ficha por empleado, con sus reservas propias y las de sus familiares
    const grupos = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();
        const mapa = new Map();

        reservas.forEach((r) => {
            if (!mapa.has(r.idUsuario)) {
                mapa.set(r.idUsuario, {
                    idUsuario: r.idUsuario,
                    nombre: r.empleadoNombre || 'Sin nombre',
                    ci: r.empleadoCi || '',
                    reservas: [],
                });
            }
            mapa.get(r.idUsuario).reservas.push(r);
        });

        let lista = Array.from(mapa.values());

        if (termino) {
            lista = lista.filter(
                (g) =>
                    g.nombre.toLowerCase().includes(termino) ||
                    g.ci.toLowerCase().includes(termino) ||
                    g.reservas.some((r) => (r.beneficiarioNombre || '').toLowerCase().includes(termino))
            );
        }

        return lista
            .map((g) => {
                const activas = g.reservas.filter((r) => !r.estaCancelada);
                return {
                    ...g,
                    cantidad: activas.length,
                    total: activas.reduce((suma, r) => suma + Number(r.costoAplicado || 0), 0),
                };
            })
            .sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [reservas, busqueda]);

    const chequeoEntrega = evaluarEntrega(fecha);

    const handleEntregar = async (reserva) => {
        try {
            setEntregandoId(reserva.id);
            setMensaje(null);
            await entregar(reserva.id);
            setMensaje({ tipo: 'ok', texto: `Entrega registrada: ${reserva.nombreBeneficiario}.` });
        } catch (err) {
            setMensaje({ tipo: 'error', texto: err.message || 'No se pudo registrar la entrega.' });
        } finally {
            setEntregandoId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Encabezado y selector de fecha */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Reservas del Día</h1>
                        <p className="text-slate-500 text-xs mt-0.5 capitalize">{fechaLarga(fecha)}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                        <button type="button" onClick={() => cambiarDia(-1)} className="p-1.5 hover:bg-white text-slate-600 rounded-lg transition" title="Día anterior">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={irAHoy} className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white rounded-lg transition">
                            Hoy
                        </button>
                        <button type="button" onClick={() => cambiarDia(1)} className="p-1.5 hover:bg-white text-slate-600 rounded-lg transition" title="Día siguiente">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => e.target.value && setFecha(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="button" onClick={cargar} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl border border-slate-200 transition" title="Actualizar">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Tarjeta icono={Users} titulo="Almuerzos del día" valor={resumen.total} color="bg-blue-50 text-blue-600" />
                <Tarjeta icono={Clock} titulo="Pendientes de entrega" valor={resumen.pendientes} color="bg-amber-50 text-amber-600" />
                <Tarjeta icono={CheckCircle2} titulo="Entregados" valor={resumen.entregadas} color="bg-emerald-50 text-emerald-600" />
                <Tarjeta icono={Wallet} titulo="Total a cobrar" valor={`Bs ${resumen.monto.toFixed(2)}`} color="bg-purple-50 text-purple-600" />
            </div>

            {/* Aviso de horario de entrega */}
            {!chequeoEntrega.permitido && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start space-x-2">
                    <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                    <span>{chequeoEntrega.mensaje}</span>
                </div>
            )}

            {mensaje && (
                <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-start space-x-2 border ${mensaje.tipo === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                >
                    {mensaje.tipo === 'ok' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    <span>{mensaje.texto}</span>
                </div>
            )}

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Resumen por plato (para cocina) */}
            {porPlato.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                        <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                        Platos a preparar
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {porPlato.map(([plato, cantidad]) => (
                            <span key={plato} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                                {plato}
                                <strong className="bg-blue-600 text-white rounded-full px-2 py-0.5 text-[11px]">{cantidad}</strong>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Búsqueda */}
            <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por empleado, familiar o CI..."
                    className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {busqueda && (
                    <button type="button" onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Limpiar búsqueda">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Fichas por empleado */}
            {loading && reservas.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Cargando reservas...
                </div>
            ) : grupos.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-12 px-4 text-center">
                    <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">
                        {reservas.length === 0 ? 'No hay reservas para este día.' : 'Ninguna reserva coincide con la búsqueda.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {grupos.map((g) => (
                        <div key={g.idUsuario} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="text-sm font-extrabold text-slate-900">{g.nombre}</p>
                                    <p className="text-[11px] text-slate-400 font-mono">CI: {g.ci || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">
                                        {g.cantidad} {g.cantidad === 1 ? 'almuerzo' : 'almuerzos'}
                                    </p>
                                    <p className="text-sm font-black text-emerald-700">Bs {g.total.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {g.reservas.map((r) => (
                                    <div key={r.id} className={`px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${r.estaCancelada ? 'opacity-50' : ''}`}>
                                        <div className="space-y-0.5 min-w-0">
                                            <div className="flex items-center flex-wrap gap-2">
                                                <p className="text-sm font-bold text-slate-800">
                                                    {r.nombreBeneficiario}
                                                    {!r.esParaFamiliar && <span className="text-xs font-medium text-slate-400"> (titular)</span>}
                                                </p>
                                                <EstadoBadge reserva={r} />
                                                {r.esPension && (
                                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pensión</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-600">{r.dishName || 'Almuerzo'}</p>
                                            {r.notas && <p className="text-xs text-slate-500 italic">“{r.notas}”</p>}
                                        </div>

                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="text-xs font-bold text-slate-700">Bs {Number(r.costoAplicado).toFixed(2)}</span>
                                            {r.estaActiva && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleEntregar(r)}
                                                    disabled={!chequeoEntrega.permitido || entregandoId === r.id}
                                                    title={chequeoEntrega.permitido ? 'Marcar como entregado' : chequeoEntrega.mensaje}
                                                    className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    {entregandoId === r.id ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5" />
                                                    )}
                                                    <span>Entregar</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}