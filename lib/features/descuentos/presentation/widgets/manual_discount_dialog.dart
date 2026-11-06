import 'package:flutter/material.dart';
import 'package:restaurante_app/features/descuentos/domain/entities/detalle_cierre_entity.dart';

class ManualDiscountDialog extends StatefulWidget {
  final DetalleCierreEntity detalle;

  const ManualDiscountDialog({super.key, required this.detalle});

  static Future<double?> show(
    BuildContext context,
    DetalleCierreEntity detalle,
  ) {
    return showDialog<double>(
      context: context,
      builder: (_) => ManualDiscountDialog(detalle: detalle),
    );
  }

  @override
  State<ManualDiscountDialog> createState() => _ManualDiscountDialogState();
}

class _ManualDiscountDialogState extends State<ManualDiscountDialog> {
  late final TextEditingController _controller;
  String? _errorText;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(
      text: widget.detalle.totalDescontar.toStringAsFixed(2),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onConfirm() {
    final value = double.tryParse(_controller.text.trim());
    if (value == null || value < 0) {
      setState(() {
        _errorText = 'Ingrese un monto numérico válido mayor o igual a 0.';
      });
      return;
    }
    Navigator.of(context).pop(value);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.edit_note, color: Color(0xFF2563EB)),
          ),
          const SizedBox(width: 10),
          const Expanded(
            child: Text(
              'Ajuste Manual de Descuento',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.detalle.empleadoNombre,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          Text(
            'CI: ${widget.detalle.empleadoCi} · ${widget.detalle.cantidadCobrable} consumos',
            style: const TextStyle(color: Colors.grey, fontSize: 12),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Total Calculado:', style: TextStyle(fontSize: 13)),
                Text(
                  'Bs. ${(widget.detalle.cantidadCobrable * widget.detalle.precioUnitario).toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Nuevo monto a descontar (Bs.):',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _controller,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(
              prefixText: 'Bs. ',
              errorText: _errorText,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 12,
              ),
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2563EB),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          onPressed: _onConfirm,
          child: const Text('Confirmar'),
        ),
      ],
    );
  }
}

class TextInputPainter {
  final bool signed;
  final bool decimal;
  const TextInputPainter({this.signed = false, this.decimal = true});
}
