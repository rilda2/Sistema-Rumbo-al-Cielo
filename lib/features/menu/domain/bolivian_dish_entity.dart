/// Resuelve la URL o ruta del asset para un plato según los datos recibidos de Supabase.
/// Soporta URLs remotas (HTTP/HTTPS de Supabase Storage / CDN), rutas de assets y nombres de archivo locales.
String resolveDishImageUrl(
  String? rawUrl, {
  String? dishName,
  int? dishId,
}) {
  final trimmed = rawUrl?.trim() ?? '';

  // 1. Si es una URL completa de Supabase Storage o CDN externo (http/https)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // 2. Si ya es una ruta relativa de assets válida (no apuntando a silpancho.png que no existe)
  if (trimmed.startsWith('assets/images/')) {
    return trimmed;
  }
  if (trimmed.startsWith('assets/') && !trimmed.contains('silpancho.png')) {
    return trimmed;
  }

  // 3. Si viene el nombre de archivo directo (ej. '01_silpancho.jpg')
  if (trimmed.endsWith('.jpg') || trimmed.endsWith('.png') || trimmed.endsWith('.jpeg')) {
    final cleanFile = trimmed.split('/').last;
    if (cleanFile != 'silpancho.png') {
      return 'assets/images/$cleanFile';
    }
  }

  // 4. Mapeo inteligente según el ID del plato
  if (dishId != null) {
    switch (dishId) {
      case 1:
        return 'assets/images/01_silpancho.jpg';
      case 2:
        return 'assets/images/02_pique_macho.jpg';
      case 3:
        return 'assets/images/03_charque_kan.jpg';
      case 4:
        return 'assets/images/04_sopa_de_mani.jpg';
      case 5:
        return 'assets/images/05_chicharron.jpg';
      case 6:
        return 'assets/images/06_fricase.jpg';
      case 7:
        return 'assets/images/07_milanesa_de_soya.jpg';
      case 8:
        return 'assets/images/08_crema_de_quinua.jpg';
      case 9:
        return 'assets/images/09_locro_de_zapallo.jpg';
      case 10:
        return 'assets/images/11_tortilla_de_verduras.jpg';
      case 11:
        return 'assets/images/10_aji_de_fideo_sin_carne.jpg';
      case 12:
        return 'assets/images/07_milanesa_de_soya.jpg';
    }
  }

  // 5. Mapeo inteligente según el nombre del plato
  final nameLower = (dishName ?? '').toLowerCase();
  if (nameLower.contains('silpancho')) {
    return 'assets/images/01_silpancho.jpg';
  } else if (nameLower.contains('pique')) {
    return 'assets/images/02_pique_macho.jpg';
  } else if (nameLower.contains('majadito') || nameLower.contains('charque')) {
    return 'assets/images/03_charque_kan.jpg';
  } else if (nameLower.contains('maní') || nameLower.contains('mani')) {
    return 'assets/images/04_sopa_de_mani.jpg';
  } else if (nameLower.contains('falso conejo') || nameLower.contains('chicharr')) {
    return 'assets/images/05_chicharron.jpg';
  } else if (nameLower.contains('saice') || nameLower.contains('fricas')) {
    return 'assets/images/06_fricase.jpg';
  } else if (nameLower.contains('soya') || nameLower.contains('papalisa')) {
    return 'assets/images/07_milanesa_de_soya.jpg';
  } else if (nameLower.contains('quinua') || nameLower.contains('chairo')) {
    return 'assets/images/08_crema_de_quinua.jpg';
  } else if (nameLower.contains('zapallo') || nameLower.contains('picante') || nameLower.contains('mondongo')) {
    return 'assets/images/09_locro_de_zapallo.jpg';
  } else if (nameLower.contains('fideo')) {
    return 'assets/images/10_aji_de_fideo_sin_carne.jpg';
  } else if (nameLower.contains('trucha') || nameLower.contains('tortilla')) {
    return 'assets/images/11_tortilla_de_verduras.jpg';
  }

  return 'assets/images/01_silpancho.jpg';
}

class PlatoCatalogo {
  final int id;
  final String nombre;
  final String descripcion;
  final String categoria;
  final String region;
  final double precio;
  final String imagenUrl;
  final bool activo;

  const PlatoCatalogo({
    required this.id,
    required this.nombre,
    required this.descripcion,
    this.categoria = 'Segundo',
    this.region = 'Bolivia',
    this.precio = 18.0,
    this.imagenUrl = 'assets/images/01_silpancho.jpg',
    this.activo = true,
  });

  factory PlatoCatalogo.fromJson(Map<String, dynamic> json) {
    final rawImg = json['imagen_url'] ?? json['imagen_path'] ?? json['image_url'];
    final idVal = json['id'] is int
        ? json['id'] as int
        : int.tryParse(json['id']?.toString() ?? '0') ?? 0;
    final nameVal = json['nombre']?.toString() ?? json['name']?.toString() ?? '';

    return PlatoCatalogo(
      id: idVal,
      nombre: nameVal,
      descripcion: json['descripcion']?.toString() ?? json['description']?.toString() ?? '',
      categoria: json['categoria']?.toString() ?? json['category']?.toString() ?? 'Segundo',
      region: json['region']?.toString() ?? 'Bolivia',
      precio: (json['precio'] as num?)?.toDouble() ??
          (json['price'] as num?)?.toDouble() ??
          18.0,
      imagenUrl: resolveDishImageUrl(
        rawImg?.toString(),
        dishName: nameVal,
        dishId: idVal,
      ),
      activo: json['activo'] == true || json['activo'] == 1 || json['is_available'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'descripcion': descripcion,
      'categoria': categoria,
      'region': region,
      'precio': precio,
      'imagen_url': imagenUrl,
      'activo': activo,
    };
  }

  PlatoCatalogo copyWith({
    int? id,
    String? nombre,
    String? descripcion,
    String? categoria,
    String? region,
    double? precio,
    String? imagenUrl,
    bool? activo,
  }) {
    return PlatoCatalogo(
      id: id ?? this.id,
      nombre: nombre ?? this.nombre,
      descripcion: descripcion ?? this.descripcion,
      categoria: categoria ?? this.categoria,
      region: region ?? this.region,
      precio: precio ?? this.precio,
      imagenUrl: imagenUrl ?? this.imagenUrl,
      activo: activo ?? this.activo,
    );
  }
}

class MenuSemanalItem {
  final int id;
  final DateTime fecha;
  final String diaSemana;
  final int platoCatalogoId;
  final String platoNombre;
  final String platoDescripcion;
  final String platoRegion;
  final String tipoPlato;
  final String estado; // 'borrador', 'publicado'
  final String imagenUrl;

