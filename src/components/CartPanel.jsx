// src/components/CartPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';

const CartPanel = ({ isOpen, onClose }) => {
  const { 
    cartItems, 
    totalPrice, 
    totalItems, 
    removeFromCart, 
    updateQuantity,
    clearCart 
  } = useCart();
  
  const [isClosing, setIsClosing] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef(null);

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Manejar clickes fuera del panel para cerrarlo
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Manejar tecla ESC para cerrar el panel
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  // Deshabilitar scroll del body cuando el panel está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Animar los items después de abrir
      setTimeout(() => {
        setAnimateItems(true);
      }, 300);
    } else {
      document.body.style.overflow = 'auto';
      setAnimateItems(false);
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Función para cerrar suavemente con animación
  const handleClose = () => {
    setAnimateItems(false);
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Coincide con la duración de la transición CSS
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Si no está abierto y no está en proceso de cierre, no renderizar nada
  if (!isOpen && !isClosing) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      {/* Overlay con efecto adaptativo */}
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity">
        {/* Efecto para PC: Líneas de velocidad */}
        {!isMobile && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="speed-lines">
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i} 
                  className="speed-line"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: '-5%',
                    width: `${50 + Math.random() * 50}%`,
                    height: '1px',
                    opacity: 0.1 + Math.random() * 0.2,
                    backgroundColor: 'white',
                    position: 'absolute',
                    animationDuration: `${0.5 + Math.random() * 1}s`,
                    animationIterationCount: 'infinite',
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Efecto para móviles: Patrón de neumáticos */}
        {isMobile && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="tread-pattern">
              {Array.from({ length: 8 }).map((_, row) => (
                <div 
                  key={`row-${row}`} 
                  className="flex justify-center"
                  style={{
                    position: 'absolute',
                    top: `${row * 12.5}%`,
                    left: 0,
                    right: 0,
                    opacity: 0.1,
                  }}
                >
                  {Array.from({ length: 5 }).map((_, col) => (
                    <div 
                      key={`tire-${row}-${col}`} 
                      className="tire-tread-mobile"
                      style={{
                        width: '20%',
                        height: '30px',
                        margin: '0 1%',
                        backgroundImage: 'radial-gradient(circle, transparent 40%, rgba(255,204,0,0.15) 40%, rgba(255,204,0,0.15) 60%, transparent 60%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: `${Math.random() * 20}px ${Math.random() * 20}px`,
                        backgroundRepeat: 'repeat',
                        animation: `tread-pulse 3s infinite ${Math.random() * 3}s`
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Panel deslizable */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div 
          ref={panelRef}
          className={`w-full ${isMobile ? 'max-w-full' : 'max-w-md'} bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col h-full ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
          style={{
            borderLeft: '4px solid #FFCC00',
            boxShadow: '0 0 25px rgba(255, 204, 0, 0.3)'
          }}
        >
          {/* Encabezado del panel - Tablero de Auto */}
          <div className="px-4 py-3 bg-black text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Icono de rim/rueda */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6 text-yellow-500">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                <path d="M12 2 L12 5" strokeWidth="1.5" />
                <path d="M12 19 L12 22" strokeWidth="1.5" />
                <path d="M2 12 L5 12" strokeWidth="1.5" />
                <path d="M19 12 L22 12" strokeWidth="1.5" />
                <path d="M4.93 4.93 L7.05 7.05" strokeWidth="1.5" />
                <path d="M16.95 16.95 L19.07 19.07" strokeWidth="1.5" />
                <path d="M4.93 19.07 L7.05 16.95" strokeWidth="1.5" />
                <path d="M16.95 7.05 L19.07 4.93" strokeWidth="1.5" />
              </svg>
              <h2 className="text-lg font-bold tracking-wider">GARAJE</h2>
              <div className="flex items-center bg-yellow-500 text-black text-xs font-bold rounded-full px-2 py-1">
                <span>{totalItems}</span>
                <span className="ml-1">{totalItems === 1 ? 'rin' : 'rines'}</span>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="text-gray-200 hover:text-yellow-500 focus:outline-none transition-colors"
              aria-label="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* "Velocímetro" de total */}
          <div className="bg-black py-2 px-4 border-t border-gray-700 border-b">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-xs">Total Acumulado</div>
              <div className="flex items-center">
                <div className="text-yellow-500 font-mono text-lg font-bold">
                  {formatPrice(totalPrice)}
                </div>
                <svg className="ml-2 h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            {/* Barra de progreso estilo velocímetro */}
            <div className="mt-1 h-1.5 w-full bg-gray-700 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.min(100, (totalPrice / 10000) * 100)}%`
                }}
              />
              {/* Marcadores para móvil */}
              {isMobile && (
                <div className="absolute inset-0 flex justify-between items-center px-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-3 w-px bg-gray-600" style={{ opacity: 0.7 }} />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Contenido del carrito */}
          <div className="flex-grow overflow-y-auto flex flex-col h-full">
            {/* Lista de productos */}
            <div className="flex-grow py-2 px-3 divide-y divide-gray-700">
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`py-3 transition-all duration-300 ${
                      animateItems ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{ 
                      transitionDelay: `${index * 100}ms`,
                      backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                      borderRadius: '8px',
                      marginBottom: '4px',
                      padding: '8px'
                    }}
                  >
                    <div className="flex">
                      {/* Imagen del producto en forma circular como rin */}
                      <div className={`flex-shrink-0 ${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-full overflow-hidden border-2 border-yellow-500 shadow-lg shadow-yellow-500/20`} style={{ padding: '2px' }}>
                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 rim-rotate">
                          {item.thumbnail ? (
                            <img 
                              src={item.thumbnail.startsWith('http') ? item.thumbnail : `${import.meta.env.VITE_API_URL || ''}${item.thumbnail}`}
                              alt={item.name}
                              className="w-full h-full object-center object-cover"
                              onError={(e) => {
                                e.target.src = '/images/placeholder-product.png';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="8" strokeWidth="2" />
                                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                                <path d="M12 4 L12 6" strokeWidth="1.5" />
                                <path d="M12 18 L12 20" strokeWidth="1.5" />
                                <path d="M4 12 L6 12" strokeWidth="1.5" />
                                <path d="M18 12 L20 12" strokeWidth="1.5" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Detalles del producto */}
                      <div className="ml-3 flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-2">
                            <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-100 line-clamp-2`}>
                              <Link to={`/producto/${item.slug}`} className="hover:text-yellow-400">
                                {item.name}
                              </Link>
                            </h3>
                            
                            {/* Precio */}
                            <div className="mt-1 flex items-center">
                              {item.compareAtPrice ? (
                                <>
                                  <span className={`line-through ${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 mr-1`}>
                                    {formatPrice(item.compareAtPrice)}
                                  </span>
                                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-yellow-500`}>
                                    {formatPrice(item.price)}
                                  </span>
                                </>
                              ) : (
                                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-yellow-500`}>{formatPrice(item.price)}</span>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            aria-label="Quitar producto"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Control de cantidad y subtotal */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center rounded-md overflow-hidden bg-gray-700 border border-gray-600">
                            <button
                              className="text-yellow-500 focus:outline-none hover:bg-gray-600 p-1"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Disminuir cantidad"
                            >
                              <svg className="h-3 w-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M20 12H4"></path>
                              </svg>
                            </button>
                            <div className="w-8 py-1 text-center text-xs text-white font-mono border-l border-r border-gray-600">
                              {item.quantity}
                            </div>
                            <button
                              className="text-yellow-500 focus:outline-none hover:bg-gray-600 p-1"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Aumentar cantidad"
                            >
                              <svg className="h-3 w-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M12 4v16m8-8H4"></path>
                              </svg>
                            </button>
                          </div>
                          
                          {/* Subtotal */}
                          <div className="text-xs font-medium text-white py-1 px-2 rounded bg-gray-700 border border-gray-600 shadow-inner">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Carrito vacío con temática de garaje (optimizado para móvil)
                <div className="py-8 flex flex-col items-center justify-center text-center px-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4 mx-auto rim-rotate">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-gray-500">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 2 L12 4" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 20 L12 22" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M2 12 L4 12" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M20 12 L22 12" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M4.93 4.93 L6.34 6.34" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M17.66 17.66 L19.07 19.07" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M4.93 19.07 L6.34 17.66" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M17.66 6.34 L19.07 4.93" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                    {/* Líneas radiales simplificadas para móvil */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-0.5 bg-gray-700"
                          style={{
                            height: '30px',
                            transformOrigin: 'center',
                            transform: `rotate(${i * 45}deg) translateY(-25px)`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-base font-medium text-yellow-500 mb-1">¡Garaje Vacío!</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Elige el estilo perfecto<br/>para tu vehículo
                  </p>
                  <button
                    onClick={handleClose}
                    className="inline-flex items-center px-5 py-2 border border-yellow-500 text-sm font-medium rounded-full text-yellow-500 bg-transparent hover:bg-yellow-500 hover:text-black transition-colors focus:outline-none"
                  >
                    Explorar Rines
                  </button>
                </div>
              )}
            </div>
            
            {/* Resumen y botones de acción */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-700 p-4 bg-gray-800 mt-auto">
                {/* Resumen */}
                <div className="flex justify-between items-center font-medium text-white mb-2">
                  <p className="text-base">Total Estimado</p>
                  <p className="text-lg font-mono text-yellow-500">{formatPrice(totalPrice)}</p>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Envío e impuestos calculados en el checkout.
                </p>
                
                {/* Botones de acción */}
                <div className="space-y-3">
                  <Link
                    to="/checkout"
                    onClick={handleClose}
                    className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md text-sm font-medium text-black bg-yellow-500 hover:bg-yellow-400 focus:outline-none transition-colors shadow-lg shadow-yellow-500/20"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    PROCEDER AL PAGO
                  </Link>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-3 py-2 border border-gray-600 rounded-md text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none transition-colors"
                    >
                      Seguir comprando
                    </button>
                    <button
                      onClick={clearCart}
                      className="flex-1 px-3 py-2 border border-gray-600 rounded-md text-xs font-medium text-gray-300 bg-gray-700 hover:bg-red-900 hover:border-red-700 focus:outline-none transition-colors group"
                    >
                      <span className="group-hover:text-red-400">Vaciar garaje</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Estilos para animaciones específicas */}
      <style jsx>{`
        @keyframes speedLine {
          0% {
            transform: translateX(0) scaleX(1);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          100% {
            transform: translateX(100vw) scaleX(0.5);
            opacity: 0;
          }
        }
        
        .speed-line {
          animation-name: speedLine;
          animation-timing-function: linear;
        }
        
        @keyframes tread-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.3; }
        }
        
        @keyframes rim-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .rim-rotate:hover img {
          animation: rim-spin 2s linear infinite;
        }
        
        /* Animación diferente para móvil */
        @media (max-width: 767px) {
          .rim-rotate img {
            animation: rim-spin 10s linear infinite;
          }
          
          .rim-rotate:active img {
            animation: rim-spin 1s linear infinite;
          }
        }
      `}</style>
    </div>
  );
};

export default CartPanel;