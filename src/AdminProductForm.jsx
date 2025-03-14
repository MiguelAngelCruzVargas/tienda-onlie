// src/AdminProductForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Automóvil',
    size: '',
    color: '',
    price: '',
    originalPrice: '',
    stock: '',
    description: '',
    featured: false
  });
  
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    // Cargar datos del producto si estamos en modo edición
    const fetchProductData = async () => {
      if (isEditing) {
        try {
          setIsLoading(true);
          setError(null);
          
          const response = await fetch(`http://localhost:5000/api/products/${id}`);
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const productData = await response.json();
          console.log('Datos del producto cargados:', productData);
          
          // Formatear datos para el formulario
          setFormData({
            name: productData.name || '',
            brand: productData.brand || '',
            category: productData.category || 'Automóvil',
            size: productData.size || '',
            color: productData.color || '',
            price: productData.price || '',
            originalPrice: productData.originalPrice || '',
            stock: productData.stock || '',
            description: productData.description || '',
            featured: productData.featured || false
          });
          
          // Si el producto tiene imágenes
          if (productData.images && productData.images.length > 0) {
            const imageData = productData.images.map(img => ({
              id: img.id,
              preview: img.url || `http://localhost:5000${img.path}`
            }));
            setImages(imageData);
          }
          
        } catch (err) {
          console.error('Error al cargar el producto:', err);
          setError(`Error al cargar el producto: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProductData();
    
    // Limpiar URLs de objetos al desmontar el componente
    return () => {
      images.forEach(image => {
        if (image.preview && image.preview.startsWith('blob:')) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [isEditing, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? (value === '' ? '' : Number(value)) : 
              value
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      const newImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        isNew: true
      }));
      
      setImages([...images, ...newImages]);
      
      // Limpiar el input de archivos
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    
    // Revocar URL para evitar pérdidas de memoria
    if (newImages[index].preview && newImages[index].preview.startsWith('blob:')) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (!formData.name || !formData.brand || !formData.price || !formData.stock) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Crear objeto con los datos para enviar
      const productToSend = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        stock: Number(formData.stock)
      };
      
      console.log('Enviando datos del producto:', productToSend);
      
      // Enviar los datos a la API
      let response;
      
      // En caso de edición
      if (isEditing) {
        response = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productToSend)
        });
      } 
      // En caso de creación de nuevo producto
      else {
        response = await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productToSend)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const savedProduct = await response.json();
      console.log('Producto guardado:', savedProduct);
      
      // Manejo de imágenes
      if (images.length > 0) {
        // Subir nuevas imágenes
        const newImages = images.filter(img => img.isNew);
        
        if (newImages.length > 0) {
          const formData = new FormData();
          formData.append('productId', savedProduct.id);
          
          newImages.forEach((image, index) => {
            if (image.file) {
              formData.append(`images`, image.file);
            }
          });
          
          const imageResponse = await fetch(`http://localhost:5000/api/products/${savedProduct.id}/images`, {
            method: 'POST',
            body: formData
          });
          
          if (!imageResponse.ok) {
            console.warn('Advertencia: No se pudieron guardar todas las imágenes');
          }
        }
      }
      
      setSuccessMessage(`Producto ${isEditing ? 'actualizado' : 'creado'} correctamente`);
      
      // Redirigir a la lista de productos después de 1.5 segundos
      setTimeout(() => {
        navigate('/admin/productos');
      }, 1500);
      
    } catch (err) {
      console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} el producto:`, err);
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el producto: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-lg text-gray-700">Cargando datos del producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow" role="alert">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow" role="alert">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-2 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Básica */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Información Básica</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Nombre del Producto <span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: Rin Deportivo Modelo XYZ"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="brand">
                Marca <span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleChange}
                required
                placeholder="Ej: BBS, OZ Racing, etc."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="Automóvil">Automóvil</option>
                <option value="Camioneta">Camioneta</option>
                <option value="SUV">SUV</option>
                <option value="Llantas">Llantas</option>
                <option value="Accesorios">Accesorios</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="size">
                  Tamaño (pulgadas) <span className="text-red-500">*</span>
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                  id="size"
                  name="size"
                  type="text"
                  value={formData.size}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 17, 18, 19"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="color">
                  Color <span className="text-red-500">*</span>
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                  id="color"
                  name="color"
                  type="text"
                  value={formData.color}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Negro, Plata, etc."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                  Precio (MXN) <span className="text-red-500">*</span>
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="Ej: 2499.99"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="originalPrice">
                  Precio Original (opcional)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="Para mostrar descuento"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stock">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                required
                placeholder="Cantidad disponible"
              />
            </div>
            
            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <span className="ml-2 text-gray-700">Destacar en página principal</span>
              </label>
            </div>
          </div>
          
          {/* Imágenes y descripción */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Imágenes y Descripción</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Imágenes del Producto
              </label>
              
              {images.length > 0 ? (
                <div className="flex flex-wrap gap-4 mb-4 border p-3 rounded-md">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image.preview} 
                        alt={`Vista previa ${index + 1}`} 
                        className="w-24 h-24 object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110"
                        aria-label="Eliminar imagen"
                      >
                        ×
                      </button>
                      {image.isNew && (
                        <span className="absolute top-0 left-0 bg-green-500 text-white text-xs px-1 rounded-br-md rounded-tl-md">
                          Nueva
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-md text-center text-gray-500">
                  No hay imágenes seleccionadas
                </div>
              )}
              
              <div className="mt-2">
                <label htmlFor="image-upload" className="block w-full cursor-pointer">
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md py-3 px-4 hover:bg-gray-50 transition-colors">
                    <svg className="h-6 w-6 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600 text-sm">Haz clic para agregar imágenes</span>
                  </div>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos permitidos: JPG, PNG, GIF. Máximo 5MB por imagen.
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200 h-60"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe las características y especificaciones del producto..."
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/productos')}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center"
          >
            {isSaving && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSaving 
              ? (isEditing ? 'Actualizando...' : 'Creando...') 
              : (isEditing ? 'Actualizar Producto' : 'Crear Producto')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;