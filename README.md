# Perfumes Arabes AE

Aplicación web para la gestión y visualización de perfumes árabes.

## Características

- Catálogo de perfumes con detalles como nombre, marca, descripción, precio, etc.
- Panel de administración para gestionar los perfumes (CRUD)
- Autenticación de administradores
- Diseño responsive con una paleta de colores elegante

## Tecnologías utilizadas

- Node.js
- Express
- MySQL
- Handlebars (para las vistas)
- JWT (para autenticación)
- Bcrypt (para encriptación de contraseñas)
- Multer (para subida de imágenes)

## Requisitos previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)

## Instalación

1. Clonar el repositorio:

```bash
git clone <url-del-repositorio>
cd perfumes_web
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar la base de datos:

- Crear una base de datos MySQL llamada `perfumes_web`
- Importar el archivo `perfumes_web.sql` para crear las tablas y datos iniciales

```bash
mysql -u root -p perfumes_web < perfumes_web.sql
```

4. Configurar variables de entorno (opcional):

Puedes modificar las variables de entorno en el archivo `src/config.js` o crear un archivo `.env` en la raíz del proyecto.

## Ejecución

### Modo desarrollo

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del proyecto

```
perfumes_web/
├── src/
│   ├── public/          # Archivos estáticos (CSS, JS, imágenes)
│   ├── routes/          # Rutas de la API
│   ├── middlewares/     # Middlewares personalizados
│   ├── views/           # Plantillas Handlebars
│   ├── app.js           # Punto de entrada de la aplicación
│   ├── config.js        # Configuración de la aplicación
│   └── db.js            # Configuración de la base de datos
├── perfumes_web.sql     # Script SQL para crear la base de datos
├── package.json
└── README.md
```

## Acceso al panel de administración

Para acceder al panel de administración, utiliza las siguientes credenciales:

- Email: admin@perfumesweb.com
- Contraseña: x000138da4983

## Licencia

ISC