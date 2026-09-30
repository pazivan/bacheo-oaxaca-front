-- Insertar Categorías Básicas (Formato C01, C02 según restricción)
INSERT INTO public.categorias (codigo, nombre, descripcion) VALUES 
('C01', 'Bacheo y Asfalto', 'Reparación de baches y reencarpetamiento'),
('C02', 'Luminarias', 'Reparación y mantenimiento de alumbrado público'),
('C03', 'Fuga de Agua', 'Reparación de fugas de agua potable'),
('C04', 'Drenaje', 'Desazolve y reparación de drenaje'),
('C05', 'Árbol en Riesgo', 'Poda o tala de árboles en riesgo de caída'),
('C06', 'Semáforo / Señalización', 'Reparación de semáforos o señales de tránsito'),
('C07', 'Otros Servicios', 'Otros servicios urbanos')
ON CONFLICT (codigo) DO NOTHING;

-- Insertar Estados del Flujo de Trabajo
INSERT INTO public.estados_incidencia (nombre, descripcion) VALUES
('Validando (IA / Dron)', 'El reporte acaba de ingresar y está siendo validado por IA o programado para inspección.'),
('Inspección Programada', 'Se ha agendado una revisión por dron o cuadrilla física.'),
('En reparación', 'El presupuesto fue aprobado y la cuadrilla se encuentra trabajando.'),
('Concluido', 'El trabajo ha sido finalizado y verificado.')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar Áreas Responsables
INSERT INTO public.areas_responsables (nombre, descripcion) VALUES
('SOBSE', 'Secretaría de Obras y Servicios de la CDMX'),
('SACMEX', 'Sistema de Aguas de la Ciudad de México'),
('Alcaldía', 'Área de obras de la alcaldía correspondiente')
ON CONFLICT (nombre) DO NOTHING;

-- Opcional: Insertar un Dron
INSERT INTO public.drones (identificador, modelo, estado) VALUES
('DRON-SOBSE-01', 'DJI Matrice 300 RTK', 'Disponible')
ON CONFLICT (identificador) DO NOTHING;
