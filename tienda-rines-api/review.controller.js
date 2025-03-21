// tienda-rines-api/review.controller.js
const Review = require('./review.model');
const Product = require('./product.model'); // Asegúrate de importar el modelo de producto
const { Op, Sequelize } = require('sequelize');

/**
 * Obtener todas las reseñas con filtros
 */
exports.getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      productId,
      userId,
      rating,
      status,  // Valor por defecto cambiado a 'pending'
      sort = 'createdAt',
      order = 'DESC',
      hasProduct,     // Parámetro original
      productType,    // Nuevo parámetro: 'product'/'general' para filtrar reseñas
      productName,    // Para filtrar por nombre de producto
      productSKU      // Para filtrar por SKU
    } = req.query;

    // Construir condiciones de búsqueda
    const whereConditions = {};

    // Eliminar este bloque que fuerza 'approved' para no-admins
    // if (!req.user || req.user.role !== 'admin') {
    //   whereConditions.status = 'approved';
    // }

    // Mantener filtro de estado solo si se especifica (admins)
    if (req.query.status && req.query.status !== 'all') {
      whereConditions.status = req.query.status;
    }
    
    // Resto de condiciones
    if (productId) {
      whereConditions.productId = productId;
    }

    if (userId) {
      whereConditions.userId = userId;
    }

    if (rating) {
      whereConditions.rating = rating;
    }


    // Filtro por tipo de reseña (producto o general)
    // Primero intentamos usar productType (nuevo), si no está presente, intentamos hasProduct (antiguo)
    if (productType === 'product' || hasProduct === 'true') {
      // Reseñas que tienen información de producto
      whereConditions[Op.or] = [
        { productId: { [Op.not]: null } },
        {
          productName: {
            [Op.and]: [
              { [Op.not]: null },
              { [Op.ne]: '' }
            ]
          }
        },
        {
          productSKU: {
            [Op.and]: [
              { [Op.not]: null },
              { [Op.ne]: '' }
            ]
          }
        }
      ];
    } else if (productType === 'general' || hasProduct === 'false') {
      // Reseñas generales sin información de producto
      whereConditions[Op.and] = [
        { productId: null },
        {
          [Op.or]: [
            { productName: null },
            { productName: '' }
          ]
        },
        {
          [Op.or]: [
            { productSKU: null },
            { productSKU: '' }
          ]
        }
      ];
    }

    // Filtro por nombre de producto (búsqueda parcial)
    if (productName) {
      whereConditions.productName = {
        [Op.like]: `%${productName}%`
      };
    }

    // Filtro por SKU de producto (búsqueda exacta o parcial)
    if (productSKU) {
      whereConditions.productSKU = {
        [Op.like]: `%${productSKU}%`
      };
    }

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Incluir relación con producto si está disponible
    const include = [];
    if (productId || productType === 'product' || hasProduct === 'true') {
      include.push({
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'slug', 'sku', 'images', 'thumbnail'],
        required: false
      });
    }

    // Consulta con posible eager loading
    const count = await Review.count({ where: whereConditions });
    const reviews = await Review.findAll({
      where: whereConditions,
      include: include.length > 0 ? include : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]]
    });

    // Calcular información de paginación
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      count,
      page: parseInt(page),
      totalPages,
      hasNextPage,
      hasPrevPage,
      reviews: reviews
    });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseñas',
      error: error.message
    });
  }
};

/**
 * Obtener reseñas destacadas para mostrar en home/landing
 */
