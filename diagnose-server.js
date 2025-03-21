const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Diagnóstico de Servidor Backend');
console.log('-----------------------------------');

const serverPath = path.resolve('./tienda-rines-api/server.js');
console.log('Ruta del servidor:', serverPath);

const serverProcess = spawn('node', [serverPath], {
  stdio: 'pipe',
  env: { ...process.env, PORT: 3000 }
});

serverProcess.stdout.on('data', (data) => {
  console.log(`📋 Stdout: ${data}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`❌ Stderr: ${data}`);
});

serverProcess.on('close', (code) => {
  console.log(`🚪 Proceso cerrado con código ${code}`);
});

serverProcess.on('error', (err) => {
  console.error('❌ Error al iniciar el proceso:', err);
});

// Detener el proceso después de 10 segundos
setTimeout(() => {
  serverProcess.kill();
  console.log('⏰ Proceso detenido después de 10 segundos');
}, 10000);