import { createPool } from "mysql2/promise";
import { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } from "./config.js";

// Configuración de la conexión a la base de datos
export const pool = createPool({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000, // Aumentar el tiempo de espera de conexión a 60 segundos
  ssl: process.env.NODE_ENV === 'production' ? {rejectUnauthorized: true} : false // Habilitar SSL en producción
});

// Verificar la conexión a la base de datos
pool.getConnection()
  .then(connection => {
    console.log('Conexión a la base de datos establecida correctamente');
    connection.release();
  })
  .catch(error => {
    console.error('Error al conectar a la base de datos:', error.message);
    console.error('Detalles adicionales del error:', error);
    console.error('Asegúrese de que el servidor MySQL esté en ejecución y que la base de datos exista.');
  });
