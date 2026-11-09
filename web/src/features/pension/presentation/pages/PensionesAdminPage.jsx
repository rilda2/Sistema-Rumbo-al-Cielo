import React, { useState } from 'react';
import { usePensionesAdmin } from '../hooks/usePensionesAdmin';
import {
    Wallet,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Check,
    X,
    ClipboardList,
} from 'lucide-react';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const FILTROS = [
    { id: 'Pendiente', label: 'Pendientes' },
    { id: 'Confirmada', label: 'Confirmadas' },
    { id: 'Rechazada', label: 'Rechazadas' },
    { id: 'Cancelada', label: 'Canceladas' },
    { id: 'Todas', label: 'Todas' },
];

const ESTILO_ESTADO = {
    Pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
    Confirmada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Rechazada: 'bg-rose-50 text-rose-700 border-rose-200',
    Cancelada: 'bg-slate-100 text-slate-600 border-slate-200',
};

function fechaCorta(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export default function PensionesAdminPage() {
    const {
        periodo, filtro, setFiltro, conteos, visibles, loading, error, diasMinimos,
        cargar, confirmar, rechazar, mesAnterior, mesSiguiente,
    } = usePensionesAdmin();

    const [procesandoId, setProcesandoId] = useState(null);
    const [mensaje, setMensaje] = useState(null); // { tipo: 'ok' | 'error', texto }

    const etiquetaMes = `${MESES[periodo.mes - 1]} de ${periodo.year}`;

    const ejecutar = async (id, accion, textoOk) => {
        try {
            setProcesandoId(id);
            setMensaje(null);
            const resultado = await accion();
            setMensaje({ tipo: 'ok', texto: typeof textoOk === 'function' ? textoOk(resultado) : textoOk });
        } catch (err) {
            setMensaje({ tipo: 'error', texto: err.message || 'No se pudo completar la operación.' });
        } finally {
            setProcesandoId(null);
        }
    };

    const handleConfirmar = (pension) => {
        const ok = window.confirm(
            `¿Confirmar la pensión de ${pension.beneficiarioNombre} para ${etiquetaMes}?\n\n` +
            `Se programarán sus primeros ${diasMinimos} almuerzos del mes (lunes a jueves, sin feriados). Son obligatorios y no podrá cancelarlos.`
        );
        if (!ok) return;
        ejecutar(
            pension.id,
            () => confirmar(pension.id),
            (r) => `Pensión confirmada: se programaron ${r?.reservasCreadas ?? 0} almuerzos.`
        );
    };

    const handleRechazar = (pension) => {
        const ok = window.confirm(`¿Rechazar la solicitud de ${pension.beneficiarioNombre}?`);
        if (!ok) return;
        ejecutar(pension.id, () => rechazar(pension.id), 'Solicitud rechazada.');
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Encabezado */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Gestión de Pensiones</h1>
                        <p className="text-slate-500 text-xs mt-0.5">
                            Confirma las solicitudes de pensión de empleados y familiares. Al confirmar, se programan sus almuerzos obligatorios del mes.
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

            {/* Mes y filtros */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start">
                    <button type="button" onClick={mesAnterior} className="p-1.5 hover:bg-white text-slate-600 rounded-lg transition cursor-pointer" title="Mes anterior">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1.5 text-xs font-semibold text-slate-700 capitalize">{etiquetaMes}</span>
                    <button type="button" onClick={mesSiguiente} className="p-1.5 hover:bg-white text-slate-600 rounded-lg transition cursor-pointer" title="Mes siguiente">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {FILTROS.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => setFiltro(f.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${filtro === f.id
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {f.label} ({conteos[f.id] ?? 0})
                        </button>
                    ))}
                </div>
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

            {/* Lista */}
            {loading && visibles.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Cargando pensiones...
                </div>
            ) : visibles.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-12 px-4 text-center">
                    <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No hay pensiones en este estado para {etiquetaMes}.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {visibles.map(({ pension, almuerzosVigentes }) => {
                        const ocupado = procesandoId === pension.id;
                        const porcentaje =
                            almuerzosVigentes === null ? 0 : Math.min(100, Math.round((almuerzosVigentes / diasMinimos) * 100));

                        return (
                            <div key={pension.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-2">
                                        <p className="text-sm font-extrabold text-slate-900">{pension.beneficiarioNombre}</p>
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${ESTILO_ESTADO[pension.estado] || ESTILO_ESTADO.Cancelada}`}>
                                            {pension.estado}
                                        </span>
                                    </div>
                                    {pension.esParaFamiliar && (
                                        <p className="text-xs text-slate-500">Titular: <strong className="text-slate-700">{pension.titularNombre}</strong></p>
                                    )}
                                    <p className="text-xs text-slate-500">Solicitada el {fechaCorta(pension.fechaSolicitud)}</p>
                                    {pension.esConfirmada && almuerzosVigentes !== null && (
                                        <p className="text-xs text-slate-600">
                                            {almuerzosVigentes} almuerzos vigentes ({diasMinimos} obligatorios
                                            {almuerzosVigentes > diasMinimos ? ` + ${almuerzosVigentes - diasMinimos} adicionales` : ''})
                                        </p>
                                    )}
                                    {pension.esConfirmada && almuerzosVigentes !== null && (
                                        <div className="h-1.5 w-48 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${porcentaje}%` }} />
                                        </div>
                                    )}
                                </div>

                                {pension.esPendiente && (
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleRechazar(pension)}
                                            disabled={ocupado}
                                            className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition disabled:opacity-40"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            <span>Rechazar</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleConfirmar(pension)}
                                            disabled={ocupado}
                                            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-40"
                                        >
                                            {ocupado ? (
                                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Check className="w-3.5 h-3.5" />
                                            )}
                                            <span>Confirmar</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}