// src/components/CartNotification.jsx
import React, { useEffect, useState } from 'react';
import { useCart } from '../CartContext';
import { Link } from 'react-router-dom';

const CartNotification = ({ onViewCart }) => {
  const { showCartNotification, lastAddedItem } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Controlar la animación de entrada y salida
  useEffect(() => {
    let timeout;
    if (showCartNotification && lastAddedItem) {
      setIsVisible(true);
      setIsLeaving(false);
      
      // Comenzar la animación de salida después de 2.5 segundos
      timeout = setTimeout(() => {
        setIsLeaving(true);
        
        // Ocultar completamente después de que termine la animación
        setTimeout(() => {
          setIsVisible(false);
        }, 300); // Duración de la animación de salida
      }, 2500);
    } else {
      setIsVisible(false);
    }
    
    return () => clearTimeout(timeout);
  }, [showCartNotification, lastAddedItem]);

  // Si no es visible o no hay producto, no renderizar nada
  if (!isVisible || !lastAddedItem) return null;

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 w-72 sm:w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 transform transition-all duration-300 ${
        isLeaving ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Indicador de éxito */}
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          {/* Mensaje */}
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Añadido al carrito
            </p>
            <div className="mt-2 flex items-start">
              {/* Miniatura del producto */}
              {lastAddedItem.thumbnail && (
                <div className="flex-shrink-0 h-12 w-12 overflow-hidden rounded border border-gray-200">
                  <img 
                    src={lastAddedItem.thumbnail.startsWith('http') ? lastAddedItem.thumbnail : `${import.meta.env.VITE_API_URL || ''}${lastAddedItem.thumbnail}`}
                    alt={lastAddedItem.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-product.png';
                    }}
                  />
                </div>
              )}
              
              {/* Detalles del producto */}
              <div className="ml-2">
                <p className="text-sm text-gray-900 font-medium line-clamp-1">
                  {lastAddedItem.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Precio: {formatPrice(lastAddedItem.price)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Botón de cerrar */}
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => setIsLeaving(true)}
              className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => {
              if (typeof onViewCart === 'function') {
                onViewCart();
              }
              setIsLeaving(true);
            }}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Ver carrito
          </button>
          <Link
            to="/checkout"
            onClick={() => setIsLeaving(true)}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Pagar ahora
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartNotification;