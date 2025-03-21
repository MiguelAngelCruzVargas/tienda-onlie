// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../tienda-rines-api/auth.controller');

// Ruta para login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar que se proporcionen credenciales
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email y contraseña son requeridos' 
      });
    }

    console.log('Intento de login:', { email }); // Log para depuración
    
    // Llamar al método de login del controlador
    const { token, user } = await AuthController.login(email, password);
    
    // Configurar cookie con el token (opcional)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hora
    });

    res.json({ 
      success: true, 
      token,
      user: { 
        id: user.id,
        email: user.email,
        role: user.role 
      }
    });
  } catch (error) {
    console.error('Error en ruta de login:', error.message);
    
    // Manejar diferentes tipos de errores
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    if (error.message === 'Contraseña incorrecta') {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    // Error genérico del servidor
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : ''
    });
  }
});

// Ruta para registro
router.post('/register', async (req, res) => {
  try {
    const userData = req.body;
    
    // Validar datos de entrada
    if (!userData.email || !userData.password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email y contraseña son requeridos' 
      });
    }

    // Intentar registrar usuario
    const newUser = await AuthController.register(userData);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    
    // Manejar error de email duplicado
    if (error.message.includes('correo electrónico ya está registrado')) {
      return res.status(409).json({ 
        success: false,
        message: 'El correo electrónico ya está en uso' 
      });
    }

    // Error genérico del servidor
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : ''
    });
  }
});

// Ruta para cerrar sesión
router.post('/logout', (req, res) => {
  // Limpiar cookie de token
  res.clearCookie('token');
  
  res.json({ 
    success: true, 
    message: 'Sesión cerrada exitosamente' 
  });
});

// Ruta para verificar token (requiere middleware de autenticación)
const authMiddleware = require('./auth.middleware');
router.get('/verify', authMiddleware, (req, res) => {
  // El middleware ya verificó el token, solo devolvemos los datos del usuario
  const user = req.user;
  
  res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

module.exports = router;