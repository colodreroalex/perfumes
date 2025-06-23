import { Router } from 'express';
import { pool } from '../db.js';
import { isAuthenticated, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Obtener todos los perfumes
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM perfumes WHERE activo = 1');
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron perfumes' });
    }
    return res.json(rows);
  } catch (error) {
    console.error('Error al obtener perfumes:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener un perfume por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM perfumes WHERE id = ? AND activo = 1', [req.params.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Perfume no encontrado' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener perfume por ID:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear un nuevo perfume (solo para administradores)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { nombre, marca, descripcion, precio, tipo, genero, tamano, stock } = req.body;
    
    // Obtener el nombre del archivo de imagen si existe
    const imagen = req.file ? req.file.filename : null;

    // Verificar si el perfume ya existe
    const [existingPerfume] = await pool.query('SELECT id FROM perfumes WHERE nombre = ? AND marca = ?', [nombre, marca]);
    
    if (existingPerfume && existingPerfume.length > 0) {
      return res.status(409).json({ message: 'El perfume ya existe en la base de datos' });
    }

    // Insertar el nuevo perfume
    const [result] = await pool.query(
      'INSERT INTO perfumes (nombre, marca, descripcion, precio, tipo, genero, tamano, stock, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, marca, descripcion, precio, tipo, genero, tamano, stock, imagen]
    );
    
    if (!result || !result.insertId) {
      return res.status(400).json({ message: 'Error al crear el perfume' });
    }
    
    return res.status(201).json({ 
      message: 'Perfume creado exitosamente', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error al crear perfume:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar un perfume (solo para administradores)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, marca, descripcion, precio, tipo, genero, tamano, stock, activo } = req.body;
    
    // Obtener el nombre del archivo de imagen si se ha subido uno nuevo
    let imagen = undefined;
    if (req.file) {
      imagen = req.file.filename;
    }

    // Verificar si el perfume existe
    const [perfumeExiste] = await pool.query('SELECT id FROM perfumes WHERE id = ?', [id]);
    if (!perfumeExiste || perfumeExiste.length === 0) {
      return res.status(404).json({ message: 'Perfume no encontrado' });
    }

    // Verificar si el nombre y marca ya existen en otro perfume
    if (nombre && marca) {
      const [existingPerfume] = await pool.query(
        'SELECT id FROM perfumes WHERE nombre = ? AND marca = ? AND id != ?', 
        [nombre, marca, id]
      );
      
      if (existingPerfume && existingPerfume.length > 0) {
        return res.status(409).json({ message: 'Ya existe otro perfume con el mismo nombre y marca' });
      }
    }

    // Actualizar el perfume
    const [result] = await pool.query(
      'UPDATE perfumes SET nombre = IFNULL(?, nombre), marca = IFNULL(?, marca), descripcion = IFNULL(?, descripcion), ' +
      'precio = IFNULL(?, precio), tipo = IFNULL(?, tipo), genero = IFNULL(?, genero), ' +
      'tamano = IFNULL(?, tamano), stock = IFNULL(?, stock), imagen = IFNULL(?, imagen), ' +
      'activo = IFNULL(?, activo) WHERE id = ?',
      [nombre, marca, descripcion, precio, tipo, genero, tamano, stock, imagen, activo, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'No se pudo actualizar el perfume' });
    }
    
    return res.json({ message: 'Perfume actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar perfume:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar un perfume (borrado permanente - solo para administradores)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el perfume existe
    const [perfumeExiste] = await pool.query('SELECT id, imagen FROM perfumes WHERE id = ?', [id]);
    if (!perfumeExiste || perfumeExiste.length === 0) {
      return res.status(404).json({ message: 'Perfume no encontrado' });
    }

    // Borrado permanente de la base de datos
    const [result] = await pool.query('DELETE FROM perfumes WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'No se pudo eliminar el perfume' });
    }
    
    return res.json({ message: 'Perfume eliminado permanentemente de la base de datos' });
  } catch (error) {
    console.error('Error al eliminar perfume:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;