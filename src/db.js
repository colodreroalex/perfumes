import pkg from 'pg';
const { Pool } = pkg;
import { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } from "./config.js";

// Configuración de la conexión a la base de datos PostgreSQL
export const pool = new Pool({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Permitir conexiones sin verificación de certificado en producción
  } : false,
  connectionTimeoutMillis: 120000, // Timeout de conexión: 2 minutos
  idleTimeoutMillis: 60000, // Timeout de inactividad: 1 minuto
  max: 10 // Máximo de conexiones en el pool
});

// Verificar la conexión a la base de datos
pool.connect()
  .then(client => {
    console.log('Conexión a la base de datos PostgreSQL establecida correctamente');
    client.release();
  })
  .catch(error => {
    console.error('Error al conectar a la base de datos:', error.message);
    console.error('Detalles adicionales del error:', error);
    console.error('Asegúrese de que el servidor PostgreSQL esté en ejecución y que la base de datos exista.');
  });
