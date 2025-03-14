// tienda-rines-api/settings.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'general'
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'settings',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['category', 'key']
    }
  ]
});

module.exports = Setting;