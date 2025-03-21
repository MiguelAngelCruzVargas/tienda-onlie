// tienda-rines-api/customer.controller.js
const Customer = require('./customer.model');
const Order = require('./order.model');
const Product = require('./product.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Obtener el secreto JWT del entorno o usar uno por defecto
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura';

exports.register = async (req, res) => {
  try {
    console.log('Solicitud de registro recibida:', req.body);
    
    // Validar datos de entrada
    const { email, password, name, phone, address, city, state, zipcode } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email y contraseña son requeridos' 
      });
    }
    
    // Verificar si el email ya existe
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({ 
        success: false,
        message: 'Ya existe una cuenta con este email' 
      });
    }
    
    // Crear nuevo cliente (el hook beforeCreate encriptará la contraseña)
    const newCustomer = await Customer.create({
      email,
      password,
      name,
      phone,
      address,
      city,
      state,
      zipcode,
      is_verified: false,
      last_login: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Generar token JWT
    const token = jwt.sign(
      { id: newCustomer.id, email: newCustomer.email, type: 'customer' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Devolver respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Cliente registrado correctamente',
      token,
      customer: {
        id: newCustomer.id,
        email: newCustomer.email,
        name: newCustomer.name
      }
    });
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al registrar cliente', 
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email y contraseña son requeridos' 
      });
    }
    
    // Buscar cliente por email
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return res.status(404).json({ 
        success: false,
        message: 'Cliente no encontrado' 
      });
    }
    
    // Verificar contraseña
    const isPasswordValid = await customer.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Contraseña incorrecta' 
      });
    }
    
    // Actualizar último login
    await customer.update({ last_login: new Date() });
    
    // Generar token JWT
    const token = jwt.sign(
      { id: customer.id, email: customer.email, type: 'customer' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Devolver respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al iniciar sesión', 
      error: error.message 
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const customerId = req.customerId; // Viene del middleware de autenticación
    
    const customer = await Customer.findByPk(customerId, {
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires', 'verification_token'] }
    });
    
    if (!customer) {
      return res.status(404).json({ 
        success: false,
        message: 'Cliente no encontrado' 
      });
    }
    
    res.status(200).json({ 
      success: true,
      customer 
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener perfil', 
      error: error.message 
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const customerId = req.customerId; // Viene del middleware de autenticación
    const { name, phone, address, city, state, zipcode } = req.body;
    
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ 
        success: false,
        message: 'Cliente no encontrado' 
      });
    }
    
    // Actualizar datos
    await customer.update({
      name,
      phone,
      address,
      city,
      state,
      zipcode,
      updatedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: 'Perfil actualizado correctamente',
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zipcode: customer.zipcode
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar perfil', 
      error: error.message 
    });
  }
};

// Obtener todos los pedidos del cliente
exports.getOrders = async (req, res) => {
  try {
    const customerId = req.customerId;
    
    // Obtener pedidos del cliente
    const orders = await Order.findAll({
      where: { customerId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity', 'price'] }
        }
      ]
    });
    
    // Si no hay pedidos, devolver arreglo vacío
    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No se encontraron pedidos',
        orders: []
      });
    }
    
    res.status(200).json({
      success: true,
      orders: orders.map(order => {
        // Calcular total del pedido
        const total = order.products ? order.products.reduce((sum, product) => {
          const orderDetail = product.OrderDetail;
          return sum + (orderDetail.price * orderDetail.quantity);
        }, 0) : 0;
        
        return {
          id: order.id,
          orderNumber: order.orderNumber || `ORD-${order.id}`,
          status: order.status || 'pending',
          createdAt: order.createdAt,
          total: total || 0,
          items: order.products ? order.products.length : 0
        };
      })
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener pedidos', 
      error: error.message 
    });
  }
};

// Obtener detalles de un pedido específico
exports.getOrderById = async (req, res) => {
  try {
    const customerId = req.customerId;
    const orderId = req.params.id;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'ID de pedido no proporcionado'
      });
    }
    
    // Obtener detalles del pedido
    const order = await Order.findOne({
      where: { 
        id: orderId,
        customerId // Asegurar que el pedido pertenece a este cliente
      },
      include: [
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity', 'price', 'discount'] }
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Pedido no encontrado o no tienes permiso para verlo' 
      });
    }
    
    // Calcular total y formatear respuesta
    const items = order.products ? order.products.map(product => ({
      id: product.id,
      name: product.name,
      quantity: product.OrderDetail.quantity,
      price: product.OrderDetail.price,
      discount: product.OrderDetail.discount || 0,
      subtotal: product.OrderDetail.price * product.OrderDetail.quantity,
      image: product.thumbnail || (product.images && product.images.length > 0 ? product.images[0] : '')
    })) : [];
    
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber || `ORD-${order.id}`,
        status: order.status || 'pending',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingAddress: order.shippingAddress || {
          name: order.shippingName || '',
          address: order.shippingAddress || '',
          city: order.shippingCity || '',
          state: order.shippingState || '',
          zipcode: order.shippingZipcode || '',
          phone: order.shippingPhone || ''
        },
        paymentMethod: order.paymentMethod || 'No especificado',
        items,
        total,
        shippingCost: order.shippingCost || 0,
        tax: order.tax || 0,
        grandTotal: total + (order.shippingCost || 0) + (order.tax || 0)
      }
    });
  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener detalles del pedido', 
      error: error.message 
    });
  }
};

// Cancelar un pedido
exports.cancelOrder = async (req, res) => {
  try {
    const customerId = req.customerId;
    const orderId = req.params.id;
    const { reason } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'ID de pedido no proporcionado'
      });
    }
    
    // Buscar el pedido
    const order = await Order.findOne({
      where: { 
        id: orderId,
        customerId
      }
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Pedido no encontrado o no tienes permiso para modificarlo' 
      });
    }
    
    // Verificar si el pedido puede ser cancelado (solo si está en ciertos estados)
    const cancelableStatuses = ['pending', 'processing'];
    if (!cancelableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `No es posible cancelar un pedido con estado "${order.status}"`
      });
    }
    
    // Actualizar el estado del pedido
    await order.update({
      status: 'cancelled',
      cancellationReason: reason || 'Cancelado por el cliente',
      updatedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: 'Pedido cancelado correctamente',
      orderId: order.id
    });
  } catch (error) {
    console.error('Error al cancelar el pedido:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al cancelar el pedido', 
      error: error.message 
    });
  }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const customerId = req.customerId;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual y la nueva son requeridas'
      });
    }
    
    // Verificar que la nueva contraseña cumpla con requisitos mínimos
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Buscar el cliente
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    // Verificar la contraseña actual
    const isPasswordValid = await customer.verifyPassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }
    
    // Actualizar la contraseña (el hook beforeUpdate encriptará la contraseña)
    await customer.update({
      password: newPassword,
      updatedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar la contraseña',
      error: error.message
    });
  }
};