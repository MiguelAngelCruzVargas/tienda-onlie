// src/components/ProductQuickView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';

const ProductQuickView = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const modalRef = useRef(null);

  // Determinar la ruta base para imágenes
  const imageBasePath = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Manejar el error de carga de imagen
  const handleImageError = (e) => {
    e.target.src = '/images/placeholder-product.png';
  };

  // Formatear precios
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  // Obtener las imágenes del producto
  const getProductImages = () => {
    if (!product) return [];
    
    // Si hay un array de imágenes, usarlo
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map(img => `${imageBasePath}${img}`);
    }
    
    // Si solo hay thumbnail, usarlo
    if (product.thumbnail) {
      return [`${imageBasePath}${product.thumbnail}`];
    }
    
    // Si no hay imágenes, usar placeholder
    return ['/images/placeholder-product.png'];
  };

  const productImages = getProductImages();

  // Incrementar cantidad
  const incrementQuantity = () => {
    if (quantity < product.inventory) {
      setQuantity(prevQty => prevQty + 1);
    }
  };

  // Decrementar cantidad
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQty => prevQty - 1);
    }
  };

  // Añadir al carrito
  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  // Cerrar el modal al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Bloquear el scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Restaurar el scroll del body cuando el modal se cierra
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Calcular el porcentaje de descuento
  const discountPercentage = product.compareAtPrice && product.price < product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up"
      >
        {/* Header del modal */}
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
            aria-label="Cerrar vista rápida"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Contenido del modal */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-col md:flex-row">
            {/* Galería de imágenes */}
            <div className="md:w-1/2 md:pr-6">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-3">
                <img 
                  src={productImages[activeImage]}
                  alt={product.name}
                  className="w-full h-auto object-contain max-h-64"
                  onError={handleImageError}
                />
                
                {/* Etiquetas */}
                {discountPercentage && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded-md">
                    -{discountPercentage}%
                  </div>
                )}
                
                {product.inventory <= 5 && product.inventory > 0 && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 text-xs font-bold rounded-md">
                    ¡Últimas {product.inventory} unidades!
                  </div>
                )}
              </div>
              
              {/* Miniaturas */}
              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`flex-shrink-0 w-16 h-16 border-2 rounded overflow-hidden ${
                        activeImage === index ? 'border-yellow-500' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} - Vista ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Información del producto */}
            <div className="md:w-1/2 mt-6 md:mt-0">
              <div className="mb-1">
                <Link 
                  to={`/categoria/${product.category?.slug || 'general'}`} 
                  className="text-sm text-gray-500 hover:text-yellow-600"
                  onClick={onClose}
                >
                  {product.category?.name || 'Categoría General'}
                </Link>
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h2>
              
              {/* Valoraciones */}
              {product.rating && (
                <div className="flex items-center mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.round(product.rating) ? 'text-yellow-500' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating.toFixed(1)}
                    {product.reviewCount ? ` (${product.reviewCount} reseñas)` : ''}
                  </span>
                </div>
              )}
              
              {/* Descripción */}
              <div className="mb-4">
                <p className="text-gray-600 text-sm">
                  {product.shortDescription || product.description?.substring(0, 150) || 'Sin descripción disponible'}
                  {product.description?.length > 150 && '...'}
                </p>
              </div>
              
              {/* Precio */}
              <div className="flex items-baseline mb-4">
                <span className="text-2xl font-bold text-gray-900 mr-2">
                  {formatPrice(product.price)}
                </span>
                {discountPercentage && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
                {discountPercentage && (
                  <span className="ml-2 text-sm text-green-600 font-medium">
                    Ahorras: {formatPrice(product.compareAtPrice - product.price)}
                  </span>
                )}
              </div>
              
             {/* Especificaciones técnicas */}
{product.attributes && Object.keys(product.attributes).length > 0 && (
  <div className="mb-4">
    <h3 className="text-sm font-medium text-gray-700 mb-2">Especificaciones:</h3>
    <div className="bg-gray-100 rounded-lg p-3 grid grid-cols-2 gap-2 text-sm">
      {Object.entries(product.attributes).map(([key, value]) => (
        <div key={key} className="flex justify-between">
          <span className="font-medium text-gray-700">{key}:</span>
          <span className="text-gray-600">{value}</span>
        </div>
      ))}
    </div>
  </div>
)}
              
{/* Disponibilidad */}
<div className="mb-4">
  <div className="flex items-center">
    {product.inventory > 0 ? (
      <>
        <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
        <span className="text-sm text-green-600 font-medium">En stock - {product.inventory} disponibles</span>
      </>
    ) : (
      <>
        <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
        <span className="text-sm text-red-600 font-medium">Agotado</span>
      </>
    )}
  </div>
</div>

{/* SKU */}
{product.sku && (
  <div className="mb-4 text-sm text-gray-500">
    SKU: {product.sku}
  </div>
)}

{/* Selección de cantidad */}
{product.inventory > 0 && (
  <div className="mb-6">
    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
      Cantidad:
    </label>
    <div className="flex items-center">
      <button
        onClick={decrementQuantity}
        disabled={quantity <= 1}
        className={`p-2 border border-gray-300 rounded-l-md ${
          quantity <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <input
        type="number"
        id="quantity"
        min="1"
        max={product.inventory}
        value={quantity}
        onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), product.inventory))}
        className="w-16 text-center border-t border-b border-gray-300 p-2 focus:outline-none"
      />
      <button
        onClick={incrementQuantity}
        disabled={quantity >= product.inventory}
        className={`p-2 border border-gray-300 rounded-r-md ${
          quantity >= product.inventory ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  </div>
)}
            </div>
          </div>
        </div>
        
        {/* Footer del modal */}
        <div className="border-t border-gray-200 px-4 py-3 sm:px-6 bg-gray-50 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <div className="text-sm text-gray-500">
            {product.inventory > 0 ? (
              <span>Disponible para envío inmediato</span>
            ) : (
              <span>Actualmente sin stock</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cerrar
            </button>
            <Link
              to={`/producto/${product.slug}`}
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
            >
              Ver detalles
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={product.inventory === 0}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                product.inventory === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 text-black hover:bg-yellow-600'
              } transition-colors`}
            >
              {product.inventory === 0 ? 'Sin stock' : 'Añadir al carrito'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Estilo personalizado para la animación */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductQuickView;