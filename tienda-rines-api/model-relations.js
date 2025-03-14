const Product = require('./product.model'); // Ajusta la ruta si es necesario
const Category = require('./category.model'); // Ajusta la ruta si es necesario
const User = require('./user.model');
const ProductImage = require('./product-image.model');
const Promotion = require('./promotion.model'); // Si lo tienes
const { sequelize } = require('../config/database.config');

// Definir relaciones
const setupRelations = () => {
  // Relación Producto-Categoría (Un producto pertenece a una categoría)
  Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
  });

  // Relación Categoría-Productos (Una categoría tiene muchos productos)
  Category.hasMany(Product, {
    foreignKey: 'categoryId',
    as: 'products'
  });

  // Relación Producto-Imágenes (Un producto tiene muchas imágenes)
  Product.hasMany(ProductImage, {
    foreignKey: 'productId',
    as: 'images'
  });

  // Relación Imagen-Producto (Una imagen pertenece a un producto)
  ProductImage.belongsTo(Product, {
    foreignKey: 'productId'
  });
};

module.exports = setupRelations;