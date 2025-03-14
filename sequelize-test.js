require('dotenv').config();
const path = require('path');
const fs = require('fs');

console.log('🔍 Diagnóstico de Configuración de Sequelize');
console.log('-------------------------------------------');

// Rutas de archivos
const databaseConfigPath = path.resolve('./src/config/database.config.js');
const productModelPath = path.resolve('./tienda-rines-api/product.model.js');

console.log('Rutas de archivos:');
console.log('- Configuración de base de datos:', databaseConfigPath);
console.log('- Modelo de producto:', productModelPath);

// Verificar existencia de archivos
console.log('\n📁 Verificación de archivos:');
console.log('Configuración de base de datos existe:', fs.existsSync(databaseConfigPath));
console.log('Modelo de producto existe:', fs.existsSync(productModelPath));

// Intentar importar módulos
console.log('\n📦 Prueba de importación:');
try {
  const { Sequelize } = require('sequelize');
  console.log('✅ Sequelize importado correctamente');
} catch (error) {
  console.error('❌ Error al importar Sequelize:', error);
}

try {
  const { sequelize } = require('./src/config/database.config');
  console.log('✅ Configuración de base de datos importada');
} catch (error) {
  console.error('❌ Error al importar configuración de base de datos:', error);
}

try {
  const Product = require('./tienda-rines-api/product.model.js');
  console.log('✅ Modelo de producto importado');
} catch (error) {
  console.error('❌ Error al importar modelo de producto:', error);
}

// Verificar variables de entorno
console.log('\n🌐 Variables de entorno:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PORT:', process.env.DB_PORT);