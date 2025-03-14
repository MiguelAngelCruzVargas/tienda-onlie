// categories.routes.js
const express = require('express');
const router = express.Router();

// Importar el controlador de categorías
// Si aún no lo tienes, deberás crearlo
// Por ahora haré una implementación simple
const categoryController = {
  getAllCategories: async () => {
    // Aquí deberías implementar la lógica real
    // Por ahora devolvemos un array vacío
    return [];
  },
  getCategoryById: async (id) => {
    // Implementación temporal
    throw new Error('Categoría no encontrada');
  },
  createCategory: async (data) => {
    // Implementación temporal
    return { id: 1, ...data };
  },
  updateCategory: async (id, data) => {
    // Implementación temporal
    return { id, ...data };
  },
  deleteCategory: async (id) => {
    // Implementación temporal
    return true;
  }
};

// Ruta para obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const categories = await categoryController.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener categorías', 
      error: error.message 
    });
  }
});

// Ruta para obtener una categoría por ID
router.get('/:id', async (req, res) => {
  try {
    const category = await categoryController.getCategoryById(req.params.id);
    res.json(category);
  } catch (error) {
    res.status(404).json({ 
      message: 'Categoría no encontrada', 
      error: error.message 
    });
  }
});

// Ruta para crear una nueva categoría
router.post('/', async (req, res) => {
  try {
    const newCategory = await categoryController.createCategory(req.body);
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ 
      message: 'Error al crear categoría', 
      error: error.message 
    });
  }
});

// Ruta para actualizar una categoría
router.put('/:id', async (req, res) => {
  try {
    const updatedCategory = await categoryController.updateCategory(
      req.params.id, 
      req.body
    );
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ 
      message: 'Error al actualizar categoría', 
      error: error.message 
    });
  }
});

// Ruta para eliminar una categoría
router.delete('/:id', async (req, res) => {
  try {
    await categoryController.deleteCategory(req.params.id);
    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    res.status(400).json({ 
      message: 'Error al eliminar categoría', 
      error: error.message 
    });
  }
});

module.exports = router;