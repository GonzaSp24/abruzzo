

# Abruzzo — Sistema de Turnos Online

Una app de reserva de turnos para la barbería **Abruzzo**, con estética **minimalista elegante italiana** (tonos neutros, tipografía serif para títulos, mucho espacio en blanco, detalles en negro/dorado sutil).

---

## 1. Landing Page
- Hero con imagen placeholder del local a pantalla completa, logo "Abruzzo" con tipografía elegante
- Sección "Nuestros Servicios" con los 4 servicios: Corte, Corte y Lavado, Barba, Corte + Barba (con precios editables desde el admin)
- Sección "Nuestro Equipo" mostrando los barberos con foto (placeholder por ahora) y nombre
- Botón principal "Reservar Turno" siempre visible
- Footer con dirección, WhatsApp e Instagram

## 2. Flujo de Reserva de Turno
- **Paso 1**: Elegir barbero — se muestra la foto y nombre de cada barbero disponible
- **Paso 2**: Elegir servicio (Corte, Corte y Lavado, Barba, Corte + Barba)
- **Paso 3**: Elegir fecha y horario disponible (calendario visual)
- **Paso 4**: Ingresar nombre y número de WhatsApp del cliente
- **Paso 5**: Confirmación — resumen del turno + botón que abre WhatsApp con mensaje pre-armado confirmando el turno (ej: "Hola! Reservé un turno en Abruzzo para Corte con [Barbero] el [fecha] a las [hora]")

## 3. Panel de Administración (protegido con contraseña)
- **Dashboard**: vista de turnos del día y próximos
- **Gestión de Turnos**: ver, cancelar o marcar turnos como completados. Vista por día/semana
- **Gestión de Barberos**: agregar, editar o eliminar barberos (nombre, foto, servicios que ofrece)
- **Gestión de Servicios**: editar nombres, precios y duración de cada servicio
- **Horarios**: configurar días y horarios de atención por barbero

## 4. Backend (Lovable Cloud / Supabase)
- Base de datos para barberos, servicios, turnos y horarios
- Autenticación simple para el panel admin
- Los turnos se guardan y se validan para evitar superposición de horarios

## 5. Diseño y Estilo
- Paleta: blanco, negro, gris cálido, acento dorado/beige sutil
- Tipografía serif elegante para títulos, sans-serif limpia para cuerpo
- Diseño mobile-first, responsive
- Inspiración italiana minimalista: limpio, espacioso, sofisticado

