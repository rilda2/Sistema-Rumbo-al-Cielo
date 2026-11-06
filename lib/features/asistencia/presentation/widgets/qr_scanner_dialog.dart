import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:restaurante_app/features/asistencia/domain/entities/qr_asistencia_result.dart';
import 'package:restaurante_app/features/asistencia/presentation/providers/asistencia_providers.dart';

class QrScannerDialog extends ConsumerStatefulWidget {
  final ValueChanged<QrAsistenciaResult>? onScanResult;

  const QrScannerDialog({super.key, this.onScanResult});

  static Future<QrAsistenciaResult?> show(BuildContext context) {
    return showDialog<QrAsistenciaResult>(
      context: context,
      barrierDismissible: false,
      builder: (_) => const QrScannerDialog(),
    );
  }

  @override
  ConsumerState<QrScannerDialog> createState() => _QrScannerDialogState();
}

class _QrScannerDialogState extends ConsumerState<QrScannerDialog> {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
    torchEnabled: false,
  );

  final TextEditingController _manualInputController = TextEditingController();
  bool _isProcessing = false;
  bool _showManualInput = false;
  QrAsistenciaResult? _lastResult;

  @override
  void dispose() {
    _scannerController.dispose();
    _manualInputController.dispose();
    super.dispose();
  }

  Future<void> _processCode(String rawCode) async {
    if (_isProcessing || rawCode.trim().isEmpty) return;
    setState(() {
      _isProcessing = true;
      _lastResult = null;
    });

    try {
      final useCase = ref.read(validarAsistenciaQrUseCaseProvider);
      final result = await useCase.execute(rawCode);

      if (mounted) {
        setState(() {
          _lastResult = result;
          _isProcessing = false;
        });

        widget.onScanResult?.call(result);

        // Si fue exitoso o error específico, mostrar feedback y cerrar tras breve delay o botón
        if (result.isSuccess) {
          Future.delayed(const Duration(milliseconds: 1400), () {
            if (mounted) {
              Navigator.of(context).pop(result);
            }
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _lastResult = QrAsistenciaResult(
            status: QrAsistenciaStatus.error,
            mensaje: 'Error: $e',
          );
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: Colors.white,
      clipBehavior: Clip.antiAlias,
      child: SizedBox(
        width: 440,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Cabecera
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              color: const Color(0xFF1E293B),
              child: Row(
                children: [
                  const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 24),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Escanear Ficha Virtual (HU11)',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Control de Asistencia del Comedor',
                          style: TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),

            // Visor de Cámara o Input Manual
            if (!_showManualInput)
              SizedBox(
                height: 280,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    MobileScanner(
                      controller: _scannerController,
                      onDetect: (capture) {
                        final barcodes = capture.barcodes;
                        for (final barcode in barcodes) {
                          final value = barcode.rawValue;
                          if (value != null && value.isNotEmpty) {
                            _processCode(value);
                            break;
                          }
                        }
                      },
                    ),

                    // Marco visual del escáner
                    Container(
                      width: 200,
                      height: 200,
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: _isProcessing
                              ? Colors.amber
                              : const Color(0xFF2563EB),
                          width: 3,
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),

                    if (_isProcessing)
                      Container(
                        color: Colors.black45,
                        child: const Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircularProgressIndicator(color: Colors.white),
                              SizedBox(height: 12),
                              Text(
                                'Validando Ficha Virtual...',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ),

                    // Controles de cámara (Flash / Flip)
                    Positioned(
                      bottom: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: ValueListenableBuilder(
                                valueListenable: _scannerController,
                                builder: (context, state, child) {
                                  switch (state.torchState) {
                                    case TorchState.on:
                                      return const Icon(
                                        Icons.flash_on,
                                        color: Colors.amber,
                                        size: 20,
                                      );
                                    case TorchState.off:
                                    case TorchState.auto:
                                    default:
                                      return const Icon(
                                        Icons.flash_off,
                                        color: Colors.white,
                                        size: 20,
                                      );
                                  }
                                },
                              ),
                              onPressed: () => _scannerController.toggleTorch(),
                            ),
                            IconButton(
                              icon: const Icon(Icons.cameraswitch_outlined, color: Colors.white, size: 20),
                              onPressed: () => _scannerController.switchCamera(),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              )
            else
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Ingreso manual de código de reserva:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _manualInputController,
                      decoration: InputDecoration(
                        hintText: 'Ej. 12, reserva:12 o #12',
                        prefixIcon: const Icon(Icons.vpn_key_outlined),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2563EB),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: _isProcessing
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Icon(Icons.verified_outlined, size: 18),
                        label: Text(_isProcessing ? 'Validando...' : 'Validar Ficha Manual'),
                        onPressed: _isProcessing
                            ? null
                            : () => _processCode(_manualInputController.text),
                      ),
                    ),
                  ],
                ),
              ),

            // Resultado de la validación (Criterios de Aceptación HU11)
            if (_lastResult != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                margin: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: _lastResult!.isSuccess
                      ? Colors.green.shade50
                      : (_lastResult!.status == QrAsistenciaStatus.fichaExpirada ||
                              _lastResult!.status == QrAsistenciaStatus.registradoMultiplesVeces
                          ? Colors.red.shade50
                          : Colors.orange.shade50),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: _lastResult!.isSuccess
                        ? Colors.green.shade400
                        : (_lastResult!.status == QrAsistenciaStatus.fichaExpirada ||
                                _lastResult!.status == QrAsistenciaStatus.registradoMultiplesVeces
                            ? Colors.red.shade400
                            : Colors.orange.shade400),
                    width: 1.5,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          _lastResult!.isSuccess
                              ? Icons.check_circle_rounded
                              : Icons.error_outline_rounded,
                          color: _lastResult!.isSuccess
                              ? Colors.green.shade700
                              : Colors.red.shade700,
                          size: 22,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _lastResult!.mensaje,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: _lastResult!.isSuccess
                                  ? Colors.green.shade900
                                  : Colors.red.shade900,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (_lastResult!.usuarioNombre != null) ...[
                      const SizedBox(height: 6),
                      Text(
                        'Comensal: ${_lastResult!.usuarioNombre}',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ],
                    if (_lastResult!.platoNombre != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        'Plato: ${_lastResult!.platoNombre}',
                        style: const TextStyle(fontSize: 12, color: Colors.black87),
                      ),
                    ],
                  ],
                ),
              ),

            // Botón alternar entre Cámara y Entrada Manual
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton.icon(
                    icon: Icon(
                      _showManualInput ? Icons.camera_alt_outlined : Icons.keyboard_outlined,
                      size: 18,
                    ),
                    label: Text(
                      _showManualInput ? 'Usar Cámara' : 'Ingresar código manual',
                      style: const TextStyle(fontSize: 12.5),
                    ),
                    onPressed: () {
                      setState(() {
                        _showManualInput = !_showManualInput;
                        _lastResult = null;
                      });
                    },
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(_lastResult),
                    child: const Text('Cerrar'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
