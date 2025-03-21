// components/ProductCard.jsx
import React, { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Componente ProductCard - Versión Compacta con Efecto 3D
const ProductCard = memo(({ product, onAddToCart, isFeaturedSection = false }) => {
  const navigate = useNavigate();
  const [imageState, setImageState] = useState({
    loaded: false,
    error: false
  });
  
  if (!product) return null;

  const {
    name,
    slug,
    price,
    compareAtPrice,
    thumbnail,
    attributes = {},
    inventory = 0,
    featured = false
  } = product;

  // Determinar si se debe mostrar la etiqueta destacada
  const showFeaturedBadge = isFeaturedSection;

  const getApiBase = () => {
    if (thumbnail && (thumbnail.startsWith('http') || thumbnail.startsWith('/'))) {
      return '';
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
  };
  
  const imageUrl = thumbnail 
    ? `${getApiBase()}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}` 
    : null;
  
  let parsedAttributes = attributes;
  if (typeof attributes === 'string') {
    try {
      parsedAttributes = JSON.parse(attributes);
    } catch (e) {
      console.error('Error al parsear atributos:', e);
      parsedAttributes = {};
    }
  }

  const diameter = parsedAttributes.diameter || '';
  const width = parsedAttributes.width || '';
  const material = parsedAttributes.material || '';
  const color = parsedAttributes.color || '';

  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) 
    : 0;

  const isLowStock = inventory > 0 && inventory <= 3;
  const isOutOfStock = inventory === 0;

  const fallbackImage = 'https://via.placeholder.com/400x400.png?text=No+Disponible';

  useEffect(() => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.onload = () => setImageState({ loaded: true, error: false });
    img.onerror = () => setImageState({ loaded: true, error: true });
    img.src = imageUrl;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) return;
    
    if (typeof onAddToCart === 'function') {
      onAddToCart(e);
    }
  };

  const handleProductClick = () => {
    navigate(`/producto/${slug}`);
  };

  // DISEÑO COMPACTO CON EFECTO 3D MEJORADO
  return (
    <>
      {/* Contenedor principal con perspectiva para efecto 3D */}
      <div className="product-card-wrapper relative h-full perspective">
        {/* Tarjeta con efecto de elevación y profundidad */}
        <div className="product-card h-full bg-white overflow-hidden group rounded-lg transform transition-all duration-300 hover:scale-[1.03] card-3d-effect">
          {/* Borde superior con efecto 3D */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 z-10"></div>
          
          {/* Sombras laterales para efecto de profundidad */}
          <div className="absolute inset-0 rounded-lg card-inner-shadow opacity-20 pointer-events-none"></div>
          
          {/* Container para imagen y badges */}
          <div className="relative">
            {/* Badge de descuento con efecto elevado */}
            {hasDiscount && (
              <div className="absolute top-2 right-2 z-10 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full px-2 py-1 shadow-discount">
                {discountPercentage}% OFF
              </div>
            )}
            
           {/* Badge de DESTACADO */}
           {showFeaturedBadge && (
              <div className="absolute top-2 left-2 z-20 featured-badge-container">
                <div className="featured-badge relative inline-flex items-center bg-gradient-to-br from-yellow-400 to-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform -rotate-2 hover:rotate-0 transition-all duration-300 hover:scale-105 active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-black" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                  <span className="relative z-10 tracking-wider uppercase">Destacado</span>
                  <span className="absolute inset-0 bg-white bg-opacity-20 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </div>
              </div>
            )}
            
            {/* Badge de stock bajo con ajuste de posición */}
            {isLowStock && !isOutOfStock && (
              <div className={`absolute ${showFeaturedBadge ? 'top-10' : 'top-2'} left-2 z-10 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-xs font-bold px-2 py-1 rounded-sm shadow-sm`}>
                ¡Últimas unidades!
              </div>
            )}
            
            {/* Badge de agotado con ajuste de posición */}
            {isOutOfStock && (
              <div className={`absolute ${showFeaturedBadge ? 'top-10' : 'top-2'} left-2 z-10 bg-gradient-to-br from-gray-700 to-gray-800 text-white text-xs font-bold px-2 py-1 rounded-sm shadow-sm`}>
                Agotado
              </div>
            )}
            
            {/* Link a la página de detalles del producto */}
            <Link 
              to={`/producto/${slug}`}
              className="w-full aspect-square block focus:outline-none"
            >
              {/* Loader */}
              {!imageState.loaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-yellow-500 rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Imagen con sombra sutil */}
              <img 
                src={imageState.error ? fallbackImage : (imageUrl || fallbackImage)}
                alt={name}
                className={`w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-md ${imageState.loaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                decoding="async"
              />
            </Link>
          </div>
          
          {/* Línea separadora con gradiente */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          
          {/* Información del producto con efecto de profundidad */}
          <div className="p-3 relative card-content-shadow">
            {/* Especificaciones técnicas en fila horizontal */}
            <div className="flex flex-wrap gap-1 mb-2">
              {diameter && (
                <div className="inline-flex items-center bg-gray-800 text-white text-xs rounded overflow-hidden shadow-sm">
                  <span className="px-1.5 py-0.5">D</span>
                  <span className="px-1 py-0.5 bg-gray-700">{diameter}"</span>
                </div>
              )}
              {width && (
                <div className="inline-flex items-center bg-gray-800 text-white text-xs rounded overflow-hidden shadow-sm">
                  <span className="px-1.5 py-0.5">A</span>
                  <span className="px-1 py-0.5 bg-gray-700">{width}"</span>
                </div>
              )}
              {material && (
                <div className="inline-flex items-center bg-gray-800 text-white text-xs rounded overflow-hidden shadow-sm">
                  <span className="px-1.5 py-0.5">M</span>
                  <span className="px-1 py-0.5 bg-gray-700 capitalize">{material}</span>
                </div>
              )}
              {color && (
                <div className="inline-flex items-center bg-gray-800 text-white text-xs rounded overflow-hidden shadow-sm">
                  <span className="px-1.5 py-0.5">C</span>
                  <span className="px-1 py-0.5 bg-gray-700">{color}</span>
                </div>
              )}
            </div>
            
            {/* Nombre del producto (link a página de detalle) */}
            <Link 
              to={`/producto/${slug}`}
              className="block w-full text-left focus:outline-none mb-2"
            >
              <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                {name}
              </h3>
            </Link>
            
            {/* Precio con efecto 3D sutil */}
            <div className="flex items-baseline mb-3">
              <span className="text-lg font-bold text-gray-900 drop-shadow-sm">
                ${parseFloat(price).toLocaleString('es-MX')}
              </span>
              
              {hasDiscount && (
                <span className="ml-2 text-xs text-red-500 line-through">
                  ${parseFloat(compareAtPrice).toLocaleString('es-MX')}
                </span>
              )}
            </div>
            
            {/* Botones de acción en fila */}
            <div className="flex gap-2">
              {/* Botón de ver detalle */}
              <Link 
                to={`/producto/${slug}`}
                className="flex-1 flex items-center justify-center py-1.5 px-2 rounded text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Ver
              </Link>
            
              {/* Botón de agregar al carrito con efecto elevado */}
              <button 
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded text-sm font-medium transition-all
                  ${isOutOfStock 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 active:from-yellow-600 active:to-yellow-700 shadow-sm hover:shadow'
                  }`}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? (
                  'Agotado'
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Agregar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos específicos para efectos 3D */}
      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        
        .card-3d-effect {
          transform-style: preserve-3d;
          box-shadow: 
            0 2px 5px rgba(0,0,0,0.1),
            0 0 0 1px rgba(0,0,0,0.05),
            0 1px 2px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        
        .card-3d-effect:hover {
          box-shadow: 
            0 10px 25px rgba(0,0,0,0.08),
            0 0 0 1px rgba(234,179,8,0.2),
            0 4px 12px rgba(234,179,8,0.1);
          transform: translateY(-3px) scale(1.03);
        }
        
        .card-inner-shadow {
          box-shadow: 
            inset 0 1px 3px rgba(0,0,0,0.1),
            inset 0 0 0 1px rgba(0,0,0,0.05);
        }
        
        .card-content-shadow {
          box-shadow: 
            inset 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .shadow-discount {
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        
        .shadow-featured {
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
      `}</style>
    </>
  );
});

// Nombre para depuración en DevTools
ProductCard.displayName = 'ProductCard';

export default ProductCard;