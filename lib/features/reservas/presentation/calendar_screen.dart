import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:restaurante_app/core/utils/date_utils.dart';
import 'package:restaurante_app/features/reservas/domain/holiday_entity.dart';
import 'package:restaurante_app/features/reservas/presentation/providers/reservation_providers.dart';
import 'package:restaurante_app/supabase/menu_service.dart';

class CalendarScreen extends ConsumerStatefulWidget {
  const CalendarScreen({super.key});

  @override
  ConsumerState<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends ConsumerState<CalendarScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();

  Set<String> _excepcionesFechas = {};
  Map<String, String> _excepcionesMotivos = {};

  @override
  void initState() {
    super.initState();
    _selectedDay = DateTime.now();
    _loadExceptions();
  }

  Future<void> _loadExceptions() async {
    try {
      final now = DateTime.now();
      final inicio = DateTime(now.year, now.month - 1, 1);
      final fin = DateTime(now.year, now.month + 3, 0);

      final list = await MenuService.getExcepcionesCalendario(
        fechaInicio: MenuService.formatDate(inicio),
        fechaFin: MenuService.formatDate(fin),
      );

      if (mounted) {
        setState(() {
          _excepcionesFechas = list
              .map((e) => e['fecha']?.toString() ?? '')
              .where((s) => s.isNotEmpty)
              .toSet();
          _excepcionesMotivos = {
            for (final e in list)
              if (e['fecha'] != null)
                e['fecha'].toString():
                    e['motivo']?.toString() ?? 'Día sin atención institucional',
          };
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final holidaysAsync = ref.watch(holidaysProvider);
    final holidays = holidaysAsync.value ?? Holiday.defaultHolidays;
    final userReservations = ref.watch(userReservationsProvider);

    final selectedDateStr = MenuService.formatDate(_selectedDay);
    final bool isExcepcionDb = _excepcionesFechas.contains(selectedDateStr);
    final String? motivoDb = _excepcionesMotivos[selectedDateStr];

    final bool isHolidayList = holidays.any(
      (h) => AppDateUtils.isSameDay(h.date, _selectedDay),
    );
    final holidayObj = isHolidayList
        ? holidays.firstWhere((h) => AppDateUtils.isSameDay(h.date, _selectedDay))
        : null;

    final bool isNoServiceDay = isExcepcionDb || isHolidayList;
    final String motivoNoService = motivoDb ??
        holidayObj?.description ??
        holidayObj?.name ??
        'Día feriado o de suspensión del servicio de comedor';

    final isWeekend = _selectedDay.weekday == DateTime.saturday ||
        _selectedDay.weekday == DateTime.sunday;

    // Reservas activas del usuario para el día seleccionado
    final reservationsForSelectedDay = userReservations
        .where((r) =>
            AppDateUtils.isSameDay(r.date, _selectedDay) &&
            r.status.toLowerCase() != 'cancelada')
        .toList();

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Calendario Institucional',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 20,
                color: Colors.white,
              ),
            ),
            Text(
              'Fechas, feriados, excepciones y reservas programadas',
              style: TextStyle(fontSize: 12, color: Colors.white70),
            ),
          ],
        ),
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            tooltip: 'Actualizar',
            onPressed: () {
              ref.invalidate(holidaysProvider);
              _loadExceptions();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Contenedor principal del TableCalendar
            Container(
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.96),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(12),
              child: TableCalendar(
                firstDay: DateTime.now().subtract(const Duration(days: 90)),
                lastDay: DateTime.now().add(const Duration(days: 365)),
                focusedDay: _focusedDay,
                currentDay: DateTime.now(),
                selectedDayPredicate: (day) =>
                    AppDateUtils.isSameDay(_selectedDay, day),
                onDaySelected: (newSelectedDay, newFocusedDay) {
                  setState(() {
                    _selectedDay = newSelectedDay;
                    _focusedDay = newFocusedDay;
                  });
                },
                calendarFormat: CalendarFormat.month,
                headerStyle: HeaderStyle(
                  formatButtonVisible: false,
                  titleCentered: true,
                  titleTextStyle: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                  leftChevronIcon: Icon(
                    Icons.chevron_left,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  rightChevronIcon: Icon(
                    Icons.chevron_right,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
                calendarStyle: CalendarStyle(
                  todayDecoration: BoxDecoration(
                    color: Theme.of(context)
                        .colorScheme
                        .primary
                        .withValues(alpha: 0.35),
                    shape: BoxShape.circle,
                  ),
                  selectedDecoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    shape: BoxShape.circle,
                  ),
                  weekendTextStyle: const TextStyle(color: Colors.redAccent),
                ),
                calendarBuilders: CalendarBuilders(
                  markerBuilder: (context, date, events) {
                    final dateStr = MenuService.formatDate(date);
                    final hasRes = userReservations.any(
                      (r) =>
                          AppDateUtils.isSameDay(r.date, date) &&
                          r.status.toLowerCase() != 'cancelada',
                    );
                    final isHol = _excepcionesFechas.contains(dateStr) ||
                        holidays.any((h) => AppDateUtils.isSameDay(h.date, date));

                    if (hasRes || isHol) {
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (hasRes)
                            Container(
                              width: 6,
                              height: 6,
                              margin: const EdgeInsets.symmetric(horizontal: 1),
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.green,
                              ),
                            ),
                          if (isHol)
                            Container(
                              width: 6,
                              height: 6,
                              margin: const EdgeInsets.symmetric(horizontal: 1),
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.amber,
                              ),
                            ),
                        ],
                      );
                    }
                    return null;
                  },
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Leyenda de marcadores
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildLegendDot(Colors.green, 'Tienes Reserva'),
                  const SizedBox(width: 14),
                  _buildLegendDot(Colors.amber, 'Feriado / Excepción'),
                  const SizedBox(width: 14),
                  _buildLegendDot(
                    Theme.of(context).colorScheme.primary,
                    'Seleccionado',
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Detalle de la Fecha Seleccionada
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.96),
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AppDateUtils.formatFullDate(_selectedDay),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          Text(
                            isWeekend
                                ? 'Fin de semana'
                                : (isNoServiceDay
                                    ? 'Feriado / Sin servicio'
                                    : 'Día hábil de comedor'),
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isNoServiceDay
                                  ? Colors.amber.shade900
                                  : (isWeekend
                                      ? Colors.grey
                                      : Colors.green.shade700),
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: isNoServiceDay
                              ? Colors.amber.shade50
                              : (isWeekend
                                  ? Colors.grey.shade100
                                  : Colors.blue.shade50),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isNoServiceDay
                                ? Colors.amber.shade300
                                : (isWeekend
                                    ? Colors.grey.shade300
                                    : Colors.blue.shade300),
                          ),
                        ),
                        child: Text(
                          isNoServiceDay
                              ? 'SUSPENDIDO'
                              : (isWeekend ? 'CERRADO' : 'HABILITADO'),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: isNoServiceDay
                                ? Colors.amber.shade900
                                : (isWeekend
                                    ? Colors.grey.shade700
                                    : const Color(0xFF2563EB)),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const Divider(height: 24),

                  if (isNoServiceDay)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.amber.shade300),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.event_busy,
                            color: Colors.amber.shade800,
                            size: 22,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Atención suspendida:',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                                Text(
                                  motivoNoService,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.amber.shade900,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    )
                  else if (isWeekend)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.weekend_outlined, color: Colors.grey, size: 22),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'El comedor institucional atiende de Lunes a Viernes.',
                              style: TextStyle(fontSize: 12.5, color: Colors.grey),
                            ),
                          ),
                        ],
                      ),
                    ),

                  const SizedBox(height: 14),

                  // Lista de reservas para este día
                  const Text(
                    'Reservas para esta fecha:',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  const SizedBox(height: 8),

                  if (reservationsForSelectedDay.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.info_outline, color: Colors.grey, size: 20),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'No cuentas con reservas registradas para esta fecha.',
                              style: TextStyle(fontSize: 12.5, color: Colors.grey),
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    ...reservationsForSelectedDay.map((res) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade50.withValues(alpha: 0.6),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.blue.shade200),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              res.isForFamiliar
                                  ? Icons.family_restroom
                                  : Icons.person,
                              color: const Color(0xFF2563EB),
                              size: 24,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    res.beneficiaryName ?? res.userName,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13.5,
                                    ),
                                  ),
                                  Text(
                                    'Plato: ${res.dishName}',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Colors.black87,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: res.recogido
                                    ? Colors.green.shade100
                                    : Colors.blue.shade100,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                res.recogido ? 'RECOGIDO' : 'CONFIRMADA',
                                style: TextStyle(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.bold,
                                  color: res.recogido
                                      ? Colors.green.shade900
                                      : Colors.blue.shade900,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLegendDot(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 9,
          height: 9,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ],
    );
  }
}
