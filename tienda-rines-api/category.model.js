// tienda-rines-api/category.model.js
const { sequelize, Sequelize } = require('../config/database.config');

const Category = sequelize.define('Category', {
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
  image: {
    type: Sequelize.STRING,
    allowNull: true
  },
  parentId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  order: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: Sequelize.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  featured: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
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
  }
}, {
  timestamps: true,
  paranoid: true,
  tableName: 'categories',
  hooks: {
    beforeValidate: (category) => {
      // Generar slug a partir del nombre si no está definido
      if (!category.slug && category.name) {
        category.slug = category.name
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      }
    }
  }
});

module.exports = Category;