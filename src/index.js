// require('dotenv').config(); // Añade esta línea al principio para cargar variables de entorno
// const express = require('express');
// const cors = require('cors'); // Añade soporte para CORS
// const helmet = require('helmet'); // Añade algunas configuraciones de seguridad
// const { testDatabaseConnection, syncDatabase } = require('./config/database.config');
// const ProductController = require('../tienda-rines-api/product.controller');
// const AuthController = require('../tienda-rines-api/auth.controller'); // Importar el controlador de autenticación
// const productRoutes = require('../routes/product.routes');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middlewares de seguridad y configuración
// app.use(helmet()); // Añade cabeceras de seguridad
// // app.use(cors()); // Permite solicitudes de diferentes orígenes
// app.use(express.json()); // Parsea JSON
// app.use(express.urlencoded({ extended: true })); // Parsea datos de formularios



// app.use(cors({
//   origin: [
//     'http://localhost:5173',
//     'https://tiendarines-frontend.loca.lt',
//     'http://tiendarines-frontend.loca.lt', // Añadir versión HTTP
//     'http://localhost:8000' // Si usas proxy
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// // Rutas
// app.use('/api/products', productRoutes);

// // Ruta de prueba
// app.get('/', (req, res) => {
//   res.json({ 
//     message: 'Bienvenido a la API de Tienda Rines', 
//     status: 'OK' 
//   });
// });

// // Middleware para manejar rutas no encontradas
// app.use((req, res, next) => {
//   res.status(404).json({ 
//     message: 'Ruta no encontrada' 
//   });
// });

// // Middleware de manejo de errores global
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     message: 'Ocurrió un error interno', 
//     error: process.env.NODE_ENV === 'development' ? err.message : null 
//   });
// });

// // Inicialización del servidor
// async function startServer() {
//   try {
//     // Probar conexión a la base de datos
//     const isConnected = await testDatabaseConnection();
    
//     if (isConnected) {
//       // Sincronizar modelos
//       await syncDatabase();
      
//       // Inicializar usuario administrador
//       try {
//         await AuthController.initializeAdminUser();
//         console.log('✅ Usuario administrador verificado/creado exitosamente');
//       } catch (error) {
//         console.error('❌ Error al inicializar usuario administrador:', error);
//       }
      
//       // Agregar productos de ejemplo (solo en desarrollo)
//       if (process.env.NODE_ENV === 'development') {
//         await ProductController.seedProducts();
//       }
      
//       // Iniciar servidor
//       const server = app.listen(PORT, () => {
//         console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
//         console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
//       });

//       // Manejo de cierre graciosos del servidor
//       process.on('SIGTERM', () => {
//         console.log('SIGTERM recibido. Cerrando servidor...');
//         server.close(() => {
//           console.log('Servidor cerrado');
//           process.exit(0);
//         });
//       });
//     } else {
//       console.error('No se pudo iniciar el servidor debido a problemas de conexión');
//       process.exit(1);
//     }
//   } catch (error) {
//     console.error('Error al iniciar el servidor:', error);
//     process.exit(1);
//   }
// }

// // Manejar errores no capturados
// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//   process.exit(1);
// });

// startServer();

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { testDatabaseConnection, syncDatabase } = require('./config/database.config');
const ProductController = require('./controllers/product.controller');
const AuthController = require('./controllers/auth.controller');
const productRoutes = require('./routes/product.routes');

// Configuración inicial
const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
// 1. Verificación de variables de entorno críticas
// =============================================
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Faltan variables de entorno requeridas: ${varName}`);
    process.exit(1);
  }
});

// =============================================
// 2. Configuración de middlewares (ORDEN IMPORTANTE)
// =============================================

// Seguridad básica
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Ajustar según necesidades del frontend
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

// Compresión
app.use(compression());

// Configuración CORS detallada
// En tu index.js
const allowedOrigins = [
  'http://localhost:5173',
  'https://tiendarines-api.loca.lt', // ← ¡NUEVO!
  'https://tiendarines-frontend.loca.lt'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600
}));

// Parseo de solicitudes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================
// 3. Logging de solicitudes (solo desarrollo)
// =============================================
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// =============================================
// 4. Configuración de rutas PRINCIPALES
// =============================================

// Ruta de verificación de estado
app.get('/', (req, res) => {
  res.json({
    message: 'API Tienda Rines Operativa',
    version: '1.0.0',
    status: 'OK',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta de health check extendida
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'Desconectado',
    memoryUsage: process.memoryUsage()
  };

  try {
    await testDatabaseConnection();
    healthCheck.database = 'Conectado';
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.status = 'WARNING';
    healthCheck.error = error.message;
    res.status(503).json(healthCheck);
  }
});

// Rutas de la API
app.use('/api/products', productRoutes);

// =============================================
// 5. Manejo de errores
// =============================================

// 404 - Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    attemptedPath: req.path
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Error interno del servidor',
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

// =============================================
// 6. Inicialización del servidor
// =============================================
async function initializeServer() {
  try {
    // 1. Verificar conexión a la base de datos
    await testDatabaseConnection();
    console.log('✅ Conexión a la base de datos exitosa');

    // 2. Sincronizar modelos
    await syncDatabase();
    console.log('✅ Modelos sincronizados');

    // 3. Inicializar usuario admin
    await AuthController.initializeAdminUser();
    console.log('✅ Usuario administrador verificado');

    // 4. Datos de prueba (solo desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await ProductController.seedProducts();
      console.log('📦 Productos de prueba creados');
    }

    // 5. Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor operativo en http://localhost:${PORT}`);
      console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });

    // Manejo de cierre gracioso
    process.on('SIGTERM', () => {
      console.log('🛑 Recibida señal SIGTERM. Cerrando servidor...');
      server.close(() => {
        console.log('🔴 Servidor detenido');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Error de inicialización:', error);
    process.exit(1);
  }
}

// =============================================
// 7. Manejo de errores no capturados
// =============================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Rechazo no manejado:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('⚠️ Excepción no capturada:', error);
  process.exit(1);
});

// Iniciar todo el sistema
initializeServer();

module.exports = app;