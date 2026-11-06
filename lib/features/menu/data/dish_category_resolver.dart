String resolveDishCategory({required String? type, required String? name}) {
  final normalizedType = (type ?? '').trim().toLowerCase();
  final normalizedName = (name ?? '').trim().toLowerCase();

  if (normalizedName.contains('sopa') ||
      normalizedName.contains('crema') ||
      normalizedName.contains('chairo')) {
    return 'Sopa';
  }
  if (normalizedName.contains('ensalada') ||
      normalizedType.contains('entrada')) {
    return 'Entrada';
  }
  if (normalizedType.contains('postre') ||
      normalizedName.contains('postre') ||
      normalizedName.contains('dulce')) {
    return 'Postre';
  }
  if (normalizedType.contains('veget') || normalizedName.contains('vegetar')) {
    return 'Vegetariano';
  }
  if (normalizedType.contains('especial') ||
      normalizedName.contains('especial')) {
    return 'Especial';
  }
  if (normalizedType.contains('regular') ||
      normalizedType.contains('segundo') ||
      normalizedType.contains('fuerte')) {
    return 'Segundo';
  }
  return type?.trim().isNotEmpty == true ? type!.trim() : 'Segundo';
}
