import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:restaurante_app/features/auth/presentation/providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _isRequestingReset = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _requestPasswordReset() async {
    final currentEmail = _emailController.text.trim();
    final resetEmailController = TextEditingController(text: currentEmail);

    final String? emailToSubmit = await showDialog<String>(
      context: context,
      builder: (dialogCtx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.lock_reset, color: Color(0xFF2563EB)),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  '¿Olvidaste tu contraseña?',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Ingresa tu correo institucional registrado para notificar al administrador. '
                'El encargado actualizará tu contraseña desde el panel administrativo.',
                style: TextStyle(fontSize: 13, color: Color(0xFF475569), height: 1.4),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: resetEmailController,
                keyboardType: TextInputType.emailAddress,
                autofocus: currentEmail.isEmpty,
                decoration: InputDecoration(
                  labelText: 'Correo electrónico',
                  hintText: 'usuario@institucion.gob.bo',
                  prefixIcon: const Icon(Icons.email_outlined),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  filled: true,
                  fillColor: Colors.grey.shade50,
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogCtx).pop(null),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () {
                final email = resetEmailController.text.trim();
                if (email.isEmpty || !email.contains('@')) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Por favor ingresa un correo electrónico válido.'),
                      backgroundColor: Colors.orange,
                    ),
                  );
                  return;
                }
                Navigator.of(dialogCtx).pop(email);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Enviar Solicitud'),
            ),
          ],
        );
      },
    );

    if (emailToSubmit == null || !mounted) return;

    setState(() => _isRequestingReset = true);
    try {
      final message = await ref
          .read(authRepositoryProvider)
          .createPasswordResetRequest(email: emailToSubmit);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: 8),
                Expanded(child: Text(message)),
              ],
            ),
            backgroundColor: Colors.green.shade700,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        final errorMsg =
            e.toString().replaceFirst(RegExp(r'^(Exception|AuthException):\s*'), '');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMsg),
            backgroundColor: Colors.redAccent,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isRequestingReset = false);
    }
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor ingresa correo y contraseña'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    final ok = await ref.read(authProvider.notifier).signIn(email, password);
    if (mounted) {
      setState(() => _isLoading = false);
      if (!ok) {
        final rawError = ref.read(authProvider.notifier).lastError ?? '';
        final cleanError = rawError
            .replaceFirst(RegExp(r'^(Exception|AuthException):\s*'), '')
            .trim();

        final String message;
        if (cleanError.contains('bloqueada') ||
            cleanError.contains('bloqueado') ||
            cleanError.contains('intentos') ||
            cleanError.contains('Intento') ||
            cleanError.contains('desactivada')) {
          message = cleanError;
        } else if (cleanError.contains('email_not_confirmed') ||
            cleanError.contains('Email not confirmed')) {
          message =
              'Tu correo aún no está confirmado. Revisa tu bandeja de entrada o solicita al administrador que confirme la cuenta.';
        } else if (cleanError.contains('email_provider_disabled')) {
          message =
              'No se puede consultar la base de datos porque el proveedor Email está deshabilitado en Supabase. Habilítalo en Authentication > Providers.';
        } else if (cleanError.contains('no tiene un perfil')) {
          message =
              'La cuenta existe, pero no tiene un perfil asociado en Supabase. Registra el perfil del usuario y vuelve a intentar.';
        } else if (cleanError.isNotEmpty) {
          message = cleanError;
        } else {
          message = 'Error al iniciar sesión. Revisa tus credenciales.';
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            backgroundColor: Colors.redAccent,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: const AssetImage('assets/mesa.jpeg'),
            fit: BoxFit.cover,
            colorFilter: ColorFilter.mode(
              Colors.black.withValues(alpha: 0.65),
              BlendMode.darken,
            ),
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Card(
                elevation: 12,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(28),
                ),
                color: Colors.white.withValues(alpha: 0.95),
                child: Padding(
                  padding: const EdgeInsets.all(28),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Encabezado
                      Center(
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Theme.of(
                              context,
                            ).colorScheme.primary.withValues(alpha: 0.12),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.restaurant,
                            size: 40,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Iniciar Sesión',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E293B),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Restaurante Institucional',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      const SizedBox(height: 28),

                      // Campo Correo
                      TextField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        decoration: InputDecoration(
                          labelText: 'Correo electrónico',
                          hintText: 'usuario@institucion.gob.bo',
                          prefixIcon: const Icon(Icons.email_outlined),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          filled: true,
                          fillColor: Colors.grey.shade50,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Campo Contraseña
                      TextField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        textInputAction: TextInputAction.done,
                        onSubmitted: (_) => _handleLogin(),
                        decoration: InputDecoration(
                          labelText: 'Contraseña',
                          prefixIcon: const Icon(Icons.lock_outline),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility_outlined
                                  : Icons.visibility_off_outlined,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          filled: true,
                          fillColor: Colors.grey.shade50,
                        ),
                      ),
                      const SizedBox(height: 24),
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: _isLoading || _isRequestingReset
                              ? null
                              : _requestPasswordReset,
                          child: _isRequestingReset
                              ? const Text('Enviando solicitud...')
                              : const Text('¿Olvidaste tu contraseña?'),
                        ),
                      ),

                      // Botón Ingresar
                      SizedBox(
                        height: 52,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Theme.of(
                              context,
                            ).colorScheme.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 4,
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2.5,
                                  ),
                                )
                              : const Text(
                                  'Ingresar al Sistema',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
