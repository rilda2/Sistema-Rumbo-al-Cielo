import 'package:flutter_test/flutter_test.dart';
import 'package:restaurante_app/core/config/supabase_config.dart';

void main() {
  group('Supabase Configuration & Connectivity Verification', () {
    test('Configuración: Las constantes de conexión coinciden con resumen.md y db.md', () {
      expect(
        SupabaseConfig.supabaseUrl,
        equals('https://qnieqczrdyxyhpepjduj.supabase.co'),
      );
      expect(
        SupabaseConfig.supabaseAnonKey,
        equals('sb_publishable_s7ww56WzXyW76KlH-cqvfQ_SgdpLsX7'),
      );
    });

    test('Diagnóstico: checkConnectionHealth reporta estado y configuración de forma controlada', () async {
      final health = await SupabaseConfig.checkConnectionHealth();
      expect(health.containsKey('connected'), isTrue);
      expect(health.containsKey('url'), isTrue);
      expect(health['url'], equals('https://qnieqczrdyxyhpepjduj.supabase.co'));
    });

    test('Resiliencia: Si Supabase no está conectado, el cliente retorna null sin lanzar excepciones', () {
      expect(() => SupabaseConfig.client, returnsNormally);
    });
  });
}
