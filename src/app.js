import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { create } from 'express-handlebars';
import multer from 'multer';
import { PORT } from './config.js';
import perfumesRoutes from './routes/perfumes.routes.js';
import authRoutes from './routes/auth.routes.js';
import { isAuthenticated, isAdmin } from './middlewares/auth.middleware.js';

// Configuración de directorios
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar la aplicación
const app = express();

// Configuración de Handlebars
const hbs = create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: join(__dirname, 'views/layouts'),
  helpers: {
    currentYear: () => new Date().getFullYear()
  }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(__dirname, 'public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Middleware para procesar archivos en las rutas de perfumes
app.use('/api/perfumes', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    upload.single('imagen')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Error en la subida: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  } else {
    next();
  }
});

// Rutas de la API
app.use('/api/perfumes', perfumesRoutes);
app.use('/api/auth', authRoutes);

// Rutas de las vistas
app.get('/', (req, res) => {
  res.render('home', { title: 'Inicio' });
});

app.get('/contacto', (req, res) => {
  res.render('contacto', { title: 'Contacto' });
});

// Rutas del panel de administración
app.get('/admin', (req, res) => {
  res.render('admin/dashboard', { 
    title: 'Panel de Administración',
    layout: 'main',
    requiresAuth: true
  });
});

app.get('/admin/perfumes', (req, res) => {
  res.render('admin/perfumes/index', { 
    title: 'Gestión de Perfumes',
    layout: 'main',
    requiresAuth: true
  });
});

app.get('/admin/perfumes/nuevo', (req, res) => {
  res.render('admin/perfumes/nuevo', { 
    title: 'Nuevo Perfume',
    layout: 'main',
    requiresAuth: true
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});