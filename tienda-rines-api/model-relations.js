// tienda-rines-api/model-relations.js
const { sequelize } = require('../config/database.config');

/**
 * Configura las relaciones entre los diferentes modelos
 */
const setupRelations = () => {
  try {
    console.log('🔄 Configurando relaciones entre modelos...');
    
    // Importar modelos directamente aquí para asegurar que están correctamente cargados
    const User = require('./user.model');
    const Product = require('./product.model');
    const Category = require('./category.model');
    const Order = require('./order.model');
    const Review = require('./review.model');
    const Customer = require('./customer.model'); // Importamos el modelo Customer
    
    // Verificación de modelos
    if (!Product || !Category || !Order || !User || !Review || !Customer) {
      throw new Error('Uno o más modelos no están correctamente definidos');
    }
    
    console.log('Modelos disponibles:', {
      Product: !!Product,
      Category: !!Category,
      Order: !!Order,
      User: !!User,
      Review: !!Review,
      Customer: !!Customer // Agregamos Customer a la verificación
    });
    
    // Relación entre Producto y Categoría
    Product.belongsTo(Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });
    
    Category.hasMany(Product, {
      foreignKey: 'categoryId',
      as: 'products'
    });
    
    // Relación entre Orden y Usuario
    Order.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    User.hasMany(Order, {
      foreignKey: 'userId',
      as: 'orders'
    });
    
    // Relación entre Orden y Cliente
    Order.belongsTo(Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    });
    
    Customer.hasMany(Order, {
      foreignKey: 'customerId',
      as: 'orders'
    });
    
    // Relación entre Orden y Producto (muchos a muchos)
    // Creando tabla intermedia OrderDetail
    const OrderDetail = sequelize.define('OrderDetail', {
      quantity: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      price: {
        type: sequelize.Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discount: {
        type: sequelize.Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      }
    });
    
    Order.belongsToMany(Product, {
      through: OrderDetail,
      foreignKey: 'orderId',
      otherKey: 'productId',
      as: 'products'
    });
    
    Product.belongsToMany(Order, {
      through: OrderDetail,
      foreignKey: 'productId',
      otherKey: 'orderId',
      as: 'orders'
    });
    
    // Relaciones para las Reseñas
    // IMPORTANTE: Definir explícitamente el nombre de la columna de clave foránea
    Review.belongsTo(User, {
      foreignKey: {
        name: 'userId',
        allowNull: true
      },
      as: 'user'
    });
    
    User.hasMany(Review, {
      foreignKey: 'userId',
      as: 'reviews'
    });
    
    // Relación entre Reseñas y Cliente
    Review.belongsTo(Customer, {
      foreignKey: {
        name: 'customerId',
        allowNull: true
      },
      as: 'customer'
    });
    
    Customer.hasMany(Review, {
      foreignKey: 'customerId',
      as: 'customerReviews'
    });
    
    Review.belongsTo(Product, {
      foreignKey: {
        name: 'productId',
        allowNull: true
      },
      as: 'product'
    });
    
    Product.hasMany(Review, {
      foreignKey: 'productId',
      as: 'reviews'
    });
    
    console.log('✅ Relaciones entre modelos configuradas correctamente.');
    
    return {
      User,
      Product,
      Category,
      Order,
      OrderDetail,
      Review,
      Customer // Agregamos Customer al objeto de retorno
    };
  } catch (error) {
    console.error('❌ Error al configurar relaciones entre modelos:', error);
    throw error;
  }
};

module.exports = setupRelations;