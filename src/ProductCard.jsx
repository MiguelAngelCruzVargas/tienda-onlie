// src/ProductCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const {
    id,
    name,
    price,
    originalPrice,
    imageUrl,
    brand,
    size,
    color,
    rating,
    reviewCount,
    inStock,
    discount
  } = product;

  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!inStock) return;
    
    try {
      setIsAddingToCart(true);
      
      // Aquí iría la llamada a la API para añadir al carrito
      // Ejemplo:
      // await fetch('/api/cart/add', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ productId: id, quantity: 1 })
      // });
      
      // Disparar un evento para actualizar el contador del carrito en el Header
      const event = new CustomEvent('cartUpdated');
      window.dispatchEvent(event);
      
      // Mostrar una notificación de éxito (puedes implementar esto con una librería como react-toastify)
      console.log('Producto añadido al carrito');
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    
    try {
      // Aquí iría la llamada a la API para añadir/quitar de la lista de deseos
      // Ejemplo:
      // const method = isInWishlist ? 'DELETE' : 'POST';
      // await fetch(`/api/wishlist/${id}`, { method });
      
      setIsInWishlist(!isInWishlist);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  // Calcular el precio con descuento si lo hay
  const discountedPrice = discount > 0 && originalPrice 
    ? originalPrice - (originalPrice * discount / 100) 
    : price;

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 10px 20px rgba(0, 0, 0, 0.1)' 
          : '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <Link to={`/producto/${id}`}>
          <img
            src={imageUrl || "https://via.placeholder.com/400x300"}
            alt={name}
            className="w-full h-56 object-cover object-center transition-transform duration-500"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        </Link>
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md">
            -{discount}%
          </div>
        )}
        
        {/* Quick Actions */}
        <div 
          className={`absolute top-3 right-3 flex flex-col space-y-2 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Wishlist Button */}
          <button 
            onClick={toggleWishlist}
            className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors duration-200"
            title={isInWishlist ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              fill={isInWishlist ? "currentColor" : "none"}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          
          {/* Quick View Button */}
          <Link 
            to={`/producto/${id}`}
            className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors duration-200"
            title="Vista rápida"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        {/* Brand with badge */}
        <div className="flex items-center mb-1">
          <span className="text-sm bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md font-medium">{brand}</span>
          {inStock ? (
            <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">En stock</span>
          ) : (
            <span className="ml-auto text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Agotado</span>
          )}
        </div>
        
        {/* Product Name */}
        <Link to={`/producto/${id}`}>
          <h3 className="font-semibold text-gray-800 mb-1 hover:text-yellow-600 transition-colors duration-200 line-clamp-2 h-12">
            {name}
          </h3>
        </Link>
        
        {/* Specifications */}
        <div className="text-sm text-gray-600 mb-2 flex items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{size}"</span>
          </div>
          <span className="mx-2">•</span>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span>{color}</span>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`h-4 w-4 ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 15.585l-7.939 4.187 1.517-8.75L0 7.175l8.146-1.184L10 0l1.854 5.991L20 7.175l-3.578 3.847 1.517 8.75z"
                  clipRule="evenodd"
                />
              </svg>
            ))}
          </div>
          <span className="ml-1 text-xs text-gray-500">({reviewCount} reseñas)</span>
        </div>
        
        {/* Price */}
        <div className="mt-3 flex items-center justify-between">
          <div>
            {discount > 0 ? (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-800">${discountedPrice.toLocaleString()}</span>
                <span className="text-sm text-gray-500 line-through">${originalPrice.toLocaleString()}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-800">${price.toLocaleString()}</span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
              inStock
                ? 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
            disabled={!inStock || isAddingToCart}
            title={inStock ? "Añadir al carrito" : "Producto agotado"}
          >
            {isAddingToCart ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Entrega Rápida Badge */}
        {inStock && (
          <div className="mt-3 flex items-center text-xs text-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Entrega en 24-48 horas</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;