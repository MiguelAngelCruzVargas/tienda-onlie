// category.controller.js
const Category = require('./category.model');
const slugify = require('slugify');

class CategoryController {
  // Obtener todas las categorías activas
  static async getAllCategories() {
    try {
      const categories = await Category.findAll({
        where: { status: 'active' },
        order: [['displayOrder', 'ASC'], ['name', 'ASC']]
      });
      return categories;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  // Obtener una categoría por ID
  static async getCategoryById(id) {
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        throw new Error('Categoría no encontrada');
      }
      return category;
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      throw error;
    }
  }

  // Crear una nueva categoría
  static async createCategory(categoryData) {
    try {
      // Generar slug a partir del nombre si no se proporciona
      if (!categoryData.slug) {
        categoryData.slug = slugify(categoryData.name, { lower: true });
      }
      
      const category = await Category.create(categoryData);
      return category;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  }

  // Actualizar una categoría
  static async updateCategory(id, updateData) {
    try {
      // Actualizar slug si se modifica el nombre
      if (updateData.name && !updateData.slug) {
        updateData.slug = slugify(updateData.name, { lower: true });
      }
      
      const [updated] = await Category.update(updateData, {
        where: { id }
      });
      
      if (updated === 0) {
        throw new Error('Categoría no encontrada');
      }
      
      return this.getCategoryById(id);
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  }

  // Eliminar una categoría
  static async deleteCategory(id) {
    try {
      const deleted = await Category.destroy({
        where: { id }
      });
      
      if (deleted === 0) {
        throw new Error('Categoría no encontrada');
      }
      
      return true;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  }
}

module.exports = CategoryController;