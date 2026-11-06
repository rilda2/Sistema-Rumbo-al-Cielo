import 'package:flutter/material.dart';
import 'package:restaurante_app/features/auth/presentation/profile_screen.dart';
import 'package:restaurante_app/features/menu/presentation/menu_screen.dart';
import 'package:restaurante_app/features/reservas/presentation/calendar_screen.dart';
import 'package:restaurante_app/features/reservas/presentation/employee_screen.dart';
import 'package:restaurante_app/features/reservas/presentation/my_reservations_screen.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _selectedIndex = 0;

  void _goToReservations() {
    setState(() {
      _selectedIndex = 1; // Ir a EmployeeScreen
    });
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      MenuScreen(onSelectDishForReservation: (_) => _goToReservations()),
      const EmployeeScreen(),
      const CalendarScreen(),
      const MyReservationsScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: const AssetImage('assets/mesa.jpeg'),
            fit: BoxFit.cover,
            colorFilter: ColorFilter.mode(
              Colors.black.withValues(alpha: 0.55),
              BlendMode.darken,
            ),
          ),
        ),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 680),
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 250),
              child: screens[_selectedIndex],
            ),
          ),
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (index) {
            setState(() {
              _selectedIndex = index;
            });
          },
          backgroundColor: Colors.white,
          elevation: 10,
          indicatorColor:
              Theme.of(context).colorScheme.primary.withValues(alpha: 0.15),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.restaurant_menu_outlined),
              selectedIcon:
                  Icon(Icons.restaurant_menu, color: Color(0xFF2563EB)),
              label: 'Menú',
            ),
            NavigationDestination(
              icon: Icon(Icons.bookmark_add_outlined),
              selectedIcon:
                  Icon(Icons.bookmark_add, color: Color(0xFF2563EB)),
              label: 'Reservas',
            ),
            NavigationDestination(
              icon: Icon(Icons.calendar_month_outlined),
              selectedIcon:
                  Icon(Icons.calendar_month, color: Color(0xFF2563EB)),
              label: 'Calendario',
            ),
            NavigationDestination(
              icon: Icon(Icons.receipt_long_outlined),
              selectedIcon:
                  Icon(Icons.receipt_long, color: Color(0xFF2563EB)),
              label: 'Tickets',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person, color: Color(0xFF2563EB)),
              label: 'Perfil',
            ),
          ],
        ),
      ),
    );
  }
}
