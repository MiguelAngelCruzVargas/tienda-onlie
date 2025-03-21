// tienda-rines-api/order.controller.js
const Order = require('./order.model');
const Product = require('./product.model');
const User = require('./user.model');
const { sequelize, Sequelize } = require('../config/database.config');
const { Op } = Sequelize;

/**
 * Obtener todas las órdenes con opciones de filtrado
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      startDate,
      endDate,
      customer,
      sort = 'createdAt',
      order = 'DESC'
    } = req.query;
    
    // Construir condiciones de búsqueda
    const whereConditions = {};
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (startDate || endDate) {
      whereConditions.createdAt = {};
      if (startDate) {
        whereConditions.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereConditions.createdAt[Op.lte] = endDateTime;
      }
    }
    
    if (customer) {
      whereConditions[Op.or] = [
        { customerName: { [Op.like]: `%${customer}%` } },
        { customerEmail: { [Op.like]: `%${customer}%` } }
      ];
    }
    
    // Calcular offset para paginación
    const offset = (page - 1) * limit;
    
    // Obtener las órdenes con paginación
    const { count, rows } = await Order.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    // Calcular información de paginación
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.status(200).json({
      success: true,
      count,
      page: parseInt(page),
      totalPages,
      hasNextPage,
      hasPrevPage,
      orders: rows
    });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes',
      error: error.message
    });
  }
};

/**
 * Obtener una orden por su ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Product,
          as: 'products',
          through: {
            attributes: ['quantity', 'price', 'discount']
          }
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error al obtener orden por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener orden',
      error: error.message
    });
  }
};

/**
 * Crear una nueva orden
 */
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      userId,
      products,
      shippingAddress,
      billingAddress,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      notes
    } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La orden debe contener al menos un producto'
      });
    }
    
    // Verificar que los productos existen y tienen suficiente inventario
    const productIds = products.map(item => item.productId);
    const dbProducts = await Product.findAll({
      where: {
        id: { [Op.in]: productIds },
        status: 'active'
      }
    });
    
    if (dbProducts.length !== productIds.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Uno o más productos no existen o no están disponibles'
      });
    }
    
    // Verificar inventario y calcular totales
    let subtotal = 0;
    const orderProducts = [];
    
    for (const item of products) {
      const product = dbProducts.find(p => p.id === item.productId);
      
      if (product.inventory < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Inventario insuficiente para el producto: ${product.name}`
        });
      }
      
      // Calcular precio con posible descuento
      let price = product.price;
      let discount = 0;
      
      if (product.compareAtPrice && product.compareAtPrice > product.price) {
        discount = product.compareAtPrice - product.price;
      }
      
      // Actualizar inventario
      await product.update({
        inventory: product.inventory - item.quantity,
        soldCount: product.soldCount + item.quantity
      }, { transaction });
      
      // Calcular total del ítem
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      
      // Guardar información del producto para la orden
      orderProducts.push({
        productId: product.id,
        quantity: item.quantity,
        price,
        discount
      });
    }
    
    // Calcular impuestos y envío (estos valores pueden calcularse dinámicamente)
    const taxRate = 0.16; // 16% IVA
    const tax = subtotal * taxRate;
    const shipping = subtotal > 1000 ? 0 : 150; // Envío gratis para compras mayores a $1000
    const total = subtotal + tax + shipping;
    
    // Crear la orden
    const trackingNumber = `OR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const newOrder = await Order.create({
      userId,
      status: 'pending',
      total,
      subtotal,
      tax,
      shipping,
      discount: 0,
      trackingNumber,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      notes,
      customerName,
      customerEmail,
      customerPhone
    }, { transaction });
    
    // Asociar productos a la orden
    const OrderDetail = sequelize.models.OrderDetail;
    
    for (const item of orderProducts) {
      await OrderDetail.create({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount
      }, { transaction });
    }
    
    // Confirmar transacción
    await transaction.commit();
    
    // Obtener la orden completa con productos
    const completedOrder = await Order.findByPk(newOrder.id, {
      include: [
        {
          model: Product,
          as: 'products',
          through: {
            attributes: ['quantity', 'price', 'discount']
          }
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      trackingNumber: completedOrder.trackingNumber,
      order: completedOrder
    });
  } catch (error) {
    // Rollback en caso de error
    if (transaction) await transaction.rollback();
    
    console.error('Error al crear orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear orden',
      error: error.message
    });
  }
};

/**
 * Actualizar estado de una orden
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    // Manejar caso de cancelación
    if (status === 'cancelled' && order.status !== 'cancelled') {
      // Devolver productos al inventario
      const OrderDetail = sequelize.models.OrderDetail;
      const orderDetails = await OrderDetail.findAll({
        where: { orderId: order.id }
      });
      
      for (const detail of orderDetails) {
        const product = await Product.findByPk(detail.productId);
        if (product) {
          await product.update({
            inventory: product.inventory + detail.quantity,
            soldCount: Math.max(0, product.soldCount - detail.quantity)
          });
        }
      }
    }
    
    // Actualizar estado
    await order.update({ status });
    
    res.status(200).json({
      success: true,
      message: `Estado de la orden actualizado a ${status}`,
      order: {
        id: order.id,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Error al actualizar estado de la orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de la orden',
      error: error.message
    });
  }
};

/**
 * Actualizar información de una orden
 */
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Campos que no se pueden actualizar directamente
    const restrictedFields = ['id', 'total', 'subtotal', 'tax', 'createdAt', 'updatedAt'];
    
    // Filtrar campos restringidos
    restrictedFields.forEach(field => {
      delete updateData[field];
    });
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    // Actualizar la orden
    await order.update(updateData);
    
    // Obtener la orden actualizada
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: 'Orden actualizada exitosamente',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar orden',
      error: error.message
    });
  }
};

/**
 * Eliminar una orden
 */
exports.deleteOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { restoreInventory = false } = req.query;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    // Si se solicita restaurar inventario
    if (restoreInventory === 'true' || restoreInventory === true) {
      const OrderDetail = sequelize.models.OrderDetail;
      const orderDetails = await OrderDetail.findAll({
        where: { orderId: order.id }
      });
      
      for (const detail of orderDetails) {
        const product = await Product.findByPk(detail.productId);
        if (product) {
          await product.update({
            inventory: product.inventory + detail.quantity,
            soldCount: Math.max(0, product.soldCount - detail.quantity)
          }, { transaction });
        }
      }
    }
    
    // Eliminar la orden (soft delete)
    await order.destroy({ transaction });
    
    // Confirmar transacción
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Orden eliminada exitosamente'
    });
  } catch (error) {
    // Rollback en caso de error
    if (transaction) await transaction.rollback();
    
    console.error('Error al eliminar orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar orden',
      error: error.message
    });
  }
};

/**
 * Rastrear una orden por número de seguimiento
 */
exports.trackOrder = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    const order = await Order.findOne({
      where: { trackingNumber },
      attributes: ['id', 'status', 'createdAt', 'updatedAt', 'trackingNumber', 'customerName', 'customerEmail']
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error al rastrear orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rastrear orden',
      error: error.message
    });
  }
};