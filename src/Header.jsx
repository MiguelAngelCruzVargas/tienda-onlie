// src/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const location = useLocation();
  
  // Detectar ruta activa para resaltar el enlace correspondiente
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Efecto para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    // Función para obtener la cantidad de productos en el carrito
    const fetchCartItemCount = async () => {
      try {
        // Por ahora, simplemente podemos usar localStorage como ejemplo
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItemCount(cart.length);
      } catch (err) {
        console.error('Error fetching cart count:', err);
      }
    };

    fetchCartItemCount();
    
    // Opcional: Escuchar eventos para actualizar el contador cuando cambia el carrito
    window.addEventListener('cartUpdated', fetchCartItemCount);
    
    return () => {
      window.removeEventListener('cartUpdated', fetchCartItemCount);
    };
  }, []);
  
  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/buscar?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <header className={`sticky top-0 z-50 text-white transition-all duration-300 ${isScrolled ? 'bg-gray-900 shadow-lg' : 'bg-gray-800'}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo con efecto hover */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold hover:text-yellow-400 transition-colors duration-300 overflow-hidden relative group">
              <span className="inline-block transform group-hover:translate-y-0">COMERCIALIZADORA DE RINES</span>
              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <span className="font-black text-yellow-400 ml-2">SPORT</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {[
              { path: '/', name: 'Inicio' },
              { path: '/automovil', name: 'Rines Automóvil' },
              { path: '/camioneta', name: 'Rines Camioneta' },
              { path: '/llantas', name: 'Llantas' },
              { path: '/accesorios', name: 'Accesorios' },
              { path: '/ofertas', name: 'Ofertas' }
            ].map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`relative font-medium group overflow-hidden py-1 ${isActive(item.path) ? 'text-yellow-400' : 'hover:text-yellow-400'} transition-colors duration-200`}
              >
                <span>{item.name}</span>
                <span className={`absolute left-0 bottom-0 w-full h-0.5 ${isActive(item.path) ? 'bg-yellow-400 scale-x-100' : 'bg-yellow-400 scale-x-0 group-hover:scale-x-100'} transition-transform duration-300 origin-left`}></span>
              </Link>
            ))}
          </nav>
          
          {/* Search, Cart, and Account */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar rines..."
                className={`bg-gray-700 rounded-lg px-4 py-2 pl-10 text-sm transition-all duration-300 ${searchFocused ? 'w-72 ring-2 ring-yellow-400' : 'w-64 focus:outline-none focus:ring-2 focus:ring-yellow-400'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
            <Link to="/carrito" className="relative p-2 hover:text-yellow-400 transition-colors duration-200 group">
              <span className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs text-black font-bold rounded-full h-5 w-5 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                    {cartItemCount}
                  </span>
                )}
              </span>
              <span className="absolute inset-0 rounded-full bg-gray-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            </Link>
            <Link to="/cuenta" className="relative p-2 hover:text-yellow-400 transition-colors duration-200 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="absolute inset-0 rounded-full bg-gray-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-transform duration-300 hover:text-yellow-400" 
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-screen opacity-100 py-3 border-t border-gray-700' : 'max-h-0 opacity-0 py-0 border-t-0 border-gray-700'}`}
        >
          <form onSubmit={handleSearch} className="flex justify-center mb-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar rines..."
                className="bg-gray-700 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
          <div className="flex flex-col space-y-3">
            {[
              { path: '/', name: 'Inicio' },
              { path: '/automovil', name: 'Rines Automóvil' },
              { path: '/camioneta', name: 'Rines Camioneta' },
              { path: '/llantas', name: 'Llantas' },
              { path: '/accesorios', name: 'Accesorios' },
              { path: '/ofertas', name: 'Ofertas' }
            ].map((item, index) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={`font-medium ${isActive(item.path) ? 'text-yellow-400' : 'hover:text-yellow-400'} transition-colors duration-200 transform translate-y-0 animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.name}
                {isActive(item.path) && (
                  <span className="ml-2">•</span>
                )}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-gray-700 mt-2">
              <Link to="/carrito" className="hover:text-yellow-400 transition-colors duration-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Carrito {cartItemCount > 0 && (
                  <span className="ml-1 bg-yellow-400 text-xs text-black font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <Link to="/cuenta" className="hover:text-yellow-400 transition-colors duration-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi Cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;