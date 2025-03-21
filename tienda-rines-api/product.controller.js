// tienda-rines-api/product.controller.js
const Product = require('./product.model');
const Category = require('./category.model');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Obtener todos los productos
 * Permite filtrado, paginación y ordenamiento
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'DESC',
      category,
      minPrice,
      maxPrice,
      search,
      status = 'all'
    } = req.query;
    
    // Construir objeto de condiciones para la consulta
    const whereConditions = {};

   // Filtrar por estado (solo productos activos para usuarios normales)
//// Filtrar por estado
if (status === 'all') {
  // No añadir condición de estado
  delete whereConditions.status;
} else if (status) {
  // Usar el estado específico solicitado
  whereConditions.status = status;
}
    // Filtrar por categoría
    if (category) {
      whereConditions.categoryId = category;
    }
    
    // Filtrar por precio
    if (minPrice || maxPrice) {
      whereConditions.price = {};
      if (minPrice) whereConditions.price[Op.gte] = minPrice;
      if (maxPrice) whereConditions.price[Op.lte] = maxPrice;
    }
    
    // Filtrar por término de búsqueda
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { searchTerms: { [Op.like]: `%${search}%` } },
        { '$category.name$': { [Op.like]: `%${search}%` } } // Búsqueda por nombre de categoría
      ];
    }
    
    // Calcular offset para paginación
    const offset = (page - 1) * limit;
    
    // Ejecutar consulta con opciones
    const { count, rows } = await Product.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]]
    });
    
    // Calcular información de paginación
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    // Enviar respuesta
    res.status(200).json({
      success: true,
      count,
      page: parseInt(page),
      totalPages,
      hasNextPage,
      hasPrevPage,
      products: rows
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};
/**
 * Obtener un producto por su ID
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
};

/**
 * Obtener productos destacados
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = req.query.limit || 8;
    
    const featuredProducts = await Product.findAll({
      where: {
        featured: true,
        status: 'active'
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      limit: parseInt(limit),
      order: [['soldCount', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: featuredProducts.length,
      products: featuredProducts
    });
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos destacados',
      error: error.message
    });
  }
};

/**
 * Obtener productos por categoría
 */
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const { page = 1, limit = 12 } = req.query;
    
    // Buscar la categoría por slug
    const category = await Category.findOne({
      where: { slug: categorySlug }
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    // Calcular offset para paginación
    const offset = (page - 1) * limit;
    
    // Obtener todos los IDs de categorías hijas (si hay)
    const subCategories = await Category.findAll({
      where: { parentId: category.id }
    });
    
    const categoryIds = [category.id, ...subCategories.map(cat => cat.id)];
    
    // Buscar productos en la categoría y subcategorías
    const { count, rows } = await Product.findAndCountAll({
      where: {
        categoryId: { [Op.in]: categoryIds },
        status: 'active'
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    // Calcular información de paginación
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    // Enviar respuesta
    res.status(200).json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image
      },
      count,
      page: parseInt(page),
      totalPages,
      hasNextPage,
      hasPrevPage,
      products: rows
    });
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos por categoría',
      error: error.message
    });
  }
};

/**
 * Obtener un producto por su slug
 */
exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Buscar el producto por slug
    const product = await Product.findOne({
      where: { 
        slug,
        status: 'active'
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    // Buscar productos relacionados
    const relatedProducts = await Product.findAll({
      where: {
        categoryId: product.categoryId,
        id: { [Op.ne]: product.id },
        status: 'active'
      },
      limit: 4,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
    
    // Enviar respuesta
    res.status(200).json({
      success: true,
      product,
      relatedProducts
    });
  } catch (error) {
    console.error('Error al obtener producto por slug:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
};

/**
 * Buscar productos
 */
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 12 } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'La búsqueda debe tener al menos 2 caracteres'
      });
    }
    
    // Calcular offset para paginación
    const offset = (page - 1) * limit;
    
    // Buscar productos que coincidan con la consulta
    const { count, rows } = await Product.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
          { searchTerms: { [Op.like]: `%${query}%` } }
        ],
        status: 'active'
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });
    
    // Calcular información de paginación
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    // Enviar respuesta
    res.status(200).json({
      success: true,
      count,
      page: parseInt(page),
      totalPages,
      hasNextPage,
      hasPrevPage,
      query,
      products: rows
    });
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar productos',
      error: error.message
    });
  }
};

