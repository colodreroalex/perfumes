import { pool } from '../db.js';

// Middleware para verificar si el usuario está autenticado
export const isAuthenticated = (req, res, next) => {
  try {
    // Obtener el token del header de autorización
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const token = authHeader.split(' ')[1];
    
    // Parsear los datos de sesión
    let sessionData;
    try {
      sessionData = JSON.parse(token);
    } catch (e) {
      return res.status(401).json({ message: 'Sesión inválida' });
    }
    
    // Verificar que la sesión no haya expirado (8 horas)
    const now = Date.now();
    const eightHoursInMs = 8 * 60 * 60 * 1000;
    if (!sessionData.timestamp || now - sessionData.timestamp > eightHoursInMs) {
      return res.status(401).json({ message: 'Sesión expirada' });
    }
    
    // Añadir la información del usuario al objeto request
    req.user = sessionData;
    
    // Continuar con la siguiente función
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(401).json({ message: 'Sesión inválida o expirada' });
  }
};

// Middleware para verificar si el usuario es administrador
export const isAdmin = async (req, res, next) => {
  try {
    // Primero verificar si está autenticado
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Verificar si el usuario existe en la tabla de administradores
    const [rows] = await pool.query('SELECT id FROM administradores WHERE id = ?', [req.user.id]);
    
    if (!rows || rows.length === 0) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Si es administrador, continuar
    next();
  } catch (error) {
    console.error('Error al verificar administrador:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};