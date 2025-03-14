// routes/settings.js
const express = require('express');
const router = express.Router();
const SettingsController = require('../tienda-rines-api/settings.controller');

// Rutas para configuración general
router.get('/general', async (req, res) => {
  try {
    const settings = await SettingsController.getGeneral();
    res.json(settings);
  } catch (error) {
    console.error('Error al obtener configuración general:', error);
    res.status(500).json({ 
      message: 'Error al obtener configuración general', 
      error: error.message 
    });
  }
});

router.put('/general', async (req, res) => {
  try {
    await SettingsController.saveGeneral(req.body);
    res.json({ message: 'Configuración general guardada con éxito' });
  } catch (error) {
    console.error('Error al guardar configuración general:', error);
    res.status(500).json({ 
      message: 'Error al guardar configuración general', 
      error: error.message 
    });
  }
});

// Rutas para configuración de envío
router.get('/shipping', async (req, res) => {
  try {
    const settings = await SettingsController.getShipping();
    res.json(settings);
  } catch (error) {
    console.error('Error al obtener configuración de envío:', error);
    res.status(500).json({ 
      message: 'Error al obtener configuración de envío', 
      error: error.message 
    });
  }
});

router.put('/shipping', async (req, res) => {
  try {
    await SettingsController.saveShipping(req.body);
    res.json({ message: 'Configuración de envío guardada con éxito' });
  } catch (error) {
    console.error('Error al guardar configuración de envío:', error);
    res.status(500).json({ 
      message: 'Error al guardar configuración de envío', 
      error: error.message 
    });
  }
});

// Rutas para configuración de pagos
router.get('/payment', async (req, res) => {
  try {
    const settings = await SettingsController.getPayment();
    res.json(settings);
  } catch (error) {
    console.error('Error al obtener configuración de pagos:', error);
    res.status(500).json({ 
      message: 'Error al obtener configuración de pagos', 
      error: error.message 
    });
  }
});

router.put('/payment', async (req, res) => {
  try {
    await SettingsController.savePayment(req.body);
    res.json({ message: 'Configuración de pagos guardada con éxito' });
  } catch (error) {
    console.error('Error al guardar configuración de pagos:', error);
    res.status(500).json({ 
      message: 'Error al guardar configuración de pagos', 
      error: error.message 
    });
  }
});

// Rutas para configuración de notificaciones
router.get('/notifications', async (req, res) => {
  try {
    const settings = await SettingsController.getNotifications();
    res.json(settings);
  } catch (error) {
    console.error('Error al obtener configuración de notificaciones:', error);
    res.status(500).json({ 
      message: 'Error al obtener configuración de notificaciones', 
      error: error.message 
    });
  }
});

router.put('/notifications', async (req, res) => {
  try {
    await SettingsController.saveNotifications(req.body);
    res.json({ message: 'Configuración de notificaciones guardada con éxito' });
  } catch (error) {
    console.error('Error al guardar configuración de notificaciones:', error);
    res.status(500).json({ 
      message: 'Error al guardar configuración de notificaciones', 
      error: error.message 
    });
  }
});

module.exports = router;