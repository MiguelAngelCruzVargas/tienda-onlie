// tienda-rines-api/category.controller.js
const Category = require('./category.model');
const Product = require('./product.model');
const slugify = require('slugify');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Obtener todas las categorías
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { includeProducts, productLimit, status } = req.query;
    
    // Construir condiciones de búsqueda
    const whereConditions = {};
    
    // Filtrar por estado (solo categorías activas para usuarios normales)
    if (!req.user || req.user.role !== 'admin') {
      whereConditions.status = 'active';
    } else if (status) {
      whereConditions.status = status;
    }
    
    // Configurar inclusión de productos
    const includeOptions = [];
    if (includeProducts === 'true') {
      includeOptions.push({
        model: Product,
        as: 'products',
        where: { status: 'active' },
        limit: parseInt(productLimit || 5),
        order: [['createdAt', 'DESC']]
      });
    }
    
    // Obtener todas las categorías
    const categories = await Category.findAll({
      where: whereConditions,
      include: includeOptions,
      order: [
        ['order', 'ASC'],
        ['name', 'ASC']
      ]
    });
    
    // Organizar categorías en estructura jerárquica
    const rootCategories = categories.filter(cat => !cat.parentId);
    const childCategories = categories.filter(cat => cat.parentId);
    
    // Función para construir árbol de categorías
    const buildCategoryTree = (categories) => {
      return categories.map(category => {
        const children = childCategories.filter(child => child.parentId === category.id);
        
        return {
          ...category.toJSON(),
          children: children.length > 0 ? buildCategoryTree(children) : []
        };
      });
    };
    
    const categoryTree = buildCategoryTree(rootCategories);
    
    res.status(200).json({
      success: true,
      categories: req.query.flat === 'true' ? categories : categoryTree
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

/**
 * Obtener categorías destacadas
 */
exports.getFeaturedCategories = async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    
    const featuredCategories = await Category.findAll({
      where: {
        featured: true,
        status: 'active'
      },
      limit: parseInt(limit),
      order: [
        ['order', 'ASC'],
        ['name', 'ASC']
      ],
      include: [
        {
          model: Product,
          as: 'products',
          where: { status: 'active' },
          limit: 4,
          order: [['createdAt', 'DESC']]
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      categories: featuredCategories
    });
  } catch (error) {
    console.error('Error al obtener categorías destacadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías destacadas',
      error: error.message
    });
  }
};

/**
 * Obtener una categoría por su slug
 */
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { includeProducts, productLimit } = req.query;
    
    // Configurar inclusión de productos
    const includeOptions = [];
    if (includeProducts !== 'false') {
      includeOptions.push({
        model: Product,
        as: 'products',
        where: { status: 'active' },
        limit: parseInt(productLimit || 10),
        order: [['createdAt', 'DESC']]
      });
    }
    
    // Buscar la categoría por slug
    const category = await Category.findOne({
      where: { 
        slug,
        status: 'active'
      },
      include: includeOptions
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    // Obtener subcategorías
    const subcategories = await Category.findAll({
      where: { 
        parentId: category.id,
        status: 'active'
      }
    });
    
    // Obtener jerarquía completa (breadcrumbs)
    const hierarchy = await getHierarchy(category);
    
    res.status(200).json({
      success: true,
      category: {
        ...category.toJSON(),
        subcategories,
        hierarchy
      }
    });
  } catch (error) {
    console.error('Error al obtener categoría por slug:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoría',
      error: error.message
    });
  }
};

/**
 * Función auxiliar para obtener la jerarquía completa de una categoría
 */
async function getHierarchy(category) {
  const hierarchy = [];
  let currentCategory = category;
  
  // Agregar la categoría actual
  hierarchy.unshift({
    id: currentCategory.id,
    name: currentCategory.name,
    slug: currentCategory.slug
  });
  
  // Buscar hacia arriba en la jerarquía
  while (currentCategory.parentId) {
    currentCategory = await Category.findByPk(currentCategory.parentId);
    
    if (!currentCategory) break;
    
    hierarchy.unshift({
      id: currentCategory.id,
      name: currentCategory.name,
      slug: currentCategory.slug
    });
  }
  
  return hierarchy;
}

/**
 * Crear una nueva categoría
 */
