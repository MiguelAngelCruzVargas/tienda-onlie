const express = require('express');
const { sequelize } = require('../config/database.config');

const router = express.Router();

// Ruta para probar la conexión a la base de datos
router.get('/test-connection', async (req, res) => {
  try {
    // Intentar autenticar la conexión
    await sequelize.authenticate();
    res.status(200).json({ 
      message: 'Conexión a la base de datos establecida correctamente',
      status: 'success'
    });
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error);
    res.status(500).json({ 
      message: 'No se pudo conectar a la base de datos',
      error: error.message,
      status: 'error'
    });
  }
});

// Ruta para sincronizar modelos (usar con precaución en producción)
router.post('/sync-database', async (req, res) => {
  try {
    // El parámetro 'force' eliminará y recreará las tablas
    const { force = false } = req.body;
    
    await sequelize.sync({ force });
    
    res.status(200).json({ 
      message: `Base de datos sincronizada ${force ? 'forzosamente' : ''}`,
      status: 'success'
    });
  } catch (error) {
    console.error('Error al sincronizar base de datos:', error);
    res.status(500).json({ 
      message: 'No se pudo sincronizar la base de datos',
      error: error.message,
      status: 'error'
    });
  }
});

// Ruta para obtener información de la base de datos
router.get('/database-info', async (req, res) => {
  try {
    const results = await sequelize.query('SELECT DATABASE() as database');
    const tables = await sequelize.query('SHOW TABLES');
    
    res.status(200).json({ 
      database: results[0][0].database,
      tables: tables[0].map(table => Object.values(table)[0]),
      status: 'success'
    });
  } catch (error) {
    console.error('Error al obtener información de la base de datos:', error);
    res.status(500).json({ 
      message: 'No se pudo obtener información de la base de datos',
      error: error.message,
      status: 'error'
    });
  }
});

module.exports = router;