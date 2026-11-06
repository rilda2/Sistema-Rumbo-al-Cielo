# Agente de Continuidad: Proyecto "Restaurante App" (COMPLETADO)

## 1. Contexto General y Objetivo
Aplicación en Flutter para la gestión del restaurante de una institución pública o corporativa. Resuelve el control de reservas diarias, cobros, pensiones mensuales, control de asistencia en cocina y acceso público al menú.
- **Plataformas objetivo soportadas:** Android y Web (carpetas no utilizadas eliminadas).
- **Backend:** Supabase (PostgreSQL, Auth JWT, RLS, Storage) con modo offline/demo resiliente.

## 2. Decisiones Arquitectónicas (Clean Architecture / Feature-First)
El proyecto implementa estrictamente Clean Architecture orientada a funcionalidades:
- **Core:**
  - `core/config/supabase_config.dart`: Configuración e inicialización tolerante a fallos de Supabase.
  - `core/layout/main_layout.dart`: Contenedor principal con fondo `assets/mesa.jpeg`, responsivo para Web (max-width) y Android, con 4 pestañas de navegación (Menú, Calendario, Reservas, Perfil).
  - `core/theme/app_theme.dart`: Material 3, tipografía Poppins, colores accesibles y tarjetas redondeadas con soporte sin deprecaciones.
  - `core/utils/date_utils.dart`: Cálculos de días laborables, exclusión de fines de semana y feriados.
- **Menu (`features/menu`):**
  - Domain: `Dish` con categorías, precio, calorías, favoritos y disponibilidad.
  - Data: `SupabaseMenuRepository` con fallback automático a mock.
  - Presentation: `MenuScreen` con búsqueda instantánea, filtrado por categorías ('Plato Fuerte', 'Sopa', 'Vegetariano', 'Postre'), gestión de favoritos y atajo para reservar plato.
- **Reservas (`features/reservas`):**
  - Domain: `Reservation`, `Holiday`, `ReservationPolicy` (reglas de 9:00 AM y 8:59 AM, fines de semana, feriados).
  - Data: `SupabaseReservationRepository` (lectura, inserción, cancelación y actualización de estado de entrega).
  - Presentation:
    - `CalendarScreen`: TableCalendar interactivo con marcas de feriados y reservas, selector de plato, observaciones y botón de confirmación con validación de política.
    - `MyReservationsScreen`: Pestañas Próximas / Historial, cancelación respetando la regla horaria y visualización de Ticket digital con código QR para entrega de almuerzo.
- **Pensión Mensual (`features/pension`):**
  - Domain: `MonthlyPensionSubscription` con bloqueo de cambios una vez iniciado el mes.
  - Data: `SupabasePensionRepository` calculador de días hábiles y tarifas preferenciales.
  - Presentation: `PensionScreen` con estado del mes actual (bloqueado si ya inició) y suscripción al próximo mes.
- **Autenticación y Perfil (`features/auth`):**
  - Domain: `UserProfile` con roles: `empleado`, `encargado` e `institucion`.
  - Data: `SupabaseAuthRepository` con login/registro JWT y cuentas demo integradas para prueba instantánea.
  - Presentation: `ProfileScreen` con login, registro, resumen de cuenta, cambiador de roles demo, y acceso directo a los paneles especializados.
- **Administración & Reportes (`features/admin`):**
  - `KitchenScreen`: Panel de cocina con calendario de reservas, pedidos del día, total de almuerzos, cobro acumulado por empleado/familia, métricas en tiempo real y entrega bloqueada fuera del horario de servicio (12:00 a 14:00).
    - Incluye pestañas separadas para empleados con plan mensual y empleados regulares sin plan mensual. Cada empleado se agrupa en una sola ficha con reservas propias, reservas de familiares y total de almuerzos.
    - El planificador de menú muestra imágenes del catálogo y permite agregar (`+`) o quitar (`−`) platos por día antes de publicar.
  - Cada reserva genera un ticket digital con QR individual para validar el retiro.
  - `InstitucionScreen`: Métricas de consumo global, porcentaje de pensionados vs libres, balance presupuestario y desglose por departamentos.

## 3. Reglas de Negocio Implementadas y Testeadas
1. **Bloqueo Horario Reserva:**
   - Reserva para el mismo día: Permitida hasta las 9:00 AM (9:01 AM bloqueada).
2. **Bloqueo Horario Cancelación:**
   - Cancelación para el mismo día: Permitida solo antes de las 8:59 AM (a partir de las 9:00 AM bloqueada).
3. **Fines de Semana:** Sábados y domingos inhabilitados para reservas.
4. **Control de Feriados:** Fechas marcadas como feriado oficial institucional son rechazadas automáticamente en el calendario.
5. **Bloqueo de Pensión Mensual:** Una vez iniciado el mes (día >= 1), las suscripciones y cancelaciones de ese mes quedan estrictamente bloqueadas.

## 4. Base de Datos en Supabase
El script completo para crear las tablas, políticas RLS, índices y datos iniciales se encuentra en:
`supabase_schema.sql` (en la raíz del proyecto).

Para conectar tu instancia real de Supabase:
1. Abre tu proyecto en [Supabase](https://supabase.com).
2. Pega y ejecuta el contenido de `supabase_schema.sql` en el **SQL Editor**.
3. En `lib/core/config/supabase_config.dart`, coloca tu `supabaseUrl` y tu `supabaseAnonKey` (o pásalas como `--dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...`).
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  await Supabase.initialize(
    url: 'https://qnieqczrdyxyhpepjduj.supabase.co',
    publishableKey: 'sb_publishable_s7ww56WzXyW76KlH-cqvfQ_SgdpLsX7',
  );
  runApp(MyApp());
}