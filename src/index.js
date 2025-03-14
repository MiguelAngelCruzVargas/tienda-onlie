require('dotenv').config(); // Añade esta línea al principio para cargar variables de entorno
const express = require('express');
const cors = require('cors'); // Añade soporte para CORS
const helmet = require('helmet'); // Añade algunas configuraciones de seguridad
const { testDatabaseConnection, syncDatabase } = require('./config/database.config');
const ProductController = require('../tienda-rines-api/product.controller');
const AuthController = require('../tienda-rines-api/auth.controller'); // Importar el controlador de autenticación
const productRoutes = require('../routes/product.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad y configuración
app.use(helmet()); // Añade cabeceras de seguridad
app.use(cors()); // Permite solicitudes de diferentes orígenes
app.use(express.json()); // Parsea JSON
app.use(express.urlencoded({ extended: true })); // Parsea datos de formularios

// Rutas
app.use('/api/products', productRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenido a la API de Tienda Rines', 
    status: 'OK' 
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada' 
  });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Ocurrió un error interno', 
    error: process.env.NODE_ENV === 'development' ? err.message : null 
  });
});

// Inicialización del servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    const isConnected = await testDatabaseConnection();
    
    if (isConnected) {
      // Sincronizar modelos
      await syncDatabase();
      
      // Inicializar usuario administrador
      try {
        await AuthController.initializeAdminUser();
        console.log('✅ Usuario administrador verificado/creado exitosamente');
      } catch (error) {
        console.error('❌ Error al inicializar usuario administrador:', error);
      }
      
      // Agregar productos de ejemplo (solo en desarrollo)
      if (process.env.NODE_ENV === 'development') {
        await ProductController.seedProducts();
      }
      
      // Iniciar servidor
      const server = app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
      });

      // Manejo de cierre graciosos del servidor
      process.on('SIGTERM', () => {
        console.log('SIGTERM recibido. Cerrando servidor...');
        server.close(() => {
          console.log('Servidor cerrado');
          process.exit(0);
        });
      });
    } else {
      console.error('No se pudo iniciar el servidor debido a problemas de conexión');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();