import 'dart:io';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Recursos Multimedia y Migración de la Tabla Platos', () {
    final expectedImages = [
      '01_silpancho.jpg',
      '02_pique_macho.jpg',
      '03_charque_kan.jpg',
      '04_sopa_de_mani.jpg',
      '05_chicharron.jpg',
      '06_fricase.jpg',
      '07_milanesa_de_soya.jpg',
      '08_crema_de_quinua.jpg',
      '09_locro_de_zapallo.jpg',
      '10_aji_de_fideo_sin_carne.jpg',
      '11_tortilla_de_verduras.jpg',
    ];

    test('1. Directorio assets/images contiene los 11 archivos de platos con nombres exactos', () {
      final imagesDir = Directory('assets/images');
      expect(imagesDir.existsSync(), isTrue, reason: 'El directorio assets/images debe existir');

      for (final imgName in expectedImages) {
        final file = File('assets/images/$imgName');
        expect(file.existsSync(), isTrue, reason: 'El archivo $imgName debe existir en assets/images/');
        expect(file.lengthSync(), greaterThan(1000), reason: 'El archivo $imgName debe tener contenido real');
      }
    });

    test('2. pubspec.yaml registra la carpeta assets/images/', () {
      final pubspec = File('pubspec.yaml');
      expect(pubspec.existsSync(), isTrue);
      final content = pubspec.readAsStringSync();
      expect(content.contains('- assets/images/'), isTrue, reason: 'pubspec.yaml debe declarar - assets/images/');
    });

    test('3. Script SQL update_imagenes_platos.sql contiene los 11 updates y ALTER TABLE', () {
      final sqlFile = File('supabase/migrations/update_imagenes_platos.sql');
      expect(sqlFile.existsSync(), isTrue, reason: 'El script de migración SQL debe existir en supabase/migrations/');

      final sqlContent = sqlFile.readAsStringSync();
      expect(sqlContent.contains('ALTER TABLE public.platos'), isTrue);
      expect(sqlContent.contains('ADD COLUMN IF NOT EXISTS imagen_path TEXT'), isTrue);

      for (int i = 0; i < expectedImages.length; i++) {
        final id = i + 1;
        final img = expectedImages[i];
        final expectedStatement = "update platos set imagen_path = '$img' where id = $id;";
        expect(
          sqlContent.toLowerCase().contains(expectedStatement.toLowerCase()),
          isTrue,
          reason: 'Debe contener la sentencia: $expectedStatement',
        );
      }
    });
  });
}
