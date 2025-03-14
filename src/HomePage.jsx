// src/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función para cargar los datos de la página de inicio
   // Dentro de la función fetchHomeData en HomePage.jsx, descomenta y modifica esto:

// Modifica la función fetchHomeData en HomePage.jsx
// Reemplaza la función fetchHomeData en tu HomePage.jsx con esta versión:

const fetchHomeData = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    try {
      const promosResponse = await fetch('/api/promotions');
      if (promosResponse.ok) {
        const promosData = await promosResponse.json();
        setPromotions(promosData);
      } else {
        console.warn('Error al cargar promociones:', promosResponse.statusText);
        setPromotions([]);
      }
    } catch (err) {
      console.error('Error al cargar promociones:', err);
      setPromotions([]);
    }
    
    try {
      const categoriesResponse = await fetch('/api/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } else {
        console.warn('Error al cargar categorías:', categoriesResponse.statusText);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setCategories([]);
    }
    
    try {
      const productsResponse = await fetch('/api/products/featured');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setFeaturedProducts(productsData);
      } else {
        console.warn('Error al cargar productos destacados:', productsResponse.statusText);
        setFeaturedProducts([]);
      }
    } catch (err) {
      console.error('Error al cargar productos destacados:', err);
      setFeaturedProducts([]);
    }
    
    setIsLoading(false);
  } catch (err) {
    setError(`Error al cargar la página: ${err.message}`);
    setIsLoading(false);
    console.error('Error fetching home data:', err);
  }
};

    fetchHomeData();
  }, []);

  // Configurar el timer para el slider solo cuando tengamos promociones cargadas
  useEffect(() => {
    if (promotions.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === promotions.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [promotions.length]);

  const nextSlide = () => {
    if (promotions.length === 0) return;
    setCurrentSlide((prev) => (prev === promotions.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (promotions.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? promotions.length - 1 : prev - 1));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="spinner-border text-yellow-500" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2 text-gray-600">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-yellow-500 text-black px-4 py-2 rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100">
      {/* Hero Slider */}
      {promotions.length > 0 ? (
        <div className="relative overflow-hidden h-64 md:h-96">
          <div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {promotions.map((promo, index) => (
              <div
                key={index}
                className="min-w-full h-full relative flex-shrink-0"
                style={{
                  backgroundImage: `url(${promo.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
                  <div className="container mx-auto px-6 md:px-10">
                    <div className="max-w-lg">
                      <h2 className="text-white text-3xl md:text-4xl font-bold mb-2">{promo.title}</h2>
                      <p className="text-white text-lg mb-4">{promo.description}</p>
                      <Link to={`/ofertas/${promo.id}`} className="bg-yellow-500 text-black px-6 py-2 rounded-md font-medium hover:bg-yellow-600 transition-colors inline-block">
                        Ver Oferta
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Controls */}
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-70"
            onClick={prevSlide}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-70"
            onClick={nextSlide}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {promotions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-8 rounded-full ${
                  currentSlide === index ? 'bg-yellow-500' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="h-64 md:h-96 bg-gray-200 flex items-center justify-center">
          <p className="text-gray-600">No hay promociones disponibles actualmente</p>
        </div>
      )}

      {/* Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Categorías</h2>
            <Link to="/categorias" className="text-yellow-600 hover:text-yellow-700 flex items-center">
              Ver todas 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link to={`/categoria/${category.id}`} key={category.id} className="group">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="h-40 overflow-hidden">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 text-lg">{category.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-600">No hay categorías disponibles actualmente</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Productos Destacados</h2>
            <Link to="/productos" className="text-yellow-600 hover:text-yellow-700 flex items-center">
              Ver todos 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-600">No hay productos destacados disponibles actualmente</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">¿Por qué comprar con nosotros?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-yellow-500 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Los Mejores Precios</h3>
              <p className="text-gray-300">Tenemos los precios más competitivos del mercado y ofertas exclusivas.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-yellow-500 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Productos Garantizados</h3>
              <p className="text-gray-300">Todos nuestros productos cuentan con garantía directa del fabricante.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-yellow-500 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Envío Rápido</h3>
              <p className="text-gray-300">Entrega en todo el país con seguimiento en tiempo real de tu pedido.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-yellow-500 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Soporte Técnico</h3>
              <p className="text-gray-300">Contamos con expertos para ayudarte a elegir los mejores rines para tu vehículo.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

// // src/HomePage.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import ProductCard from './ProductCard';

// const HomePage = () => {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [featuredProducts, setFeaturedProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [promotions, setPromotions] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [autoplay, setAutoplay] = useState(true);
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [isVisible, setIsVisible] = useState({
//     categories: false,
//     products: false,
//     benefits: false
//   });

//   // Referencias para los observadores de intersección
//   const categoriesRef = useRef(null);
//   const productsRef = useRef(null);
//   const benefitsRef = useRef(null);
//   const heroRef = useRef(null);

//   useEffect(() => {
//     // Configurar observadores para animar elementos cuando aparecen en la pantalla
//     const observerOptions = {
//       threshold: 0.2,
//       rootMargin: '0px 0px -100px 0px'
//     };

//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           if (entry.target === categoriesRef.current) {
//             setIsVisible(prev => ({ ...prev, categories: true }));
//           } else if (entry.target === productsRef.current) {
//             setIsVisible(prev => ({ ...prev, products: true }));
//           } else if (entry.target === benefitsRef.current) {
//             setIsVisible(prev => ({ ...prev, benefits: true }));
//           }
//         }
//       });
//     }, observerOptions);

//     if (categoriesRef.current) observer.observe(categoriesRef.current);
//     if (productsRef.current) observer.observe(productsRef.current);
//     if (benefitsRef.current) observer.observe(benefitsRef.current);

//     return () => {
//       if (categoriesRef.current) observer.unobserve(categoriesRef.current);
//       if (productsRef.current) observer.unobserve(productsRef.current);
//       if (benefitsRef.current) observer.unobserve(benefitsRef.current);
//     };
//   }, []);

//   useEffect(() => {
//     // Función para cargar los datos de la página de inicio
//     const fetchHomeData = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
        
//         // Aquí irían las llamadas a la API para obtener los datos
//         // Ejemplo:
//         // const promosResponse = await fetch('/api/promotions');
//         // if (!promosResponse.ok) throw new Error('Error al cargar promociones');
//         // const promosData = await promosResponse.json();
//         // setPromotions(promosData);

//         // const categoriesResponse = await fetch('/api/categories');
//         // if (!categoriesResponse.ok) throw new Error('Error al cargar categorías');
//         // const categoriesData = await categoriesResponse.json();
//         // setCategories(categoriesData);

//         // const productsResponse = await fetch('/api/products/featured');
//         // if (!productsResponse.ok) throw new Error('Error al cargar productos destacados');
//         // const productsData = await productsResponse.json();
//         // setFeaturedProducts(productsData);
        
//         // Datos de ejemplo mientras se implementa la API - estos serán reemplazados por tu API real
//         // Esto es solo para propósitos de demostración
//         setTimeout(() => {
//           setPromotions([
//             {
//               id: 1,
//               title: "Colección Verano 2025",
//               description: "Descubre nuestra nueva colección de rines para automóvil con hasta 30% de descuento",
//               imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
//             },
//             {
//               id: 2,
//               title: "Rines Premium",
//               description: "Transforma tu vehículo con nuestra línea exclusiva de rines premium",
//               imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
//             }
//           ]);
          
//           setCategories([
//             {
//               id: 1,
//               name: "Rines Automóvil",
//               description: "Para sedan, hatchback y deportivos",
//               imageUrl: "https://images.unsplash.com/photo-1577473403731-a35778535d51?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
//             },
//             {
//               id: 2,
//               name: "Rines Camioneta",
//               description: "Para SUV, pickups y todo terreno",
//               imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
//             },
//             {
//               id: 3,
//               name: "Llantas",
//               description: "Diferentes tipos para todo terreno",
//               imageUrl: "https://images.unsplash.com/photo-1600606242977-f9af21667fdb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
//             },
//             {
//               id: 4,
//               name: "Accesorios",
//               description: "Complementa tus rines con accesorios",
//               imageUrl: "https://images.unsplash.com/photo-1581382575064-318461eb6ec9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
//             }
//           ]);
          
//           setFeaturedProducts([
//             {
//               id: 1,
//               name: "Rin Sport XR3",
//               description: "Rines deportivos de aleación ligera",
//               price: 3299,
//               discountPrice: 2999,
//               imageUrl: "https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
//               rating: 4.8,
//               inStock: true,
//               isNew: true
//             },
//             {
//               id: 2,
//               name: "Rin Luxury RS20",
//               description: "Elegantes rines cromados para sedán",
//               price: 4199,
//               discountPrice: null,
//               imageUrl: "https://images.unsplash.com/photo-1626455613744-3a1912c564c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
//               rating: 4.5,
//               inStock: true,
//               isNew: false
//             },
//             {
//               id: 3,
//               name: "Rin Todo Terreno X5",
//               description: "Resistentes para terrenos difíciles",
//               price: 5499,
//               discountPrice: 4999,
//               imageUrl: "https://images.unsplash.com/photo-1546185081-22376d839511?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
//               rating: 4.9,
//               inStock: true,
//               isNew: true
//             },
//             {
//               id: 4,
//               name: "Rin Classic CR10",
//               description: "Diseño clásico con tecnología moderna",
//               price: 3899,
//               discountPrice: null,
//               imageUrl: "https://images.unsplash.com/photo-1612680306114-c858a3f39650?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
//               rating: 4.3,
//               inStock: false,
//               isNew: false
//             }
//           ]);
          
//           setIsLoading(false);
//         }, 1000); // Simular tiempo de carga
        
//       } catch (err) {
//         setError(`Error al cargar la página: ${err.message}`);
//         setIsLoading(false);
//         console.error('Error fetching home data:', err);
//       }
//     };

//     fetchHomeData();
//   }, []);

//   // Configurar el timer para el slider solo cuando tengamos promociones cargadas
//   useEffect(() => {
//     if (promotions.length === 0 || !autoplay) return;
    
//     const timer = setInterval(() => {
//       setCurrentSlide((prev) => (prev === promotions.length - 1 ? 0 : prev + 1));
//     }, 5000);

//     return () => clearInterval(timer);
//   }, [promotions.length, autoplay]);

//   const nextSlide = () => {
//     if (promotions.length === 0) return;
//     setCurrentSlide((prev) => (prev === promotions.length - 1 ? 0 : prev + 1));
//     setAutoplay(false); // Pausar autoplay cuando el usuario interactúa
//     setTimeout(() => setAutoplay(true), 10000); // Reanudar después de 10s
//   };

//   const prevSlide = () => {
//     if (promotions.length === 0) return;
//     setCurrentSlide((prev) => (prev === 0 ? promotions.length - 1 : prev - 1));
//     setAutoplay(false); // Pausar autoplay cuando el usuario interactúa
//     setTimeout(() => setAutoplay(true), 10000); // Reanudar después de 10s
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-96">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
//           <p className="mt-4 text-gray-600 animate-pulse">Cargando la mejor experiencia para ti...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto px-4 py-10">
//         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md mb-4">
//           <div className="flex items-center">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             <p>{error}</p>
//           </div>
//         </div>
//         <button 
//           onClick={() => window.location.reload()}
//           className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors shadow-md flex items-center"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//           </svg>
//           Reintentar
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50">
//       {/* Hero Slider */}
//       <div 
//         ref={heroRef} 
//         className="relative overflow-hidden"
//       >
//         {promotions.length > 0 ? (
//           <>
//             <div className="h-[70vh] max-h-[600px] min-h-[400px] relative">
//               {promotions.map((promo, index) => (
//                 <div
//                   key={index}
//                   className={`absolute inset-0 transition-opacity duration-1000 ${
//                     currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
//                   }`}
//                 >
//                   <div 
//                     className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-10000"
//                     style={{
//                       backgroundImage: `url(${promo.imageUrl})`,
//                       transform: currentSlide === index ? 'scale(1)' : 'scale(1.05)',
//                     }}
//                   ></div>
//                   <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20 flex items-center">
//                     <div className="container mx-auto px-6 md:px-10">
//                       <div className={`max-w-lg transition-all duration-1000 transform ${
//                         currentSlide === index ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
//                       }`}>
//                         <span className="inline-block bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold mb-3">
//                           Oferta Exclusiva
//                         </span>
//                         <h2 className="text-white text-4xl md:text-5xl font-bold mb-4">{promo.title}</h2>
//                         <p className="text-gray-200 text-lg mb-6">{promo.description}</p>
//                         <Link to={`/ofertas/${promo.id}`} className="inline-flex items-center bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 transform hover:translate-y-[-2px] transition-all shadow-lg hover:shadow-xl group">
//                           Ver Oferta
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//                           </svg>
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Slider Controls */}
//             <button
//               className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full z-20 backdrop-blur-sm transition-all hover:scale-110"
//               onClick={prevSlide}
//               aria-label="Anterior"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//               </svg>
//             </button>
//             <button
//               className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full z-20 backdrop-blur-sm transition-all hover:scale-110"
//               onClick={nextSlide}
//               aria-label="Siguiente"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//               </svg>
//             </button>

//             {/* Slide Indicators */}
//             <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3 z-20">
//               {promotions.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => {
//                     setCurrentSlide(index);
//                     setAutoplay(false);
//                     setTimeout(() => setAutoplay(true), 10000);
//                   }}
//                   className={`h-2 w-10 rounded-full transition-all duration-300 ${
//                     currentSlide === index 
//                       ? 'bg-yellow-500 w-10' 
//                       : 'bg-white/50 hover:bg-white/70 w-6'
//                   }`}
//                   aria-label={`Ir a diapositiva ${index + 1}`}
//                 />
//               ))}
//             </div>
//           </>
//         ) : (
//           <div className="h-[50vh] bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center">
//             <div className="text-center px-4">
//               <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Descubre Nuestra Colección de Rines</h2>
//               <p className="text-xl text-gray-300 mb-8">Encuentra el estilo perfecto para tu vehículo</p>
//               <Link to="/productos" className="inline-flex items-center bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 transform hover:translate-y-[-2px] transition-all shadow-lg hover:shadow-xl">
//                 Ver Productos
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//                 </svg>
//               </Link>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Search Bar Floating */}
//       <div className="relative z-10 container mx-auto px-4">
//         <div className="bg-white rounded-xl shadow-xl p-4 -mt-8 flex flex-col md:flex-row md:items-center gap-4">
//           <div className="flex-grow">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="¿Qué estás buscando? Ej: Rines 17 pulgadas..."
//                 className="w-full bg-gray-100 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
//               />
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             </div>
//           </div>
//           <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-2">
//             <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded-lg transition-colors text-sm whitespace-nowrap flex items-center justify-center">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
//               </svg>
//               Filtrar
//             </button>
//             <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded-lg transition-colors text-sm whitespace-nowrap flex items-center justify-center">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//               Tamaño
//             </button>
//             <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded-lg transition-colors text-sm whitespace-nowrap flex items-center justify-center">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
//               </svg>
//               Modelo
//             </button>
//             <button className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-lg transition-colors text-sm font-medium whitespace-nowrap flex items-center justify-center">
//               Buscar
//             </button>
//           </div>
//         </div>
//       </div>
//       {/* Categories Section */}
//       <section 
//         ref={categoriesRef}
//         className={`py-16 mt-8 transition-opacity duration-1000 ${isVisible.categories ? 'opacity-100' : 'opacity-0'}`}
//       >
//         <div className="container mx-auto px-4">
//           <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12">
//             <div>
//               <h4 className="text-yellow-500 font-bold mb-2 tracking-wider">EXPLORA NUESTRO CATÁLOGO</h4>
//               <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">Categorías</h2>
//               <div className="w-20 h-1 bg-yellow-500 rounded"></div>
//             </div>
//             <Link to="/categorias" className="mt-4 md:mt-0 text-yellow-600 hover:text-yellow-700 flex items-center group">
//               <span>Ver todas</span> 
//               <span className="ml-2 bg-yellow-100 rounded-full p-1 group-hover:bg-yellow-200 transition-all duration-300 transform group-hover:translate-x-1">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                 </svg>
//               </span>
//             </Link>
//           </div>
          
//           {categories.length > 0 ? (
//   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//     {categories.map((category, index) => (
//       <Link 
//         to={`/categoria/${category.id}`} 
//         key={category.id} 
//         onMouseEnter={() => setActiveCategory(category.id)}
//         onMouseLeave={() => setActiveCategory(null)}
//         style={{
//           transitionDelay: `${isVisible.categories ? index * 100 : 0}ms`
//         }}
//         className={`group transform transition-all duration-500 ${
//           isVisible.categories 
//             ? 'translate-y-0 opacity-100' 
//             : 'translate-y-12 opacity-0'
//         }`}
//       >

//                   <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
//                     <div className="relative h-56 overflow-hidden">
//                       {category.imageUrl && (
//                         <img
//                           src={category.imageUrl}
//                           alt={category.name}
//                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                         />
//                       )}
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity"></div>
//                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                         <span className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
//                           Explorar {category.name}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="p-6">
//                       <h3 className="font-bold text-gray-800 text-xl mb-2 group-hover:text-yellow-600 transition-colors">{category.name}</h3>
//                       <p className="text-gray-600">{category.description}</p>
//                     </div>
//                   </div>
//                 </Link>
//               ))}
//             </div>

//           ) : (
//             <div className="bg-white rounded-xl shadow-md p-8 text-center">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//               <p className="text-gray-600 text-lg">No hay categorías disponibles actualmente</p>
//               <p className="text-gray-500 mt-2">Vuelve a intentarlo más tarde</p>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Why Choose Us Banner */}
//       <section className="py-16 bg-gray-900 relative overflow-hidden">
//         <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
//           <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-yellow-500"></div>
//           <div className="absolute bottom-12 left-12 w-48 h-48 rounded-full bg-yellow-500"></div>
//         </div>
        
//         <div className="container mx-auto px-4 relative z-10">
//           <div className="text-center max-w-3xl mx-auto">
//             <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">¿Por qué elegir nuestras llantas y rines?</h2>
//             <p className="text-gray-300 text-lg mb-10">Nos destacamos en el mercado por nuestra calidad, variedad y el mejor servicio al cliente</p>
            
//             <div className="flex flex-wrap justify-center gap-6">
//               <Link to="/productos" className="inline-flex items-center bg-yellow-500 text-black font-medium px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors">
//                 Ver Catálogo
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//                 </svg>
//               </Link>
//               <Link to="/contacto" className="inline-flex items-center bg-transparent border-2 border-white text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
//                 Contactarnos
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                 </svg>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Featured Products Section */}
//       <section 
//         ref={productsRef}
//         className={`py-16 bg-white transition-opacity duration-1000 ${isVisible.products ? 'opacity-100' : 'opacity-0'}`}
//       >
//         <div className="container mx-auto px-4">
//           <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12">
//             <div>
//               <h4 className="text-yellow-500 font-bold mb-2 tracking-wider">LO MÁS DESTACADO</h4>
//               <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">Productos Destacados</h2>
//               <div className="w-20 h-1 bg-yellow-500 rounded"></div>
//             </div>
//             <Link to="/productos" className="mt-4 md:mt-0 text-yellow-600 hover:text-yellow-700 flex items-center group">
//               <span>Ver todos</span> 
//               <span className="ml-2 bg-yellow-100 rounded-full p-1 group-hover:bg-yellow-200 transition-all duration-300 transform group-hover:translate-x-1">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                 </svg>
//               </span>
//             </Link>
//           </div>
          
//           {featuredProducts.length > 0 ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//               {featuredProducts.map((product, index) => (
//                 <div 
//                   key={product.id}
//                   style={{
//                     transitionDelay: `${isVisible.products ? index * 100 : 0}ms`
//                   }}
//                   className={`transform transition-all duration-500 ${
//                     isVisible.products 
//                       ? 'translate-y-0 opacity-100' 
//                       : 'translate-y-12 opacity-0'
//                   }`}
//                 >
//                   <ProductCard product={product} />
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="bg-gray-50 rounded-xl shadow-sm p-8 text-center">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//               </svg>
//               <p className="text-gray-600 text-lg">No hay productos destacados disponibles actualmente</p>
//               <p className="text-gray-500 mt-2">Vuelve a intentarlo más tarde</p>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Benefits Section */}
//       <section 
//         ref={benefitsRef}
//         className={`py-16 bg-gradient-to-br from-gray-800 to-gray-900 text-white transition-opacity duration-1000 ${isVisible.benefits ? 'opacity-100' : 'opacity-0'}`}
//       >
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <h4 className="text-yellow-400 font-bold mb-2 tracking-wider">NUESTRAS VENTAJAS</h4>
//             <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Por qué comprar con nosotros?</h2>
//             <div className="w-20 h-1 bg-yellow-500 rounded mx-auto"></div>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             <div className={`benefit-card ${isVisible.benefits ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.1s' }}>
//               <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center h-full hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10">
//                 <div className="bg-yellow-500 text-gray-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 transform -translate-y-12">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-bold mb-4">Los Mejores Precios</h3>
//                 <p className="text-gray-300">Tenemos los precios más competitivos del mercado y ofertas exclusivas.</p>
//               </div>
//             </div>
            
//             <div className={`benefit-card ${isVisible.benefits ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.3s' }}>
//               <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center h-full hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10">
//                 <div className="bg-yellow-500 text-gray-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 transform -translate-y-12">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-bold mb-4">Productos Garantizados</h3>
//                 <p className="text-gray-300">Todos nuestros productos cuentan con garantía directa del fabricante.</p>
//               </div>
//             </div>
            
//             <div className={`benefit-card ${isVisible.benefits ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.5s' }}>
//               <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center h-full hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10">
//                 <div className="bg-yellow-500 text-gray-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 transform -translate-y-12">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-bold mb-4">Envío Rápido</h3>
//                 <p className="text-gray-300">Entrega en todo el país con seguimiento en tiempo real de tu pedido.</p>
//               </div>
//             </div>
            
//             <div className={`benefit-card ${isVisible.benefits ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.7s' }}>
//               <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center h-full hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10">
//                 <div className="bg-yellow-500 text-gray-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 transform -translate-y-12">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9" />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-bold mb-4">Soporte Técnico</h3>
//                 <p className="text-gray-300">Contamos con expertos para ayudarte a elegir los mejores rines para tu vehículo.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Testimonials Section (Optional) */}
//       <section className="py-16 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <h4 className="text-yellow-500 font-bold mb-2 tracking-wider">LO QUE DICEN NUESTROS CLIENTES</h4>
//             <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">Testimonios</h2>
//             <div className="w-20 h-1 bg-yellow-500 rounded mx-auto"></div>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {/* En este espacio se cargarían los testimonios desde la API */}
//             <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow relative">
//               <div className="absolute -top-4 left-6 bg-yellow-500 text-black h-8 w-8 rounded-full flex items-center justify-center text-xl font-bold">
//                 "
//               </div>
//               <div className="pt-4">
//                 <p className="text-gray-600 mb-4">Cargando testimonios...</p>
//                 <div className="flex items-center mt-6">
//                   <div className="w-12 h-12 bg-gray-200 rounded-full animated-bg"></div>
//                   <div className="ml-4">
//                     <div className="h-4 w-32 bg-gray-200 rounded animated-bg mb-2"></div>
//                     <div className="h-3 w-24 bg-gray-200 rounded animated-bg"></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
      
//       {/* Call to Action */}
//       <section className="py-16 bg-yellow-500">
//         <div className="container mx-auto px-4">
//           <div className="flex flex-col md:flex-row items-center justify-between">
//             <div className="mb-8 md:mb-0 text-center md:text-left">
//               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Listo para transformar tu vehículo?</h2>
//               <p className="text-gray-800 text-lg">Descubre nuestra amplia selección de rines y llantas de alta calidad.</p>
//             </div>
//             <div className="flex flex-col sm:flex-row gap-4">
//               <Link to="/productos" className="bg-gray-900 hover:bg-black text-white py-3 px-8 rounded-lg text-center transition-colors font-medium">
//                 Ver productos
//               </Link>
//               <Link to="/contacto" className="bg-white hover:bg-gray-100 text-gray-900 py-3 px-8 rounded-lg text-center transition-colors font-medium">
//                 Contactar
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default HomePage;