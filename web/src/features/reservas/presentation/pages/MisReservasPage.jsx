import React, { useState, useMemo } from 'react';
import { useReservas } from '../hooks/useReservas';
import {
    ClipboardList,
    CalendarCheck,
    History,
    Trash2,
    AlertCircle,
    CheckCircle2,
    UtensilsCrossed,
    RefreshCw,
} from 'lucide-react';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// 'YYYY-MM-DD' -> "viernes 6 de noviembre de 2026" (sin problemas de zona horaria)
function fechaLarga(fecha) {
    const [y, m, d] = String(fecha).split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return `${DIAS[dt.getDay()]} ${d} de ${MESES[m - 1]} de ${y}`;
}

function hoyLocal() {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

function EstadoBadge({ reserva }) {
    if (reserva.estaCancelada) {
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">Cancelada</span>;
    }
    if (reserva.estaEntregada) {
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Entregada</span>;
    }
    return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Confirmada</span>;
}

export default function MisReservasPage() {
    const { reservas, loading, error, cargar, cancelar, evaluarCancelacion } = useReservas();
    const [tab, setTab] = useState('proximas');
    const [cancelandoId, setCancelandoId] = useState(null);
    const [mensaje, setMensaje] = useState(null); // { tipo: 'ok' | 'error', texto }

    const hoy = hoyLocal();

    const proximas = useMemo(
        () =>
            reservas
                .filter((r) => r.estaActiva && r.fecha >= hoy)
                .sort((a, b) => a.fecha.localeCompare(b.fecha)),
        [reservas, hoy]
    );

    const historial = useMemo(
        () => reservas.filter((r) => !(r.estaActiva && r.fecha >= hoy)),
        [reservas, hoy]
    );

    const handleCancelar = async (reserva) => {
        const ok = window.confirm(
            `¿Cancelar la reserva de ${reserva.nombreBeneficiario} para el ${fechaLarga(reserva.fecha)}?`
        );
        if (!ok) return;

        try {
            setCancelandoId(reserva.id);
            setMensaje(null);
            await cancelar(reserva.id);
            setMensaje({ tipo: 'ok', texto: 'Reserva cancelada correctamente.' });
        } catch (err) {
            setMensaje({ tipo: 'error', texto: err.message || 'No se pudo cancelar la reserva.' });
        } finally {
            setCancelandoId(null);
        }
    };

    const lista = tab === 'proximas' ? proximas : historial;

    const renderReserva = (r) => {
        const chequeo = tab === 'proximas'
            ? (r.esObligatoria
                ? { permitido: false, mensaje: 'Almuerzo obligatorio de tu pensión: no se puede cancelar.' }
                : evaluarCancelacion(r.fecha))
            : null;

        return (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                        <p className="text-sm font-extrabold text-slate-900 capitalize">{fechaLarga(r.fecha)}</p>
                        <EstadoBadge reserva={r} />
                        {r.esPension && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pensión</span>
                        )}
                        {r.esObligatoria && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Obligatorio</span>
                        )}
                    </div>
                    <p className="text-sm text-slate-700 flex items-start gap-1.5">
                        <UtensilsCrossed className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{r.dishName || 'Almuerzo'}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                        Para: <strong className="text-slate-700">{r.nombreBeneficiario}</strong>
                        {!r.esParaFamiliar && ' (Tú)'} · Bs {Number(r.costoAplicado).toFixed(2)}
                    </p>
                    {r.notas && <p className="text-xs text-slate-500 italic">“{r.notas}”</p>}
                </div>

                {tab === 'proximas' && (
                    <div className="flex flex-col items-start sm:items-end gap-1 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => handleCancelar(r)}
                            disabled={!chequeo.permitido || cancelandoId === r.id}
                            title={chequeo.permitido ? 'Cancelar reserva' : chequeo.mensaje}
                            className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {cancelandoId === r.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                            )}
                            <span>Cancelar</span>
                        </button>
                        {!chequeo.permitido && (
                            <p className="text-[10px] text-slate-400 max-w-[220px] sm:text-right">{chequeo.mensaje}</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Encabezado */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Mis Reservas</h1>
                        <p className="text-slate-500 text-xs mt-0.5">
                            Tus almuerzos reservados y los de tus familiares. Puedes cancelar hasta las 09:00 del día del almuerzo.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={cargar}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl border border-slate-200 transition"
                    title="Actualizar"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Pestañas */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setTab('proximas')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${tab === 'proximas' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Próximas ({proximas.length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => setTab('historial')}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${tab === 'historial' ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    <History className="w-4 h-4" />
                    <span>Historial ({historial.length})</span>
                </button>
            </div>

            {/* Mensajes */}
            {mensaje && (
                <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-start space-x-2 border ${mensaje.tipo === 'ok'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                >
                    {mensaje.tipo === 'ok' ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{mensaje.texto}</span>
                </div>
            )}

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Lista */}
            {loading && reservas.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Cargando tus reservas...
                </div>
            ) : lista.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-12 px-4 text-center">
                    <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">
                        {tab === 'proximas' ? 'No tienes reservas próximas.' : 'Aún no tienes reservas en el historial.'}
                    </p>
                    {tab === 'proximas' && (
                        <p className="text-xs text-slate-400 mt-1">Reserva desde la pestaña “Ver Menú”.</p>
                    )}
                </div>
            ) : (
                <div className="space-y-3">{lista.map(renderReserva)}</div>
            )}
        </div>
    );
}