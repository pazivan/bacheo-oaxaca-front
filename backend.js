import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json());

// Configuración del correo con las credenciales
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'departamentodesoporteymantimie@gmail.com',
    pass: 'kvde uapu rbeq fsnd'
  }
});

// Endpoint para enviar el correo
app.post('/api/enviar-folio', async (req, res) => {
  const { correo, folio, categoria, ubicacion, descripcion } = req.body;
  
  if (!correo) {
    return res.status(400).json({ error: 'Falta el correo destino' });
  }

  try {
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
                
                <p style="font-size: 14px; color: #64748b;">Puedes consultar el avance de tu solicitud usando tu número de folio en nuestro portal ciudadano.</p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                    Este es un correo automático. Por favor, no respondas a este mensaje.<br>
                    Gobierno de la Ciudad de México © 2026
                </p>
            </div>
        </div>
      `
    });
    
    console.log(`✅ Correo enviado exitosamente a ${correo}: ${info.messageId}`);
    res.json({ success: true, messageId: info.messageId });
    
  } catch (error) {
    console.error("❌ Error al enviar el correo:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para notificar cambios de estado (Ej. Dron agendado)
app.post('/api/notificar-estado', async (req, res) => {
  const { correo, folio, nuevoEstado, mensaje } = req.body;
  
  if (!correo) return res.status(400).json({ error: 'Falta el correo destino' });

  try {
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
                <p style="font-size: 16px; color: #334155;">Hola,</p>
                <p style="font-size: 16px; color: #334155;">Te informamos que tu reporte ha cambiado de estado.</p>
                
                <div style="background-color: #f8fafc; border-left: 4px solid #bc955c; padding: 15px; margin: 25px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>Folio:</strong> <span style="color: #9F2241; font-family: monospace; font-size: 18px;">${folio}</span></p>
                    <p style="margin: 0 0 10px 0;"><strong>Nuevo Estado:</strong> <span style="background-color: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${nuevoEstado}</span></p>
                </div>
                
                <p style="font-size: 15px; color: #334155; line-height: 1.5;">${mensaje}</p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                    Este es un correo automático. Por favor, no respondas a este mensaje.<br>
                    Gobierno de la Ciudad de México © 2026
                </p>
            </div>
        </div>
      `
    });
    
    console.log(`✅ Notificación enviada a ${correo}: ${info.messageId}`);
    res.json({ success: true, messageId: info.messageId });
    
  } catch (error) {
    console.error("❌ Error al enviar notificación:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor Backend CDMX corriendo en http://localhost:${PORT}`);
  console.log(`📧 Listo para enviar correos desde departamentodesoporteymantimie@gmail.com`);
});
