import 'package:flutter/material.dart';

class InstitucionScreen extends StatelessWidget {
  const InstitucionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Resumen de consumo global
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.96),
              borderRadius: BorderRadius.circular(22),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Balance del Mes en Curso',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildSummaryItem(
                      'Total Almuerzos',
                      '1,420',
                      Icons.lunch_dining,
                      Colors.blue,
                    ),
                    _buildSummaryItem(
                      'Pensionados',
                      '85',
                      Icons.people,
                      Colors.purple,
                    ),
                    _buildSummaryItem(
                      'Consumo Diario',
                      'Bs. 21,300',
                      Icons.attach_money,
                      Colors.green,
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Distribución por modalidades
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.96),
              borderRadius: BorderRadius.circular(22),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Modalidad de Consumo',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _buildProgressBar(
                  'Pensionados Mensuales',
                  0.72,
                  '72% (85 suscripciones)',
                ),
                const SizedBox(height: 10),
                _buildProgressBar(
                  'Reservas Diarias',
                  0.28,
                  '28% (33 comensales libres)',
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Distribución por departamento
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.96),
              borderRadius: BorderRadius.circular(22),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Consumo por Departamento',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _buildDeptRow(
                  'Finanzas y Contabilidad',
                  '380 almuerzos',
                  'Bs. 5,700',
                ),
                const Divider(),
                _buildDeptRow(
                  'Tecnología e Informática',
                  '420 almuerzos',
                  'Bs. 6,300',
                ),
                const Divider(),
                _buildDeptRow('Recursos Humanos', '290 almuerzos', 'Bs. 4,350'),
                const Divider(),
                _buildDeptRow(
                  'Dirección Ejecutiva',
                  '330 almuerzos',
                  'Bs. 4,950',
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Auditoría y Exportación
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.95),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              children: [
                const Text(
                  'Cierre Contable Institucional',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'El reporte de descuentos por planilla se genera automáticamente el día 25 de cada mes.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Reporte mensual exportado con éxito.'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  },
                  icon: const Icon(Icons.download),
                  label: const Text('Exportar Resumen Mensual (Excel / PDF)'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Column(
      children: [
        CircleAvatar(
          backgroundColor: color.withValues(alpha: 0.15),
          child: Icon(icon, color: color, size: 22),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        Text(
          label,
          style: TextStyle(color: Colors.grey.shade600, fontSize: 11),
        ),
      ],
    );
  }

  Widget _buildProgressBar(String title, double percentage, String caption) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              caption,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        const SizedBox(height: 6),
        LinearProgressIndicator(
          value: percentage,
          minHeight: 8,
          borderRadius: BorderRadius.circular(4),
          backgroundColor: Colors.grey.shade200,
          valueColor: AlwaysStoppedAnimation(
            percentage > 0.5 ? const Color(0xFF2563EB) : Colors.orange,
          ),
        ),
      ],
    );
  }

  Widget _buildDeptRow(String dept, String meals, String amount) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  dept,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
                Text(
                  meals,
                  style: const TextStyle(fontSize: 11.5, color: Colors.grey),
                ),
              ],
            ),
          ),
          Text(
            amount,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Color(0xFF2563EB),
            ),
          ),
        ],
      ),
    );
  }
}
