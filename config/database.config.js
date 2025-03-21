const { Sequelize } = require('sequelize');

// Configuración de la conexión a la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASS, 
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      paranoid: true
    },
    dialectOptions: {
      dateStrings: true,
      typeCast: function (field, next) {
        // Para campos de tipo fecha
        if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
          const value = field.string();
          // Si el valor es nulo o una fecha inválida, devolver null
          if (!value || value === '0000-00-00 00:00:00') {
            return null;
          }
          return value;
        }
        
        // Para campos decimales
        if (field.type === 'DECIMAL' || field.type === 'NEWDECIMAL') {
          const value = field.string();
          // Si el valor es nulo, devolver null
          if (value === null || value === undefined) {
            return null;
          }
          return parseFloat(value);
        }
        
        // Para otros tipos, usar el handler predeterminado
        return next();
      }
    }
  }
);

// Función para probar la conexión
const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
    return false;
  }
};

// Función para eliminar manualmente las tablas en el orden correcto
const dropAllTables = async () => {
  try {
    // Desactivar temporalmente las restricciones de clave foránea
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Obtener todas las tablas
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
    `);
    
    console.log('Tablas encontradas:', results.map(r => r.TABLE_NAME));
    
    // Eliminar todas las tablas
    for (const row of results) {
      const tableName = row.TABLE_NAME;
      await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
      console.log(`Tabla eliminada: ${tableName}`);
    }
    
    // Reactivar las restricciones de clave foránea
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Todas las tablas han sido eliminadas correctamente.');
  } catch (error) {
    console.error('❌ Error al eliminar tablas:', error);
    // Asegurarse de reactivar las restricciones de clave foránea incluso en caso de error
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    throw error;
  }
};

// Función para sincronizar modelos
const syncDatabase = async (force = false, setupRelationsFunc = null) => {
  try {
    if (force) {
      // Eliminar todas las tablas manualmente primero
      await dropAllTables();
    }
    
    // Ahora sincronizar los modelos (recrear tablas)
    await sequelize.sync({ 
      force: false, // Ya eliminamos las tablas manualmente
      alter: false
    });
    console.log('📦 Modelos sincronizados con la base de datos (tablas recreadas).');
    
    // Solo llamar a setupRelations si se proporcionó como parámetro
    if (setupRelationsFunc) {
      setupRelationsFunc();
    }
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error);
    throw error;
  }
};

// Exportación explícita
module.exports = {
  sequelize,
  Sequelize,
  testDatabaseConnection,
  syncDatabase
};