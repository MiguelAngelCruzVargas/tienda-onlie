const express = require('express');
const router = express.Router();
const Category = require('../tienda-rines-api/category.model');

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'description', 'imageUrl', 'status']
    });
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ 
      message: 'Error al obtener categorías', 
      error: error.message 
    });
  }
});

// Obtener categoría por ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      attributes: ['id', 'name', 'description', 'imageUrl', 'status']
    });

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ 
      message: 'Error al obtener categoría', 
      error: error.message 
    });
  }
});

// Crear categoría
router.post('/', async (req, res) => {
  try {
    const { name, description, imageUrl, status } = req.body;
    
    // Validar datos de entrada
    if (!name) {
      return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
    }

    const newCategory = await Category.create({
      name,
      description,
      imageUrl,
      status: status || 'active'
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(400).json({ 
      message: 'Error al crear categoría', 
      error: error.message 
    });
  }
});

// Actualizar categoría
router.put('/:id', async (req, res) => {
  try {
    const { name, description, imageUrl, status } = req.body;
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Actualizar campos
    if (name) category.name = name;
    if (description) category.description = description;
    if (imageUrl) category.imageUrl = imageUrl;
    if (status) category.status = status;

    await category.save();

    res.json(category);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(400).json({ 
      message: 'Error al actualizar categoría', 
      error: error.message 
    });
  }
});

// Eliminar categoría (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    await category.destroy();
    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(400).json({ 
      message: 'Error al eliminar categoría', 
      error: error.message 
    });
  }
});

module.exports = router;