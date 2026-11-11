# Sistema Rumbo al Cielo

Desarrollo de una aplicación web que centralice la administración y operación del comedor, desde la planificación del menú y la reserva hasta el registro de consumo y la generación de reportes mensuales.


# Funcionalidades
Para el Empleado:
Menú semanal de almuerzos de lunes a jueves.
Reservar el almuerzo para si mismo o para un familiar.
Mis reservas, con cancelación dentro del horario permitido.
Mi pensión, solicitar la pensión del próximo mes para sí o para cada familiar.
Calendario con feriados y días sin atención.
Mi cuenta, datos personales y cambio de contraseña.
Para el Administrador:
Usuarios y familiares, asigna roles, la activación desactivación de usuarios y atención de solicitudes de pensiones.
Menú, publicar el menú semanal.
Excepciones de calendario feriados y días de no atención.
Pensiones, confirmar o rechazar solicitudes.
Reportes: detalle de consumo por empleado y sus familiares.

#Tecnologías utilizadas

Frontend: React + Vite
Estilos: Tailwind CSS 
Backend como servicio Supabase PostgreSQL, funciones RPC y RLS
Gestor de paquetes: pnpm

# Requisitos 
Node.js 18 o superior
pnpm
Un proyecto de Supabase

Configurar la base de datos
En el panel de Supabase abre SQL Editor New query.
Ejecuta:
supabase_schema.sql 

#ejecución
Clona el repositorio: git clone <https://github.com/rilda2/Sistema-Rumbo-al-Cielo>
En visual studio code entra: cd web
pnpm install
pnpm dev

[@usuario](https://github.com/rilda2)
