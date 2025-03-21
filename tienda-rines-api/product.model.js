// tienda-rines-api/product.model.js
const { sequelize, Sequelize } = require('../config/database.config');

const Product = sequelize.define('Product', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  slug: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  price: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  compareAtPrice: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio anterior, para mostrar descuentos'
  },
  costPrice: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio de costo, para cálculos internos'
  },
  sku: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true
  },
  barcode: {
    type: Sequelize.STRING,
    allowNull: true
  },
  inventory: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  weight: {
    type: Sequelize.FLOAT,
    allowNull: true,
    comment: 'Peso en kilogramos'
  },
  width: {
    type: Sequelize.FLOAT,
    allowNull: true,
    comment: 'Ancho en centímetros'
  },
  height: {
    type: Sequelize.FLOAT,
    allowNull: true,
    comment: 'Alto en centímetros'
  },
  depth: {
    type: Sequelize.FLOAT,
    allowNull: true,
    comment: 'Profundidad en centímetros'
  },
  images: {
    type: Sequelize.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('images');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('images', JSON.stringify(value));
    }
  },
  thumbnail: {
    type: Sequelize.STRING,
    allowNull: true
  },
  featured: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  status: {
    type: Sequelize.ENUM('active', 'draft', 'archived'),
    defaultValue: 'draft'
  },
  categoryId: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  tags: {
    type: Sequelize.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('tags');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('tags', JSON.stringify(value));
    }
  },
  attributes: {
    type: Sequelize.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('attributes');
      return rawValue ? JSON.parse(rawValue) : {};
    },
    set(value) {
      this.setDataValue('attributes', JSON.stringify(value));
    }
  },
  metaTitle: {
    type: Sequelize.STRING,
    allowNull: true
  },
  metaDescription: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  metaKeywords: {
    type: Sequelize.STRING,
    allowNull: true
  },
  searchTerms: {
    type: Sequelize.TEXT,
    allowNull: true,
    comment: 'Términos de búsqueda adicionales'
  },
  rating: {
    type: Sequelize.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  reviewCount: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  soldCount: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  timestamps: true,
  paranoid: true,
  tableName: 'products',
  hooks: {
    beforeValidate: (product) => {
      // Generar slug a partir del nombre si no está definido
      if (!product.slug && product.name) {
        product.slug = product.name
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      }
    }
  },
  defaultScope: {
    where: {
      status: 'active'
    }
  },
  scopes: {
    // Incluir todos los productos, independientemente del estado
    allProducts: {},
    // Solo productos destacados
    featured: {
      where: {
        featured: true,
        status: 'active'
      }
    }
  }
});

// Método de instancia para calcular el porcentaje de descuento
Product.prototype.getDiscountPercentage = function() {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) {
    return 0;
  }
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
};

// Método de instancia para verificar si el producto tiene stock bajo
Product.prototype.isLowStock = function() {
  return this.inventory > 0 && this.inventory <= 3;
};

// Método virtual para determinar si el producto es nuevo (menos de 30 días)
Product.prototype.isNew = function() {
  if (!this.createdAt) return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(this.createdAt) >= thirtyDaysAgo;
};

// Método virtual para determinar si es un bestseller basado en ventas
Product.prototype.isBestseller = function() {
  return this.soldCount >= 5; // Umbrales personalizables
};

module.exports = Product;