const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ProductController = require('../tienda-rines-api/product.controller');

// Configurar almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/products';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generar un nombre único para la imagen
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + req.params.id + '-' + uniqueSuffix + ext);
  }
});

// Filtro para solo permitir imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

// Configurar middleware de multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await ProductController.getAllProducts(req.query);
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ 
      message: 'Error al obtener productos', 
      error: error.message 
    });
  }
});

// IMPORTANTE: Ruta para obtener productos destacados (DEBE ESTAR ANTES DE /:id)
router.get('/featured', async (req, res) => {
  try {
    console.log('Intentando obtener productos destacados...');
    const featuredProducts = await ProductController.getFeaturedProducts();
    console.log(`Se encontraron ${featuredProducts.length} productos destacados`);
    res.json(featuredProducts);
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    res.status(500).json({ 
      message: 'Error al obtener productos destacados', 
      error: error.message 
    });
  }
});

// Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await ProductController.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ 
      message: 'Error al obtener producto', 
      error: error.message 
    });
  }
});

// Crear producto
router.post('/', async (req, res) => {
  try {
    const newProduct = await ProductController.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(400).json({ 
      message: 'Error al crear producto', 
      error: error.message 
    });
  }
});

// Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await ProductController.updateProduct(
      req.params.id, 
      req.body
    );
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(400).json({ 
      message: 'Error al actualizar producto', 
      error: error.message 
    });
  }
});

// Eliminar producto (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await ProductController.deleteProduct(req.params.id);
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(400).json({ 
      message: 'Error al eliminar producto', 
      error: error.message 
    });
  }
});

// Rutas para imágenes de productos
// Subir imágenes
router.post('/:id/images', upload.array('images', 5), async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Verificar que el producto existe
    const product = await ProductController.getProductById(productId);
    if (!product) {
      // Eliminar archivos subidos si el producto no existe
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Procesar las imágenes subidas
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No se han subido imágenes' });
    }
    
    // Guardar las referencias a las imágenes en la base de datos
    const imageUrls = req.files.map(file => ({
      productId: productId,
      path: '/' + file.path.replace(/\\/g, '/') // Normalizar path para URLs
    }));
    
    // Guardar las imágenes en la base de datos
    const savedImages = await ProductController.addProductImages(productId, imageUrls);
    
    res.status(201).json({
      message: 'Imágenes subidas correctamente',
      images: savedImages
    });
  } catch (error) {
    console.error('Error al subir imágenes:', error);
    res.status(500).json({ 
      message: 'Error al subir imágenes', 
      error: error.message 
    });
  }
});

// Obtener imágenes de un producto
router.get('/:id/images', async (req, res) => {
  try {
    const productId = req.params.id;
    const images = await ProductController.getProductImages(productId);
    res.json(images);
  } catch (error) {
    console.error('Error al obtener imágenes:', error);
    res.status(500).json({ 
      message: 'Error al obtener imágenes', 
      error: error.message 
    });
  }
});

// Establecer imagen principal
router.put('/images/:imageId/main', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Se requiere el ID del producto' });
    }
    
    await ProductController.setMainImage(imageId, productId);
    res.json({ message: 'Imagen principal establecida correctamente' });
  } catch (error) {
    console.error('Error al establecer imagen principal:', error);
    res.status(500).json({ 
      message: 'Error al establecer imagen principal', 
      error: error.message 
    });
  }
});

// Eliminar una imagen
router.delete('/images/:imageId', async (req, res) => {
  try {
    await ProductController.deleteProductImage(req.params.imageId);
    res.json({ message: 'Imagen eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ 
      message: 'Error al eliminar imagen', 
      error: error.message 
    });
  }
});

module.exports = router;