// routes/categories.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../tienda-rines-api/category.controller');
const authMiddleware = require('./auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración para almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Crear directorio si no existe
    const uploadDir = path.join(__dirname, '../public/uploads/categories');
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Crear nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'category-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Límite de 2MB
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo permitidos
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
  }
});

// Rutas públicas (no requieren autenticación)
router.get('/', categoryController.getAllCategories);
router.get('/featured', categoryController.getFeaturedCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Rutas protegidas (requieren autenticación)
router.use(authMiddleware);

// Rutas para el panel de administración
router.post('/', upload.single('image'), categoryController.createCategory);
router.put('/:id', upload.single('image'), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.patch('/:id/status', categoryController.updateCategoryStatus);
router.patch('/:id/featured', categoryController.toggleCategoryFeatured);

module.exports = router;