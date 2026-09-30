# Plan de Acción: Integración de Base de Datos (PostgreSQL) 🚀

Para conectar la increíble base de datos que compartiste (con soporte para Drones, IA y cuadrillas) a nuestras pantallas `ciudadano.html` y `dashboard.html`, dejaremos de usar la memoria temporal (`localStorage`) y pasaremos a un flujo profesional de cliente-servidor.

Aquí tienes el plan paso a paso que ejecutaremos:

## Fase 1: Configuración de la Base de Datos
1. **Levantar PostgreSQL:** Usaremos tu archivo `docker-compose.yml` (si ya lo tienes configurado) o instalaremos Postgres localmente para correr el motor de base de datos.
2. **Ejecutar el Script (Esquema):** Correremos el script SQL que me pasaste para crear todas las tablas (`incidencias`, `reportes_ciudadanos`, `vuelos_dron`, etc.).
3. **Poblar Catálogos (Semilla):** Insertaremos los datos base necesarios para que funcione el sistema:
   - **Categorías:** Bacheo, Luminaria, Fuga de Agua, etc.
   - **Estados:** Validando (IA / Dron), Inspección Programada, En Reparación, Concluido.
   - **Áreas Responsables:** SOBSE, SACMEX, Alcaldías.

## Fase 2: Expansión del Backend (`backend.js`)
Actualmente nuestro `backend.js` solo envía correos. Lo expandiremos para que sea el "cerebro" conectando la web con la base de datos.
1. **Instalar Dependencias:** Instalaremos el conector de Postgres para Node (`npm install pg`).
2. **Conexión a BD:** Configuraremos el pool de conexiones a tu base de datos local.
3. **Crear Endpoints (API REST):**
   - **`POST /api/reportes`:** Recibirá los datos del `ciudadano.html` e insertará los registros en las tablas `incidencias` y `reportes_ciudadanos`. También disparará el correo de confirmación.
   - **`GET /api/reportes`:** Consultará la tabla `incidencias` uniendo los catálogos para devolver la lista completa al `dashboard.html`.
   - **`PATCH /api/reportes/:id/estado`:** Actualizará el estado de la incidencia (ej. pasar a "En Reparación") e insertará el registro del cambio en la tabla `historial_incidencia`.

## Fase 3: Conexión de `ciudadano.html` (Frontend)
1. **Reemplazar LocalStorage:** Eliminaremos el código que guarda en `localStorage`.
2. **Petición HTTP:** Enviaremos el formulario mediante un `fetch('http://localhost:3000/api/reportes')` al backend.
3. **Manejo de Errores:** Mostraremos alertas si el servidor o la base de datos están caídos.

## Fase 4: Conexión de `dashboard.html` (Centro de Mando)
1. **Carga Inicial:** Cambiaremos la función `cargarDatos()` para que en lugar de leer el navegador, haga un `fetch('http://localhost:3000/api/reportes')` y pinte la tabla con datos reales.
2. **Botones de Acción:** Modificaremos los botones ("Agendar Inspección", "Asignar Presupuesto") para que envíen la orden al backend (`PATCH`).
3. **Automatización:** El backend se encargará de actualizar la BD, cambiar el estado y enviar el correo al ciudadano en una sola transacción.

---

> [!TIP]
> **Siguiente paso lógico:** Si estás de acuerdo con este plan, puedo empezar de inmediato con la **Fase 2** (modificando el `backend.js` para conectarlo a PostgreSQL y crear las rutas de la API). ¿Quieres que comience a escribir ese código?
