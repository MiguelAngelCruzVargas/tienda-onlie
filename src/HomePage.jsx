// // src/HomePage.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import { useCart } from './CartContext';
// import { toast } from 'react-toastify';
// import Header from './Header';
// import Footer from './Footer';
// import ProductCard from './components/ProductCard'; // Importar tus tarjetas de productos existentes
// // import Testimonials from './components/Testimonials';
// import { API_BASE } from './utils/apiConfig';

// const HomePage = ({ onCartOpen }) => {
//   // Estados para almacenar datos del backend
//   const [featuredProducts, setFeaturedProducts] = useState([]);
//   const [newArrivals, setNewArrivals] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [promotions, setPromotions] = useState([]);
//   const [bestSellers, setBestSellers] = useState([]);
//   const [featuredReviews, setFeaturedReviews] = useState([]);

//   // Estados para controlar la UI
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [activePromotion, setActivePromotion] = useState(0);
//   const [isHovering, setIsHovering] = useState(null);

//   // Referencias para elementos DOM
//   const promoSliderRef = useRef(null);
//   const categorySliderRef = useRef(null);

//   // Acceso al contexto del carrito
//   const { addToCart } = useCart();

//   // Array de imágenes para el banner rotativo
//   const bannerImages = [
//     "https://images.pexels.com/photos/3608542/pexels-photo-3608542.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Lamborghini amarillo
//     "https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Mercedes deportivo negro
//     "https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Porsche rojo
//     "https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // BMW deportivo azul
//     "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"  // Audi R8 plateado
//   ];

//   // Estado para controlar el índice de la imagen actual
//   const [currentBannerImageIndex, setCurrentBannerImageIndex] = useState(0);

//   // Efecto para cargar datos de la API cuando el componente monta
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError('');

//         //  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

//         // Realizamos todas las solicitudes en paralelo para mejorar el rendimiento
//         const [
//           featuredResponse,
//           categoriesResponse,
//           promotionsResponse,
//           newArrivalsResponse,
//           bestSellersResponse,
//           featuredReviewsResponse  // Añade esta línea
//         ] = await Promise.all([
//           fetch(`${API_BASE}/api/products/featured?limit=8`),
//           fetch(`${API_BASE}/api/categories?featured=true`),
//           fetch(`${API_BASE}/api/promotions/active`),
//           fetch(`${API_BASE}/api/products?sort=createdAt&order=DESC&limit=4`),
//           fetch(`${API_BASE}/api/products?sort=soldCount&order=DESC&limit=4`),
//           fetch(`${API_BASE}/api/reviews/featured?limit=2`)  // Y esta línea
//         ]);

//         // Procesamos cada respuesta individualmente
//         if (featuredResponse.ok) {
//           const featuredData = await featuredResponse.json();
//           if (featuredData.success) {
//             setFeaturedProducts(featuredData.products || []);
//           }
//         }

//         if (categoriesResponse.ok) {
//           const categoriesData = await categoriesResponse.json();
//           if (categoriesData.success) {
//             setCategories(categoriesData.categories || []);
//           }
//         }

//         if (promotionsResponse.ok) {
//           const promotionsData = await promotionsResponse.json();
//           if (promotionsData.success) {
//             setPromotions(promotionsData.promotions || []);
//           }
//         }

//         if (newArrivalsResponse.ok) {
//           const newArrivalsData = await newArrivalsResponse.json();
//           if (newArrivalsData.success) {
//             setNewArrivals(newArrivalsData.products || []);
//           }
//         }

//         if (bestSellersResponse.ok) {
//           const bestSellersData = await bestSellersResponse.json();
//           if (bestSellersData.success) {
//             setBestSellers(bestSellersData.products || []);
//           }
//         }
//         if (featuredReviewsResponse.ok) {
//           const featuredReviewsData = await featuredReviewsResponse.json();
//           if (featuredReviewsData.success) {
//             setFeaturedReviews(featuredReviewsData.reviews || []);
//           }
//         }

//       } catch (err) {
//         console.error('Error al cargar datos de la página de inicio:', err);
//         setError('Ocurrió un problema al cargar algunos contenidos. Por favor, intenta recargar la página.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();


//     // Iniciar un intervalo para cambiar automáticamente las promociones
//     const promotionInterval = setInterval(() => {
//       if (!isHovering) {
//         setActivePromotion(prev => {
//           if (promotions.length === 0) return 0;
//           return (prev + 1) % promotions.length;
//         });
//       }
//     }, 6000);

//     return () => clearInterval(promotionInterval);
//   }, [isHovering, promotions.length]);

//   // Efecto para cambiar la imagen automáticamente del banner
//   useEffect(() => {
//     // Solo cambiar si no se está interactuando con el slider
//     if (!isHovering) {
//       const interval = setInterval(() => {
//         setCurrentBannerImageIndex(prevIndex =>
//           (prevIndex + 1) % bannerImages.length
//         );
//       }, 4000); // Cambiar cada 4 segundos

//       return () => clearInterval(interval);
//     }
//   }, [isHovering, bannerImages.length]);

//   // Efecto para mover al slider a la promoción activa
//   useEffect(() => {
//     if (promoSliderRef.current && promotions.length > 0) {
//       promoSliderRef.current.scrollTo({
//         left: activePromotion * promoSliderRef.current.offsetWidth,
//         behavior: 'smooth'
//       });
//     }
//   }, [activePromotion, promotions.length]);

//   // Función para manejar la navegación del slider de promociones
//   const navigatePromotion = (index) => {
//     setActivePromotion(index);
//   };

// // Función corregida para añadir al carrito en HomePage.jsx
//   // Función para añadir un producto al carrito
//   const handleAddToCart = (product, event) => {
//     console.log("Añadiendo al carrito:", product);
//     event.preventDefault();
//     event.stopPropagation();
//     addToCart(product, 1, true);
//   };

//   // Función para cargar imágenes por defecto si hay error
//   const handleImageError = (e) => {
//     e.target.src = '/images/placeholder-product.png';
//   };

//   // Función para formatear precios
//   const formatPrice = (price) => {
//     return new Intl.NumberFormat('es-MX', {
//       style: 'currency',
//       currency: 'MXN'
//     }).format(price);
//   };

//   // Función para navegar en el slider de categorías
//   const scrollCategories = (direction) => {
//     if (categorySliderRef.current) {
//       const scrollAmount = direction === 'left' ? -250 : 250;
//       categorySliderRef.current.scrollBy({
//         left: scrollAmount,
//         behavior: 'smooth'
//       });
//     }
//   };

//   // Componentes para mostrar esqueletos durante la carga
//   const ProductSkeleton = () => (
//     <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
//       <div className="h-56 bg-gray-300"></div>
//       <div className="p-4">
//         <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
//         <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
//         <div className="h-6 bg-gray-300 rounded w-1/3 mb-3"></div>
//         <div className="flex space-x-2">
//           <div className="h-9 bg-gray-300 rounded w-1/2"></div>
//           <div className="h-9 bg-gray-300 rounded w-1/2"></div>
//         </div>
//       </div>
//     </div>
//   );

