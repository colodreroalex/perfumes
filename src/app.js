import express from "express";
import { pool } from "./db.js";
import { PORT } from "./config.js";

const app = express();
const port = 3000;

//Ruta principal que muestra un mensaje de bienvenida
app.get("/", async (req, res) => {
  
    const [result] = await pool.query("SELECT * FROM administradores");
    res.json(result);
  
});

//Ruta para obtener todos los perfumes
app.get("/ping", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM perfumes");
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para crear un nuevo perfume TEST
app.get('/create', async (req, res) => {
  try {
    // Verificar si el perfume ya existe
    const [existingPerfume] = await pool.query('SELECT id FROM perfumes WHERE nombre = "Blue de Channel" AND marca = "Channel"');
    
    if (existingPerfume && existingPerfume.length > 0) {
      return res.status(409).json({ message: "El perfume ya existe en la base de datos" });
    }

    // Si no existe, crear el nuevo perfume
    const [result] = await pool.query('INSERT INTO perfumes (nombre, marca, descripcion, precio, tipo, genero, tamano, stock) VALUES ("Blue de Channel", "Channel", "Fragancia fresca y masculina", 120.00, "Eau de Parfum", "Masculino", "100ml", 10)');
    
    if (!result || !result.insertId) {
      return res.status(400).json({ message: "Error al crear el perfume" });
    }
    
    return res.status(201).json({ 
      message: 'Perfume creado exitosamente', 
      id: result.insertId 
    });
  } catch (error) {
    console.error("Error en la ruta /create:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.listen(port);
console.log(`Server is running on port ${port}`);