  const MenuSemanalItem({
    required this.id,
    required this.fecha,
    required this.diaSemana,
    required this.platoCatalogoId,
    required this.platoNombre,
    this.platoDescripcion = '',
    this.platoRegion = 'Bolivia',
    this.tipoPlato = 'Segundo',
    this.estado = 'borrador',
    this.imagenUrl = '',
  });

  bool get isPublicado => estado.toLowerCase() == 'publicado';
  bool get isBorrador => estado.toLowerCase() == 'borrador';

  factory MenuSemanalItem.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate;
    if (json['fecha'] is DateTime) {
      parsedDate = json['fecha'] as DateTime;
    } else if (json['fecha'] != null) {
      parsedDate = DateTime.tryParse(json['fecha'].toString()) ?? DateTime.now();
    } else {
      parsedDate = DateTime.now();
    }

    String platoNom = json['plato_nombre']?.toString() ?? '';
    String platoDesc = json['plato_descripcion']?.toString() ?? '';
    String platoReg = json['plato_region']?.toString() ?? 'Bolivia';
    String? platoImg = (json['imagen_url'] ?? json['imagen_path'] ?? json['image_url'])?.toString();

    final catId = json['plato_catalogo_id'] is int
        ? json['plato_catalogo_id'] as int
        : int.tryParse(json['plato_catalogo_id']?.toString() ?? '0') ?? 0;

    if (json['platos_catalogo'] is Map) {
      final pMap = json['platos_catalogo'] as Map;
      if (platoNom.isEmpty) platoNom = pMap['nombre']?.toString() ?? '';
      if (platoDesc.isEmpty) platoDesc = pMap['descripcion']?.toString() ?? '';
      if (platoReg == 'Bolivia') platoReg = pMap['region']?.toString() ?? 'Bolivia';
      if (platoImg == null || platoImg.isEmpty) {
        platoImg = (pMap['imagen_url'] ?? pMap['imagen_path'] ?? pMap['image_url'])?.toString();
      }
    } else if (json['platos'] is Map) {
      final pMap = json['platos'] as Map;
      if (platoNom.isEmpty) platoNom = pMap['nombre']?.toString() ?? '';
      if (platoImg == null || platoImg.isEmpty) {
        platoImg = (pMap['imagen_path'] ?? pMap['imagen_url'])?.toString();
      }
    }

    final resolvedImg = resolveDishImageUrl(
      platoImg,
      dishName: platoNom,
      dishId: catId,
    );

    return MenuSemanalItem(
      id: json['id'] is int
          ? json['id'] as int
          : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      fecha: parsedDate,
      diaSemana: json['dia_semana']?.toString() ?? 'Lunes',
      platoCatalogoId: catId,
      platoNombre: platoNom.isNotEmpty ? platoNom : 'Plato Boliviano',
      platoDescripcion: platoDesc,
      platoRegion: platoReg,
      tipoPlato: json['tipo_plato']?.toString() ?? 'Segundo',
      estado: json['estado']?.toString() ?? 'borrador',
      imagenUrl: resolvedImg,
    );
  }

  Map<String, dynamic> toJson() {
    final dateStr =
        "${fecha.year.toString().padLeft(4, '0')}-${fecha.month.toString().padLeft(2, '0')}-${fecha.day.toString().padLeft(2, '0')}";
    return {
      'id': id,
      'fecha': dateStr,
      'dia_semana': diaSemana,
      'plato_catalogo_id': platoCatalogoId,
      'plato_nombre': platoNombre,
      'tipo_plato': tipoPlato,
      'estado': estado,
      'imagen_url': imagenUrl,
    };
  }

  MenuSemanalItem copyWith({
    int? id,
    DateTime? fecha,
    String? diaSemana,
    int? platoCatalogoId,
    String? platoNombre,
    String? platoDescripcion,
    String? platoRegion,
    String? tipoPlato,
    String? estado,
    String? imagenUrl,
  }) {
    return MenuSemanalItem(
      id: id ?? this.id,
      fecha: fecha ?? this.fecha,
      diaSemana: diaSemana ?? this.diaSemana,
      platoCatalogoId: platoCatalogoId ?? this.platoCatalogoId,
      platoNombre: platoNombre ?? this.platoNombre,
      platoDescripcion: platoDescripcion ?? this.platoDescripcion,
      platoRegion: platoRegion ?? this.platoRegion,
      tipoPlato: tipoPlato ?? this.tipoPlato,
      estado: estado ?? this.estado,
      imagenUrl: imagenUrl ?? this.imagenUrl,
    );
  }
}
