// tienda-rines-api/review.model.js
const { sequelize, Sequelize } = require('../config/database.config');
const User = require('./user.model');
const Product = require('./product.model');

const Review = sequelize.define('Review', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: true, // Puede ser null si es un usuario no registrado
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  productId: {
    type: Sequelize.INTEGER,
    allowNull: true, // Puede ser null si es una reseña general de la tienda
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  rating: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Calificación de 1 a 5 estrellas'
  },
  title: {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'Título opcional de la reseña'
  },
  comment: {
    type: Sequelize.TEXT,
    allowNull: false,
    comment: 'Contenido de la reseña'
  },
  customerName: {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'Nombre del cliente si no está registrado'
  },
  customerEmail: {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'Email del cliente si no está registrado'
  },
  isVerifiedPurchase: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si la reseña es de una compra verificada'
  },
  isApproved: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si la reseña ha sido aprobada para mostrarse'
  },
  status: {
    type: Sequelize.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    comment: 'Estado de la reseña'
  },
  adminResponse: {
    type: Sequelize.TEXT,
    allowNull: true,
    comment: 'Respuesta opcional del administrador a esta reseña'
  },
  photoUrl: {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'URL opcional a una foto subida con la reseña (campo legado)'
  },
  // Nuevo campo para almacenar múltiples fotos
  photos: {
    type: Sequelize.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array de URLs o datos base64 de fotos subidas con la reseña'
  },
  // Campo para almacenar el nombre del producto (para cuando no hay relación directa)
  productName: {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'Nombre del producto cuando no está vinculado directamente'
  },
  // Campo para almacenar el SKU del producto
  productSKU: {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'SKU del producto cuando no está vinculado directamente'
  }
}, {
  timestamps: true,
  paranoid: true,
  tableName: 'reviews',
  indexes: [
    { fields: ['productId'] },
    { fields: ['userId'] },
    { fields: ['rating'] },
    { fields: ['status'] },
    { fields: ['isVerifiedPurchase'] }
  ],
  hooks: {
    afterCreate: async (review, options) => {
      // Si la reseña está asociada a un producto, actualizamos su rating promedio
      if (review.productId && review.status === 'approved') {
        try {
          const product = await Product.findByPk(review.productId);
          if (product) {
            // Obtener todas las reseñas aprobadas para este producto
            const reviews = await Review.findAll({
              where: {
                productId: review.productId,
                status: 'approved'
              }
            });
            
            // Calcular el promedio de calificaciones
            const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
            const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
            
            // Actualizar el producto
            await product.update({
              rating: averageRating,
              reviewCount: reviews.length
            }, { transaction: options.transaction });
          }
        } catch (error) {
          console.error('Error al actualizar rating del producto:', error);
        }
      }
    },
    afterUpdate: async (review, options) => {
      // Si el estado de la reseña cambió a aprobado o si la calificación cambió
      if (review.changed('status') || review.changed('rating')) {
        if (review.productId) {
          try {
            const product = await Product.findByPk(review.productId);
            if (product) {
              // Obtener todas las reseñas aprobadas para este producto
              const reviews = await Review.findAll({
                where: {
                  productId: review.productId,
                  status: 'approved'
                }
              });
              
              // Calcular el promedio de calificaciones
              const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
              const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
              
              // Actualizar el producto
              await product.update({
                rating: averageRating,
                reviewCount: reviews.length
              }, { transaction: options.transaction });
            }
          } catch (error) {
            console.error('Error al actualizar rating del producto:', error);
          }
        }
      }
    }
  }
});

// Definir relaciones
Review.associate = (models) => {
  Review.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  Review.belongsTo(models.Product, {
    foreignKey: 'productId',
    as: 'product'
  });
};

module.exports = Review;