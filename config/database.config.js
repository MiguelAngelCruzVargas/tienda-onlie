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

// Función para sincronizar modelos
const syncDatabase = async (force = false, setupRelationsFunc = null) => {
  try {
    // Usar force con precaución
    await sequelize.sync({ 
      force: false, 
      alter: {
        drop: false
      }
    });
    console.log('📦 Modelos sincronizados con la base de datos.');
    
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