exports.getFeaturedReviews = async (req, res) => {
  try {
    const limit = req.query.limit || 3;
    const { productOnly = false, productType } = req.query; // Añadido nuevo parámetro

    const whereConditions = {
      status: 'approved',
      rating: { [Op.gte]: 4 } // Solo reseñas de 4 o 5 estrellas
    };

    // Si se solicitan solo reseñas de productos (usando cualquier parámetro)
    if (productOnly === 'true' || productType === 'product') {
      whereConditions[Op.or] = [
        { productId: { [Op.not]: null } },
        { productName: { [Op.not]: null } },
        { productSKU: { [Op.not]: null } }
      ];
    } else if (productType === 'general') {
      // Solo reseñas generales
      whereConditions[Op.and] = [
        { productId: null },
        {
          [Op.or]: [
            { productName: null },
            { productName: '' }
          ]
        },
        {
          [Op.or]: [
            { productSKU: null },
            { productSKU: '' }
          ]
        }
      ];
    }

    // Incluir relación con producto si está disponible
    const include = [];
    if (productOnly === 'true' || productType === 'product') {
      include.push({
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'slug', 'sku', 'images', 'thumbnail'],
        required: false
      });
    }

    const featuredReviews = await Review.findAll({
      where: whereConditions,
      include: include.length > 0 ? include : undefined,
      limit: parseInt(limit),
      order: [
        ['rating', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    res.status(200).json({
      success: true,
      reviews: featuredReviews
    });
  } catch (error) {
    console.error('Error al obtener reseñas destacadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseñas destacadas',
      error: error.message
    });
  }
};

/**
 * Obtener una reseña por su ID
 */
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    // Incluir relación con producto si está disponible
    const include = [{
      model: Product,
      as: 'product',
      attributes: ['id', 'name', 'slug', 'sku', 'images', 'thumbnail'],
      required: false
    }];

    const review = await Review.findByPk(id, {
      include
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    // Si no es admin y la reseña no está aprobada
    if ((!req.user || req.user.role !== 'admin') && review.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta reseña'
      });
    }

    res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Error al obtener reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseña',
      error: error.message
    });
  }
};

/**
 * Crear una nueva reseña
 */
exports.createReview = async (req, res) => {
  try {
    const {
      productId,
      productName,
      productSKU,
      rating,
      title,
      comment,
      customerName,
      customerEmail,
      photoUrl,
      photos
    } = req.body;

    // Validar datos requeridos
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'La calificación y el comentario son obligatorios'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'La calificación debe estar entre 1 y 5'
      });
    }

    // Validar si es reseña de producto que tiene nombre del producto
    if ((productId || productSKU) && !productName) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del producto es obligatorio para reseñas de productos'
      });
    }

    // Datos para la reseña
    const reviewData = {
      productId: productId || null,
      productName: productName || null,
      productSKU: productSKU || null,
      rating,
      title: title || null,
      comment,
      status: 'approved', // ✔️ Valor correcto para aprobación automática
      isVerifiedPurchase: false,
      isApproved: true // ✔️ Confirmar aprobación
    };

    // Si hay usuario autenticado
    if (req.user) {
      reviewData.userId = req.user.id;
      reviewData.userName = req.user.name || req.user.username;
      reviewData.userEmail = req.user.email;

      // Si el usuario es admin, aprobar directamente
      if (req.user.role === 'admin') {
        reviewData.status = 'approved';
        reviewData.isApproved = true;
      }
    } else {
      // Si no hay usuario, se requiere nombre
      if (!customerName) {
        return res.status(400).json({
          success: false,
          message: 'El nombre es obligatorio para enviar una reseña'
        });
      }

      reviewData.customerName = customerName;
      reviewData.customerEmail = customerEmail || null;
    }

    // Si se proporcionó URL de foto
    if (photoUrl) {
      reviewData.photoUrl = photoUrl;
    }

     // NUEVO: Si se proporcionó array de fotos
     if (photos && Array.isArray(photos) && photos.length > 0) {
      reviewData.photos = photos;
    }

    // Verificar si el producto existe cuando se proporciona ID
    if (productId) {
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'El producto especificado no existe'
        });
      }
    }

    // Crear la reseña
    const newReview = await Review.create(reviewData);

    res.status(201).json({
      success: true,
      message: '¡Increíble! Tu retroalimentación ayuda a mejorar nuestros productos. Revisaremos tu reseña muy pronto.',
      review: newReview
    });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar reseña. Por favor, intenta de nuevo más tarde.',
      error: error.message
    });
  }
};

