// tienda-rines-api/customer.model.js
const { sequelize, Sequelize } = require('../config/database.config');
const bcrypt = require('bcryptjs');

const Customer = sequelize.define('Customer', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  phone: {
    type: Sequelize.STRING(20),
    allowNull: true
  },
  address: {
    type: Sequelize.STRING,
    allowNull: true
  },
  city: {
    type: Sequelize.STRING(100),
    allowNull: true
  },
  state: {
    type: Sequelize.STRING(100),
    allowNull: true
  },
  zipcode: {
    type: Sequelize.STRING(10),
    allowNull: true
  },
  reset_token: {
    type: Sequelize.STRING,
    allowNull: true
  },
  reset_token_expires: {
    type: Sequelize.DATE,
    allowNull: true
  },
  verification_token: {
    type: Sequelize.STRING,
    allowNull: true
  },
  is_verified: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  last_login: {
    type: Sequelize.DATE,
    allowNull: true
  }
}, {
  tableName: 'customers', // Asegura que use la tabla existente
  paranoid: true, // Para manejar el deletedAt
  hooks: {
    beforeCreate: async (customer) => {
      if (customer.password) {
        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(customer.password, salt);
      }
    },
    beforeUpdate: async (customer) => {
      if (customer.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(customer.password, salt);
      }
    }
  }
});

// Método para verificar contraseña
Customer.prototype.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Customer;