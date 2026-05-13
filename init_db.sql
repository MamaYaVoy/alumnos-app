-- ============================================================
-- Script para crear y poblar la tabla alumnos
-- Ejecútalo desde pgAdmin, DBeaver, o el cliente psql de Render
-- ============================================================

-- Crear la tabla
CREATE TABLE IF NOT EXISTS alumnos (
  id        SERIAL PRIMARY KEY,
  nombre    VARCHAR(50)  NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email     VARCHAR(100) UNIQUE NOT NULL,
  curso     VARCHAR(30)  NOT NULL
);

-- Insertar datos de ejemplo
INSERT INTO alumnos (nombre, apellidos, email, curso) VALUES
  ('Adrián',   'Maldonado Regil',       'adrian.maldonado@iefburgos.es',  '1º ASIR'),
  ('Pablo',    'Villa Valenzuela',      'pablo.villa@iefburgos.es',       '1º ASIR'),
  ('María',    'García López',          'maria.garcia@iefburgos.es',      '1º ASIR'),
  ('Carlos',   'Martínez Sánchez',      'carlos.martinez@iefburgos.es',   '2º ASIR'),
  ('Laura',    'Fernández Jiménez',     'laura.fernandez@iefburgos.es',   '2º ASIR'),
  ('Sergio',   'Rodríguez Pérez',       'sergio.rodriguez@iefburgos.es',  '1º DAM'),
  ('Ana',      'López Torres',          'ana.lopez@iefburgos.es',         '1º DAM'),
  ('Javier',   'González Ruiz',         'javier.gonzalez@iefburgos.es',   '2º DAM')
ON CONFLICT (email) DO NOTHING;

-- Verificar que se ha creado bien
SELECT * FROM alumnos ORDER BY id;