/**
 * Actualizar estado de una reseña (solo admins)
 */
exports.updateReviewStatus = async (req, res) => {
  try {
    // Verificar si es admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para realizar esta acción'
      });
    }

    const { id } = req.params;
    const { status, adminResponse } = req.body;

   if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    // Actualizar estado y respuesta del admin
    const updateData = {
      status,
      isApproved: status === 'approved'
    };

    if (adminResponse !== undefined) {
      updateData.adminResponse = adminResponse;
    }

    await review.update(updateData);

    res.status(200).json({
      success: true,
      message: `Estado de la reseña actualizado a ${status}`,
      review
    });
  } catch (error) {
    console.error('Error al actualizar estado de reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de reseña',
      error: error.message
    });
  }
};

/**
 * Eliminar una reseña
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    // Solo el dueño de la reseña o un admin pueden eliminarla
    if (!req.user || (req.user.id !== review.userId && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta reseña'
      });
    }

    await review.destroy();

    res.status(200).json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar reseña',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de reseñas
 */
exports.getReviewStats = async (req, res) => {
  try {
    // Versión simplificada sin carga anticipada
    const totalReviews = await Review.count();
    const pendingReviews = await Review.count({ where: { status: 'approved' } });
    const approvedReviews = await Review.count({ where: { status: 'approved' } });
    const rejectedReviews = await Review.count({ where: { status: 'rejected' } });
    const verifiedPurchases = await Review.count({ where: { isVerifiedPurchase: true } });

    // Contar reseñas de productos vs generales
    const productReviews = await Review.count({
      where: {
        [Op.or]: [
          { productId: { [Op.not]: null } },
          { productName: { [Op.not]: null } },
          { productSKU: { [Op.not]: null } }
        ]
      }
    });

    const generalReviews = totalReviews - productReviews;

    // Distribución simplificada - Sin agrupación compleja para evitar errores
    const rating5 = await Review.count({ where: { rating: 5 } });
    const rating4 = await Review.count({ where: { rating: 4 } });
    const rating3 = await Review.count({ where: { rating: 3 } });
    const rating2 = await Review.count({ where: { rating: 2 } });
    const rating1 = await Review.count({ where: { rating: 1 } });

    const formattedDistribution = {
      1: rating1,
      2: rating2,
      3: rating3,
      4: rating4,
      5: rating5
    };

    // Calcular promedio manualmente
    const totalRating = 5 * rating5 + 4 * rating4 + 3 * rating3 + 2 * rating2 + 1 * rating1;
    const ratingCount = rating5 + rating4 + rating3 + rating2 + rating1;
    const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '0.0';

    res.status(200).json({
      success: true,
      stats: {
        totalReviews,
        pendingReviews,
        approvedReviews,
        rejectedReviews,
        verifiedPurchases,
        productReviews,
        generalReviews,
        averageRating,
        ratingDistribution: formattedDistribution
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de reseñas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de reseñas',
      error: error.message
    });
  }
};

/**
 * Obtener reseñas para un producto específico
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.query;

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Consulta con eager loading
    const count = await Review.count({
      where: {
        productId,
        status: 'approved'
      }
    });

    const reviews = await Review.findAll({
      where: {
        productId,
        status: 'approved'
      },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'slug', 'sku', 'images', 'thumbnail'],
        required: false
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]]
    });

    // Calcular información de paginación
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Estadísticas simplificadas
    const rating5 = await Review.count({ where: { productId, status: 'approved', rating: 5 } });
    const rating4 = await Review.count({ where: { productId, status: 'approved', rating: 4 } });
    const rating3 = await Review.count({ where: { productId, status: 'approved', rating: 3 } });
    const rating2 = await Review.count({ where: { productId, status: 'approved', rating: 2 } });
    const rating1 = await Review.count({ where: { productId, status: 'approved', rating: 1 } });

    const formattedDistribution = {
      5: rating5,
      4: rating4,
      3: rating3,
      2: rating2,
      1: rating1
    };

    // Calcular promedio manualmente
    const totalRating = 5 * rating5 + 4 * rating4 + 3 * rating3 + 2 * rating2 + 1 * rating1;
    const ratingCount = rating5 + rating4 + rating3 + rating2 + rating1;
    const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '0.0';

    res.status(200).json({
      success: true,
      productId,
      count,
      page: parseInt(page),
      totalPages,
      hasNextPage,
      hasPrevPage,
      averageRating,
      reviewCount: count,
      ratingDistribution: formattedDistribution,
      reviews
    });
  } catch (error) {
    console.error('Error al obtener reseñas del producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseñas del producto',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de reseñas para un producto específico
 */
exports.getProductReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validar acceso (opcional - dependiendo de tus requisitos)
    if (!req.user && req.query.requireAuth === 'true') {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida para acceder a estas estadísticas'
      });
    }

    // Obtener el producto relacionado
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Obtener las reseñas aprobadas para este producto
    const reviews = await Review.findAll({
      where: {
        productId,
        status: 'approved'
      }
    });

    // Calcular estadísticas
    const totalReviews = reviews.length;
    let averageRating = 0;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (totalReviews > 0) {
      let totalRating = 0;

      reviews.forEach(review => {
        totalRating += review.rating;
        distribution[review.rating] = (distribution[review.rating] || 0) + 1;
      });

      averageRating = totalRating / totalReviews;
    }

    return res.status(200).json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        totalReviews,
        averageRating,
        distribution
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de reseñas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de reseñas',
      error: error.message
    });
  }
};