//   const CategorySkeleton = () => (
//     <div className="flex-shrink-0 w-36 sm:w-40 md:w-60 h-32 sm:h-36 md:h-40 rounded-lg overflow-hidden shadow-md animate-pulse">
//       <div className="h-full w-full bg-gray-300"></div>
//     </div>
//   );

//   // Si hay error, mostrar mensaje de error
//   if (error) {
//     return (
//       <>
//         {/* Pasamos la prop onCartOpen al Header */}
//         <Header onCartOpen={onCartOpen} />
//         <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
//           <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
//             <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//             <h3 className="mt-4 text-lg font-semibold text-gray-900">Error al cargar datos</h3>
//             <p className="mt-2 text-gray-600">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
//             >
//               Reintentar
//             </button>
//           </div>
//         </div>
//         <Footer />
//       </>
//     );
//   }

//   return (
//     <>
//       <Header onCartOpen={onCartOpen} />
//       <main className="min-h-screen bg-gray-50">
//         {/* Sección Hero Banner con la nueva imagen */}
//         <section className="relative bg-gray-900 text-white overflow-hidden">
//           {loading ? (
//             <div className="w-full h-[60vh] sm:h-[70vh] md:h-[85vh] rounded-lg bg-gray-300 animate-pulse"></div>
//           ) : (
//             <>
//               <div
//                 ref={promoSliderRef}
//                 className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide scroll-smooth"
//                 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//                 onMouseEnter={() => setIsHovering(true)}
//                 onMouseLeave={() => setIsHovering(false)}
//                 onTouchStart={() => setIsHovering(true)}
//                 onTouchEnd={() => setTimeout(() => setIsHovering(false), 3000)}
//               >
//                 {promotions.length > 0 ? (
//                   promotions.map((promo, index) => (
//                     <div
//                       key={promo.id || index}
//                       className="snap-center shrink-0 w-full h-[60vh] sm:h-[70vh] md:h-[85vh] relative flex items-center"
//                     >
//                       <div
//                         className="absolute inset-0 bg-center bg-cover transition-transform duration-700"
//                         style={{
//                           backgroundImage: `url(${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${promo.image || '/images/default-banner.jpg'})`,
//                           backgroundPosition: 'center'
//                         }}
//                       >
//                         <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
//                       </div>
//                       <div className="relative z-10 container mx-auto px-8 sm:px-12 py-8 sm:py-12 md:py-16">
//                         <div className="max-w-xl ml-0 md:ml-8 lg:ml-16 transform transition-all duration-700 translate-y-0 text-left">
//                           <div className="overflow-hidden mb-3">
//                             <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-2 text-white animate-slide-up">
//                               <span className="inline-block bg-yellow-500 text-black px-4 py-1 transform -skew-x-12 mb-3 shadow-lg">
//                                 {promo.title}
//                               </span>
//                               <span className="block text-shadow-lg">{promo.subtitle || "De Alta Calidad"}</span>
//                             </h1>
//                           </div>
//                           <p className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-10 bg-black/30 p-4 rounded-lg shadow-xl max-w-md animate-fade-in backdrop-blur-sm text-white/90">
//                             {promo.description || "Descubre nuestra exclusiva colección de rines deportivos para darle un nuevo estilo a tu vehículo."}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   // Banner por defecto con el efecto de crossfade integrado
//                   <div className="snap-center shrink-0 w-full h-[60vh] sm:h-[70vh] md:h-[85vh] relative flex items-center">
//                     {/* Contenedor de imágenes con efecto crossfade */}
//                     {bannerImages.map((image, index) => (
//                       <div
//                         key={index}
//                         className="absolute inset-0 bg-center bg-cover transition-opacity duration-1000"
//                         style={{
//                           backgroundImage: `url('${image}')`,
//                           backgroundPosition: 'center center',
//                           opacity: index === currentBannerImageIndex ? 1 : 0
//                         }}
//                       >
//                         {/* Los overlays se aplican a cada imagen para asegurar el efecto con cada cambio */}
//                         {index === currentBannerImageIndex && (
//                           <>
//                             {/* Overlay de efecto con patrón */}
//                             <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
//                             {/* Gradiente para mejor contraste */}
//                             <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
//                             {/* Efectos de luz */}
//                             <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-yellow-500/10 to-transparent"></div>
//                           </>
//                         )}
//                       </div>
//                     ))}

//                     <div className="relative z-10 container mx-auto px-8 sm:px-12 py-8 sm:py-12 md:py-16">
//                       <div className="max-w-xl ml-0 md:ml-8 lg:ml-16 transform transition-all duration-700 translate-y-0 text-left">
//                         <div className="overflow-hidden mb-4">
//                           <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-3 text-white animate-slide-up">
//                             <span className="inline-block bg-yellow-500 text-black px-4 py-1 transform -skew-x-12 shadow-xl">
//                               Rines Deportivos
//                             </span>
//                             <span className="block mt-2 text-shadow-lg">De Alta Calidad</span>
//                           </h1>
//                         </div>
//                         <p className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-10 bg-black/20 backdrop-blur-sm p-4 rounded-lg shadow-xl max-w-md leading-relaxed animate-fade-in">
//                           Descubre nuestra exclusiva colección de rines deportivos para darle un nuevo estilo a tu vehículo.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Indicadores del slider - solo para promociones */}
//               {promotions.length > 1 && (
//                 <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex justify-center space-x-2">
//                   {promotions.map((_, index) => (
//                     <button
//                       key={index}
//                       onClick={() => navigatePromotion(index)}
//                       className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${activePromotion === index
//                         ? 'bg-yellow-500 scale-125'
//                         : 'bg-white bg-opacity-50 hover:bg-opacity-75'
//                         }`}
//                       aria-label={`Ver promoción ${index + 1}`}
//                     ></button>
//                   ))}
//                 </div>
//               )}

//               {/* Botones de navegación del slider - solo para promociones */}
//               {promotions.length > 1 && (
//                 <>
//                   <button
//                     className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-300 focus:outline-none backdrop-blur-sm"
//                     onClick={() => navigatePromotion((activePromotion - 1 + promotions.length) % promotions.length)}
//                     aria-label="Promoción anterior"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                     </svg>
//                   </button>
//                   <button
//                     className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-300 focus:outline-none backdrop-blur-sm"
//                     onClick={() => navigatePromotion((activePromotion + 1) % promotions.length)}
//                     aria-label="Siguiente promoción"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                     </svg>
//                   </button>
//                 </>
//               )}
//             </>
//           )}
//         </section>

//         {/* Sección de Categorías - Mejorada para móvil */}
//         <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 lg:px-12">
//           <div className="max-w-7xl mx-auto">
//             <div className="flex justify-between items-center mb-6 sm:mb-8">
//               <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 relative">
//                 Categorías Destacadas
//                 <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-yellow-500"></span>
//               </h2>

