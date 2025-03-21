
// // src/Header.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useCart } from './CartContext';
// import { useCustomerAuth } from './CustomerAuthContext'; // Importamos el contexto de autenticación
// import CartIcon from './components/CartIcon';
// import { API_BASE } from './utils/apiConfig'; 
// const Header = ({ onCartOpen }) => {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userMenuOpen, setUserMenuOpen] = useState(false); // Estado para el menú de usuario
  
//   const userMenuRef = useRef(null); // Referencia para el menú desplegable
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { cartItems } = useCart();
//   const { isAuthenticated, customerData, logout } = useCustomerAuth(); // Obtenemos información de autenticación

//   // Detectar ruta activa para resaltar el enlace correspondiente
//   const isActive = (path) => {
//     if (path === '/') {
//       return location.pathname === path;
//     }
//     return location.pathname.startsWith(path);
//   };

//   // Efecto para detectar scroll
//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 20) {
//         setIsScrolled(true);
//       } else {
//         setIsScrolled(false);
//       }
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => {
//       window.removeEventListener('scroll', handleScroll);
//     };
//   }, []);

//   // Efecto para cerrar el menú móvil cuando cambia el tamaño de la ventana
//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 768 && mobileMenuOpen) {
//         setMobileMenuOpen(false);
//       }
//     };

//     window.addEventListener('resize', handleResize);
//     return () => {
//       window.removeEventListener('resize', handleResize);
//     };
//   }, [mobileMenuOpen]);

//   // Efecto para cerrar el menú de usuario al hacer clic fuera de él
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
//         setUserMenuOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // Cargar categorías desde el backend
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         setLoading(true);
//         //  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';;

//         const response = await fetch(`${API_BASE}/api/categories?featured=true`);

//         if (!response.ok) {
//           throw new Error(`Error HTTP: ${response.status}`);
//         }

//         const data = await response.json();

//         if (data.success && data.categories) {
//           // Filtrar solo categorías activas y destacadas para el menú principal
//           // Excluimos las categorías "Llantas" y "Accesorios"
//           const mainCategories = data.categories
//             .filter(cat =>
//               cat.status === 'active' &&
//               cat.featured &&
//               !['llantas', 'accesorios'].includes(cat.slug.toLowerCase())
//             )
//             .slice(0, 5); // Limitar a 5 categorías principales para mejor experiencia móvil

//           setCategories(mainCategories);
//         }
//       } catch (err) {
//         console.error('Error al cargar categorías:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   // Cerrar menú móvil al cambiar de ruta
//   useEffect(() => {
//     setMobileMenuOpen(false);
//     setUserMenuOpen(false); // También cerrar el menú de usuario
//   }, [location]);

//   const toggleMobileMenu = () => {
//     setMobileMenuOpen(!mobileMenuOpen);
//   };

//   const toggleUserMenu = () => {
//     setUserMenuOpen(!userMenuOpen);
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchTerm.trim()) {
//       navigate(`/buscar?q=${encodeURIComponent(searchTerm)}`);
//       setSearchTerm('');
//       // Cerrar el menú móvil después de buscar
//       setMobileMenuOpen(false);
//     }
//   };
  
//   // Manejar cierre de sesión
//   const handleLogout = () => {
//     logout();
//     setUserMenuOpen(false);
//     navigate('/');
//   };

//   // Definir los enlaces predeterminados excluyendo llantas y accesorios
//   const defaultNavLinks = [
//     { path: '/', name: 'Inicio' },
//     { path: '/productos/automovil', name: 'Rines Automóvil' },
//     { path: '/productos/camioneta', name: 'Rines Camioneta' },
//     { path: '/ofertas', name: 'Ofertas' }
//   ];

//   // Determinar los enlaces de navegación (desde la API o usar los predeterminados)
//   const navLinks = categories.length > 0
//     ? [
//       { path: '/', name: 'Inicio' },
//       ...categories.map(cat => ({
//         path: `/categoria/${cat.slug}`,
//         name: cat.name
//       })),
//       { path: '/ofertas', name: 'Ofertas' }
//     ]
//     : defaultNavLinks;

//   return (
//     <header className={`sticky top-0 z-50 text-white transition-all duration-300 ${isScrolled ? 'bg-gray-900 shadow-lg' : 'bg-gray-800'}`}>
//       <div className="container mx-auto px-4 py-3">
//         <div className="flex justify-between items-center">
//           {/* Logo - Versión simplificada para móviles */}
//           <div className="flex items-center">
//             <Link to="/" className="text-xl md:text-2xl font-bold hover:text-yellow-400 transition-colors duration-300 overflow-hidden relative group">
//               <span className="hidden sm:inline-block transform group-hover:translate-y-0">COMERCIALIZADORA DE RINES</span>
//               <span className="inline-block sm:hidden">RINES</span>
//               <span className="font-black text-yellow-400 ml-1 md:ml-2">SPORT</span>
//               <span className="absolute left-0 bottom-0 w-full h-0.5 bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
//             </Link>
//           </div>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex space-x-4 lg:space-x-6">
//             {navLinks.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={`relative font-medium group overflow-hidden py-1 ${isActive(item.path) ? 'text-yellow-400' : 'hover:text-yellow-400'} transition-colors duration-200`}
//               >
//                 <span>{item.name}</span>
//                 <span className={`absolute left-0 bottom-0 w-full h-0.5 ${isActive(item.path) ? 'bg-yellow-400 scale-x-100' : 'bg-yellow-400 scale-x-0 group-hover:scale-x-100'} transition-transform duration-300 origin-left`}></span>
//               </Link>
//             ))}
//           </nav>

//           {/* Search, Cart, and Account - Desktop */}
//           <div className="hidden md:flex items-center space-x-4">
//             <form onSubmit={handleSearch} className="relative">
//               <input
//                 type="text"
//                 placeholder="Buscar rines..."
//                 className={`bg-gray-700 rounded-lg px-4 py-2 pl-10 text-sm transition-all duration-300 ${searchFocused ? 'w-64 lg:w-72 ring-2 ring-yellow-400' : 'w-56 lg:w-64 focus:outline-none focus:ring-2 focus:ring-yellow-400'}`}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 onFocus={() => setSearchFocused(true)}
//                 onBlur={() => setSearchFocused(false)}
//               />
//               <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             </form>
//             {/* Reemplazamos el ícono del carrito con nuestro componente personalizado */}
//             <CartIcon onClick={onCartOpen} />
            
//             {/* Menú de usuario */}
//             <div className="relative" ref={userMenuRef}>
//               <button 
//                 onClick={toggleUserMenu}
//                 className="relative p-2 hover:text-yellow-400 transition-colors duration-200 group flex items-center"
//                 aria-label={isAuthenticated ? "Menú de usuario" : "Iniciar sesión"} 
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 {isAuthenticated && (
//                   <span className="ml-2 hidden lg:inline-block text-sm font-medium overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[100px]">
//                     {customerData?.name || customerData?.email?.split('@')[0] || 'Mi cuenta'}
//                   </span>
//                 )}
//                 <span className="absolute inset-0 rounded-full bg-gray-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
//               </button>

//               {/* Menú desplegable de usuario */}
//               {userMenuOpen && (
//                 <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-700">
//                   {isAuthenticated ? (
//                     <>
//                       <div className="px-4 py-2 border-b border-gray-700">
//                         <p className="text-sm font-medium text-white truncate">
//                           {customerData?.name || 'Cliente'}
//                         </p>
//                         <p className="text-xs text-gray-400 truncate">{customerData?.email}</p>
//                       </div>
//                       <Link to="/mi-cuenta" className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors">
//                         Mi cuenta
//                       </Link>
//                       <Link to="/mis-pedidos" className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors">
//                         Mis pedidos
//                       </Link>
//                       <button 
//                         onClick={handleLogout}
//                         className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
//                       >
//                         Cerrar sesión
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <Link to="/login" className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors">
//                         Iniciar sesión
//                       </Link>
//                       <Link to="/registro" className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors">
//                         Crear cuenta
//                       </Link>
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Mobile Menu Button & Cart */}
//           <div className="md:hidden flex items-center space-x-3">
//             {/* Reemplazamos el enlace del carrito con el botón que abre el panel */}
//             <button 
//               onClick={onCartOpen}
//               className="relative p-1 hover:text-yellow-400 transition-colors duration-200"
//               aria-label="Ver carrito"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//               </svg>
//               {cartItems.length > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs text-black font-bold rounded-full h-5 w-5 flex items-center justify-center">
//                   {cartItems.length}
//                 </span>
//               )}
//             </button>

//             <button
//               className="text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 hover:text-yellow-400"
//               onClick={toggleMobileMenu}
//               aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
//               aria-expanded={mobileMenuOpen}
//             >
//               {mobileMenuOpen ? (
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               ) : (
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu - Mejorado para mejor experiencia móvil */}
//         <div
//           className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen
//             ? 'max-h-96 opacity-100 py-3 border-t border-gray-700 mt-2'
//             : 'max-h-0 opacity-0 py-0 border-t-0 border-gray-700'
//             }`}
//         >
//           <form onSubmit={handleSearch} className="flex justify-center mb-4 px-2">
//             <div className="relative w-full">
//               <input
//                 type="text"
//                 placeholder="Buscar rines..."
//                 className="bg-gray-700 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//               <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//               <button
//                 type="submit"
//                 className="absolute right-3 top-2 text-gray-300 hover:text-white"
//                 aria-label="Buscar"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
//                 </svg>
//               </button>
//             </div>
//           </form>

//           <div className="flex flex-col space-y-4 px-2">
//             {navLinks.map((item, index) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={`font-medium text-lg no-flickr ${isActive(item.path)
//                   ? 'text-yellow-400 font-semibold'
//                   : 'text-white hover:text-yellow-200'
//                   } transition-colors duration-300 transform translate-y-0 flex items-center will-change-transform hover:scale-105`}
//                 style={{
//                   animationDelay: `${index * 50}ms`,
//                   backfaceVisibility: 'hidden',
//                   perspective: '1000px'
//                 }}
//               >
//                 {item.path === '/' && (
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//                   </svg>
//                 )}
//                 {item.path.includes('/ofertas') && (
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
//                   </svg>
//                 )}
//                 {!item.path.includes('/ofertas') && item.path !== '/' && (
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
//                   </svg>
//                 )}
//                 {item.name}
//                 {isActive(item.path) && (
//                   <span className="ml-2 text-yellow-400">•</span>
//                 )}
//               </Link>
//             ))}

//             {/* Opciones de usuario en móvil */}
//             <div className="pt-3 border-t border-gray-700">
//               {isAuthenticated ? (
//                 <div className="space-y-3">
//                   <div className="flex items-center text-yellow-400 mb-2">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <span className="font-medium">{customerData?.name || customerData?.email?.split('@')[0] || 'Mi cuenta'}</span>
//                   </div>
//                   <Link to="/mi-cuenta" className="hover:text-yellow-400 transition-colors duration-200 flex items-center font-medium pl-7">
//                     Mi perfil
//                   </Link>
//                   <Link to="/mis-pedidos" className="hover:text-yellow-400 transition-colors duration-200 flex items-center font-medium pl-7">
//                     Mis pedidos
//                   </Link>
//                   <button 
//                     onClick={handleLogout}
//                     className="hover:text-yellow-400 transition-colors duration-200 flex items-center font-medium pl-7 text-left w-full"
//                   >
//                     Cerrar sesión
//                   </button>
//                 </div>
//               ) : (
//                 <div className="flex justify-between">
//                   <Link to="/login" className="hover:text-yellow-400 transition-colors duration-200 flex items-center font-medium">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
//                     </svg>
//                     Iniciar sesión
//                   </Link>
//                   <Link to="/registro" className="hover:text-yellow-400 transition-colors duration-200 flex items-center font-medium">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
//                     </svg>
//                     Registrarse
//                   </Link>
//                 </div>
//               )}
              
//               {/* Botón del carrito */}
//               <button
//                 onClick={onCartOpen}
//                 className="mt-3 w-full flex justify-center items-center py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-md transition-colors duration-200"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//                 Ver mi carrito
//                 {cartItems.length > 0 && (
//                   <span className="ml-2 bg-white text-xs text-black font-bold rounded-full h-5 w-5 flex items-center justify-center">
//                     {cartItems.length}
//                   </span>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useCustomerAuth } from './CustomerAuthContext';
import CartIcon from './components/CartIcon';
import { API_BASE } from './utils/apiConfig'; 

const Header = ({ onCartOpen }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null); // Referencia para el menú móvil
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { isAuthenticated, customerData, logout } = useCustomerAuth();

  // Detectar ruta activa para resaltar el enlace correspondiente
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
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

  // Efecto para cerrar el menú móvil cuando cambia el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  // Efecto para cerrar el menú de usuario al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      // También cerrar el menú móvil al hacer clic fuera de él
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('button[aria-label="Abrir menú"]')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cargar categorías desde el backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/categories?featured=true`);

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.categories) {
          // Filtrar solo categorías activas y destacadas para el menú principal
          // Excluimos las categorías "Llantas" y "Accesorios"
          const mainCategories = data.categories
            .filter(cat =>
              cat.status === 'active' &&
              cat.featured &&
              !['llantas', 'accesorios'].includes(cat.slug.toLowerCase())
            )
            .slice(0, 5); // Limitar a 5 categorías principales para mejor experiencia móvil

          setCategories(mainCategories);
        }
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      // Cerrar el menú móvil después de buscar
      setMobileMenuOpen(false);
    }
  };
  
  // Manejar cierre de sesión
  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  // Definir los enlaces predeterminados excluyendo llantas y accesorios
  const defaultNavLinks = [
    { path: '/', name: 'Inicio' },
    { path: '/productos/automovil', name: 'Rines Automóvil' },
    { path: '/productos/camioneta', name: 'Rines Camioneta' },
    { path: '/ofertas', name: 'Ofertas' }
  ];

  // Determinar los enlaces de navegación (desde la API o usar los predeterminados)
  const navLinks = categories.length > 0
    ? [
      { path: '/', name: 'Inicio' },
      ...categories.map(cat => ({
        path: `/categoria/${cat.slug}`,
        name: cat.name
      })),
      { path: '/ofertas', name: 'Ofertas' }
    ]
    : defaultNavLinks;

  return (
    <header className={`sticky top-0 z-50 text-white transition-all duration-300 ${isScrolled ? 'bg-gray-900 shadow-lg' : 'bg-gray-800'}`}>
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex justify-between items-center">
          {/* Logo - Optimizado para todos los tamaños */}
          <div className="flex items-center">
            <Link to="/" className="text-lg sm:text-xl md:text-2xl font-bold hover:text-yellow-400 transition-colors duration-300 overflow-hidden relative group">
              <span className="hidden sm:inline-block transform group-hover:translate-y-0">COMERCIALIZADORA DE RINES</span>
              <span className="inline-block sm:hidden">RINES</span>
              <span className="font-black text-yellow-400 ml-1 md:ml-2">SPORT</span>
              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 lg:space-x-6">
            {navLinks.map((item) => (
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

          {/* Search, Cart, and Account - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar rines..."
                className={`bg-gray-700 rounded-lg px-4 py-2 pl-10 text-sm transition-all duration-300 ${searchFocused ? 'w-64 lg:w-72 ring-2 ring-yellow-400' : 'w-56 lg:w-64 focus:outline-none focus:ring-2 focus:ring-yellow-400'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
            
            <CartIcon onClick={onCartOpen} />
            
            {/* Menú de usuario */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={toggleUserMenu}
                className="relative p-2 hover:text-yellow-400 transition-colors duration-200 group flex items-center"
                aria-label={isAuthenticated ? "Menú de usuario" : "Iniciar sesión"} 
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isAuthenticated && (
                  <span className="ml-2 hidden lg:inline-block text-sm font-medium overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[100px]">
                    {customerData?.name || customerData?.email?.split('@')[0] || 'Mi cuenta'}
                  </span>
                )}
                <span className="absolute inset-0 rounded-full bg-gray-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              </button>

              {/* Menú desplegable de usuario */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-700">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm font-medium text-white truncate">
                          {customerData?.name || 'Cliente'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{customerData?.email}</p>
                      </div>
                      <Link to="/mi-cuenta" className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors">
                        Mi cuenta
                      </Link>
                      <Link to="/mis-pedidos" className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors">
                        Mis pedidos
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                      >
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors">
                        Iniciar sesión
                      </Link>
                      <Link to="/registro" className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors">
                        Crear cuenta
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button & Cart - Mejorado */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Botón de búsqueda en móvil */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="relative p-1 hover:text-yellow-400 transition-colors duration-200"
              aria-label="Buscar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Botón del carrito en móvil */}
            <button 
              onClick={onCartOpen}
              className="relative p-1 hover:text-yellow-400 transition-colors duration-200"
              aria-label="Ver carrito"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs text-black font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* Botón de usuario en móvil */}
            <button 
              onClick={toggleUserMenu}
              className="relative p-1 hover:text-yellow-400 transition-colors duration-200"
              aria-label={isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Botón de menú en móvil */}
            <button
              className="text-white p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 hover:text-yellow-400"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Rediseñado para mejor experiencia */}
        <div
          ref={mobileMenuRef}
          className={`md:hidden fixed inset-0 bg-gray-900 bg-opacity-95 z-50 transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Encabezado del menú móvil */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <Link to="/" className="text-xl font-bold text-yellow-400" onClick={() => setMobileMenuOpen(false)}>
                RINES SPORT
              </Link>
              <button
                className="text-white p-2 hover:text-yellow-400"
                onClick={toggleMobileMenu}
                aria-label="Cerrar menú"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Buscador */}
            <div className="p-4 border-b border-gray-700">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="Buscar rines..."
                  className="flex-grow bg-gray-800 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 rounded-r-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>
            
            {/* Enlaces de navegación */}
            <div className="overflow-y-auto flex-grow">
              <nav className="px-4 py-2">
                {navLinks.map((item, index) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-3 px-2 text-base font-medium border-b border-gray-700 ${
                      isActive(item.path) ? 'text-yellow-400' : 'text-white hover:text-yellow-200'
                    } transition-colors duration-200 flex items-center`}
                  >
                    {item.path === '/' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    )}
                    {item.path.includes('/ofertas') && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    )}
                    {!item.path.includes('/ofertas') && item.path !== '/' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    )}
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* Información de usuario y botones de acción */}
            <div className="p-4 mt-auto border-t border-gray-700">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-white">{customerData?.name || 'Cliente'}</p>
                      <p className="text-xs text-gray-400">{customerData?.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      to="/mi-cuenta" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-gray-700 hover:bg-gray-600 text-center py-2 rounded-md text-sm font-medium"
                    >
                      Mi cuenta
                    </Link>
                    <Link 
                      to="/mis-pedidos" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-gray-700 hover:bg-gray-600 text-center py-2 rounded-md text-sm font-medium"
                    >
                      Mis pedidos
                    </Link>
                  </div>
                  
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm font-medium mt-2"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-center py-2 rounded-md text-sm font-medium"
                  >
                    Iniciar sesión
                  </Link>
                  <Link 
                    to="/registro" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black text-center py-2 rounded-md text-sm font-medium"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
              
              <button
                onClick={() => {
                  onCartOpen();
                  setMobileMenuOpen(false);
                }}
                className="mt-4 w-full flex justify-center items-center py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-md transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Ver mi carrito
                {cartItems.length > 0 && (
                  <span className="ml-2 bg-white text-xs text-black font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

       {/* Menú de usuario móvil */}
       {userMenuOpen && (
          <div className="md:hidden absolute right-0 left-0 mt-1 mx-2 bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-700">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm font-medium text-white truncate">
                    {customerData?.name || 'Cliente'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{customerData?.email}</p>
                </div>
                <Link 
                  to="/mi-cuenta" 
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                >
                  Mi cuenta
                </Link>
                <Link 
                  to="/mis-pedidos" 
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                >
                  Mis pedidos
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link 
                  to="/registro" 
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Mobile Menu - Rediseñado para mejor experiencia */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden fixed inset-0 bg-gray-900 bg-opacity-95 z-50 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Encabezado del menú móvil */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <Link to="/" className="text-xl font-bold text-yellow-400" onClick={() => setMobileMenuOpen(false)}>
              RINES SPORT
            </Link>
            <button
              className="text-white p-2 hover:text-yellow-400"
              onClick={toggleMobileMenu}
              aria-label="Cerrar menú"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Buscador */}
          <div className="p-4 border-b border-gray-700">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Buscar rines..."
                className="flex-grow bg-gray-800 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 rounded-r-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
          
          {/* Enlaces de navegación */}
          <div className="overflow-y-auto flex-grow">
            <nav className="px-4 py-2">
              {navLinks.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 px-2 text-base font-medium border-b border-gray-700 ${
                    isActive(item.path) ? 'text-yellow-400' : 'text-white hover:text-yellow-200'
                  } transition-colors duration-200 flex items-center`}
                >
                  {item.path === '/' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )}
                  {item.path.includes('/ofertas') && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  )}
                  {!item.path.includes('/ofertas') && item.path !== '/' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  )}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Información de usuario y botones de acción */}
          <div className="p-4 mt-auto border-t border-gray-700">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-white">{customerData?.name || 'Cliente'}</p>
                    <p className="text-xs text-gray-400">{customerData?.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to="/mi-cuenta" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-center py-2 rounded-md text-sm font-medium"
                  >
                    Mi cuenta
                  </Link>
                  <Link 
                    to="/mis-pedidos" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-center py-2 rounded-md text-sm font-medium"
                  >
                    Mis pedidos
                  </Link>
                </div>
                
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm font-medium mt-2"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-center py-2 rounded-md text-sm font-medium"
                >
                  Iniciar sesión
                </Link>
                <Link 
                  to="/registro" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black text-center py-2 rounded-md text-sm font-medium"
                >
                  Registrarse
                </Link>
              </div>
            )}
            
            <button
              onClick={() => {
                onCartOpen();
                setMobileMenuOpen(false);
              }}
              className="mt-4 w-full flex justify-center items-center py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-md transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Ver mi carrito
              {cartItems.length > 0 && (
                <span className="ml-2 bg-white text-xs text-black font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;