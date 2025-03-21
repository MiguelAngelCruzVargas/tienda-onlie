// routes/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../tienda-rines-api/user.model');

/**
 * Middleware para verificar si el usuario está autenticado
 */
module.exports = async (req, res, next) => {
  try {
    // Obtener el token desde las cabeceras de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado. Se requiere autenticación.' });
    }
    
    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No autorizado. Token no proporcionado.' });
    }
    
    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscar usuario en la base de datos
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'Usuario no encontrado.' });
      }
      
      // Verificar rol de administrador
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso prohibido. Se requieren privilegios de administrador.' });
      }
      
      // Si todo está bien, guardar el usuario en el objeto request para uso posterior
      req.user = user;
      
      next();
    } catch (error) {
      console.error('Error al verificar token:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Sesión expirada. Por favor, inicia sesión nuevamente.' });
      }
      
      return res.status(401).json({ message: 'Token inválido.' });
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({ message: 'Error en el servidor.' });
  }
};