//               {/* Controles de navegación para categorías - Adaptados para móvil */}
//               {categories.length > 3 && (
//                 <div className="flex space-x-2 sm:space-x-3">
//                   <button
//                     onClick={() => scrollCategories('left')}
//                     className="p-1.5 sm:p-2 rounded-full bg-gray-200 hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                     aria-label="Categorías anteriores"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                     </svg>
//                   </button>
//                   <button
//                     onClick={() => scrollCategories('right')}
//                     className="p-1.5 sm:p-2 rounded-full bg-gray-200 hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                     aria-label="Más categorías"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                     </svg>
//                   </button>
//                 </div>
//               )}
//             </div>

//             {loading ? (
//               <div className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-4 sm:pb-6 hide-scrollbar">
//                 {[...Array(4)].map((_, index) => (
//                   <CategorySkeleton key={index} />
//                 ))}
//               </div>
//             ) : (
//               <div
//                 ref={categorySliderRef}
//                 className="flex space-x-3 sm:space-x-4 md:space-x-6 overflow-x-auto pb-4 sm:pb-6 snap-x hide-scrollbar touch-pan-x"
//                 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
//               >
//                 {categories.length > 0 ? (
//                   categories.map(category => {
//                     console.log('Category slug:', category.slug);

//                     const categoryRoutes = {
//                       'rines-automóvil': '/rines-automovil',
//                       'rines-camioneta': '/rines-camioneta'
//                     };

//                     const categoryPath = categoryRoutes[category.slug] || `/categoria/${category.slug}`;

//                     return (
//                       <Link
//                         to={categoryPath}
//                         key={category.id}
//                         className="flex-shrink-0 w-36 sm:w-48 md:w-64 h-32 sm:h-40 md:h-48 rounded-lg overflow-hidden shadow-md group relative snap-start focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                       >
//                         <div
//                           className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
//                           style={{
//                             backgroundImage: category.slug === 'rines-automóvil'
//                               ? "url('https://i.pinimg.com/736x/36/a5/a8/36a5a84f83bd0c098fc83e8bff316c0c.jpg')"
//                               : category.slug === 'rines-camioneta'
//                                 ? "url('https://i.pinimg.com/736x/67/a3/1c/67a31c945cd03d3bd978639461c857b9.jpg')"
//                                 : `url(${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${category.image || '/images/default-category.jpg'})`,
//                             backgroundPosition: 'center'
//                           }}
//                         >
//                           <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-30 transition-opacity duration-300"></div>
//                         </div>
//                         <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
//                           <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 group-hover:text-yellow-300 transition-colors">{category.name}</h3>
//                           <div className="w-10 h-1 bg-yellow-500 mb-1.5 sm:mb-2 transition-all duration-300 group-hover:w-16"></div>
//                           <p className="text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
//                             {category.description ? (
//                               category.description.substring(0, 60) + (category.description.length > 60 ? '...' : '')
//                             ) : (
//                               'Explora nuestra colección'
//                             )}
//                           </p>
//                         </div>
//                       </Link>
//                     );
//                   })
//                 ) : (
//                   <div className="flex-1 flex items-center justify-center h-32 sm:h-40 md:h-48 bg-gray-100 rounded-lg text-gray-500 text-sm sm:text-base">
//                     No hay categorías destacadas disponibles
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </section>


//         {/* Separador visual */}
//         <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>

//         {/* Sección de Productos Destacados - Optimizada */}
//         <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 lg:px-12 bg-white">
//           <div className="max-w-7xl mx-auto">
//             <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 relative inline-block">
//               Productos Destacados
//               <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-yellow-500"></span>
//             </h2>

//             {loading ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
//                 {[...Array(4)].map((_, index) => (
//                   <ProductSkeleton key={index} />
//                 ))}
//               </div>
//             ) : (
//               <>
//                 {featuredProducts.length > 0 ? (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
//                     {featuredProducts.map(product => (
//                       <ProductCard
//                         key={product.id}
//                         product={product}
//                         onAddToCart={(e) => handleAddToCart(product, e)}
//                         isFeaturedSection={true} 
//                       />
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="bg-gray-100 rounded-lg p-6 sm:p-8 text-center">
//                     <p className="text-gray-600 mb-4">No hay productos destacados disponibles en este momento.</p>
//                     <Link to="/productos" className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-600 transition-colors">
//                       Ver todos los productos
//                     </Link>
//                   </div>
//                 )}

//                 {featuredProducts.length > 0 && (
//                   <div className="text-center mt-8 sm:mt-10">
//                     <Link to="/productos" className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-600 transition-colors">
//                       Ver todos los productos
//                     </Link>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </section>

//         {/* Separador visual */}
//         <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>

//         {/* Sección de Nuevos Productos - Optimizada */}
//         {newArrivals.length > 0 && !loading && (
//           <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 lg:px-12 bg-gray-50">
//             <div className="max-w-7xl mx-auto">
//               <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 relative inline-block">
//                 Recién Llegados
//                 <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-yellow-500"></span>
//               </h2>

//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//                 {newArrivals.map(product => (
//                   <ProductCard
//                     key={product.id}
//                     product={{ ...product, status: 'new' }}
//                     onAddToCart={(e) => handleAddToCart(product, e)}
//                   />
//                 ))}
//               </div>

//               <div className="text-center mt-6 sm:mt-8">
//                 <Link
//                   to="/productos?sort=newest"
//                   className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
//                 >
//                   Ver más novedades
//                 </Link>
//               </div>
//             </div>
//           </section>
//         )}

//         {/* Separador visual si hay nuevos productos */}
//         {newArrivals.length > 0 && !loading && (
//           <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
//         )}

//         {/* Banner de beneficios - Rediseñado para mejor responsive */}
//         <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 bg-gray-900 text-white">
//           <div className="max-w-7xl mx-auto">
//             <h2 className="sr-only">Nuestros Beneficios</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
//               <div className="flex flex-col sm:flex-row items-center text-center sm:text-left p-4 sm:p-5 md:p-6 border border-gray-700 rounded-lg transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 bg-gray-800 bg-opacity-50">
//                 <div className="rounded-full bg-yellow-500 p-3 mb-3 sm:mb-0 sm:mr-4">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Entregas Rápidas</h3>
//                   <p className="text-sm sm:text-base text-gray-300">Envíos a todo el país en 24-48 horas. Seguimiento en tiempo real de tu pedido.</p>
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row items-center text-center sm:text-left p-4 sm:p-5 md:p-6 border border-gray-700 rounded-lg transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 bg-gray-800 bg-opacity-50">
//                 <div className="rounded-full bg-yellow-500 p-3 mb-3 sm:mb-0 sm:mr-4">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Garantía de Calidad</h3>
//                   <p className="text-sm sm:text-base text-gray-300">Todos nuestros productos pasan por estrictos controles de calidad y tienen garantía.</p>
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row items-center text-center sm:text-left p-4 sm:p-5 md:p-6 border border-gray-700 rounded-lg transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 bg-gray-800 bg-opacity-50 sm:col-span-2 lg:col-span-1">
//                 <div className="rounded-full bg-yellow-500 p-3 mb-3 sm:mb-0 sm:mr-4">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Pago Seguro</h3>
//                   <p className="text-sm sm:text-base text-gray-300">Múltiples métodos de pago disponibles. Todas las transacciones están protegidas.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Separador visual */}
//         <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>

