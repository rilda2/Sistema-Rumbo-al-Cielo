import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:restaurante_app/features/menu/data/supabase_weekly_menu_repository.dart';
import 'package:restaurante_app/features/menu/domain/bolivian_dish_entity.dart';

final weeklyMenuRepositoryProvider =
    Provider<SupabaseWeeklyMenuRepository>((ref) {
  return SupabaseWeeklyMenuRepository();
});

/// Catálogo de platos bolivianos
final platosCatalogoProvider = FutureProvider<List<PlatoCatalogo>>((ref) async {
  final repo = ref.watch(weeklyMenuRepositoryProvider);
  return repo.getCatalogoPlatos();
});

/// Fecha de inicio de la semana de trabajo seleccionada
class SelectedWeekNotifier extends Notifier<DateTime> {
  @override
  DateTime build() {
    final now = DateTime.now();
    // Iniciar con el lunes de la semana actual
    return now.subtract(Duration(days: now.weekday - 1));
  }

  void nextWeek() {
    state = state.add(const Duration(days: 7));
  }

  void previousWeek() {
    state = state.subtract(const Duration(days: 7));
  }

  void setWeek(DateTime date) {
    state = date.subtract(Duration(days: date.weekday - 1));
  }
}

final selectedWeekProvider =
    NotifierProvider<SelectedWeekNotifier, DateTime>(SelectedWeekNotifier.new);

/// Estado del Menú Semanal (gestión de borrador y publicación)
class WeeklyMenuState {
  final List<MenuSemanalItem> items;
  final bool isLoading;
  final String? error;

  const WeeklyMenuState({
    required this.items,
    this.isLoading = false,
    this.error,
  });

  bool get isEntireWeekPublished {
    if (items.isEmpty) return false;
    return items.every((i) => i.isPublicado);
  }

  List<MenuSemanalItem> itemsForDay(DateTime date) {
    return items.where((i) {
      return i.fecha.year == date.year &&
          i.fecha.month == date.month &&
          i.fecha.day == date.day;
    }).toList();
  }
}

class WeeklyMenuNotifier extends Notifier<WeeklyMenuState> {
  @override
  WeeklyMenuState build() {
    final weekStart = ref.watch(selectedWeekProvider);
    Future.microtask(() => loadWeek(weekStart));
    return const WeeklyMenuState(items: [], isLoading: true);
  }

  Future<void> loadWeek(DateTime weekStart) async {
    state = WeeklyMenuState(items: state.items, isLoading: true);
    final repo = ref.read(weeklyMenuRepositoryProvider);
    try {
      final list = await repo.getMenuSemanal(weekStart);
      state = WeeklyMenuState(items: list, isLoading: false);
    } catch (e) {
      state = WeeklyMenuState(
        items: state.items,
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> toggleDish({
    required DateTime fecha,
    required String diaSemana,
    required PlatoCatalogo plato,
    required bool agregar,
  }) async {
    final repo = ref.read(weeklyMenuRepositoryProvider);
    await repo.togglePlatoEnMenu(
      fecha: fecha,
      diaSemana: diaSemana,
      plato: plato,
      agregar: agregar,
    );
    final weekStart = ref.read(selectedWeekProvider);
    final updatedList = await repo.getMenuSemanal(weekStart);
    state = WeeklyMenuState(items: updatedList, isLoading: false);
  }

  Future<bool> publishMenu() async {
    final weekStart = ref.read(selectedWeekProvider);
    final repo = ref.read(weeklyMenuRepositoryProvider);
    final ok = await repo.publicarMenuSemanal(startOfWeek: weekStart);
    if (ok) {
      final updatedList = await repo.getMenuSemanal(weekStart);
      state = WeeklyMenuState(items: updatedList, isLoading: false);
    }
    return ok;
  }
}

final weeklyMenuProvider =
    NotifierProvider<WeeklyMenuNotifier, WeeklyMenuState>(WeeklyMenuNotifier.new);

/// Menú publicado visible para los comensales / empleados
final publishedWeeklyMenuProvider =
    FutureProvider<List<MenuSemanalItem>>((ref) async {
  final weekStart = ref.watch(selectedWeekProvider);
  // Al recargar weeklyMenu, se actualiza automáticamente el menú publicado
  ref.watch(weeklyMenuProvider);
  final repo = ref.watch(weeklyMenuRepositoryProvider);
  return repo.getMenuPublicado(weekStart);
});
