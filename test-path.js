const path = require('path');
const fs = require('fs');

console.log('Ruta actual:', process.cwd());

const serverPath = path.resolve('./tienda-rines-api');
console.log('Ruta completa del servidor:', serverPath);

try {
  if (fs.existsSync(serverPath)) {
    console.log('✅ El archivo server.js existe');
  } else {
    console.log('❌ El archivo server.js NO existe');
  }
} catch (error) {
  console.error('Error al verificar el archivo:', error);
}