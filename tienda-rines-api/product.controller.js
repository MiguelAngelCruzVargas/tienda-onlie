const Product = require('./product.model');
const ProductImage = require('./product-image.model');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

class ProductController {
  // Crear un nuevo producto
  static async createProduct(productData) {
    try {
      const product = await Product.create(productData);
      return product;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  }

  // Obtener todos los productos
  static async getAllProducts(filter = {}) {
    try {
      const products = await Product.findAll({
        where: filter,
        include: [
          {
            model: ProductImage,
            as: 'images',
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return products;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }

  // Método para obtener productos destacados
 // Método para obtener productos destacados
static async getFeaturedProducts() {
  try {
    const featuredProducts = await Product.findAll({
      where: { 
        featured: true,
        status: 'active'
      },
      include: [
        {
          model: ProductImage,
          as: 'images',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 8
    });
    return featuredProducts;
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    throw error;
  }
}

  // Obtener producto por ID
  static async getProductById(id) {
    try {
      const product = await Product.findByPk(id, {
        include: [
          {
            model: ProductImage,
            as: 'images',
            required: false
          }
        ]
      });
      
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      return product;
    } catch (error) {
      console.error('Error al obtener producto:', error);
      throw error;
    }
  }

  // Actualizar producto
  static async updateProduct(id, updateData) {
    try {
      const [updated] = await Product.update(updateData, {
        where: { id }
      });
      
      if (updated === 0) {
        throw new Error('Producto no encontrado');
      }
      
      return this.getProductById(id);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  }

  // Eliminar producto (soft delete)
  static async deleteProduct(id) {
    try {
      // Primero eliminar las imágenes asociadas (borrar archivos físicos)
      const product = await this.getProductById(id);
      if (product && product.images) {
        for (const image of product.images) {
          await this.deleteProductImage(image.id);
        }
      }
      
      // Luego eliminar el producto (soft delete)
      const deleted = await Product.destroy({
        where: { id }
      });
      
      if (deleted === 0) {
        throw new Error('Producto no encontrado');
      }
      
      return true;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  }

  // Método para añadir imágenes a un producto
  static async addProductImages(productId, imageData) {
    try {
      // Verificar si el producto existe
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      
      // Crear registros de imágenes
      const images = [];
      for (const data of imageData) {
        // Si no hay imágenes principales, marcar la primera como principal
        const existingImages = await ProductImage.count({ where: { productId } });
        const isMain = existingImages === 0 ? true : data.isMain || false;
        
        const image = await ProductImage.create({
          productId,
          path: data.path,
          isMain,
          order: data.order || images.length
        });
        
        images.push(image);
      }
      
      return images;
    } catch (error) {
      console.error('Error al añadir imágenes:', error);
      throw error;
    }
  }

  // Método para obtener imágenes de un producto
  static async getProductImages(productId) {
    try {
      const images = await ProductImage.findAll({
        where: { productId },
        order: [['isMain', 'DESC'], ['order', 'ASC']]
      });
      
      return images;
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
      throw error;
    }
  }

  // Método para establecer una imagen como principal
  static async setMainImage(imageId, productId) {
    try {
      // Primero quitar la marca de principal de todas las imágenes del producto
      await ProductImage.update(
        { isMain: false },
        { where: { productId } }
      );
      
      // Luego marcar la imagen seleccionada como principal
      const [updated] = await ProductImage.update(
        { isMain: true },
        { where: { id: imageId, productId } }
      );
      
      if (updated === 0) {
        throw new Error('Imagen no encontrada');
      }
      
      return true;
    } catch (error) {
      console.error('Error al establecer imagen principal:', error);
      throw error;
    }
  }

  // Método para eliminar una imagen
  static async deleteProductImage(imageId) {
    try {
      const image = await ProductImage.findByPk(imageId);
      if (!image) {
        throw new Error('Imagen no encontrada');
      }
      
      // Eliminar archivo físico si no es una URL externa
      if (image.path && !image.path.startsWith('http')) {
        try {
          const filePath = path.join(process.cwd(), image.path.replace(/^\//, ''));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (fileError) {
          console.error('Error al eliminar archivo de imagen:', fileError);
          // Continuar incluso si el archivo no se puede eliminar
        }
      }
      
      // Si esta era la imagen principal y hay otras imágenes, establecer otra como principal
      if (image.isMain) {
        const otherImage = await ProductImage.findOne({
          where: {
            productId: image.productId,
            id: { [Op.ne]: imageId }
          }
        });
        
        if (otherImage) {
          await this.setMainImage(otherImage.id, image.productId);
        }
      }
      
      // Eliminar el registro de la base de datos
      await image.destroy();
      return true;
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      throw error;
    }
  }
}

module.exports = ProductController;