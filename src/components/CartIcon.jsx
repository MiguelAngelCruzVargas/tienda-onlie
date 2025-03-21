// src/components/CartIcon.jsx
import React from 'react';
import { useCart } from '../CartContext';

const CartIcon = ({ onClick }) => {
  const { totalItems, totalPrice } = useCart();
  
  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  return (
    <button
      onClick={onClick}
      className="group relative p-2 text-gray-600 hover:text-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-md"
      aria-label="Carrito de compras"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      
      {/* Contador de artículos */}
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
      
      {/* Tooltip - cambia el botón por un div */}
      <div className="absolute right-0 top-full mt-1 w-56 hidden group-hover:block z-20">
        <div className="bg-white rounded-md shadow-lg py-2 px-3 border border-gray-200 text-left">
          <p className="text-sm font-medium text-gray-900 mb-2">Resumen del carrito</p>
          {totalItems > 0 ? (
            <>
              <div className="flex justify-between text-xs text-gray-700 mb-1">
                <span>Productos:</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-900">
                <span>Total:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500">Tu carrito está vacío</p>
          )}
          <div className="mt-2 pt-2 border-t border-gray-100">
            {/* Cambia button por div con onClick */}
            <div 
              className="w-full text-center text-xs text-yellow-600 hover:text-yellow-700 font-medium cursor-pointer"
              onClick={onClick}
            >
              Ver carrito completo →
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default CartIcon;