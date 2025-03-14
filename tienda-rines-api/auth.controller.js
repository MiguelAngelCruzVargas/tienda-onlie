const User = require('./user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

class AuthController {
  // Crear usuario inicial
  static async initializeAdminUser() {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
  
      console.log('Valor de adminEmail:', adminEmail);
      console.log('Valor de adminPassword:', adminPassword);
  
      const existingAdmin = await User.findOne({ where: { email: adminEmail } });
  
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
  
        await User.create({
          email: adminEmail,
          password: hashedPassword,
          role: 'admin'
        });
        console.log('Usuario admin inicial creado con nueva contraseña');
      } else {
        console.log('Verificación de usuario admin completada');
      }
    } catch (error) {
      console.error('Error al crear usuario admin:', error);
      throw error;
    }
  }

  // Método de registro de usuario
  static async register(userData) {
    try {
      const { email, password, role } = userData;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        throw new Error('El correo electrónico ya está registrado');
      }

      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Crear nuevo usuario
      const newUser = await User.create({
        email,
        password: hashedPassword,
        role: role || 'viewer' // Rol por defecto si no se especifica
      });

      return newUser;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  // Método de login mejorado
  static async login(email, password) {
    try {
      console.log('Intento de login:', { email });
      
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Usar el método validatePassword del modelo
      const isMatch = await user.validatePassword(password);

      console.log('Resultado de validación de contraseña:', isMatch);

      if (!isMatch) {
        throw new Error('Contraseña incorrecta');
      }

      // Actualizar último inicio de sesión de manera segura
      try {
        user.lastLogin = new Date();
        await user.save({ fields: ['lastLogin'] });
      } catch (loginUpdateError) {
        console.warn('No se pudo actualizar lastLogin:', loginUpdateError);
      }

      // Generar token JWT con expiración adecuada
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          iat: Math.floor(Date.now() / 1000) // Tiempo de emisión
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' } // Aumentado a 8 horas para mejor experiencia de usuario
      );

      console.log('Login exitoso para:', email);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Método para obtener perfil de usuario
  static async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'email', 'role', 'createdAt', 'lastLogin']
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error);
      throw error;
    }
  }

  // Método para actualizar perfil de usuario
  static async updateUserProfile(userId, updateData) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Actualizar campos permitidos
      if (updateData.email) {
        // Verificar si el nuevo email ya existe
        const existingUser = await User.findOne({
          where: {
            email: updateData.email,
            id: { [Op.ne]: userId }
          }
        });

        if (existingUser) {
          throw new Error('El correo electrónico ya está en uso');
        }
        user.email = updateData.email;
      }

      // Actualizar contraseña si se proporciona
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(updateData.password, salt);
      }

      // Actualizar rol (solo para admin)
      if (updateData.role) {
        user.role = updateData.role;
      }

      await user.save();

      return user;
    } catch (error) {
      console.error('Error al actualizar perfil de usuario:', error);
      throw error;
    }
  }

  // Método para verificar token
  static async verifyToken(token) {
    try {
      if (!token) {
        throw new Error('No se proporcionó token');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('El token ha expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      } else {
        throw error;
      }
    }
  }

  // Método para renovar token
  static async refreshToken(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'email', 'role']
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      return { 
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Error al renovar token:', error);
      throw error;
    }
  }
}

module.exports = AuthController;