/**
 * Crear un nuevo producto
 */
exports.createProduct = async (req, res) => {
  try {
    // Procesar imágenes si se subieron
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/products/${file.filename}`);
    }
    
    // Procesar datos del producto
    const productData = {
      ...req.body,
      images: images,
      thumbnail: images.length > 0 ? images[0] : null
    };
    
    // Convertir booleanos (si vienen como strings)
    if (productData.featured) {
      productData.featured = productData.featured === 'true';
    }
    
    // Convertir numéricos
    if (productData.price) {
      productData.price = parseFloat(productData.price);
    }
    if (productData.compareAtPrice) {
      productData.compareAtPrice = parseFloat(productData.compareAtPrice);
    }
    if (productData.costPrice) {
      productData.costPrice = parseFloat(productData.costPrice);
    }
    if (productData.inventory) {
      productData.inventory = parseInt(productData.inventory);
    }
    
    // Manejar tags y atributos (si vienen como strings JSON)
    if (productData.tags && typeof productData.tags === 'string') {
      try {
        productData.tags = JSON.parse(productData.tags);
      } catch (e) {
        productData.tags = productData.tags.split(',').map(tag => tag.trim());
      }
    }
    
    if (productData.attributes && typeof productData.attributes === 'string') {
      try {
        productData.attributes = JSON.parse(productData.attributes);
      } catch (e) {
        productData.attributes = {};
      }
    }
    
    // Crear el producto
    const newProduct = await Product.create(productData);
    
    // Enviar respuesta
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      product: newProduct
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    
    // Si hubo error, eliminar las imágenes subidas
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../public/uploads/products', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
};

/**
 * Actualizar un producto existente
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar el producto existente
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    // Procesar imágenes si se subieron nuevas
    let images = product.images || [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      
      // Si se indicó reemplazar todas las imágenes
      if (req.body.replaceImages === 'true') {
        // Eliminar imágenes antiguas
        images.forEach(img => {
          const filePath = path.join(__dirname, '../public', img);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
        
        images = newImages;
      } else {
        // Agregar nuevas imágenes
        images = [...images, ...newImages];
      }
    }
    
    // Procesar datos del producto
    const productData = {
      ...req.body,
      images
    };
    
    // Actualizar thumbnail si es necesario
    if (images.length > 0 && (!product.thumbnail || req.body.updateThumbnail === 'true')) {
      productData.thumbnail = images[0];
    }
    
    // Convertir booleanos (si vienen como strings)
    if (productData.featured !== undefined) {
      productData.featured = productData.featured === 'true';
    }
    
    // Convertir numéricos
    if (productData.price) {
      productData.price = parseFloat(productData.price);
    }
    if (productData.compareAtPrice) {
      productData.compareAtPrice = parseFloat(productData.compareAtPrice);
    }
    if (productData.costPrice) {
      productData.costPrice = parseFloat(productData.costPrice);
    }
    if (productData.inventory) {
      productData.inventory = parseInt(productData.inventory);
    }
    
    // Manejar tags y atributos (si vienen como strings JSON)
    if (productData.tags && typeof productData.tags === 'string') {
      try {
        productData.tags = JSON.parse(productData.tags);
      } catch (e) {
        productData.tags = productData.tags.split(',').map(tag => tag.trim());
      }
    }
    
    if (productData.attributes && typeof productData.attributes === 'string') {
      try {
        productData.attributes = JSON.parse(productData.attributes);
      } catch (e) {
        productData.attributes = {};
      }
    }
    
    // Actualizar el producto
    await product.update(productData);
    
    // Obtener producto actualizado con relaciones
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });
    
    // Enviar respuesta
    res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    
    // Si hubo error, eliminar las imágenes nuevas subidas
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../public/uploads/products', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
};

/**
 * Eliminar un producto
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const hardDelete = req.query.hard === 'true';
    
    // Buscar el producto
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    if (hardDelete) {
      // Si es eliminación física, eliminar imágenes
      const images = product.images || [];
      images.forEach(img => {
        const filePath = path.join(__dirname, '../public', img);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      
      // Eliminar físicamente el producto
      await product.destroy({ force: true });
      
      res.status(200).json({
        success: true,
        message: 'Producto eliminado permanentemente'
      });
    } else {
      // Eliminación lógica (soft delete)
      await product.destroy();
      
      res.status(200).json({
        success: true,
        message: 'Producto enviado a la papelera'
      });
    }
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
};

/**
 * Actualizar estado de un producto
 */
exports.updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validar estado
    if (!['active', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser: active, draft o archived'
      });
    }
    
    // Buscar el producto
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    // Actualizar estado
    await product.update({ status });
    
    res.status(200).json({
      success: true,
      message: `Estado del producto actualizado a ${status}`,
      product: {
        id: product.id,
        name: product.name,
        status: product.status
      }
    });
  } catch (error) {
    console.error('Error al actualizar estado del producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado del producto',
      error: error.message
    });
  }
};

/**
 * Marcar/desmarcar producto como destacado
 */
exports.toggleProductFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    
    // Buscar y actualizar el producto
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    // Convertir a booleano si viene como string
    const isFeatured = typeof featured === 'string' ? featured === 'true' : !!featured;
    
    await product.update({ featured: isFeatured });
    
    res.status(200).json({
      success: true,
      message: isFeatured ? 'Producto marcado como destacado' : 'Producto desmarcado como destacado',
      product: {
        id: product.id,
        name: product.name,
        featured: product.featured
      }
    });
  } catch (error) {
    console.error('Error al actualizar estado de destacado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de destacado',
      error: error.message
    });
  }
};

/**
 * Agregar imágenes a un producto
 */
exports.addProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar el producto
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se han subido imágenes'
      });
    }
    
    // Procesar las nuevas imágenes
    const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
    
    // Agregar a las imágenes existentes
    const currentImages = product.images || [];
    const updatedImages = [...currentImages, ...newImages];
    
    // Actualizar producto
    await product.update({ 
      images: updatedImages,
      // Si no tiene thumbnail, usar la primera imagen
      thumbnail: product.thumbnail || newImages[0]
    });
    
    res.status(200).json({
      success: true,
      message: 'Imágenes agregadas exitosamente',
      images: updatedImages
    });
  } catch (error) {
    console.error('Error al agregar imágenes:', error);
    
    // Si hubo error, eliminar las imágenes subidas
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../public/uploads/products', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al agregar imágenes',
      error: error.message
    });
  }
};

/**
 * Eliminar una imagen específica de un producto
 */
exports.deleteProductImage = async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    
    // Buscar el producto
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    const currentImages = product.images || [];
    const index = parseInt(imageIndex);
    
    if (isNaN(index) || index < 0 || index >= currentImages.length) {
      return res.status(400).json({
        success: false,
        message: 'Índice de imagen inválido'
      });
    }
    
    // Obtener la imagen a eliminar
    const imageToDelete = currentImages[index];
    
    // Eliminar el archivo físico
    const filePath = path.join(__dirname, '../public', imageToDelete);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Quitar la imagen del array
    const updatedImages = [...currentImages];
    updatedImages.splice(index, 1);
    
    // Actualizar el thumbnail si era la imagen eliminada
    let thumbnail = product.thumbnail;
    if (product.thumbnail === imageToDelete) {
      thumbnail = updatedImages.length > 0 ? updatedImages[0] : null;
    }
    
    // Actualizar producto
    await product.update({ 
      images: updatedImages,
      thumbnail
    });
    
    res.status(200).json({
      success: true,
      message: 'Imagen eliminada exitosamente',
      images: updatedImages
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen',
      error: error.message
    });
  }
};