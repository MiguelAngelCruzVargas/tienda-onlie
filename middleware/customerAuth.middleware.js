// middleware/customerAuth.middleware.js
const jwt = require('jsonwebtoken');
const Customer = require('../tienda-rines-api/customer.model');

// Obtener el secreto JWT del entorno o usar uno por defecto
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura';

const verifyCustomerToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return res.status(403).json({ 
        success: false,
        message: 'No se proporcionó token de autenticación' 
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que el token sea de tipo 'customer'
    if (decoded.type !== 'customer') {
      return res.status(401).json({ 
        success: false,
        message: 'Token inválido para clientes' 
      });
    }
    
    // Verificar que el cliente exista
    const customer = await Customer.findByPk(decoded.id);
    if (!customer) {
      return res.status(404).json({ 
        success: false,
        message: 'Cliente no encontrado' 
      });
    }
    
    // Añadir ID del cliente a la request para uso posterior
    req.customerId = decoded.id;
    
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expirado' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: 'No autorizado', 
      error: error.message 
    });
  }
};

module.exports = { verifyCustomerToken };