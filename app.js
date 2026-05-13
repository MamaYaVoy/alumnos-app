const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// CONEXIÓN A POSTGRESQL
// ─────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }  // Requerido por Render
    : false                           // Sin SSL en local si no hay DATABASE_URL
});

// ─────────────────────────────────────────────
// INICIALIZACIÓN DE LA BASE DE DATOS
// Crea la tabla si no existe e inserta datos de prueba
// ─────────────────────────────────────────────
async function initDB() {
  const client = await pool.connect();
  try {
    // 1. Crear la tabla si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS alumnos (
        id        SERIAL PRIMARY KEY,
        nombre    VARCHAR(100)  NOT NULL,
        apellidos VARCHAR(150)  NOT NULL,
        email     VARCHAR(200)  UNIQUE NOT NULL,
        curso     VARCHAR(100)
      );
    `);
    console.log('✅ Tabla "alumnos" lista.');

    // 2. Insertar datos de prueba solo si la tabla está vacía
    const { rowCount } = await client.query('SELECT 1 FROM alumnos LIMIT 1');
    if (rowCount === 0) {
      await client.query(`
        INSERT INTO alumnos (nombre, apellidos, email, curso) VALUES
          ('Ana',      'García López',     'ana.garcia@ejemplo.com',     'DAW'),
          ('Luis',     'Martínez Ruiz',    'luis.martinez@ejemplo.com',  'DAM'),
          ('María',    'Sánchez Pérez',    'maria.sanchez@ejemplo.com',  'ASIR'),
          ('Carlos',   'Fernández Gómez',  'carlos.fdez@ejemplo.com',    'DAW'),
          ('Lucía',    'Torres Molina',    'lucia.torres@ejemplo.com',   'DAM'),
          ('Pablo',    'Ramírez Castro',   'pablo.ramirez@ejemplo.com',  'ASIR'),
          ('Elena',    'Díaz Moreno',      'elena.diaz@ejemplo.com',     'DAW'),
          ('Javier',   'Ruiz Navarro',     'javier.ruiz@ejemplo.com',    'DAM');
      `);
      console.log('✅ Datos de prueba insertados.');
    } else {
      console.log('ℹ️  La tabla ya contiene datos. No se insertan duplicados.');
    }
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────
// RUTAS
// ─────────────────────────────────────────────

// Ruta principal — Lista todos los alumnos
app.get('/', async (req, res) => {
  try {
    const { rows: alumnos } = await pool.query(
      'SELECT * FROM alumnos ORDER BY id ASC'
    );

    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Lista de Alumnos</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f0f4f8;
      min-height: 100vh;
      padding: 2rem;
    }
    header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    h1 { font-size: 1.8rem; color: #2d3748; }
    .badge {
      background: #4299e1;
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: bold;
      letter-spacing: 0.05em;
    }
    .contador {
      margin-bottom: 1rem;
      color: #718096;
      font-size: 0.95rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    thead { background: #2d3748; color: white; }
    th, td {
      padding: 0.85rem 1.2rem;
      text-align: left;
      font-size: 0.95rem;
    }
    tbody tr:nth-child(even) { background: #f7fafc; }
    tbody tr:hover { background: #ebf4ff; transition: background 0.15s; }
    td:first-child { font-weight: bold; color: #2b6cb0; }
    .empty {
      text-align: center;
      padding: 3rem;
      color: #a0aec0;
      font-size: 1.1rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>📋 Lista de Alumnos</h1>
    <span class="badge">${process.env.ENTORNO || 'LOCAL'}</span>
  </header>
  <p class="contador">
    ${alumnos.length} alumno${alumnos.length !== 1 ? 's' : ''} registrado${alumnos.length !== 1 ? 's' : ''}
  </p>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Apellidos</th>
        <th>Email</th>
        <th>Curso</th>
      </tr>
    </thead>
    <tbody>
      ${alumnos.length === 0
        ? '<tr><td colspan="5" class="empty">No hay alumnos en la base de datos.</td></tr>'
        : alumnos.map(a => `
        <tr>
          <td>${a.id}</td>
          <td>${a.nombre}</td>
          <td>${a.apellidos}</td>
          <td>${a.email}</td>
          <td>${a.curso}</td>
        </tr>`).join('')
      }
    </tbody>
  </table>
</body>
</html>`);
  } catch (err) {
    console.error('❌ Error en la ruta /:', err);
    res.status(500).send(`
      <h2 style="font-family:sans-serif;color:#c53030;padding:2rem">
        ❌ Error al conectar con la base de datos
      </h2>
      <pre style="padding:2rem;background:#fff5f5;font-size:0.9rem">${err.message}</pre>
    `);
  }
});

// Health check — útil para monitoreo y tests
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');  // Comprueba que la BD responde
    res.json({
      status: 'ok',
      entorno: process.env.ENTORNO || 'LOCAL',
      db: 'conectada'
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      entorno: process.env.ENTORNO || 'LOCAL',
      db: 'sin conexión',
      detalle: err.message
    });
  }
});

// ─────────────────────────────────────────────
// ARRANQUE DEL SERVIDOR
// ─────────────────────────────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor arrancado en el puerto ${PORT}`);
      console.log(`📦 Entorno: ${process.env.ENTORNO || 'LOCAL'}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al inicializar la base de datos:', err);
    process.exit(1);  // Detiene el proceso si la BD falla al arrancar
  });
