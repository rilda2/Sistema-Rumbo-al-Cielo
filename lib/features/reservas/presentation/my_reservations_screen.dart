import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:restaurante_app/core/utils/date_utils.dart';
import 'package:restaurante_app/features/familiares/domain/familiar_entity.dart';
import 'package:restaurante_app/features/familiares/presentation/providers/family_providers.dart';
import 'package:restaurante_app/features/reservas/domain/reservation_entity.dart';
import 'package:restaurante_app/features/reservas/domain/usecases/reservation_policy.dart';
import 'package:restaurante_app/features/reservas/presentation/providers/reservation_providers.dart';

class MyReservationsScreen extends ConsumerStatefulWidget {
  const MyReservationsScreen({super.key});

  @override
  ConsumerState<MyReservationsScreen> createState() =>
      _MyReservationsScreenState();
}

class _MyReservationsScreenState extends ConsumerState<MyReservationsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedComensalFilter = 'TODOS'; // 'TODOS' | 'EMPLEADO' | famId
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reservations = ref.watch(userReservationsProvider);
    final policyUseCase = ref.watch(reservationPolicyUseCaseProvider);
    final currentTime = ref.watch(currentTimeProvider);
    final familyAsync = ref.watch(employeeFamilyMembersProvider);
    final familyMembers = familyAsync.value ?? [];

    final today = DateTime(
      currentTime.year,
      currentTime.month,
      currentTime.day,
    );

    final upcoming = reservations.where((r) {
      final rDate = DateTime(r.date.year, r.date.month, r.date.day);
      return !rDate.isBefore(today);
    }).toList()..sort((a, b) => a.date.compareTo(b.date));

    final past = reservations.where((r) {
      final rDate = DateTime(r.date.year, r.date.month, r.date.day);
      return rDate.isBefore(today);
    }).toList()..sort((a, b) => b.date.compareTo(a.date));

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Mis Reservas',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 22,
                color: Colors.white,
              ),
            ),
            Text(
              'Control de almuerzos y tickets de retiro',
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
              ref.read(userReservationsProvider.notifier).loadReservations();
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          indicatorColor: Colors.white,
          indicatorWeight: 3,
          tabs: [
            Tab(text: 'Próximas (${upcoming.length})'),
            Tab(text: 'Historial (${past.length})'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildUpcomingReservationsView(
            upcoming,
            policyUseCase,
            currentTime,
            familyMembers,
          ),
          _buildPastReservationsView(past, policyUseCase, currentTime),
        ],
      ),
    );
  }

  /// Vista de Próximas Reservas: con métricas resumen, filtros y agrupación semanal responsiva
  Widget _buildUpcomingReservationsView(
    List<Reservation> list,
    ReservationPolicy policyUseCase,
    DateTime currentTime,
    List<Familiar> familyMembers,
  ) {
    if (list.isEmpty) {
      return Center(
        child: Container(
          padding: const EdgeInsets.all(24),
          margin: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.95),
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.blue.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.calendar_month,
                  size: 44,
                  color: Color(0xFF2563EB),
                ),
              ),
              const SizedBox(height: 14),
              const Text(
                'No tienes reservas próximas activas',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Puedes reservar tu menú diario desde la pestaña "Menú" o pensionarte para reservar automáticamente todo el mes.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Filtrar por comensal y búsqueda
    final filtered = list.where((r) {
      if (_selectedComensalFilter == 'EMPLEADO') {
        if (r.familiarId != null) return false;
      } else if (_selectedComensalFilter != 'TODOS') {
        if (r.familiarId != _selectedComensalFilter) return false;
      }

      if (_searchQuery.trim().isNotEmpty) {
        final query = _searchQuery.toLowerCase().trim();
        final matchDish = r.dishName.toLowerCase().contains(query);
        final matchPerson = r.displayName.toLowerCase().contains(query);
        final matchDate = AppDateUtils.formatFullDate(
          r.date,
        ).toLowerCase().contains(query);
        if (!matchDish && !matchPerson && !matchDate) return false;
      }

      return true;
    }).toList();

    // Métricas del mes / reservas activas
    final activeConfirmed = list.where((r) => r.isConfirmed).toList();
    final pensionCount = activeConfirmed.where((r) => r.price <= 15.0).length;
    final regularCount = activeConfirmed.where((r) => r.price > 15.0).length;

    // Agrupar por semanas laborales (Lunes a Viernes)
    final Map<String, List<Reservation>> groupedByWeek = {};
    for (final res in filtered) {
      final monday = AppDateUtils.getMondayOfWeek(res.date);
      final friday = monday.add(const Duration(days: 4));
      final weekLabel =
          'Semana del ${monday.day} al ${friday.day} de ${AppDateUtils.getMonthName(monday.month)} ${monday.year}';
      groupedByWeek.putIfAbsent(weekLabel, () => []).add(res);
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner de Métricas Resumen
          _buildKpiBanner(
            totalActive: activeConfirmed.length,
            pensionCount: pensionCount,
            regularCount: regularCount,
          ),

          const SizedBox(height: 12),

          // Barra de Filtro de Comensales
          _buildComensalFilterChips(familyMembers, list),

          const SizedBox(height: 10),

          // Buscador rápido
          _buildSearchBox(),

          const SizedBox(height: 14),

          // Lista de Reservas Agrupadas por Semana
          if (filtered.isEmpty)
            Center(
              child: Container(
                padding: const EdgeInsets.all(20),
                margin: const EdgeInsets.symmetric(vertical: 20),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Text(
                  'No hay reservas que coincidan con los filtros aplicados.',
                  style: TextStyle(fontSize: 13, color: Colors.grey),
                ),
              ),
            )
          else
            ...groupedByWeek.entries.map((entry) {
              final weekTitle = entry.key;
              final weekReservations = entry.value;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Encabezado de la Semana
                  Container(
                    margin: const EdgeInsets.only(top: 8, bottom: 8),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.95),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.blue.shade100),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.calendar_month,
                              size: 16,
                              color: Color(0xFF2563EB),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              weekTitle,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: Color(0xFF1E293B),
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(
                              0xFF2563EB,
                            ).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '${weekReservations.length} almuerzos',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF2563EB),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Tarjetas de Reservas de la semana
                  ...weekReservations.map((res) {
                    return _buildModernReservationCard(
                      res: res,
                      policyUseCase: policyUseCase,
                      currentTime: currentTime,
                      isUpcoming: true,
                    );
                  }),
                ],
              );
            }),

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  /// Banner Resumen de Indicadores Clave
  Widget _buildKpiBanner({
    required int totalActive,
    required int pensionCount,
    required int regularCount,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E3A8A), Color(0xFF2563EB)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.restaurant, color: Colors.white, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'Resumen de Almuerzos',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '$totalActive reservas activas',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildKpiItem(
                  title: 'Plan Pensión',
                  count: pensionCount,
                  priceLabel: 'Bs. 15 / día',
                  icon: Icons.stars_rounded,
                  accentColor: Colors.amber,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildKpiItem(
                  title: 'Reserva Regular',
                  count: regularCount,
                  priceLabel: 'Bs. 18 / día',
                  icon: Icons.event_available,
                  accentColor: Colors.white,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildKpiItem({
    required String title,
    required int count,
    required String priceLabel,
    required IconData icon,
    required Color accentColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Icon(icon, color: accentColor, size: 22),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$count $title',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12.5,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  priceLabel,
                  style: const TextStyle(color: Colors.white70, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Filtro interactivo de comensales (Empleado vs Familiares)
  Widget _buildComensalFilterChips(
    List<Familiar> familyMembers,
    List<Reservation> upcoming,
  ) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildChip(
            label: 'Todos (${upcoming.length})',
            isSelected: _selectedComensalFilter == 'TODOS',
            onTap: () => setState(() => _selectedComensalFilter = 'TODOS'),
          ),
          const SizedBox(width: 6),
          _buildChip(
            label: 'Tú',
            isSelected: _selectedComensalFilter == 'EMPLEADO',
            onTap: () => setState(() => _selectedComensalFilter = 'EMPLEADO'),
          ),
          ...familyMembers.map((fam) {
            return Padding(
              padding: const EdgeInsets.only(left: 6.0),
              child: _buildChip(
                label: fam.displayName,
                isSelected: _selectedComensalFilter == fam.id,
                onTap: () => setState(() => _selectedComensalFilter = fam.id),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF2563EB)
              : Colors.white.withValues(alpha: 0.9),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFF2563EB) : Colors.grey.shade300,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF2563EB).withValues(alpha: 0.25),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.white : Colors.black87,
          ),
        ),
      ),
    );
  }

  Widget _buildSearchBox() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextField(
        onChanged: (val) => setState(() => _searchQuery = val),
        decoration: InputDecoration(
          hintText: 'Filtrar por plato o fecha...',
          hintStyle: TextStyle(fontSize: 12.5, color: Colors.grey.shade500),
          prefixIcon: const Icon(Icons.search, color: Colors.grey, size: 20),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, size: 16),
                  onPressed: () => setState(() => _searchQuery = ''),
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 8),
        ),
      ),
    );
  }

  /// Tarjeta de Reserva Moderna y Responsiva
  Widget _buildModernReservationCard({
    required Reservation res,
    required ReservationPolicy policyUseCase,
    required DateTime currentTime,
    required bool isUpcoming,
  }) {
    final canCancelCheck = policyUseCase.checkCanCancel(res.date, currentTime);
    final dayOfWeek = AppDateUtils.getDayOfWeekAbbr(res.date);
    final isPension = res.price <= 15.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.96),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(
          color: res.isCancelled
              ? Colors.red.shade100
              : (isPension ? Colors.green.shade100 : Colors.blue.shade100),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Columna visual de Fecha
                Container(
                  width: 50,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: res.isCancelled
                        ? Colors.red.shade50
                        : const Color(0xFF2563EB).withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: res.isCancelled
                          ? Colors.red.shade200
                          : const Color(0xFF2563EB).withValues(alpha: 0.2),
                    ),
                  ),
                  child: Column(
                    children: [
                      Text(
                        dayOfWeek.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: res.isCancelled
                              ? Colors.red
                              : const Color(0xFF2563EB),
                        ),
                      ),
                      Text(
                        res.date.day.toString().padLeft(2, '0'),
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: res.isCancelled
                              ? Colors.red.shade800
                              : const Color(0xFF1E293B),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(width: 12),

                // Detalles del Plato y Comensal
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              res.dishName,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14.5,
                                color: res.isCancelled
                                    ? Colors.grey
                                    : const Color(0xFF1E293B),
                                decoration: res.isCancelled
                                    ? TextDecoration.lineThrough
                                    : null,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          _buildStatusChip(res.status),
                        ],
                      ),
                      const SizedBox(height: 4),

                      // Etiquetas: Modalidad / Comensal
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: [
                          // Badge de Modalidad
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: isPension
                                  ? Colors.green.withValues(alpha: 0.12)
                                  : Colors.blue.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              isPension
                                  ? '⭐ Pensión (Bs. 15.00)'
                                  : 'Regular (Bs. 18.00)',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isPension
                                    ? Colors.green.shade800
                                    : const Color(0xFF2563EB),
                              ),
                            ),
                          ),

                          // Badge de Comensal
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: res.isForFamiliar
                                  ? Colors.purple.withValues(alpha: 0.1)
                                  : Colors.blueGrey.shade100,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  res.isForFamiliar
                                      ? Icons.family_restroom
                                      : Icons.person,
                                  size: 12,
                                  color: res.isForFamiliar
                                      ? Colors.purple
                                      : Colors.blueGrey.shade700,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  res.isForFamiliar
                                      ? 'Para: ${res.displayName}'
                                      : 'Empleado',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: res.isForFamiliar
                                        ? Colors.purple
                                        : Colors.blueGrey.shade800,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      if (res.notes != null && res.notes!.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 4.0),
                          child: Text(
                            'Nota: ${res.notes}',
                            style: TextStyle(
                              fontSize: 11.5,
                              color: Colors.grey.shade600,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),

            // Acciones Rápidas (Ver Ticket QR / Cancelar)
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _showTicketModal(context, res),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    icon: const Icon(Icons.qr_code, size: 16),
                    label: const Text(
                      'Ver Ticket',
                      style: TextStyle(fontSize: 12),
                    ),
                  ),
                ),
                if (isUpcoming && res.isConfirmed) ...[
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: canCancelCheck.isAllowed
                          ? () => _cancelReservation(res.id)
                          : () => _showCancelPolicyAlert(
                              context,
                              canCancelCheck.message,
                            ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: canCancelCheck.isAllowed
                            ? Colors.red.shade600
                            : Colors.grey.shade400,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      icon: const Icon(Icons.cancel_outlined, size: 16),
                      label: const Text(
                        'Cancelar',
                        style: TextStyle(fontSize: 12),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// Vista de Historial
  Widget _buildPastReservationsView(
    List<Reservation> list,
    ReservationPolicy policyUseCase,
    DateTime currentTime,
  ) {
    if (list.isEmpty) {
      return Center(
        child: Container(
          padding: const EdgeInsets.all(24),
          margin: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.95),
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.history, size: 48, color: Colors.grey),
              SizedBox(height: 12),
              Text(
                'Aún no hay reservas en tu historial.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (context, index) {
        return _buildModernReservationCard(
          res: list[index],
          policyUseCase: policyUseCase,
          currentTime: currentTime,
          isUpcoming: false,
        );
      },
    );
  }

  Widget _buildStatusChip(String status) {
    Color bg;
    Color text;
    String label;

    switch (status.toLowerCase()) {
      case 'confirmada':
        bg = Colors.green.withValues(alpha: 0.15);
        text = Colors.green.shade800;
        label = 'Confirmada';
        break;
      case 'entregada':
        bg = Colors.blue.withValues(alpha: 0.15);
        text = Colors.blue.shade800;
        label = 'Consumida';
        break;
      case 'cancelada':
        bg = Colors.red.withValues(alpha: 0.15);
        text = Colors.red.shade800;
        label = 'Cancelada';
        break;
      default:
        bg = Colors.grey.withValues(alpha: 0.2);
        text = Colors.grey.shade800;
        label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: text,
          fontSize: 10.5,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  void _showCancelPolicyAlert(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.lock_clock, color: Colors.red),
            SizedBox(width: 8),
            Text('Cancelación Bloqueada'),
          ],
        ),
        content: Text(message),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Entendido'),
          ),
        ],
      ),
    );
  }

  Future<void> _cancelReservation(String reservationId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('¿Cancelar reserva?'),
        content: const Text(
          'Esta acción liberará tu cupo para el almuerzo de esta fecha. ¿Deseas continuar?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('No'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Sí, Cancelar'),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    final success = await ref
        .read(userReservationsProvider.notifier)
        .cancelReservation(reservationId);

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Reserva cancelada con éxito.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'No se pudo cancelar. Solo es posible cancelar antes de las 9:00 AM del día de la reserva.',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showTicketModal(BuildContext context, Reservation res) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Ticket de Retiro',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
            ),
            const Text(
              'Presenta este comprobante en el mostrador del restaurante',
              style: TextStyle(fontSize: 12, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Column(
                children: [
                  QrImageView(
                    data: 'reserva:${res.id}',
                    size: 140,
                    eyeStyle: QrEyeStyle(
                      eyeShape: QrEyeShape.square,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    dataModuleStyle: QrDataModuleStyle(
                      dataModuleShape: QrDataModuleShape.square,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Builder(
                    builder: (context) {
                      final cleanCode = res.id.toUpperCase().replaceAll(
                        '-',
                        '',
                      );
                      final displayCode = cleanCode.length >= 8
                          ? cleanCode.substring(0, 8)
                          : cleanCode.padLeft(8, '0');
                      return Text(
                        'CÓDIGO: #$displayCode',
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2,
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              dense: true,
              leading: Icon(
                res.isForFamiliar ? Icons.family_restroom : Icons.person,
                color: res.isForFamiliar ? Colors.purple : null,
              ),
              title: Text(
                res.isForFamiliar ? 'Beneficiario (Familiar)' : 'Comensal',
              ),
              subtitle: Text(res.displayName),
            ),
            ListTile(
              dense: true,
              leading: const Icon(Icons.calendar_today),
              title: const Text('Fecha'),
              subtitle: Text(AppDateUtils.formatFullDate(res.date)),
            ),
            ListTile(
              dense: true,
              leading: const Icon(Icons.lunch_dining),
              title: const Text('Plato Seleccionado'),
              subtitle: Text(res.dishName),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Cerrar Ticket'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
