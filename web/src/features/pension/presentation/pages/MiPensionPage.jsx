import React, { useState } from 'react';
import { usePension } from '../hooks/usePension';
import {
    Wallet,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Info,
    User,
    Users,
    Clock,
} from 'lucide-react';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function EstadoBadge({ pension }) {
    if (pension?.esConfirmada) {
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Pensionado</span>;
    }
    if (pension?.esPendiente) {
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pendiente de confirmación</span>;
    }
    if (pension?.esRechazada) {
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">Rechazada</span>;
    }
    return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">Sin pensión</span>;
}

export default function MiPensionPage() {
    const {
        periodo, comensales, resumen, loading, error, esMesProximo,
        diasMinimos, precioPension, precioEsporadico,
        cargar, solicitar, cancelar, mesAnterior, mesSiguiente, irAlProximoMes,
    } = usePension();

    const [procesandoId, setProcesandoId] = useState(null);
    const [mensaje, setMensaje] = useState(null); // { tipo: 'ok' | 'error', texto }

    const etiquetaMes = `${MESES[periodo.mes - 1]} de ${periodo.year}`;

    const ejecutar = async (clave, accion, textoOk) => {
        try {
            setProcesandoId(clave);
            setMensaje(null);
            await accion();
            setMensaje({ tipo: 'ok', texto: textoOk });
        } catch (err) {
            setMensaje({ tipo: 'error', texto: err.message || 'No se pudo completar la operación.' });
        } finally {
            setProcesandoId(null);
        }
    };

    const handleSolicitar = (c) => {
        const ok = window.confirm(
            `¿Solicitar pensión de ${etiquetaMes} para ${c.idFamiliar === null ? 'ti' : c.nombre}?\n\n` +
            `Pagarás Bs ${precioPension} por almuerzo y debes consumir al menos ${diasMinimos} almuerzos en el mes. ` +
            'El administrador debe confirmar la solicitud.'
        );
        if (!ok) return;
        ejecutar(
            c.clave,
            () => solicitar(c.idFamiliar),
            'Solicitud enviada. El administrador debe confirmarla para programar tus almuerzos.'
        );
    };

    const handleCancelar = (c) => {
        const ok = window.confirm(`¿Cancelar la pensión de ${etiquetaMes} para ${c.idFamiliar === null ? 'ti' : c.nombre}?`);
        if (!ok) return;
        ejecutar(c.clave, () => cancelar(c.pension.id), 'Pensión cancelada correctamente.');
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Encabezado */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Mi Pensión</h1>
                        <p className="text-slate-500 text-xs mt-0.5">
                            Pensiónate antes de que inicie el mes y paga Bs {precioPension} por almuerzo en lugar de Bs {precioEsporadico}.
                            Debes consumir al menos {diasMinimos} almuerzos al mes.
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

            {/* Selector de mes */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-slate-900 capitalize">{etiquetaMes}</h2>
                    <p className="text-xs text-slate-500">
                        {esMesProximo ? 'Próximo mes: aún puedes solicitar o cancelar.' : 'Mes distinto al próximo.'}
                    </p>
                </div>
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                    <button type="button" onClick={mesAnterior} className="p-1.5 hover:bg-white text-slate-600 rounded-lg transition cursor-pointer" title="Mes anterior">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={irAlProximoMes} className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-white rounded-lg transition cursor-pointer">
                        Próximo mes
                    </button>
                    <button type="button" onClick={mesSiguiente} className="p-1.5 hover:bg-white text-slate-600 rounded-lg transition cursor-pointer" title="Mes siguiente">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Resumen del mes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
                    <p className="text-xs text-slate-500">Días de atención</p>
                    <p className="text-2xl font-black text-slate-900">{resumen.diasHabiles}</p>
                    <p className="text-[11px] text-slate-400">Lunes a jueves, sin feriados</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
                    <p className="text-xs text-slate-500">Tarifa de pensionado</p>
                    <p className="text-2xl font-black text-slate-900">Bs {resumen.precioPorDia.toFixed(2)}</p>
                    <p className="text-[11px] text-slate-400">Ahorras Bs {resumen.ahorroPorDia.toFixed(2)} por almuerzo</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
                    <p className="text-xs text-slate-500">Pago mínimo del mes</p>
                    <p className="text-2xl font-black text-slate-900">Bs {resumen.pagoMinimo.toFixed(2)}</p>
                    <p className="text-[11px] text-slate-400">{resumen.almuerzosObligatorios} almuerzos obligatorios</p>
                </div>
            </div>

            {/* Reglas */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-slate-700 flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>
                    Al confirmarse tu pensión se programan {diasMinimos} almuerzos obligatorios del mes: no se pueden cancelar
                    y se cobran aunque no asistas. A partir del almuerzo {diasMinimos + 1} reservas en "Ver Menú" los días que quieras
                    (también a Bs {precioPension}) y puedes cancelarlos hasta las 09:00. Cada familiar se pensiona por separado.
                </p>
            </div>

            {/* Mensajes */}
            {mensaje && (
                <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-start space-x-2 border ${mensaje.tipo === 'ok'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
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

            {/* Comensales */}
            {loading && comensales.every((c) => !c.pension) ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Cargando tu pensión...
                </div>
            ) : (
                <div className="space-y-3">
                    {comensales.map((c) => {
                        const p = c.pension;
                        const ocupado = procesandoId === c.clave;
                        const puedeSolicitar = !p?.esVigente;

                        return (
                            <div key={c.clave} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-2">
                                        {c.idFamiliar === null ? <User className="w-4 h-4 text-slate-400" /> : <Users className="w-4 h-4 text-slate-400" />}
                                        <p className="text-sm font-extrabold text-slate-900">
                                            {c.nombre}
                                            {c.parentesco && <span className="text-xs font-medium text-slate-500"> ({c.parentesco})</span>}
                                        </p>
                                        <EstadoBadge pension={p} />
                                    </div>

                                    {p?.esConfirmada && (
                                        <p className="text-xs text-slate-600">
                                            {diasMinimos} almuerzos obligatorios programados en {MESES[periodo.mes - 1]} (Bs {precioPension} c/u, no cancelables).{' '}
                                            {c.cancelables > 0
                                                ? `Además tienes ${c.cancelables} adicional${c.cancelables === 1 ? '' : 'es'} que sí puedes cancelar hasta las 09:00.`
                                                : `Desde tu almuerzo ${diasMinimos + 1} puedes reservar en "Ver Menú" y cancelar hasta las 09:00.`}
                                        </p>
                                    )}
                                    {p?.esPendiente && (
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" /> El administrador aún no confirma esta solicitud.
                                        </p>
                                    )}
                                    {p?.esRechazada && (
                                        <p className="text-xs text-slate-500">El administrador rechazó la solicitud. Puedes volver a solicitarla.</p>
                                    )}
                                </div>

                                <div className="flex flex-col items-start sm:items-end gap-1 flex-shrink-0">
                                    {puedeSolicitar ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleSolicitar(c)}
                                                disabled={!c.chequeoSolicitud.permitido || ocupado}
                                                title={c.chequeoSolicitud.permitido ? 'Solicitar pensión' : c.chequeoSolicitud.mensaje}
                                                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                {ocupado && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                                <span>Solicitar pensión</span>
                                            </button>
                                            {!c.chequeoSolicitud.permitido && (
                                                <p className="text-[10px] text-slate-400 max-w-[220px] sm:text-right">{c.chequeoSolicitud.mensaje}</p>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleCancelar(c)}
                                                disabled={!c.chequeoCancelacion?.permitido || ocupado}
                                                title={c.chequeoCancelacion?.permitido ? 'Cancelar' : c.chequeoCancelacion?.mensaje}
                                                className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                {ocupado && <div className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />}
                                                <span>{p.esPendiente ? 'Cancelar solicitud' : 'Cancelar pensión'}</span>
                                            </button>
                                            {!c.chequeoCancelacion?.permitido && (
                                                <p className="text-[10px] text-slate-400 max-w-[220px] sm:text-right">{c.chequeoCancelacion?.mensaje}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}