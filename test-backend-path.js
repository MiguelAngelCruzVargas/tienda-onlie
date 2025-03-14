const path = require('path');
const fs = require('fs');

console.log('🔍 Explorando estructura del proyecto');
console.log('=====================================');

// Obtener el directorio raíz del proyecto
const rootDir = path.resolve('./');
console.log('📂 Directorio raíz:', rootDir);
console.log('Contenido del directorio raíz:');
console.log(fs.readdirSync(rootDir));
console.log('-------------------------------------');

// Explorar la carpeta tienda-rines-api
const apiDir = path.join(rootDir, 'tienda-rines-api');
console.log('📂 Directorio API:', apiDir);
try {
  if (fs.existsSync(apiDir)) {
    console.log('✅ Directorio tienda-rines-api encontrado');
    console.log('Contenido:');
    console.log(fs.readdirSync(apiDir));
  } else {
    console.log('❌ Directorio tienda-rines-api NO encontrado');
  }
} catch (error) {
  console.error('❌ Error al verificar tienda-rines-api:', error);
}
console.log('-------------------------------------');

// Explorar la carpeta src
const srcDir = path.join(rootDir, 'src');
console.log('📂 Directorio src:', srcDir);
try {
  if (fs.existsSync(srcDir)) {
    console.log('✅ Directorio src encontrado');
    console.log('Contenido:');
    console.log(fs.readdirSync(srcDir));
    
    // Explorar la carpeta config dentro de src
    const configDir = path.join(srcDir, 'config');
    console.log('📂 Directorio src/config:');
    if (fs.existsSync(configDir)) {
      console.log('✅ Directorio config encontrado');
      console.log('Contenido:');
      console.log(fs.readdirSync(configDir));
    } else {
      console.log('❌ Directorio config NO encontrado');
    }
  } else {
    console.log('❌ Directorio src NO encontrado');
  }
} catch (error) {
  console.error('❌ Error al verificar src:', error);
}
console.log('-------------------------------------');

// Explorar la carpeta routes
const routesDir = path.join(rootDir, 'routes');
console.log('📂 Directorio routes:', routesDir);
try {
  if (fs.existsSync(routesDir)) {
    console.log('✅ Directorio routes encontrado');
    console.log('Contenido:');
    console.log(fs.readdirSync(routesDir));
  } else {
    console.log('❌ Directorio routes NO encontrado');
  }
} catch (error) {
  console.error('❌ Error al verificar routes:', error);
}
console.log('-------------------------------------');

// Comprobar el archivo user.model.js
const userModelPath = path.join(apiDir, 'user.model.js');
console.log('📄 Archivo user.model.js:', userModelPath);
try {
  if (fs.existsSync(userModelPath)) {
    console.log('✅ Archivo user.model.js encontrado');
    // Ver las primeras líneas para ver qué está importando
    const content = fs.readFileSync(userModelPath, 'utf8').split('\n').slice(0, 5).join('\n');
    console.log('Primeras líneas del archivo:');
    console.log(content);
  } else {
    console.log('❌ Archivo user.model.js NO encontrado');
  }
} catch (error) {
  console.error('❌ Error al verificar user.model.js:', error);
}