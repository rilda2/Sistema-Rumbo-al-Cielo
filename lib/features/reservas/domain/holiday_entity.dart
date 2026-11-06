class Holiday {
  final String id;
  final DateTime date;
  final String name;
  final String? description;

  const Holiday({
    required this.id,
    required this.date,
    required this.name,
    this.description,
  });

  factory Holiday.fromJson(Map<String, dynamic> json) {
    return Holiday(
      id: json['id']?.toString() ?? '',
      date: DateTime.parse(json['date'] as String),
      name: json['name'] as String? ?? 'Feriado',
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'date':
          "${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}",
      'name': name,
      'description': description,
    };
  }

  /// Lista inicial de feriados oficiales para el control del restaurante
  static List<Holiday> get defaultHolidays => [
        Holiday(
          id: '1',
          date: DateTime(2026, 1, 1),
          name: 'Año Nuevo',
        ),
        Holiday(
          id: '2',
          date: DateTime(2026, 1, 22),
          name: 'Día del Estado Plurinacional',
        ),
        Holiday(
          id: '3',
          date: DateTime(2026, 2, 16),
          name: 'Carnaval (Lunes)',
        ),
        Holiday(
          id: '4',
          date: DateTime(2026, 2, 17),
          name: 'Carnaval (Martes)',
        ),
        Holiday(
          id: '5',
          date: DateTime(2026, 4, 3),
          name: 'Viernes Santo',
        ),
        Holiday(
          id: '6',
          date: DateTime(2026, 5, 1),
          name: 'Día del Trabajo',
        ),
        Holiday(
          id: '7',
          date: DateTime(2026, 6, 4),
          name: 'Corpus Christi',
        ),
        Holiday(
          id: '8',
          date: DateTime(2026, 8, 6),
          name: 'Día de la Independencia',
        ),
        Holiday(
          id: '9',
          date: DateTime(2026, 11, 2),
          name: 'Todos Santos',
        ),
        Holiday(
          id: '10',
          date: DateTime(2026, 12, 25),
          name: 'Navidad',
        ),
        // Feriados 2027 también contemplados
        Holiday(
          id: '11',
          date: DateTime(2027, 1, 1),
          name: 'Año Nuevo 2027',
        ),
        Holiday(
          id: '12',
          date: DateTime(2027, 5, 1),
          name: 'Día del Trabajo 2027',
        ),
        Holiday(
          id: '13',
          date: DateTime(2027, 12, 25),
          name: 'Navidad 2027',
        ),
      ];
}