//         {/* Sección de Más Vendidos - Optimizada */}
//         {bestSellers.length > 0 && !loading && (
//           <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 lg:px-12 bg-white">
//             <div className="max-w-7xl mx-auto">
//               <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 relative inline-block">
//                 Los Más Vendidos
//                 <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-yellow-500"></span>
//               </h2>

//               {/* Slider horizontal para móvil, grid para desktop */}
//               <div className="relative">
//                 {/* Slider horizontal optimizado */}
//                 <div className="flex overflow-x-auto pb-4 snap-x touch-pan-x hide-scrollbar lg:hidden">
//                   {bestSellers.map(product => (
//                     <div key={product.id} className="flex-shrink-0 w-64 sm:w-72 px-2 snap-start">
//                       <ProductCard
//                         product={product}
//                         onAddToCart={(e) => handleAddToCart(product, e)}
//                       />
//                     </div>
//                   ))}
//                 </div>

//                 {/* Grid para pantallas grandes */}
//                 <div className="hidden lg:grid lg:grid-cols-4 gap-6">
//                   {bestSellers.map(product => (
//                     <ProductCard
//                       key={product.id}
//                       product={product}
//                       onAddToCart={(e) => handleAddToCart(product, e)}
//                     />
//                   ))}
//                 </div>
//               </div>

//               <div className="text-center mt-6 sm:mt-8">
//                 <Link
//                   to="/productos?sort=popular"
//                   className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-purple-700 text-white font-medium rounded-md hover:bg-purple-600 transition-colors"
//                 >
//                   Ver más vendidos
//                 </Link>
//               </div>
//             </div>
//           </section>
//         )}

//         {/* Separador visual si hay productos más vendidos */}
//         {bestSellers.length > 0 && !loading && (
//           <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
//         )}




//         {/* Bloque de Testimonios de Clientes - Versión Mejorada */}
//         <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative">
//             {/* Elementos decorativos */}
//             <div className="absolute top-0 left-10 w-20 h-20 bg-yellow-500 opacity-10 rounded-full"></div>
//             <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-400 opacity-10 rounded-full"></div>
//             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-200 opacity-20 rounded-full -z-10"></div>

//             {/* Título con estilos mejorados */}
//             <div className="text-center mb-14 relative">
//               <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative inline-block">
//                 Testimonios de Nuestros Clientes
//                 <div className="absolute -bottom-3 left-0 right-0 mx-auto w-24 h-1 bg-yellow-500"></div>
//               </h2>
//               <p className="max-w-2xl mx-auto text-gray-600 text-lg">
//                 Descubre lo que opinan quienes ya han confiado en nuestra calidad y servicio
//               </p>
//             </div>

//             {/* Contenedor de testimonios - versión mejorada */}
//             {loading ? (
//               // Estado de carga con mejor animación
//               <div className="grid md:grid-cols-2 gap-8">
//                 {[...Array(2)].map((_, index) => (
//                   <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 animate-pulse transform transition duration-500 hover:shadow-2xl">
//                     <div className="flex mb-6">
//                       <div className="flex space-x-1">
//                         {[...Array(5)].map((_, i) => (
//                           <div key={i} className="w-6 h-6 bg-gray-300 rounded-full"></div>
//                         ))}
//                       </div>
//                     </div>
//                     <div className="h-28 bg-gray-300 rounded-lg mb-6"></div>
//                     <div className="flex items-center">
//                       <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
//                       <div>
//                         <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
//                         <div className="h-4 bg-gray-300 rounded w-24"></div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : featuredReviews.length > 0 ? (
//               // Mostrar los testimonios con diseño mejorado
//               <div className="grid md:grid-cols-2 gap-8">
//                 {featuredReviews.slice(0, 2).map((review) => (
//                   <div
//                     key={review.id}
//                     className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden"
//                   >
//                     {/* Marca de comillas decorativa */}
//                     <div className="absolute -top-4 -left-4 text-9xl text-gray-100 leading-none z-0 font-serif">
//                       "
//                     </div>

//                     {/* Rating con estrellas */}
//                     <div className="flex items-center mb-6 relative z-10">
//                       <div className="flex">
//                         {[...Array(5)].map((_, i) => (
//                           <svg
//                             key={i}
//                             className={`w-6 h-6 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
//                             fill="currentColor"
//                             viewBox="0 0 20 20"
//                           >
//                             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
//                           </svg>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Comentario con formato mejorado */}
//                     <p className="text-gray-700 text-lg italic mb-8 relative z-10 leading-relaxed">
//                       "{review.comment}"
//                     </p>

//                     {/* Información del cliente con mejor formato */}
//                     <div className="flex items-center justify-between relative z-10 border-t pt-4 border-gray-100">
//                       <div className="flex items-center">
//                         <div className="bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center text-gray-700 font-bold text-xl mr-4">
//                           {(review.customerName || (review.user ? review.user.name : 'A')).charAt(0).toUpperCase()}
//                         </div>
//                         <div>
//                           <h3 className="font-bold text-gray-900">
//                             {review.customerName || (review.user ? review.user.name : 'Cliente Anónimo')}
//                           </h3>
//                           {review.product && (
//                             <p className="text-sm text-gray-600">
//                               Compró: {review.product.name}
//                             </p>
//                           )}
//                         </div>
//                       </div>

//                       {/* Badge de compra verificada */}
//                       {review.isVerifiedPurchase && (
//                         <div className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-sm font-medium flex items-center">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                             <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                           </svg>
//                           Verificada
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               // Mostrar mensaje mejorado si no hay testimonios
//               <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
//                 <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-800 mb-2">Aún no hay opiniones</h3>
//                 <p className="text-gray-600 mb-8 max-w-md mx-auto">
//                   Sé el primero en compartir tu experiencia con nuestros productos y ayuda a otros clientes a tomar la mejor decisión.
//                 </p>
//                 <Link
//                   to="/opiniones"
//                   className="inline-flex items-center px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1 duration-300"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
//                   </svg>
//                   Escribir una opinión
//                 </Link>
//               </div>
//             )}

