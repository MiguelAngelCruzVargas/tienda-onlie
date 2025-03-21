// // server.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const { 
//   sequelize, 
//   testDatabaseConnection, 
//   syncDatabase 
// } = require('./config/database.config');
// const setupRelations = require('./tienda-rines-api/model-relations');

// const app = express();

// // Middlewares
// // Configuración CORS mejorada
// app.use(cors({
//   origin: function(origin, callback) {
//     // Lista de orígenes permitidos
//     const allowedOrigins = [
//       'http://localhost:5173',
//       'http://localhost:8000',
//       'https://tiendarines-frontend.loca.lt',
//       'https://tiendarines-app.loca.lt'
//     ];
    
//     // Permitir solicitudes sin origen (como Postman o curl)
//     // o permitir orígenes específicos
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       // Durante desarrollo, permitir cualquier origen
//       callback(null, true);
      
//       // Log para debugging
//       console.log(`Origen solicitado: ${origin}`);
//     }
//   },
//   credentials: true,  // IMPORTANTE: Habilitar credenciales para autenticación
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));

// // MODIFICADO: Aumentado el límite del body parser a 10MB para permitir subida de imágenes
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Middleware para diagnóstico de conexiones
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin') || 'No origin'}`);
//   next();
// });

// // Servir archivos estáticos
// app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// app.use(express.static(path.join(__dirname, 'public')));

// // Importar controladores de rutas
// const authRoutes = require('./routes/auth.routes');
// const productRoutes = require('./routes/products.routes');
// const categoryRoutes = require('./routes/categories.routes');
// const orderRoutes = require('./routes/order.routes');
// const dashboardRoutes = require('./routes/dashboard.routes');
// const settingsRoutes = require('./routes/settings.routes');
// const promotionsRoutes = require('./routes/promotions.routes');
// const reviewsRoutes = require('./routes/reviews.routes');
// const customerRoutes = require('./routes/customer.routes');

// // Configurar rutas
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/settings', settingsRoutes);
// app.use('/api/promotions', promotionsRoutes);
// app.use('/api/reviews', reviewsRoutes);
// app.use('/api/customers', customerRoutes);
// // Importar AuthController
// const AuthController = require('./tienda-rines-api/auth.controller');

// // Ruta de prueba
// app.get('/api/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'ok',
//     message: 'API de Tienda de Rines funcionando correctamente',
//     timestamp: new Date(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // Función de inicialización
// const initializeApp = async () => {
//   try {
//     // Probar conexión a la base de datos
//     const dbConnected = await testDatabaseConnection();
    
//     if (!dbConnected) {
//       console.error('❌ No se pudo conectar a la base de datos. Abortando inicio del servidor.');
//       process.exit(1);
//     }

//     // Sincronizar modelos
//     await syncDatabase(false, setupRelations);

//     // Inicializar usuario admin
//     await AuthController.seedAdminUser();
//     console.log('✅ Verificación de usuario admin completada');

//     // Iniciar servidor
//     const PORT = process.env.PORT || 3000;
//     app.listen(PORT, () => {
//       console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
//       console.log(`🌐 API disponible en: http://localhost:${PORT}/api`);
//       console.log(`💻 Modo: ${process.env.NODE_ENV || 'development'}`);
//     });
//   } catch (error) {
//     console.error('❌ Error al inicializar la aplicación:', error);
//     process.exit(1);
//   }
// };

// // Manejo de rutas no encontradas
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Ruta no encontrada'
//   });
// });

// // Middleware de manejo de errores global
// app.use((err, req, res, next) => {
//   console.error('❌ Error interno del servidor:', err);
//   res.status(500).json({
//     success: false,
//     message: 'Error interno del servidor',
//     error: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error en el servidor'
//   });
// });

// // Inicializar la aplicación
// initializeApp();

// // Exportar la instancia de app para pruebas
// module.exports = { app, sequelize };
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet'); // Añadir helmet para seguridad
const compression = require('compression'); // Comprimir respuestas
const rateLimit = require('express-rate-limit'); // Limitar solicitudes

const { 
  sequelize, 
  testDatabaseConnection, 
  syncDatabase 
} = require('./config/database.config');
const setupRelations = require('./tienda-rines-api/model-relations');

const app = express();

// Middleware de seguridad y rendimiento
app.use(helmet()); // Añade cabeceras de seguridad
app.use(compression()); // Comprimir respuestas

// Limitador de solicitudes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // Límite de 200 solicitudes por IP
  message: 'Demasiadas solicitudes, por favor intente más tarde'
});
app.use(limiter);

// Configuración CORS mejorada
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8000',
      'https://tiendarines-frontend.loca.lt',
      'http://tiendarines-frontend.loca.lt',
      'https://tiendarines-app.loca.lt'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Origen no permitido: ${origin}`);
      callback(null, true); // En desarrollo, permitir cualquier origen
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 3600 // Caché de preflight por 1 hora
}));

// Parseo de solicitudes
app.use(express.json({ 
  limit: '10mb', 
  // Configuraciones de seguridad adicionales
  verify: (req, res, buf) => {
    // Prevenir ataques de JSON overflow
    if (buf.length > 1024 * 1024) {
      throw new Error('Solicitud demasiado grande');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de diagnóstico (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin') || 'No origin'}`);
    next();
  });
}

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
  maxAge: '1d', // Caché de archivos estáticos por 1 día
  setHeaders: (res, path) => {
    if (path.endsWith('.jpg') || path.endsWith('.png')) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Caché específico para imágenes
    }
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

// Importar y configurar rutas
const routes = [
  { path: '/api/auth', router: require('./routes/auth.routes') },
  { path: '/api/products', router: require('./routes/products.routes') },
  { path: '/api/categories', router: require('./routes/categories.routes') },
  { path: '/api/orders', router: require('./routes/order.routes') },
  { path: '/api/dashboard', router: require('./routes/dashboard.routes') },
  { path: '/api/settings', router: require('./routes/settings.routes') },
  { path: '/api/promotions', router: require('./routes/promotions.routes') },
  { path: '/api/reviews', router: require('./routes/reviews.routes') },
  { path: '/api/customers', router: require('./routes/customer.routes') }
];

routes.forEach(route => app.use(route.path, route.router));

const AuthController = require('./tienda-rines-api/auth.controller');

// Ruta de health check mejorada
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'API de Tienda de Rines funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memoryUsage: process.memoryUsage()
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.path
  });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error interno del servidor:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error en el servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Función de inicialización
const initializeApp = async () => {
  try {
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Abortando inicio del servidor.');
      process.exit(1);
    }

    await syncDatabase(false, setupRelations);
    await AuthController.seedAdminUser();
    console.log('✅ Verificación de usuario admin completada');

    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      console.log(`🌐 API disponible en: http://localhost:${PORT}/api`);
      console.log(`💻 Modo: ${process.env.NODE_ENV || 'development'}`);
    });

    // Manejo de cierre graciosos del servidor
    process.on('SIGTERM', () => {
      console.log('SIGTERM recibido. Cerrando servidor...');
      server.close(() => {
        console.log('Servidor cerrado');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error);
    process.exit(1);
  }
};

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Inicializar la aplicación
initializeApp();

// Exportar la instancia de app para pruebas
module.exports = { app, sequelize };