exports.createCategory = async (req, res) => {
  try {
    // Procesar imagen si se subió
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/categories/${req.file.filename}`;
    }
    
    // Procesar datos de la categoría
    const categoryData = {
      ...req.body,
      image: imagePath
    };
    
    // Generar slug si no se proporcionó
    if (!categoryData.slug && categoryData.name) {
      categoryData.slug = slugify(categoryData.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
    }
    
    // Convertir booleanos (si vienen como strings)
    if (categoryData.featured) {
      categoryData.featured = categoryData.featured === 'true';
    }
    
    // Convertir numéricos
    if (categoryData.order) {
      categoryData.order = parseInt(categoryData.order);
    }
    if (categoryData.parentId) {
      categoryData.parentId = parseInt(categoryData.parentId) || null;
    }
    
    // Crear la categoría
    const newCategory = await Category.create(categoryData);
    
    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      category: newCategory
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    
    // Si hubo error y se subió una imagen, eliminarla
    if (req.file) {
      const filePath = path.join(__dirname, '../public/uploads/categories', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear categoría',
      error: error.message
    });
  }
};

/**
 * Actualizar una categoría existente
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la categoría existente
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    // Procesar imagen si se subió una nueva
    let imagePath = category.image;
    if (req.file) {
      // Si ya había una imagen, eliminarla
      if (category.image) {
        const oldImagePath = path.join(__dirname, '../public', category.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      imagePath = `/uploads/categories/${req.file.filename}`;
    }
    
    // Procesar datos de la categoría
    const categoryData = {
      ...req.body,
      image: imagePath
    };
    
    // Actualizar slug si se cambió el nombre y no se proporcionó un nuevo slug
    if (categoryData.name && !categoryData.slug && categoryData.name !== category.name) {
      categoryData.slug = slugify(categoryData.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
    }
    
    // Convertir booleanos (si vienen como strings)
    if (categoryData.featured !== undefined) {
      categoryData.featured = categoryData.featured === 'true';
    }
    
    // Convertir numéricos
    if (categoryData.order) {
      categoryData.order = parseInt(categoryData.order);
    }
    if (categoryData.parentId) {
      categoryData.parentId = parseInt(categoryData.parentId) || null;
    }
    
    // Verificación para evitar ciclos en la jerarquía
    if (categoryData.parentId) {
      const parentId = parseInt(categoryData.parentId);
      
      // No se puede asignar como padre a sí mismo
      if (parentId === category.id) {
        return res.status(400).json({
          success: false,
          message: 'Una categoría no puede ser su propio padre'
        });
      }
      
      // Verificar que el padre no sea uno de sus descendientes
      const checkCycle = async (parentId, ancestorId) => {
        if (parentId === ancestorId) return true;
        
        const parent = await Category.findByPk(parentId);
        if (!parent || !parent.parentId) return false;
        
        return checkCycle(parent.parentId, ancestorId);
      };
      
      const hasCycle = await checkCycle(parentId, category.id);
      if (hasCycle) {
        return res.status(400).json({
          success: false,
          message: 'Esta asignación crearía un ciclo en la jerarquía de categorías'
        });
      }
    }
    
    // Actualizar la categoría
    await category.update(categoryData);
    
    res.status(200).json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      category: await Category.findByPk(id)
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    
    // Si hubo error y se subió una imagen, eliminarla
    if (req.file) {
      const filePath = path.join(__dirname, '../public/uploads/categories', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar categoría',
      error: error.message
    });
  }
};

/**
 * Eliminar una categoría
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const reassignTo = req.query.reassignTo; // ID de categoría para reasignar productos
    
    // Buscar la categoría
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    // Verificar si tiene subcategorías
    const subcategories = await Category.findAll({
      where: { parentId: category.id }
    });
    
    if (subcategories.length > 0 && !reassignTo) {
      return res.status(400).json({
        success: false,
        message: 'Esta categoría tiene subcategorías. Debe reasignarlas antes de eliminar.',
        subcategories: subcategories.map(sub => ({
          id: sub.id,
          name: sub.name
        }))
      });
    }
    
    // Reasignar subcategorías si se especificó
    if (subcategories.length > 0 && reassignTo) {
      // Verificar que la categoría de destino existe
      const targetCategory = await Category.findByPk(reassignTo);
      
      if (!targetCategory) {
        return res.status(400).json({
          success: false,
          message: 'La categoría de destino para reasignación no existe'
        });
      }
      
      // Verificar que no se está reasignando a una subcategoría
      const isSubcategory = subcategories.some(sub => sub.id === parseInt(reassignTo));
      if (isSubcategory) {
        return res.status(400).json({
          success: false,
          message: 'No se puede reasignar a una subcategoría de la categoría que se está eliminando'
        });
      }
      
      // Reasignar subcategorías
      await Promise.all(subcategories.map(sub => sub.update({ parentId: reassignTo })));
    }
    
    // Verificar productos asociados y reasignarlos si es necesario
    const products = await Product.findAll({
      where: { categoryId: category.id }
    });
    
    if (products.length > 0) {
      if (reassignTo) {
        // Reasignar productos a otra categoría
        await Promise.all(products.map(product => product.update({ categoryId: reassignTo })));
      } else {
        // Si no se especifica reasignación, establecer categoría a null
        await Promise.all(products.map(product => product.update({ categoryId: null })));
      }
    }
    
    // Eliminar la imagen si existe
    if (category.image) {
      const imagePath = path.join(__dirname, '../public', category.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Eliminar la categoría
    await category.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar categoría',
      error: error.message
    });
  }
};

/**
 * Actualizar estado de una categoría
 */
exports.updateCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser: active o inactive'
      });
    }
    
    // Buscar y actualizar la categoría
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    await category.update({ status });
    
    res.status(200).json({
      success: true,
      message: `Estado de la categoría actualizado a ${status}`,
      category: {
        id: category.id,
        name: category.name,
        status: category.status
      }
    });
  } catch (error) {
    console.error('Error al actualizar estado de la categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de la categoría',
      error: error.message
    });
  }
};

/**
 * Marcar/desmarcar categoría como destacada
 */
exports.toggleCategoryFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    
    // Buscar y actualizar la categoría
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    // Convertir a booleano si viene como string
    const isFeatured = typeof featured === 'string' ? featured === 'true' : !!featured;
    
    await category.update({ featured: isFeatured });
    
    res.status(200).json({
      success: true,
      message: isFeatured ? 'Categoría marcada como destacada' : 'Categoría desmarcada como destacada',
      category: {
        id: category.id,
        name: category.name,
        featured: category.featured
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