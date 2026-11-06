import 'package:intl/intl.dart';

class AppDateUtils {
  static bool isSameDay(DateTime? a, DateTime? b) {
    if (a == null || b == null) return false;
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  static bool isWeekend(DateTime date) {
    return date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;
  }

  static String formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy').format(date);
  }

  static String formatShortDate(DateTime date) {
    return DateFormat('dd/MM').format(date);
  }

  static String formatFullDate(DateTime date) {
    final weekdays = [
      '',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];
    final months = [
      '',
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    final weekdayName = weekdays[date.weekday];
    final monthName = months[date.month];
    return '$weekdayName, ${date.day} de $monthName de ${date.year}';
  }

  static String getMonthName(int month) {
    const months = [
      '',
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    if (month >= 1 && month <= 12) return months[month];
    return '';
  }

  static String getDiaSemana(DateTime date) {
    const weekdays = [
      '',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];
    if (date.weekday >= 1 && date.weekday <= 7) return weekdays[date.weekday];
    return 'Lunes';
  }

  static String getWeekdayName(DateTime date) => getDiaSemana(date);

  static DateTime getMondayOfWeek(DateTime date) {
    return DateTime(date.year, date.month, date.day)
        .subtract(Duration(days: date.weekday - 1));
  }

  static String getDayOfWeekAbbr(DateTime date) {
    const abbrs = ['', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
    if (date.weekday >= 1 && date.weekday <= 7) return abbrs[date.weekday];
    return 'LUN';
  }

  /// Cuenta la cantidad de días hábiles de un mes dado,
  /// excluyendo sábados, domingos y los feriados proporcionados.
  static int countBusinessDays(
    int year,
    int month, {
    List<DateTime> holidays = const [],
  }) {
    final daysInMonth = DateTime(year, month + 1, 0).day;
    int businessDays = 0;

    for (int day = 1; day <= daysInMonth; day++) {
      final date = DateTime(year, month, day);
      if (!isWeekend(date)) {
        final isHoliday = holidays.any((h) => isSameDay(h, date));
        if (!isHoliday) {
          businessDays++;
        }
      }
    }

    return businessDays;
  }
}
