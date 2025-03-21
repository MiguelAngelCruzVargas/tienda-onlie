// src/AdminProductForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { API_BASE } from './utils/apiConfig';
// Función para generar SKU automáticamente para rines
const generateSKU = (name) => {
  if (!name) return '';
  
  // Normalizar el nombre: eliminar tildes y convertir a mayúsculas
  const normalizeName = (str) => {
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toUpperCase();
  };
  
  // Inicializar el SKU base
  let sku = 'RIN-';
  
  // Añadir tipo de rin
  sku += 'DEP-'; // Deportivo por defecto
  
  // Extraer el tamaño del rin (R18, R20, etc.)
  const sizeRegex = /R(\d{2})/i;
  const sizeMatch = name.match(sizeRegex);
  if (sizeMatch && sizeMatch[1]) {
    sku += `R${sizeMatch[1]}-`;
  } else {
    // Si no se encuentra el tamaño, añadir un marcador genérico
    sku += 'RX-';
  }
  
  // Generar un código único basado en el nombre
  const normalizedName = normalizeName(name);
  
  // Extraer palabras clave o códigos
  const keywords = normalizedName.split(' ')
    .filter(word => word.length > 1 && !/^(DEPORTIVO|RIN|CON|PARA|DE|LA)$/.test(word));
  
  // Tomar las primeras 2-3 letras de las palabras clave
  let identifier = keywords
    .slice(0, 3)
    .map(word => word.slice(0, 2))
    .join('');
  
  // Si el identificador es muy corto, añadir caracteres aleatorios
  if (identifier.length < 3) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    while (identifier.length < 3) {
      identifier += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  // Truncar a 3 caracteres
  identifier = identifier.slice(0, 3);
  
  // Añadir el identificador al SKU
  sku += identifier;
  
  return sku;
};

// Ejemplo de uso en un manejador de cambios
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  
  // Lógica de actualización de estado del producto
  if (type === 'checkbox') {
    setProduct(prev => ({ ...prev, [name]: checked }));
  } else {
    setProduct(prev => ({ ...prev, [name]: value }));
    
    // Si el campo es "name", generar SKU automáticamente
    if (name === 'name' && value) {
      const generatedSKU = generateSKU(value);
      setProduct(prev => ({ ...prev, sku: generatedSKU }));
    }
  }
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado inicial del producto
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    inventory: 0,
    categoryId: '',
    status: 'draft',
    featured: false,
    tags: [],
    attributes: {
      diameter: '',
      width: '',
      boltPattern: '',
      offset: '',
      material: '',
      color: '',
      finish: ''
    }
  });

  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
      
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE}/api/categories?flat=true`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        setError('No se pudieron cargar las categorías. Por favor, inténtalo de nuevo.');
      }
    };

    fetchCategories();
  }, []);

  // Cargar datos del producto si estamos en modo edición
  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          setIsLoading(true);
       
          const token = localStorage.getItem('token');
          
          const response = await fetch(`${API_BASE}/api/products/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          if (data.success && data.product) {
            setProduct({
              ...data.product,
              attributes: data.product.attributes || {
                diameter: '',
                width: '',
                boltPattern: '',
                offset: '',
                material: '',
                color: '',
                finish: ''
              }
            });
            
            // Si hay imágenes, configurar las previsualizaciones
            if (data.product.images && data.product.images.length > 0) {
            
              const previews = data.product.images.map(img => ({
                url: `${API_BASE}${img}`
              }));
              setPreviewImages(previews);
            }
          }
        } catch (error) {
          console.error('Error al cargar producto:', error);
          setError('No se pudo cargar la información del producto.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id]);

  // Manejar cambios en campos simples
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setProduct(prev => ({ ...prev, [name]: checked }));
    } else if (name.includes('.')) {
      // Para campos anidados (attributes)
      const [parent, child] = name.split('.');
      setProduct(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProduct(prev => ({ ...prev, [name]: value }));
      
      // Si el campo es "name", generar SKU automáticamente
      if (name === 'name' && value && !product.sku) {
        const generatedSKU = generateSKU(value);
        setProduct(prev => ({ ...prev, sku: generatedSKU }));
      }
    }
  };

  // Manejar carga de imágenes
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    const newPreviewImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    setPreviewImages(prev => [...prev, ...newPreviewImages]);
  };

  // Eliminar una imagen de la previsualización
  const removeImage = (index) => {
    const updatedPreviews = [...previewImages];
    
    // Liberar URL si es un objeto creado con URL.createObjectURL
    if (updatedPreviews[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(updatedPreviews[index].url);
    }
    
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);
  };

  // Manejar entrada de tags
  const handleTagsChange = (e) => {
    const tagInput = e.target.value;
    const tagArray = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    setProduct(prev => ({ ...prev, tags: tagArray }));
  };

  // Preparar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
    
      const token = localStorage.getItem('token');
      
      // Crear FormData para enviar archivos e información
      const formData = new FormData();
      
      // Añadir campos de texto
      Object.keys(product).forEach(key => {
        if (key === 'tags' || key === 'attributes') {
          formData.append(key, JSON.stringify(product[key]));
        } else {
          formData.append(key, product[key]);
        }
      });
      
      // Añadir imágenes nuevas
      previewImages.forEach(preview => {
        if (preview.file) {
          formData.append('images', preview.file);
        }
      });

      // Determinar método y URL según si es creación o edición
      const method = id ? 'PUT' : 'POST';
      const url = id 
        ? `${API_BASE}/api/products/${id}`
        : `${API_BASE}/api/products`;
      
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(id ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
        if (!id) {
          // Resetear formulario en caso de creación
          setProduct({
            name: '',
            description: '',
            price: '',
            compareAtPrice: '',
            sku: '',
            inventory: 0,
            categoryId: '',
            status: 'draft',
            featured: false,
            tags: [],
            attributes: {
              diameter: '',
              width: '',
              boltPattern: '',
              offset: '',
              material: '',
              color: '',
              finish: ''
            }
          });
          setPreviewImages([]);
        }
        
        // Redirigir después de un breve retraso
        setTimeout(() => {
          navigate('/admin/productos');
        }, 2000);
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setError(`Error al guardar el producto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && id) {
    return (
      <div className="p-6">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-12 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-36 bg-gray-200 rounded"></div>
            <div className="h-36 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Editar Producto' : 'Añadir Nuevo Producto'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Panel principal con datos básicos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Información Básica</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre del producto */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej. Rin Deportivo R18 Modelo XYZ"
              />
            </div>
            
            {/* SKU */}
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                SKU (Código)
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={product.sku}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej. RIN-DEP-R18-XYZ"
              />
            </div>
            
            
            {/* Categoría */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={product.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Estado */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={product.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="draft">Borrador</option>
                <option value="active">Activo</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
            
            {/* Precio */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {/* Precio de comparación */}
            <div>
              <label htmlFor="compareAtPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Precio Regular (para mostrar descuento)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="compareAtPrice"
                  name="compareAtPrice"
                  value={product.compareAtPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {/* Inventario */}
            <div>
              <label htmlFor="inventory" className="block text-sm font-medium text-gray-700 mb-1">
                Inventario
              </label>
              <input
                type="number"
                id="inventory"
                name="inventory"
                value={product.inventory}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0"
              />
            </div>
            
            {/* Destacado */}
            <div className="flex items-center h-full mt-6">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={product.featured}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                Marcar como producto destacado
              </label>
            </div>
          </div>
          
          {/* Descripción */}
          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={product.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe el producto con detalles relevantes para los clientes..."
            ></textarea>
          </div>
          
          {/* Tags */}
          <div className="mt-4">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Etiquetas (separadas por comas)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={product.tags.join(', ')}
              onChange={handleTagsChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej. deportivo, lujo, r18, aluminio"
            />
          </div>
        </div>
        
        {/* Panel de atributos específicos para rines */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Especificaciones Técnicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Diámetro */}
            <div>
              <label htmlFor="attributes.diameter" className="block text-sm font-medium text-gray-700 mb-1">
                Diámetro (pulgadas)
              </label>
              <input
                type="text"
                id="attributes.diameter"
                name="attributes.diameter"
                value={product.attributes.diameter}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej. 18"
              />
            </div>
            
            {/* Ancho */}
            <div>
              <label htmlFor="attributes.width" className="block text-sm font-medium text-gray-700 mb-1">
                Ancho (pulgadas)
              </label>
              <input
                type="text"
                id="attributes.width"
                name="attributes.width"
                value={product.attributes.width}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej. 8.5"
              />
            </div>
            
            {/* Patrón de birlos */}
            <div>
              <label htmlFor="attributes.boltPattern" className="block text-sm font-medium text-gray-700 mb-1">
                Patrón de Birlos
              </label>
              <input
                type="text"
                id="attributes.boltPattern"
                name="attributes.boltPattern"
                value={product.attributes.boltPattern}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej. 5x114.3"
              />
            </div>
            
            {/* Offset */}
            <div>
              <label htmlFor="attributes.offset" className="block text-sm font-medium text-gray-700 mb-1">
                Offset (mm)
              </label>
              <input
                type="text"
                id="attributes.offset"
                name="attributes.offset"
                value={product.attributes.offset}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej. +35"
              />
            </div>
            
            {/* Material */}
            <div>
              <label htmlFor="attributes.material" className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <select
                id="attributes.material"
                name="attributes.material"
                value={product.attributes.material}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Seleccionar material</option>
                <option value="aluminio">Aluminio</option>
                <option value="acero">Acero</option>
                <option value="aleación">Aleación</option>
                <option value="magnesio">Magnesio</option>
                <option value="forjado">Forjado</option>
                <option value="carbono">Fibra de Carbono</option>
              </select>
            </div>
            
            {/* Color */}
            <div>
              <label htmlFor="attributes.color" className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                id="attributes.color"
                name="attributes.color"
                value={product.attributes.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej. Negro Mate"
              />
            </div>
            
            {/* Acabado */}
            <div>
              <label htmlFor="attributes.finish" className="block text-sm font-medium text-gray-700 mb-1">
                Acabado
              </label>
              <input
                type="text"
                id="attributes.finish"
                name="attributes.finish"
                value={product.attributes.finish}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej. Pulido"
              />
            </div>
          </div>
        </div>
        
        {/* Panel de imágenes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Imágenes del Producto</h2>
          
          {/* Área de carga de imágenes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agregar Imágenes
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Sube archivos</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">o arrastra y suelta</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF hasta 5MB
                </p>
              </div>
            </div>
          </div>
          
          {/* Previsualización de imágenes */}
          {previewImages.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Imágenes Seleccionadas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="w-full aspect-square bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={preview.url}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Principal
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/productos')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar Producto'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;