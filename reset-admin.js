// reset-admin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

// Configurar conexión a la base de datos desde variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    logging: false
  }
);

// Definir modelo de Usuario (versión simplificada solo para este script)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'viewer'
  }
}, {
  timestamps: true,
  paranoid: true
});

async function resetAdmin() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Credenciales del administrador
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rinesmax.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Prueba123';
    
    console.log(`Intentando restablecer contraseña para: ${adminEmail}`);

    // Buscar usuario admin
    const existingUser = await User.findOne({ where: { email: adminEmail } });

    // Generar hash de la contraseña usando bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Si existe, actualizar contraseña
    if (existingUser) {
      existingUser.password = hashedPassword;
      await existingUser.save();
      console.log('✅ Contraseña de administrador actualizada exitosamente.');
    } else {
      // Si no existe, crear usuario admin
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Usuario administrador creado exitosamente.');
    }
    
    // Verificar que la contraseña funciona
    const user = await User.findOne({ where: { email: adminEmail } });
    const isMatch = await bcrypt.compare(adminPassword, user.password);
    console.log('Verificación de contraseña:', isMatch ? '✅ Correcta' : '❌ Incorrecta');
    console.log('Hash de contraseña generado:', hashedPassword);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Cerrar conexión
    await sequelize.close();
    process.exit();
  }
}

// Ejecutar función
resetAdmin();