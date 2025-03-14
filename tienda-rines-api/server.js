require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { 
  sequelize, 
  testDatabaseConnection, 
  syncDatabase 
} = require('../config/database.config');
const setupRelations = require('./model-relations');

const app = express();

// Configuración de CORS más restrictiva
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Puertos de desarrollo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importaciones de modelos
const User = require('./user.model');
const Product = require('./product.model');
const Category = require('./category.model');
const Setting = require('./settings.model'); // Añadido modelo de ajustes

// Importar controladores de rutas
const authRoutes = require('../routes/auth');
const productRoutes = require('../routes/products');
const categoryRoutes = require('../routes/categories');
const settingsRoutes = require('../routes/settings'); // Añadida ruta de ajustes
const promotionRoutes = require('./promotion.routes'); // Añadida ruta de promociones

// Configurar rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes); // Añadida ruta de ajustes
app.use('/api/promotions', promotionRoutes); // Añadida configuración de ruta de promociones

// Importar AuthController
const AuthController = require('./auth.controller');

// Función de inicialización
const initializeApp = async () => {
  try {
    // Probar conexión a la base de datos
    await testDatabaseConnection();

    // Sincronizar modelos
    await syncDatabase(false, setupRelations);

    // Inicializar usuario admin
    await AuthController.initializeAdminUser();
    console.log('Verificación de usuario admin completada');

    // Iniciar servidor
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
    process.exit(1);
  }
};

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Ha ocurrido un error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Tienda de Rines funcionando correctamente');
});

// Carpeta para imágenes
app.use('/uploads', express.static('uploads'));

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Ruta no encontrada'
  });
});

// Inicializar la aplicación
initializeApp();

// Exportar la instancia de Sequelize
module.exports = { sequelize, app };