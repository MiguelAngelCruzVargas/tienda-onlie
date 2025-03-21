// tienda-rines-api/dashboard.controller.js
const { sequelize } = require('../config/database.config');
const Product = require('./product.model');
const Order = require('./order.model');
const User = require('./user.model'); // ← Añadido esta línea para importar el modelo User
const { Op } = require('sequelize');

/**
 * Obtiene estadísticas generales para el dashboard de administración
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Obtener número total de productos
    const totalProducts = await Product.count();
    
    // Obtener stats de órdenes
    const totalOrders = await Order.count();
    
    // Obtener órdenes pendientes
    const pendingOrders = await Order.count({
      where: {
        status: 'pending'
      }
    });
    
    // Calcular ingresos totales (suma de todos los totales de órdenes)
    const revenueData = await Order.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total')), 'revenue']
      ],
      where: {
        status: {
          [Op.ne]: 'cancelled'
        }
      },
      raw: true
    });
    
    // Valor por defecto para revenue si no hay órdenes
    const revenue = revenueData.revenue || 0;
    
    // Para las visitas, esto podría venir de una tabla de analytics
    // Por ahora usamos un valor de placeholder
    const visitors = 1250; // Esto debería venir de un sistema de analytics
    
    res.status(200).json({
      totalProducts,
      totalOrders,
      pendingOrders,
      revenue,
      visitors
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas del dashboard',
      error: error.message
    });
  }
};

/**
 * Obtiene las órdenes más recientes para mostrar en el dashboard
 */
exports.getRecentOrders = async (req, res) => {
  try {
    // Versión corregida sin usar el include directo que causa problemas
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });
    
    // Transformar los datos para el formato que espera el frontend
    const formattedOrders = await Promise.all(recentOrders.map(async order => {
      let customer = 'Cliente anónimo';
      let email = '';
      
      // Si hay userId, intentar obtener información del usuario
      if (order.userId) {
        try {
          const user = await User.findByPk(order.userId);
          if (user) {
            customer = user.name || 'Usuario ' + order.userId;
            email = user.email || '';
          }
        } catch (err) {
          console.error('Error al obtener usuario para orden:', err);
        }
      } else if (order.customerName) {
        // Si no hay userId pero hay customerName, usar eso
        customer = order.customerName;
        email = order.customerEmail || '';
      }
      
      return {
        id: order.id,
        customer: customer,
        email: email,
        date: order.createdAt,
        total: order.total,
        status: order.status
      };
    }));
    
    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error('Error al obtener órdenes recientes:', error);
    res.status(500).json({ 
      message: 'Error al obtener órdenes recientes',
      error: error.message
    });
  }
};

/**
 * Obtiene estadísticas de ventas por período (día, semana, mes, año)
 */
exports.getSalesStats = async (req, res) => {
  const { period } = req.query;
  let timeFrame;
  
  // Determinar el período de tiempo para la consulta
  switch(period) {
    case 'day':
      timeFrame = 1;
      break;
    case 'week':
      timeFrame = 7;
      break;
    case 'month':
      timeFrame = 30;
      break;
    case 'year':
      timeFrame = 365;
      break;
    default:
      timeFrame = 30; // Mes por defecto
  }
  
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeFrame);
    
    // Consultar ventas en el período seleccionado
    const salesData = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('SUM', sequelize.col('total')), 'amount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate
        },
        status: {
          [Op.ne]: 'cancelled'
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.col('date'), 'ASC']],
      raw: true
    });
    
    res.status(200).json(salesData);
  } catch (error) {
    console.error('Error al obtener estadísticas de ventas:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas de ventas',
      error: error.message
    });
  }
};