//             {/* Botón para ver todos los testimonios - mejorado */}
//             {featuredReviews.length > 0 && (
//               <div className="text-center mt-12">
//                 <Link
//                   to="/opiniones"
//                   className="inline-flex items-center px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition-colors shadow-md hover:shadow-xl transform hover:-translate-y-1 duration-300"
//                 >
//                   <span>Ver todas las opiniones</span>
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
//                   </svg>
//                 </Link>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* Sección de suscripción al newsletter - Optimizada para móvil */}
//         <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
//           <div className="max-w-7xl mx-auto">
//             <div className="max-w-md sm:max-w-lg md:max-w-2xl mx-auto text-center">
//               <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">Suscríbete a nuestro Newsletter</h2>
//               <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8">Recibe las últimas novedades, ofertas exclusivas y consejos directamente en tu correo electrónico.</p>

//               <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
//                 <div className="relative flex-grow">
//                   <input
//                     type="email"
//                     placeholder="Tu correo electrónico"
//                     className="w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 pr-10"
//                     required
//                   />
//                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                       <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                     </svg>
//                   </div>
//                 </div>
//                 <button
//                   type="submit"
//                   className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-400 transition-colors duration-300 whitespace-nowrap"
//                 >
//                   Suscribirse
//                 </button>
//               </form>

//               <p className="mt-4 text-xs sm:text-sm text-gray-400">
//                 Al suscribirte, aceptas recibir comunicaciones de marketing. Puedes darte de baja en cualquier momento.
//               </p>
//             </div>
//           </div>
//         </section>

//       </main>
//       <Footer />

//       {/* Estilos globales para animaciones */}
//       <style jsx global>{`
//   @keyframes slide-up {
//     from { transform: translateY(20px); opacity: 0; }
//     to { transform: translateY(0); opacity: 1; }
//   }
  
//   @keyframes fade-in {
//     from { opacity: 0; }
//     to { opacity: 1; }
//   }
  
//   .animate-slide-up {
//     animation: slide-up 0.6s ease-out forwards;
//   }
  
//   .animate-fade-in {
//     animation: fade-in 0.8s ease-out forwards;
//   }
  
//   .text-shadow-lg {
//     text-shadow: 0 2px 4px rgba(0,0,0,0.5);
//   }
  
//   .hide-scrollbar {
//     -ms-overflow-style: none;
//     scrollbar-width: none;
//   }
  
//   .hide-scrollbar::-webkit-scrollbar {
//     display: none;
//   }
// `}</style>
//     </>
//   );
// };

// export default HomePage;
// src/HomePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import { toast } from 'react-toastify';
import Header from './Header';
import Footer from './Footer';
import ProductCard from './components/ProductCard';
import { API_BASE } from './utils/apiConfig';