/**
 * Obtener productos mejor calificados
 */
exports.getTopRatedProducts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // Este query podría necesitar ajustes según tu ORM específico y estructura de base de datos
    const topProducts = await Review.sequelize.query(`
      SELECT 
        p.id, 
        p.name, 
        p.sku,
        p.images,          // 🆕 Campo existente
        p.thumbnail,       // 🆕 Campo existente
        COUNT(r.id) as reviewCount,
        AVG(r.rating) as rating
      FROM products p
      JOIN reviews r ON p.id = r.productId
      WHERE r.status = 'approved'
      GROUP BY p.id
      HAVING COUNT(r.id) >= 3
      ORDER BY rating DESC, reviewCount DESC
      LIMIT :limit
    `, {
      replacements: { limit: parseInt(limit) },
      type: Review.sequelize.QueryTypes.SELECT
    });


    return res.status(200).json({
      success: true,
      topRatedProducts: topProducts
    });
  } catch (error) {
    console.error('Error al obtener productos mejor calificados:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener productos mejor calificados',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas generales de reseñas de productos
 */
exports.getProductReviewsOverview = async (req, res) => {
  try {
    // Obtener estadísticas básicas
    const totalProductReviews = await Review.count({
      where: {
        [Op.or]: [
          { productId: { [Op.not]: null } },
          { productName: { [Op.not]: null } },
          { productSKU: { [Op.not]: null } }
        ]
      }
    });

    // Calcular promedio de calificación para reseñas de productos
    const ratingResult = await Review.findOne({
      where: {
        [Op.or]: [
          { productId: { [Op.not]: null } },
          { productName: { [Op.not]: null } },
          { productSKU: { [Op.not]: null } }
        ],
        status: 'approved'
      },
      attributes: [
        [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'averageRating']
      ],
      raw: true
    });

    // Contar productos que tienen reseñas
    const productsWithReviews = await Review.sequelize.query(`
      SELECT COUNT(DISTINCT productId) as count
      FROM reviews
      WHERE productId IS NOT NULL
    `, {
      type: Review.sequelize.QueryTypes.SELECT
    });

    // Calcular promedio de reseñas por producto
    const averageReviewsPerProduct = productsWithReviews[0].count > 0
      ? totalProductReviews / productsWithReviews[0].count
      : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalProductReviews,
        averageProductRating: ratingResult?.averageRating || 0,
        productsWithReviews: productsWithReviews[0].count,
        averageReviewsPerProduct
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de reseñas de productos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};