// tienda-rines-api/order.model.js
const { sequelize, Sequelize } = require('../config/database.config');

const Order = sequelize.define('Order', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: true // Puede ser null para pedidos de visitantes
  },
  status: {
    type: Sequelize.ENUM('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  total: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  subtotal: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  tax: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  shipping: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  discount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  trackingNumber: {
    type: Sequelize.STRING,
    allowNull: true
  },
  shippingAddress: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  billingAddress: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  paymentMethod: {
    type: Sequelize.STRING,
    allowNull: true
  },
  paymentStatus: {
    type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  notes: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  customerName: {
    type: Sequelize.STRING,
    allowNull: true
  },
  customerEmail: {
    type: Sequelize.STRING,
    allowNull: true
  },
  customerPhone: {
    type: Sequelize.STRING,
    allowNull: true
  },
  transactionId: {
    type: Sequelize.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  paranoid: true,
  tableName: 'orders',
  hooks: {
    beforeCreate: (order) => {
      // Asegurarse de que el total es la suma de subtotal + tax + shipping - discount
      order.total = parseFloat(order.subtotal) + parseFloat(order.tax) + 
                    parseFloat(order.shipping) - parseFloat(order.discount);
    },
    beforeUpdate: (order) => {
      if (order.changed('subtotal') || order.changed('tax') || 
          order.changed('shipping') || order.changed('discount')) {
        // Recalcular total si alguno de los componentes cambia
        order.total = parseFloat(order.subtotal) + parseFloat(order.tax) + 
                      parseFloat(order.shipping) - parseFloat(order.discount);
      }
    }
  }
});

module.exports = Order;