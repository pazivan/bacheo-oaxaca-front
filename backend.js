import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import pg from 'pg';
const { Pool } = pg;

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Base de Datos PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'CDMX',
  password: 'Saladito68',
  port: 5432,
});

// Prueba de Conexión a la Base de Datos
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error al conectar a PostgreSQL:', err.stack);
  }
  console.log('✅ Conexión a PostgreSQL establecida con éxito.');
  release();
});

// Configuración del correo con las credenciales
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'departamentodesoporteymantimie@gmail.com',
    pass: 'kvde uapu rbeq fsnd'
  }
});

/* ==========================================
   NUEVOS ENDPOINTS PARA BASE DE DATOS
========================================== */

// 1. CREAR REPORTE (Desde ciudadano.html)
app.post('/api/reportes', async (req, res) => {
  const { correo, folio, categoria, ubicacion, descripcion, ubicacionGps } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Iniciar Transacción

    // 1. Buscar el ID de la Categoría seleccionada (por nombre aprox o default)
    let catRes = await client.query('SELECT id_categoria FROM categorias WHERE nombre ILIKE $1', [`%${categoria}%`]);
    let idCategoria = catRes.rows.length > 0 ? catRes.rows[0].id_categoria : 1; // 1 por default

    // 2. Buscar el ID del Estado "Validando" o "Reportado"
    let estRes = await client.query("SELECT id_estado FROM estados_incidencia WHERE nombre ILIKE '%Validando%' OR nombre ILIKE '%Reportado%'");
    let idEstado = estRes.rows.length > 0 ? estRes.rows[0].id_estado : 1; 

    // 3. Insertar en la tabla incidencias
    const incQuery = `
      INSERT INTO incidencias (folio, id_categoria, id_estado, titulo, descripcion, direccion, prioridad) 
      VALUES ($1, $2, $3, $4, $5, $6, 'Alta') 
      RETURNING id_incidencia
    `;
    const incRes = await client.query(incQuery, [folio, idCategoria, idEstado, `Reporte ${categoria}`, descripcion, ubicacion]);
    const idIncidencia = incRes.rows[0].id_incidencia;

    // 4. Insertar en reportes_ciudadanos para guardar el correo
    const repQuery = `
      INSERT INTO reportes_ciudadanos (id_incidencia, correo_contacto, descripcion_original)
      VALUES ($1, $2, $3)
    `;
    await client.query(repQuery, [idIncidencia, correo, descripcion]);

    await client.query('COMMIT'); // Guardar cambios

    // 5. Enviar el Correo Automático
    if (correo) {
      await enviarCorreoAcuse(correo, folio, categoria, ubicacion, descripcion);
    }

    res.json({ success: true, id_incidencia: idIncidencia, folio: folio });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("❌ Error al guardar reporte en BD:", error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// 2. OBTENER TODOS LOS REPORTES (Para dashboard.html)
app.get('/api/reportes', async (req, res) => {
  try {
    const query = `
      SELECT 
        i.folio AS id,
        c.nombre AS categoria,
        e.nombre AS estado,
        COALESCE(a.nombre, 'Sin Asignar') AS dependencia,
        i.direccion AS ubicacion,
        i.descripcion,
        r.correo_contacto AS correo,
        TO_CHAR(i.fecha_deteccion, 'DD/MM/YYYY') AS fecha,
        'https://images.unsplash.com/photo-1584483756263-149b144bcbbd?auto=format&fit=crop&q=80&w=400' as img
      FROM incidencias i
      LEFT JOIN categorias c ON i.id_categoria = c.id_categoria
      LEFT JOIN estados_incidencia e ON i.id_estado = e.id_estado
      LEFT JOIN areas_responsables a ON i.id_area = a.id_area
      LEFT JOIN reportes_ciudadanos r ON i.id_incidencia = r.id_incidencia
      ORDER BY i.fecha_deteccion DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener reportes:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================
   ENDPOINTS EXISTENTES (Correos)
========================================== */

// Función interna para el acuse de recibo
async function enviarCorreoAcuse(correo, folio, categoria, ubicacion, descripcion) {
    const info = await transporter.sendMail({
      from: '"Servicios Urbanos CDMX" <departamentodesoporteymantimie@gmail.com>',
      to: correo,
      subject: `Acuse de Recibo - Folio de Reporte: ${folio}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #9F2241; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Confirmación de Reporte</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Servicios Urbanos CDMX</p>
            </div>
            <div style="padding: 30px;">
                <p style="font-size: 16px; color: #334155;">Hola,</p>
                <p style="font-size: 16px; color: #334155;">Hemos recibido tu solicitud ciudadana exitosamente. La Inteligencia Artificial del sistema ya ha clasificado tu reporte y está en proceso de validación.</p>
                
                <div style="background-color: #f8fafc; border-left: 4px solid #bc955c; padding: 15px; margin: 25px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>Folio:</strong> <span style="color: #9F2241; font-family: monospace; font-size: 18px;">${folio}</span></p>
                    <p style="margin: 0 0 10px 0;"><strong>Categoría:</strong> ${categoria}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Ubicación:</strong> ${ubicacion}</p>
                    <p style="margin: 0;"><strong>Descripción:</strong> ${descripcion}</p>
                </div>
            </div>
        </div>
      `
    });
    console.log(`✅ Correo Acuse enviado a ${correo}`);
}

app.post('/api/enviar-folio', async (req, res) => {
  const { correo, folio, categoria, ubicacion, descripcion } = req.body;
  if (!correo) return res.status(400).json({ error: 'Falta correo' });

  try {
    await enviarCorreoAcuse(correo, folio, categoria, ubicacion, descripcion);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/notificar-estado', async (req, res) => {
  const { correo, folio, nuevoEstado, mensaje } = req.body;
  
  if (!correo) return res.status(400).json({ error: 'Falta el correo destino' });

  try {
    // AQUÍ TAMBIÉN PODRÍAMOS ACTUALIZAR EL ESTADO EN LA BD DIRECTAMENTE SI QUISIERAMOS
    // ej. UPDATE incidencias SET id_estado = (SELECT id FROM estados WHERE nombre = nuevoEstado) WHERE folio = folio
    
    const info = await transporter.sendMail({
      from: '"Servicios Urbanos CDMX" <departamentodesoporteymantimie@gmail.com>',
      to: correo,
      subject: `Actualización de Folio: ${folio} - ${nuevoEstado}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #bc955c; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Actualización de Solicitud</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Servicios Urbanos CDMX</p>
            </div>
            <div style="padding: 30px;">
                <p style="font-size: 16px; color: #334155;">Te informamos que tu reporte ha cambiado de estado.</p>
                
                <div style="background-color: #f8fafc; border-left: 4px solid #bc955c; padding: 15px; margin: 25px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>Folio:</strong> <span style="color: #9F2241; font-family: monospace; font-size: 18px;">${folio}</span></p>
                    <p style="margin: 0 0 10px 0;"><strong>Nuevo Estado:</strong> <span style="background-color: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${nuevoEstado}</span></p>
                </div>
                
                <p style="font-size: 15px; color: #334155; line-height: 1.5;">${mensaje}</p>
            </div>
        </div>
      `
    });
    
    console.log(`✅ Notificación enviada a ${correo}`);
    res.json({ success: true, messageId: info.messageId });
    
  } catch (error) {
    console.error("❌ Error al enviar notificación:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor Backend CDMX corriendo en http://localhost:${PORT}`);
});
