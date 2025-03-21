// tienda-rines-api/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./user.model');

/**
 * Método para iniciar sesión
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Object} - Token JWT y datos del usuario
 */
exports.login = async (email, password) => {
  try {
    // Buscar el usuario por email
    const user = await User.findOne({ where: { email } });
    
    // Verificar si el usuario existe
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    // Verificar si la contraseña es correcta
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Contraseña incorrecta');
    }
    
    // Verificar rol de administrador para acceso al panel
    if (user.role !== 'admin') {
      throw new Error('No tienes permisos de administrador');
    }
    
    // Actualizar fecha de último login
    user.lastLogin = new Date();
    await user.save();
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET || 'tu_super_secreto_temporal', 
      { expiresIn: '12h' }
    );
    
    return { token, user };
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

/**
 * Método para registrar un nuevo usuario
 * @param {Object} userData - Datos del nuevo usuario
 * @returns {Object} - Usuario creado
 */
exports.register = async (userData) => {
  try {
    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ where: { email: userData.email } });
    
    if (existingUser) {
      throw new Error('Este correo electrónico ya está registrado');
    }
    
    // Por defecto, los usuarios registrados serán clientes
    // Solo un admin puede crear otros admin
    const role = userData.role === 'admin' && userData.isAdminCreating ? 'admin' : 'viewer';
    
    // Crear nuevo usuario
    const newUser = await User.create({
      email: userData.email,
      password: userData.password, // El hook beforeCreate encriptará la contraseña
      role
    });
    
    return newUser;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

/**
 * Método para crear usuario administrador si no existe ninguno
 */
exports.seedAdminUser = async () => {
  try {
    // Verificar si ya existe un usuario admin
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (adminExists) {
      console.log('✅ Ya existe al menos un usuario administrador.');
      return false;
    }
    
    // Crear usuario admin por defecto
    const adminUser = await User.create({
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123', // El hook beforeCreate encriptará la contraseña
      role: 'admin'
    });
    
    console.log('✅ Usuario administrador creado exitosamente:', adminUser.email);
    return true;
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error);
    return false;
  }
};