const HomePage = ({ onCartOpen }) => {
  // Estados para almacenar datos del backend
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [featuredReviews, setFeaturedReviews] = useState([]);

  // Estados para controlar la UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePromotion, setActivePromotion] = useState(0);
  const [isHovering, setIsHovering] = useState(null);

  // Referencias para elementos DOM
  const promoSliderRef = useRef(null);
  const categorySliderRef = useRef(null);

  // Acceso al contexto del carrito
  const { addToCart } = useCart();

  // Array de imágenes para el banner rotativo
  const bannerImages = [
    "https://images.pexels.com/photos/3608542/pexels-photo-3608542.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Lamborghini amarillo
    "https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Mercedes deportivo negro
    "https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // Porsche rojo
    "https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", // BMW deportivo azul
    "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"  // Audi R8 plateado
  ];

  // Estado para controlar el índice de la imagen actual
  const [currentBannerImageIndex, setCurrentBannerImageIndex] = useState(0);

  // Efecto para cargar datos de la API cuando el componente monta
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Realizamos todas las solicitudes en paralelo para mejorar el rendimiento
        const [
          featuredResponse,
          categoriesResponse,
          promotionsResponse,
          newArrivalsResponse,
          bestSellersResponse,
          featuredReviewsResponse
        ] = await Promise.all([
          fetch(`${API_BASE}/api/products/featured?limit=8`),
          fetch(`${API_BASE}/api/categories?featured=true`),
          fetch(`${API_BASE}/api/promotions/active`),
          fetch(`${API_BASE}/api/products?sort=createdAt&order=DESC&limit=4`),
          fetch(`${API_BASE}/api/products?sort=soldCount&order=DESC&limit=4`),
          fetch(`${API_BASE}/api/reviews/featured?limit=2`)
        ]);

        // Procesamos cada respuesta individualmente
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          if (featuredData.success) {
            setFeaturedProducts(featuredData.products || []);
          }
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          if (categoriesData.success) {
            setCategories(categoriesData.categories || []);
          }
        }

        if (promotionsResponse.ok) {
          const promotionsData = await promotionsResponse.json();
          if (promotionsData.success) {
            setPromotions(promotionsData.promotions || []);
          }
        }

        if (newArrivalsResponse.ok) {
          const newArrivalsData = await newArrivalsResponse.json();
          if (newArrivalsData.success) {
            setNewArrivals(newArrivalsData.products || []);
          }
        }

        if (bestSellersResponse.ok) {
          const bestSellersData = await bestSellersResponse.json();
          if (bestSellersData.success) {
            setBestSellers(bestSellersData.products || []);
          }
        }
        
        if (featuredReviewsResponse.ok) {
          const featuredReviewsData = await featuredReviewsResponse.json();
          if (featuredReviewsData.success) {
            setFeaturedReviews(featuredReviewsData.reviews || []);
          }
        }

      } catch (err) {
        console.error('Error al cargar datos de la página de inicio:', err);
        setError('Ocurrió un problema al cargar algunos contenidos. Por favor, intenta recargar la página.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Iniciar un intervalo para cambiar automáticamente las promociones
    const promotionInterval = setInterval(() => {
      if (!isHovering) {
        setActivePromotion(prev => {
          if (promotions.length === 0) return 0;
          return (prev + 1) % promotions.length;
        });
      }
    }, 6000);

    return () => clearInterval(promotionInterval);
  }, [isHovering, promotions.length]);

  // Efecto para cambiar la imagen automáticamente del banner
  useEffect(() => {
    // Solo cambiar si no se está interactuando con el slider
    if (!isHovering) {
      const interval = setInterval(() => {
        setCurrentBannerImageIndex(prevIndex =>
          (prevIndex + 1) % bannerImages.length
        );
      }, 4000); // Cambiar cada 4 segundos

      return () => clearInterval(interval);
    }
  }, [isHovering, bannerImages.length]);

  // Efecto para mover al slider a la promoción activa
  useEffect(() => {
    if (promoSliderRef.current && promotions.length > 0) {
      promoSliderRef.current.scrollTo({
        left: activePromotion * promoSliderRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  }, [activePromotion, promotions.length]);

  // Función para manejar la navegación del slider de promociones
  const navigatePromotion = (index) => {
    setActivePromotion(index);
  };

  // Función para añadir un producto al carrito
  const handleAddToCart = (product, event) => {
    console.log("Añadiendo al carrito:", product);
    event.preventDefault();
    event.stopPropagation();
    addToCart(product, 1, true);
  };

  // Función para cargar imágenes por defecto si hay error
  const handleImageError = (e) => {
    e.target.src = '/images/placeholder-product.png';
  };

  // Función para formatear precios
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  // Función para navegar en el slider de categorías
  const scrollCategories = (direction) => {
    if (categorySliderRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      categorySliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Componentes para mostrar esqueletos durante la carga
  const ProductSkeleton = () => (
    <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className="h-40 sm:h-48 md:h-56 bg-gray-300"></div>
      <div className="p-3 sm:p-4">
        <div className="h-4 sm:h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/2 mb-2 sm:mb-3"></div>
        <div className="h-5 sm:h-6 bg-gray-300 rounded w-1/3 mb-2 sm:mb-3"></div>
        <div className="flex space-x-2">
          <div className="h-8 sm:h-9 bg-gray-300 rounded w-1/2"></div>
          <div className="h-8 sm:h-9 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  const CategorySkeleton = () => (
    <div className="flex-shrink-0 w-32 sm:w-40 md:w-60 h-28 sm:h-36 md:h-40 rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className="h-full w-full bg-gray-300"></div>
    </div>
  );

  // Si hay error, mostrar mensaje de error
  if (error) {
    return (
      <>
        <Header onCartOpen={onCartOpen} />
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
          <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Error al cargar datos</h3>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header onCartOpen={onCartOpen} />
      <main className="min-h-screen bg-gray-50">
        {/* Sección Hero Banner - Optimizada para móviles */}
        <section className="relative bg-gray-900 text-white overflow-hidden">
          {loading ? (
            <div className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[85vh] rounded-lg bg-gray-300 animate-pulse"></div>
          ) : (
            <>
              <div
                ref={promoSliderRef}
                className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onTouchStart={() => setIsHovering(true)}
                onTouchEnd={() => setTimeout(() => setIsHovering(false), 3000)}
              >
                {promotions.length > 0 ? (
                  promotions.map((promo, index) => (
                    <div
                      key={promo.id || index}
                      className="snap-center shrink-0 w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[85vh] relative flex items-center"
                    >
                      <div
                        className="absolute inset-0 bg-center bg-cover transition-transform duration-700"
                        style={{
                          backgroundImage: `url(${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${promo.image || '/images/default-banner.jpg'})`,
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
                      </div>
                      <div className="relative z-10 container mx-auto px-4 sm:px-8 md:px-12 py-6 sm:py-8 md:py-16">
                        <div className="max-w-xl ml-0 md:ml-8 lg:ml-16 transform transition-all duration-700 translate-y-0 text-left">
                          <div className="overflow-hidden mb-2 sm:mb-3">
                            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-extrabold mb-2 text-white animate-slide-up">
                              <span className="inline-block bg-yellow-500 text-black px-2 sm:px-4 py-1 transform -skew-x-12 mb-2 sm:mb-3 shadow-lg">
                                {promo.title}
                              </span>
                              <span className="block text-shadow-lg">{promo.subtitle || "De Alta Calidad"}</span>
                            </h1>
                          </div>
                          <p className="text-sm sm:text-lg md:text-2xl mb-4 sm:mb-8 md:mb-10 bg-black/30 p-3 sm:p-4 rounded-lg shadow-xl max-w-md animate-fade-in backdrop-blur-sm text-white/90">
                            {promo.description || "Descubre nuestra exclusiva colección de rines deportivos para darle un nuevo estilo a tu vehículo."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Banner por defecto con el efecto de crossfade integrado
                  <div className="snap-center shrink-0 w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[85vh] relative flex items-center">
                    {/* Contenedor de imágenes con efecto crossfade */}
                    {bannerImages.map((image, index) => (
                      <div
                        key={index}
                        className="absolute inset-0 bg-center bg-cover transition-opacity duration-1000"
                        style={{
                          backgroundImage: `url('${image}')`,
                          backgroundPosition: 'center center',
                          opacity: index === currentBannerImageIndex ? 1 : 0
                        }}
                      >
                        {/* Los overlays se aplican a cada imagen para asegurar el efecto con cada cambio */}
                        {index === currentBannerImageIndex && (
                          <>
                            {/* Overlay de efecto con patrón */}
                            <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
                            {/* Gradiente para mejor contraste */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                            {/* Efectos de luz */}
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-yellow-500/10 to-transparent"></div>
                          </>
                        )}
                      </div>
                    ))}

                    <div className="relative z-10 container mx-auto px-4 sm:px-8 md:px-12 py-6 sm:py-8 md:py-16">
                      <div className="max-w-xl ml-0 md:ml-8 lg:ml-16 transform transition-all duration-700 translate-y-0 text-left">
                        <div className="overflow-hidden mb-2 sm:mb-4">
                          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-extrabold mb-2 sm:mb-3 text-white animate-slide-up">
                            <span className="inline-block bg-yellow-500 text-black px-2 sm:px-4 py-1 transform -skew-x-12 shadow-xl">
                              Rines Deportivos
                            </span>
                            <span className="block mt-1 sm:mt-2 text-shadow-lg">De Alta Calidad</span>
                          </h1>
                        </div>
                        <p className="text-sm sm:text-lg md:text-2xl mb-4 sm:mb-8 md:mb-10 bg-black/20 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-xl max-w-md leading-relaxed animate-fade-in">
                          Descubre nuestra exclusiva colección de rines deportivos para darle un nuevo estilo a tu vehículo.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Indicadores del slider - rediseñados para móvil */}
              {promotions.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 flex justify-center space-x-1 sm:space-x-2">
                  {promotions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => navigatePromotion(index)}
                      className={`w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
                        activePromotion === index
                          ? 'bg-yellow-500 scale-125'
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                      aria-label={`Ver promoción ${index + 1}`}
                    ></button>
                  ))}
                </div>
              )}

              {/* Botones de navegación del slider - mejorados para móvil */}
              {promotions.length > 1 && (
                <>
                  <button
                    className="absolute left-1 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1.5 sm:p-3 rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-300 focus:outline-none backdrop-blur-sm"
                    onClick={() => navigatePromotion((activePromotion - 1 + promotions.length) % promotions.length)}
                    aria-label="Promoción anterior"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="absolute right-1 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1.5 sm:p-3 rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-300 focus:outline-none backdrop-blur-sm"
                    onClick={() => navigatePromotion((activePromotion + 1) % promotions.length)}
                    aria-label="Siguiente promoción"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </>
          )}
        </section>

        {/* Sección de Categorías - Mejorada para móvil */}
        <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-800 relative">
                Categorías Destacadas
                <span className="absolute bottom-0 left-0 w-1/3 h-0.5 sm:h-1 bg-yellow-500"></span>
              </h2>

              {/* Controles de navegación para categorías - Adaptados para móvil */}
              {categories.length > 3 && (
                <div className="flex space-x-1 sm:space-x-2">
                  <button
                    onClick={() => scrollCategories('left')}
                    className="p-1 sm:p-2 rounded-full bg-gray-200 hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-yellow-500"
                    aria-label="Categorías anteriores"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollCategories('right')}
                    className="p-1 sm:p-2 rounded-full bg-gray-200 hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-yellow-500"
                    aria-label="Más categorías"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex space-x-3 sm:space-x-4 md:space-x-6 overflow-x-auto pb-3 sm:pb-6 hide-scrollbar">
                {[...Array(4)].map((_, index) => (
                  <CategorySkeleton key={index} />
                ))}
              </div>
            ) : (
              <div
                ref={categorySliderRef}
                className="flex space-x-2 sm:space-x-4 md:space-x-6 overflow-x-auto pb-3 sm:pb-6 snap-x hide-scrollbar touch-pan-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                {categories.length > 0 ? (
                  categories.map(category => {
                    console.log('Category slug:', category.slug);

                    const categoryRoutes = {
                      'rines-automóvil': '/rines-automovil',
                      'rines-camioneta': '/rines-camioneta'
                    };

                    const categoryPath = categoryRoutes[category.slug] || `/categoria/${category.slug}`;

                    return (
                      <Link
                        to={categoryPath}
                        key={category.id}
                        className="flex-shrink-0 w-32 sm:w-40 md:w-60 h-24 sm:h-32 md:h-48 rounded-lg overflow-hidden shadow-md group relative snap-start focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <div
                          className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                          style={{
                            backgroundImage: category.slug === 'rines-automóvil'
                              ? "url('https://i.pinimg.com/736x/36/a5/a8/36a5a84f83bd0c098fc83e8bff316c0c.jpg')"
                              : category.slug === 'rines-camioneta'
                                ? "url('https://i.pinimg.com/736x/67/a3/1c/67a31c945cd03d3bd978639461c857b9.jpg')"
                                : `url(${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${category.image || '/images/default-category.jpg'})`,
                            backgroundPosition: 'center'
                          }}
                        >
                          <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-30 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 text-white">
                          <h3 className="text-sm sm:text-base md:text-xl font-bold mb-0.5 sm:mb-1 group-hover:text-yellow-300 transition-colors">{category.name}</h3>
                          <div className="w-8 sm:w-10 h-0.5 sm:h-1 bg-yellow-500 mb-1 sm:mb-2 transition-all duration-300 group-hover:w-12 sm:group-hover:w-16"></div>
                          <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2 hidden sm:block">
                            {category.description ? (
                              category.description.substring(0, 60) + (category.description.length > 60 ? '...' : '')
                            ) : (
                              'Explora nuestra colección'
                            )}
                          </p>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="flex-1 flex items-center justify-center h-24 sm:h-32 md:h-48 bg-gray-100 rounded-lg text-gray-500 text-xs sm:text-sm md:text-base">
                    No hay categorías destacadas disponibles
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Separador visual */}
        <div className="h-1 sm:h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>

        {/* Sección de Productos Destacados - Optimizada */}
        <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-6 md:px-8 lg:px-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8 relative inline-block">
              Productos Destacados
              <span className="absolute bottom-0 left-0 w-1/3 h-0.5 sm:h-1 bg-yellow-500"></span>
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {[...Array(4)].map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : (
              <>
                {featuredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                    {featuredProducts.slice(0, 8).map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={(e) => handleAddToCart(product, e)}
                        isFeaturedSection={true} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8 text-center">
                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">No hay productos destacados disponibles en este momento.</p>
                    <Link to="/productos" className="inline-block px-3 py-2 sm:px-6 sm:py-3 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-600 transition-colors text-sm sm:text-base">
                      Ver todos los productos
                    </Link>
                  </div>
                )}

                {featuredProducts.length > 0 && (
                  <div className="text-center mt-6 sm:mt-8 md:mt-10">
                    <Link to="/productos" className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-600 transition-colors text-sm sm:text-base">
                      Ver todos los productos
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Separador visual */}
        <div className="h-1 sm:h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>

        {/* Sección de Nuevos Productos - Optimizada */}
        {newArrivals.length > 0 && !loading && (
          <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-6 md:px-8 lg:px-12 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8 relative inline-block">
                Recién Llegados
                <span className="absolute bottom-0 left-0 w-1/3 h-0.5 sm:h-1 bg-yellow-500"></span>
              </h2>

              {/* Versión móvil: slider horizontal */}
              <div className="flex overflow-x-auto pb-4 snap-x hide-scrollbar space-x-3 sm:hidden">
                {newArrivals.map(product => (
                  <div key={product.id} className="flex-shrink-0 w-44 snap-start">
                    <ProductCard
                      product={{ ...product, status: 'new' }}
                      onAddToCart={(e) => handleAddToCart(product, e)}
                      compact={true}
                    />
                  </div>
                ))}
              </div>

              {/* Versión tablet/desktop: grid */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {newArrivals.map(product => (
                  <ProductCard
                    key={product.id}
                    product={{ ...product, status: 'new' }}
                    onAddToCart={(e) => handleAddToCart(product, e)}
                  />
                ))}
              </div>

              <div className="text-center mt-4 sm:mt-6 md:mt-8">
                <Link
                  to="/productos?sort=newest"
                  className="inline-block px-3 py-2 sm:px-6 sm:py-3 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Ver más novedades
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Separador visual si hay nuevos productos */}
        {newArrivals.length > 0 && !loading && (
          <div className="h-1 sm:h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
        )}

        {/* Banner de beneficios - Rediseñado para mejor responsive */}
        <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-6 md:px-8 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="sr-only">Nuestros Beneficios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left p-3 sm:p-5 md:p-6 border border-gray-700 rounded-lg transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 bg-gray-800 bg-opacity-50">
                <div className="rounded-full bg-yellow-500 p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">Entregas Rápidas</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-300">Envíos a todo el país en 24-48 horas. Seguimiento en tiempo real de tu pedido.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left p-3 sm:p-5 md:p-6 border border-gray-700 rounded-lg transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 bg-gray-800 bg-opacity-50">
                <div className="rounded-full bg-yellow-500 p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">Garantía de Calidad</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-300">Todos nuestros productos pasan por estrictos controles de calidad y tienen garantía.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left p-3 sm:p-5 md:p-6 border border-gray-700 rounded-lg transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 bg-gray-800 bg-opacity-50 sm:col-span-2 lg:col-span-1">
                <div className="rounded-full bg-yellow-500 p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">Pago Seguro</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-300">Múltiples métodos de pago disponibles. Todas las transacciones están protegidas.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Separador visual */}
        <div className="h-1 sm:h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>

        {/* Sección de Más Vendidos - Optimizada */}
        {bestSellers.length > 0 && !loading && (
          <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-6 md:px-8 lg:px-12 bg-white">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8 relative inline-block">
                Los Más Vendidos
                <span className="absolute bottom-0 left-0 w-1/3 h-0.5 sm:h-1 bg-yellow-500"></span>
              </h2>

              {/* Slider horizontal para móvil */}
              <div className="relative">
                <div className="flex overflow-x-auto pb-4 snap-x hide-scrollbar space-x-3 sm:space-x-4 lg:hidden">
                  {bestSellers.map(product => (
                    <div key={product.id} className="flex-shrink-0 w-44 sm:w-64 snap-start">
                      <ProductCard
                        product={product}
                        onAddToCart={(e) => handleAddToCart(product, e)}
                        compact={true}
                      />
                    </div>
                  ))}
                </div>

                {/* Grid para pantallas grandes */}
                <div className="hidden lg:grid lg:grid-cols-4 gap-6">
                  {bestSellers.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={(e) => handleAddToCart(product, e)}
                    />
                  ))}
                </div>
              </div>

              <div className="text-center mt-4 sm:mt-6 md:mt-8">
                <Link
                  to="/productos?sort=popular"
                  className="inline-block px-3 py-2 sm:px-6 sm:py-3 bg-purple-700 text-white font-medium rounded-md hover:bg-purple-600 transition-colors text-sm sm:text-base"
                >
                  Ver más vendidos
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Separador visual si hay productos más vendidos */}
        {bestSellers.length > 0 && !loading && (
          <div className="h-1 sm:h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
        )}

        {/* Bloque de Testimonios de Clientes - Optimizado para móvil */}
        <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 relative">
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-10 w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 bg-yellow-500 opacity-10 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 bg-blue-400 opacity-10 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 sm:w-80 md:w-96 h-60 sm:h-80 md:h-96 bg-gray-200 opacity-20 rounded-full -z-10"></div>

            {/* Título con estilos mejorados */}
            <div className="text-center mb-8 sm:mb-10 md:mb-14 relative">
              <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-4 relative inline-block">
                Testimonios de Clientes
                <div className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 mx-auto w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-yellow-500"></div>
              </h2>
              <p className="max-w-2xl mx-auto text-gray-600 text-sm sm:text-base md:text-lg">
                Descubre lo que opinan quienes ya han confiado en nuestra calidad y servicio
              </p>
            </div>

            {/* Contenedor de testimonios - versión mejorada */}
            {loading ? (
              // Estado de carga con mejor animación
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 animate-pulse transform transition duration-500 hover:shadow-2xl">
                    <div className="flex mb-3 sm:mb-4 md:mb-6">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gray-300 rounded-full"></div>
                        ))}
                      </div>
                    </div>
                    <div className="h-20 sm:h-24 md:h-28 bg-gray-300 rounded-lg mb-3 sm:mb-4 md:mb-6"></div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-300 rounded-full mr-2 sm:mr-3 md:mr-4"></div>
                      <div>
                        <div className="h-4 sm:h-5 bg-gray-300 rounded w-24 sm:w-28 md:w-32 mb-1 sm:mb-2"></div>
                        <div className="h-3 sm:h-4 bg-gray-300 rounded w-16 sm:w-20 md:w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredReviews.length > 0 ? (
              // Mostrar los testimonios con diseño mejorado
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {featuredReviews.slice(0, 2).map((review) => (
                  <div
                    key={review.id}
                    className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl relative overflow-hidden"
                  >
                    {/* Marca de comillas decorativa */}
                    <div className="absolute -top-4 -left-4 text-6xl sm:text-7xl md:text-9xl text-gray-100 leading-none z-0 font-serif">
                      "
                    </div>

                    {/* Rating con estrellas */}
                    <div className="flex items-center mb-3 sm:mb-4 md:mb-6 relative z-10">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                    </div>

                    {/* Comentario con formato mejorado */}
                    <p className="text-gray-700 text-sm sm:text-base md:text-lg italic mb-4 sm:mb-6 md:mb-8 relative z-10 leading-relaxed">
                      "{review.comment}"
                    </p>

                    {/* Información del cliente con mejor formato */}
                    <div className="flex items-center justify-between relative z-10 border-t pt-3 sm:pt-4 border-gray-100">
                      <div className="flex items-center">
                        <div className="bg-gray-200 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-gray-700 font-bold text-base sm:text-lg md:text-xl mr-2 sm:mr-3 md:mr-4">
                          {(review.customerName || (review.user ? review.user.name : 'A')).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                            {review.customerName || (review.user ? review.user.name : 'Cliente Anónimo')}
                          </h3>
                          {review.product && (
                            <p className="text-xs sm:text-sm text-gray-600">
                              Compró: {review.product.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Badge de compra verificada */}
                      {review.isVerifiedPurchase && (
                        <div className="bg-green-100 text-green-700 py-1 px-2 sm:px-3 rounded-full text-xs sm:text-sm font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verificada
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Mostrar mensaje mejorado si no hay testimonios
              <div className="text-center py-8 sm:py-12 md:py-16 bg-white rounded-xl shadow-lg border border-gray-100 max-w-xl sm:max-w-2xl mx-auto">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Aún no hay opiniones</h3>
                <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                  Sé el primero en compartir tu experiencia con nuestros productos y ayuda a otros clientes a tomar la mejor decisión.
                </p>
                <Link
                  to="/opiniones"
                  className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1 duration-300 text-sm sm:text-base"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                  </svg>
                  Escribir una opinión
                </Link>
              </div>
            )}

            {/* Botón para ver todos los testimonios - mejorado */}
            {featuredReviews.length > 0 && (
              <div className="text-center mt-6 sm:mt-8 md:mt-12">
                <Link
                  to="/opiniones"
                  className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition-colors shadow-md hover:shadow-xl transform hover:-translate-y-1 duration-300 text-sm sm:text-base"
                >
                  <span>Ver todas las opiniones</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </section>

     {/* Sección de suscripción al newsletter - Optimizada para móvil */}
     <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-6 md:px-8 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-md sm:max-w-lg md:max-w-2xl mx-auto text-center">
              <h2 className="text-lg sm:text-xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4">Suscríbete a nuestro Newsletter</h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-300 mb-4 sm:mb-6 md:mb-8">Recibe las últimas novedades, ofertas exclusivas y consejos directamente en tu correo electrónico.</p>

              <form className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto">
                <div className="relative flex-grow">
                  <input
                    type="email"
                    placeholder="Tu correo electrónico"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 pr-8 sm:pr-10 text-sm sm:text-base"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-400 transition-colors duration-300 whitespace-nowrap text-sm sm:text-base"
                >
                  Suscribirse
                </button>
              </form>

              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-400">
                Al suscribirte, aceptas recibir comunicaciones de marketing. Puedes darte de baja en cualquier momento.
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />

      {/* Estilos globales para animaciones */}
      <style jsx global>{`
  @keyframes slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .animate-slide-up {
    animation: slide-up 0.6s ease-out forwards;
  }
  
  .animate-fade-in {
    animation: fade-in 0.8s ease-out forwards;
  }
  
  .text-shadow-lg {
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }
  
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`}</style>
    </>
  );
};

export default HomePage;