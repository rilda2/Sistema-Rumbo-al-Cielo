import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../../../../components/Modal';
import { armarCombo } from '../../domain/policies/armarCombo';
import { UtensilsCrossed, AlertCircle, Check } from 'lucide-react';

const norm = (s) => String(s || '').trim().toLowerCase();
const NO_PRINCIPALES = ['sopa', 'entrada', 'postre', 'bebida'];

/**
 * Modal para reservar el almuerzo de un día, para el titular o un familiar.
 */
export default function ReservarModal({
    isOpen,
    onClose,
    fecha,
    etiquetaDia,
    menu,
    familiares = [],
    reservasActivasDia = [],
    evaluacion,
    onConfirmar,
}) {
    const [beneficiario, setBeneficiario] = useState(null);
    const [idPlatoPrincipal, setIdPlatoPrincipal] = useState(null);
    const [notas, setNotas] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(null);

    const opciones = useMemo(
        () => [
            { key: 'titular', label: 'Para mí' },
            ...familiares.map((f) => ({
                key: String(f.idFamiliar),
                label: `${f.nombre} (${f.parentesco})`,
            })),
        ],
        [familiares]
    );

    const yaReservados = useMemo(
        () =>
            new Set(
                reservasActivasDia.map((r) => (r.esParaFamiliar ? String(r.idFamiliar) : 'titular'))
            ),
        [reservasActivasDia]
    );

    const platos = menu?.platos || [];
    const principales = platos.filter((p) => !NO_PRINCIPALES.includes(norm(p.categoria)));
    const combo = armarCombo(platos, idPlatoPrincipal);

    // Al abrir: elegir el primer beneficiario libre y limpiar el formulario
    useEffect(() => {
        if (!isOpen) return;
        const libre = opciones.find((o) => !yaReservados.has(o.key));
        setBeneficiario(libre ? libre.key : null);
        setIdPlatoPrincipal(principales[0]?.id_plato ?? null);
        setNotas('');
        setError(null);
        setExito(null);
    }, [isOpen, fecha]);

    const permitido = evaluacion ? evaluacion.permitido : true;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (beneficiario === null) {
            setError('Todos los beneficiarios ya tienen una reserva para este día.');
            return;
        }

        try {
            setEnviando(true);
            const reserva = await onConfirmar({
                fecha,
                menu,
                idFamiliar: beneficiario === 'titular' ? null : Number(beneficiario),
                idPlatoPrincipal,
                notas,
            });
            setExito(reserva);
        } catch (err) {
            setError(err.message || 'No se pudo crear la reserva.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Reservar almuerzo"
            subtitle={etiquetaDia}
            icon={UtensilsCrossed}
            maxWidth="max-w-md"
        >
            {exito ? (
                <div className="text-center py-2 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">¡Reserva confirmada!</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                        <p className="font-semibold">{exito.dishName}</p>
                        <p>Para: {exito.esParaFamiliar ? exito.nombreBeneficiario : 'ti'}</p>
                        <p className="font-bold text-emerald-700">Costo: Bs {Number(exito.costoAplicado).toFixed(2)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-sm transition"
                    >
                        Cerrar
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!permitido && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                            <span>{evaluacion.mensaje}</span>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Beneficiario */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            ¿Para quién es?
                        </label>
                        <div className="space-y-1.5">
                            {opciones.map((o) => {
                                const reservado = yaReservados.has(o.key);
                                const seleccionado = beneficiario === o.key;
                                return (
                                    <button
                                        key={o.key}
                                        type="button"
                                        disabled={reservado}
                                        onClick={() => setBeneficiario(o.key)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-sm border transition ${reservado
                                                ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
                                                : seleccionado
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {o.label}
                                        {reservado && <span className="text-[11px] ml-2">(ya reservado)</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Plato principal (solo si el día tiene varios) */}
                    {principales.length > 1 && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Plato principal
                            </label>
                            <div className="space-y-1.5">
                                {principales.map((p) => (
                                    <button
                                        key={p.id_plato}
                                        type="button"
                                        onClick={() => setIdPlatoPrincipal(p.id_plato)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-sm border transition ${Number(idPlatoPrincipal) === Number(p.id_plato)
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {p.nombre}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Vista previa del combo */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                        <span className="font-bold text-slate-700 block mb-0.5">Tu almuerzo</span>
                        {combo.dishName}
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Observaciones (opcional)
                        </label>
                        <textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            rows={2}
                            placeholder="Ej. Sin locoto"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        />
                    </div>

                    <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={enviando || !permitido || beneficiario === null}
                            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition disabled:opacity-50"
                        >
                            {enviando ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>Confirmar reserva</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}