const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'categories',
  timestamps: true,
  paranoid: true,
  hooks: {
    beforeValidate: (category) => {
      // Asegurar que las fechas tengan un valor válido
      if (!category.createdAt) {
        category.createdAt = new Date();
      }
      if (!category.updatedAt) {
        category.updatedAt = new Date();
      }
    }
  }
});

module.exports = Category;