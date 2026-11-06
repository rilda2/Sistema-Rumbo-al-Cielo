import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:restaurante_app/features/descuentos/domain/entities/detalle_cierre_entity.dart';
import 'package:restaurante_app/features/descuentos/presentation/providers/descuentos_providers.dart';
import 'package:restaurante_app/features/descuentos/presentation/widgets/manual_discount_dialog.dart';

class DescuentosCierreScreen extends ConsumerStatefulWidget {
  const DescuentosCierreScreen({super.key});

  @override
  ConsumerState<DescuentosCierreScreen> createState() =>
      _DescuentosCierreScreenState();
}

class _DescuentosCierreScreenState
    extends ConsumerState<DescuentosCierreScreen> {
  int? _selectedMes = DateTime.now().month;
  int? _selectedYear = DateTime.now().year;

  final List<int> _meses = List.generate(12, (i) => i + 1);
  final List<int> _years = [2025, 2026, 2027];

  static const Map<int, String> _mesesNombres = {
    1: 'Enero',
    2: 'Febrero',
    3: 'Marzo',
    4: 'Abril',
    5: 'Mayo',
    6: 'Junio',
    7: 'Julio',
    8: 'Agosto',
    9: 'Septiembre',
    10: 'Octubre',
    11: 'Noviembre',
    12: 'Diciembre',
  };

  Future<void> _generarReporte() async {
    // Criterio de Aceptación HU12:
    // "Dado que no se selecciona período,
    //  Cuando presiona Generar reporte,
    //  Entonces el sistema muestra 'Debe seleccionar un período válido'."
    if (_selectedMes == null || _selectedYear == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Debe seleccionar un período válido'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    try {
      await ref
          .read(descuentosNotifierProvider.notifier)
          .generarReporte(mes: _selectedMes, year: _selectedYear);
    } catch (e) {
      if (mounted) {
        final errorMsg = e.toString().replaceAll('Exception: ', '');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMsg), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _abrirAjusteManual(DetalleCierreEntity detalle) async {
    final nuevoTotal = await ManualDiscountDialog.show(context, detalle);
    if (nuevoTotal != null) {
      ref
          .read(descuentosNotifierProvider.notifier)
          .aplicarDescuentoManual(detalle: detalle, nuevoTotal: nuevoTotal);

      if (mounted) {
        // Criterio de Aceptación HU12:
        // "Dado que el administrador intenta aplicar descuento manualmente,
        //  Cuando presiona Confirmar,
        //  Entonces el sistema muestra mensaje 'Descuento aplicado correctamente'"
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Descuento aplicado correctamente'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  Future<void> _guardarCierre() async {
    try {
      final res = await ref
          .read(descuentosNotifierProvider.notifier)
          .guardarCierre();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              res['mensaje']?.toString() ?? 'Cierre guardado exitosamente.',
            ),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al guardar cierre: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(descuentosNotifierProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cabecera del Módulo
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.96),
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(
                            0xFF2563EB,
                          ).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.price_change_outlined,
                          color: Color(0xFF2563EB),
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Reporte de Descuentos y Cobros',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1E293B),
                              ),
                            ),
                            Text(
                              'Cierre mensual, validación de antigüedad y tarifas',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 24),

                  // Filtros de Período (Mes y Año)
                  Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: DropdownButtonFormField<int?>(
                          value: _selectedMes,
                          decoration: InputDecoration(
                            labelText: 'Mes',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 10,
                            ),
                          ),
                          items: [
                            const DropdownMenuItem<int?>(
                              value: null,
                              child: Text('Seleccione mes...'),
                            ),
                            ..._meses.map(
                              (m) => DropdownMenuItem<int?>(
                                value: m,
                                child: Text(_mesesNombres[m] ?? 'Mes $m'),
                              ),
                            ),
                          ],
                          onChanged: (val) =>
                              setState(() => _selectedMes = val),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        flex: 2,
                        child: DropdownButtonFormField<int?>(
                          value: _selectedYear,
                          decoration: InputDecoration(
                            labelText: 'Año',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 10,
                            ),
                          ),
                          items: [
                            const DropdownMenuItem<int?>(
                              value: null,
                              child: Text('Año...'),
                            ),
                            ..._years.map(
                              (y) => DropdownMenuItem<int?>(
                                value: y,
                                child: Text('$y'),
                              ),
                            ),
                          ],
                          onChanged: (val) =>
                              setState(() => _selectedYear = val),
                        ),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2563EB),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 14,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: state.isLoading ? null : _generarReporte,
                        icon: state.isLoading
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.analytics_outlined, size: 18),
                        label: const Text(
                          'Generar',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Criterio de Aceptación HU12:
            // "Dado que el encargado abandona la pantalla,
            //  Cuando no presiona Generar,
            //  Entonces el sistema muestra 'Reporte no generado'."
            if (!state.isGenerated)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.94),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.receipt_long_outlined,
                      size: 54,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Reporte no generado',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF334155),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Seleccione un período (mes y año) y presione el botón "Generar" para calcular cobros, tarifas de pensión y reglas de antigüedad.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12.5,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              )
            else ...[
              // Tarjetas de Métricas Generales del Cierre
              Row(
                children: [
                  Expanded(
                    child: _buildMetricCard(
                      label: 'Total a Descontar',
                      value:
                          'Bs. ${(state.cierre?.totalGeneral ?? 0.0).toStringAsFixed(2)}',
                      icon: Icons.attach_money,
                      color: Colors.green.shade700,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildMetricCard(
                      label: 'Pensionados (Bs. 15)',
                      value:
                          '${state.detalles.where((d) => d.tipoReserva == "pension").length}',
                      icon: Icons.stars_rounded,
                      color: Colors.blue.shade700,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildMetricCard(
                      label: 'Regulares (Bs. 18)',
                      value:
                          '${state.detalles.where((d) => d.tipoReserva != "pension").length}',
                      icon: Icons.person_outline,
                      color: Colors.amber.shade800,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Botón Guardar Cierre si aún no está cerrado
              if (state.cierre?.cerrado == true)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.green.shade300),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.check_circle, color: Colors.green),
                      SizedBox(width: 10),
                      Text(
                        'Este cierre mensual ya fue guardado y cerrado en Supabase.',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.green,
                        ),
                      ),
                    ],
                  ),
                )
              else
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F172A),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    onPressed: state.isLoading ? null : _guardarCierre,
                    icon: state.isLoading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.save_outlined),
                    label: const Text(
                      'Confirmar y Guardar Cierre Mensual',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ),

              const SizedBox(height: 14),

              // Lista de Detalle por Empleado
              ...state.detalles.map((detalle) {
                final bool isPension = detalle.tipoReserva == 'pension';
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 1,
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                detalle.empleadoNombre,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14.5,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: isPension
                                    ? Colors.green.shade50
                                    : Colors.orange.shade50,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: isPension
                                      ? Colors.green.shade300
                                      : Colors.orange.shade300,
                                ),
                              ),
                              child: Text(
                                isPension
                                    ? '⭐ Pensionado (Bs. ${detalle.precioUnitario.toStringAsFixed(0)})'
                                    : 'Tarifa Regular (Bs. ${detalle.precioUnitario.toStringAsFixed(0)})',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isPension
                                      ? Colors.green.shade800
                                      : Colors.orange.shade900,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'CI: ${detalle.empleadoCi} · Antigüedad: ${detalle.antiguedadMeses} mes(es) · ${detalle.cumpleAntiguedad ? "Cumple antigüedad mínima" : "Sin descuento de antigüedad"}',
                          style: TextStyle(
                            fontSize: 11.5,
                            color: Colors.grey.shade700,
                          ),
                        ),
                        const Divider(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Consumos: ${detalle.cantidadCobrable} almuerzos',
                                  style: const TextStyle(fontSize: 12.5),
                                ),
                                if (detalle.descuentoManual > 0)
                                  Text(
                                    'Ajuste manual: -Bs. ${detalle.descuentoManual.toStringAsFixed(2)}',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: Colors.blue.shade700,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                              ],
                            ),
                            Row(
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      'Bs. ${detalle.totalDescontar.toStringAsFixed(2)}',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF2563EB),
                                      ),
                                    ),
                                    Text(
                                      detalle.estadoDescuento,
                                      style: TextStyle(
                                        fontSize: 10.5,
                                        color:
                                            detalle.estadoDescuento ==
                                                'Aprobado'
                                            ? Colors.green
                                            : Colors.grey,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(width: 8),
                                IconButton(
                                  tooltip: 'Modificar descuento manualmente',
                                  icon: const Icon(
                                    Icons.edit_note,
                                    color: Color(0xFF2563EB),
                                  ),
                                  onPressed: () => _abrirAjusteManual(detalle),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard({
    required String label,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.96),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: const TextStyle(fontSize: 10.5, color: Colors.grey),
          ),
        ],
      ),
    );
  }
}
