const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');

// Definición del modelo de Producto
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: "El nombre del producto no puede estar vacío" }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '' // Valor por defecto para evitar NULL
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    get() {
      // Asegurar que siempre se devuelve como número
      const value = this.getDataValue('price');
      return value === null ? 0.00 : parseFloat(value);
    },
    validate: {
      min: { args: [0], msg: "El precio no puede ser negativo" }
    }
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    get() {
      // Asegurar que siempre se devuelve como número o null
      const value = this.getDataValue('originalPrice');
      return value === null ? null : parseFloat(value);
    }
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: '' // Valor por defecto para evitar NULL
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '' // Valor por defecto para evitar NULL
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: "El stock no puede ser negativo" }
    }
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0,
    get() {
      // Asegurar que siempre se devuelve como número
      const value = this.getDataValue('rating');
      return value === null ? 0 : parseFloat(value);
    },
    validate: {
      min: 0,
      max: 5
    }
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
    validate: {
      isUrl: { 
        msg: "La URL de la imagen debe ser válida",
        // No validar si el valor es nulo
        allowNull: true
      }
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'products',
  timestamps: true,
  paranoid: true, // Soft delete
  // Hooks para garantizar que ciertos campos nunca sean nulos
  hooks: {
    beforeSave: (product) => {
      // Asegurar que los campos string que no deben ser null sean al menos strings vacíos
      if (product.description === null) product.description = '';
      if (product.brand === null) product.brand = '';
      if (product.color === null) product.color = '';
    }
  }
});

module.exports = Product;