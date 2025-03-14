// promotion.routes.js
const express = require('express');
const router = express.Router();
const PromotionController = require('./promotion.controller');

// Obtener todas las promociones activas
router.get('/', async (req, res) => {
  try {
    const promotions = await PromotionController.getActivePromotions();
    res.json(promotions);
  } catch (error) {
    console.error('Error al obtener promociones:', error);
    res.status(500).json({ 
      message: 'Error al obtener promociones', 
      error: error.message 
    });
  }
});

// Obtener promoción por ID
router.get('/:id', async (req, res) => {
  try {
    const promotion = await PromotionController.getPromotionById(req.params.id);
    res.json(promotion);
  } catch (error) {
    console.error('Error al obtener promoción:', error);
    res.status(404).json({ 
      message: 'Promoción no encontrada', 
      error: error.message 
    });
  }
});

// Crear promoción
router.post('/', async (req, res) => {
  try {
    const newPromotion = await PromotionController.createPromotion(req.body);
    res.status(201).json(newPromotion);
  } catch (error) {
    console.error('Error al crear promoción:', error);
    res.status(400).json({ 
      message: 'Error al crear promoción', 
      error: error.message 
    });
  }
});

// Actualizar promoción
router.put('/:id', async (req, res) => {
  try {
    const updatedPromotion = await PromotionController.updatePromotion(
      req.params.id, 
      req.body
    );
    res.json(updatedPromotion);
  } catch (error) {
    console.error('Error al actualizar promoción:', error);
    res.status(400).json({ 
      message: 'Error al actualizar promoción', 
      error: error.message 
    });
  }
});

// Eliminar promoción
router.delete('/:id', async (req, res) => {
  try {
    await PromotionController.deletePromotion(req.params.id);
    res.json({ message: 'Promoción eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar promoción:', error);
    res.status(400).json({ 
      message: 'Error al eliminar promoción', 
      error: error.message 
    });
  }
});

module.exports = router;