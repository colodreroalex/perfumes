import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Ruta para login de administradores
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se proporcionaron email y password
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // Buscar el administrador por email
    const [rows] = await pool.query('SELECT * FROM administradores WHERE email = ?', [email]);
    
    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const admin = rows[0];

    // Verificar la contraseña (sin hashear)
    if (password !== admin.password) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Crear un objeto de sesión simple
    const sessionData = {
      id: admin.id,
      email: admin.email,
      role: 'admin',
      timestamp: Date.now()
    };

    // Enviar respuesta con datos de sesión
    return res.json({
      message: 'Login exitoso',
      user: {
        id: admin.id,
        nombre: admin.nombre || admin.usuario,
        email: admin.email
      },
      token: JSON.stringify(sessionData) // Usamos un objeto JSON como "token" simple
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para verificar si la sesión es válida
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No autorizado' });
    }

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
    
    // Buscar el administrador en la base de datos
    const [rows] = await pool.query('SELECT id, usuario as nombre, email FROM administradores WHERE id = ?', [sessionData.id]);
    
    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    return res.json({
      user: rows[0],
      isAdmin: true
    });
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
});

export default router;