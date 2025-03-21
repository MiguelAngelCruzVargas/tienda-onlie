// src/RinesAutomovilPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCart } from './CartContext'; // Importamos el contexto del carrito

// Importar componentes necesarios
import ProductCard from './components/ProductCard';
import Breadcrumbs from './components/Breadcrumbs';
import { API_BASE } from './utils/apiConfig';
const RinesAutomovilPage = () => {
  // Utilizamos el contexto del carrito
  const { addToCart } = useCart();
  
  // Estados para gestionar los datos y la interfaz
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Valores de filtros disponibles (predefinidos basados en el diseño)
  const [availableSizes] = useState(['15', '16', '17', '18', '19', '20', '21', '22']);
  
  // Estados para los filtros actuales
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sizes: [],  // Tamaños como "18", "19", etc.
  });

  // Extraer parámetros de la URL
  const page = parseInt(searchParams.get('page') || '1');

  // Referencias para evitar recreación de fetchProducts
  const pageRef = useRef(page);
  const filtersRef = useRef(filters);

  // Actualizar referencias cuando cambien los valores
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Función para obtener la API base
  // const getApiBase = useCallback(() => import.meta.env.VITE_API_URL || 'http://localhost:3000', []);

  // Obtener filtros desde la URL
  useEffect(() => {
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');
    const urlSizes = searchParams.getAll('size');

    setFilters({
      minPrice: urlMinPrice || '',
      maxPrice: urlMaxPrice || '',
      sizes: urlSizes || [],
    });
  }, [searchParams]);

  // Función fetchProducts optimizada - sin dependencias que provoquen recreación
  const fetchProducts = useCallback(async () => {
    try {
      console.log("Iniciando fetchProducts");
      setLoading(true);
      setError(null);

      // Usar valores de las referencias para evitar recreación
      const currentPage = pageRef.current;
      const currentFilters = filtersRef.current;
      // const API_BASE = getApiBase();
      
      // Construir URL con parámetros
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage);
      
      // CORRECCIÓN: Enviar el categoryId como número entero sin comillas
      queryParams.append('category', 1); // ID 1 = "Rines Automóvil"
      
      // Especificar status activo explícitamente
      queryParams.append('status', 'active');
      
      // Añadir filtros si existen
      if (currentFilters.minPrice) queryParams.append('minPrice', currentFilters.minPrice);
      if (currentFilters.maxPrice) queryParams.append('maxPrice', currentFilters.maxPrice);
      
      // AQUÍ ESTÁ LA CORRECCIÓN PRINCIPAL PARA EL FILTRO DE TAMAÑO
      // Añadir filtros de tamaño al backend si se han seleccionado
      if (currentFilters.sizes.length > 0) {
        // Añadir los tamaños como parámetros de consulta
        currentFilters.sizes.forEach(size => {
          queryParams.append('size', size);
          console.log(`Filtrando por tamaño: ${size}"`);
        });
      }
      
      console.log(`Fetching products from: ${API_BASE}/api/products?${queryParams.toString()}`);
      
      // Hacer solicitud a la API
      const response = await fetch(`${API_BASE}/api/products?${queryParams.toString()}`);
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API Response data:", data);
      
      if (data.success) {
        if (data.products && data.products.length > 0) {
          // Procesar productos para asegurar que attributes esté en formato correcto
          let processedProducts = data.products.map(product => {
            let attributes = product.attributes;
            
            // Convertir attributes a objeto si viene como string
            if (typeof attributes === 'string') {
              try {
                attributes = JSON.parse(attributes);
              } catch (e) {
                console.error('Error al parsear attributes:', e);
                attributes = {};
              }
            }
            
            return {
              ...product,
              attributes
            };
          });
          
          // CORRECCIÓN: Filtrar manualmente en el frontend si hay tamaños seleccionados
          // Esto es un respaldo en caso de que el backend no maneje el filtro
          if (currentFilters.sizes.length > 0) {
            processedProducts = processedProducts.filter(product => {
              const productDiameter = product.attributes?.diameter || '';
              return currentFilters.sizes.includes(productDiameter);
            });
            
            console.log(`Después de filtrar por tamaño: ${processedProducts.length} productos`);
          }
          
          setProducts(processedProducts);
          setTotalProducts(data.count || processedProducts.length);
          setTotalPages(Math.max(1, Math.ceil(processedProducts.length / 10))); // Ajustar páginas según los productos filtrados
          console.log(`Procesados ${processedProducts.length} productos con éxito`);
        } else {
          console.log("No se encontraron productos en la respuesta.");
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
      } else {
        throw new Error(data.message || 'Error al cargar productos');
      }
    } catch (err) {
      console.error('Error general al cargar productos:', err);
      setError('Error al cargar productos. Intenta nuevamente más tarde.');
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias para evitar recreación

  // Efecto para cargar productos
  useEffect(() => {
    fetchProducts();
    // Si el filtro está abierto en móvil, cerrarlo al cambiar de página o filtros
    if (window.innerWidth < 1024 && filterOpen) {
      setFilterOpen(false);
    }
  }, [page, filters, fetchProducts]);

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    // Desplazamiento suave hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manejar cambios en filtros
  const handleFilterChange = (type, value) => {
    let newFilters = { ...filters };
    
    switch (type) {
      case 'minPrice':
      case 'maxPrice':
        // Validar que sea un número positivo o vacío
        if (value === '' || (/^\d*$/.test(value) && parseInt(value) >= 0)) {
          newFilters[type] = value;
        }
        break;
        
      case 'size':
        // Toggle inclusión/exclusión de tamaño
        if (filters.sizes.includes(value)) {
          newFilters.sizes = filters.sizes.filter(s => s !== value);
        } else {
          newFilters.sizes = [...filters.sizes, value];
        }
        break;
    }
    
    setFilters(newFilters);
    
    // Actualizar URL con nuevos filtros (reinicia a página 1)
    const newParams = new URLSearchParams();
    newParams.set('page', '1');
    
    if (newFilters.minPrice) newParams.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) newParams.set('maxPrice', newFilters.maxPrice);
    
    newFilters.sizes.forEach(size => {
      newParams.append('size', size);
    });
    
    setSearchParams(newParams);
  };

  // Aplicar filtros (para móvil)
  const applyFilters = () => {
    setFilterOpen(false);
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    const newParams = new URLSearchParams();
    newParams.set('page', '1');
    setSearchParams(newParams);
    
    setFilters({
      minPrice: '',
      maxPrice: '',
      sizes: [],
    });
    
    if (window.innerWidth < 1024) {
      setFilterOpen(false);
    }
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = () => {
    return (
      filters.minPrice || 
      filters.maxPrice || 
      filters.sizes.length > 0
    );
  };

  // Items para breadcrumbs
  const breadcrumbItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Rines para Automóvil', path: '/productos/automovil' }
  ];
  
  // Prevenir scroll cuando el filtro móvil está abierto
  useEffect(() => {
    if (filterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [filterOpen]);

  // Función para manejar la adición al carrito
  const handleAddToCart = (product) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Añadir el producto al carrito
    addToCart(product);
    
    // Mostrar notificación de éxito
    // toast.success(`¡${product.name} agregado al garaje!`, {
    //   position: "bottom-center",
    //   autoClose: 3000,
    //   hideProgressBar: false,
    //   closeOnClick: true,
    //   pauseOnHover: true,
    //   draggable: true,
    // });
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">

      


{/* Header Hero Section con imagen de fondo */}
<div className="relative bg-black text-white">
  {/* Overlay de imagen con gradiente */}
  <div 
    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
    style={{ 
      backgroundImage: "url('https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')", 
      backgroundPosition: "center center" 
    }}
  ></div>
  
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30"></div>
  
  <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
    {/* Se eliminaron los breadcrumbs */}
    
    <div className="max-w-3xl">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
        Rines Deportivos 
        <span className="text-yellow-500"> para Automóvil</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-300 mb-6">
        Transforma el aspecto y desempeño de tu vehículo con nuestra exclusiva colección de rines deportivos de alta calidad.
      </p>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Múltiples tamaños disponibles</span>
        </div>
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Diseños exclusivos</span>
        </div>
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Garantía de calidad</span>
        </div>
      </div>
    </div>
  </div>
</div>
      
      <div className="container mx-auto px-4 py-10">
        <div className="lg:flex">
          {/* Panel de filtros para escritorio - Rediseñado */}
          <div className={`lg:w-1/4 lg:pr-6 mb-6 lg:mb-0 hidden lg:block`}>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Filtros</h2>
                {hasActiveFilters() && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs font-medium text-yellow-600 hover:text-yellow-700 underline"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>
              
              {/* Filtro de precio */}
              <div className="mb-8">
                <h3 className="text-gray-900 font-bold mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  Precio
                </h3>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full pl-7 pr-3 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        placeholder="Mínimo"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full pl-7 pr-3 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        placeholder="Máximo"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Filtro por tamaño de rin */}
              <div className="mb-6">
                <h3 className="text-gray-900 font-bold mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  Tamaño (pulgadas)
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map((size) => (
                    <div 
                      key={size} 
                      onClick={() => handleFilterChange('size', size)}
                      className={`cursor-pointer flex items-center justify-center py-2 px-3 rounded-lg border text-center transition-all ${
                        filters.sizes.includes(size) 
                          ? 'bg-yellow-500 text-white border-yellow-500 font-bold shadow-md' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400'
                      }`}
                    >
                      {size}"
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Botones de filtro */}
              {hasActiveFilters() && (
                <button
                  onClick={handleClearFilters}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors mt-4 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
          
          {/* Contenido principal - Rediseñado */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
              <div className="flex flex-wrap justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">Rines para Automóvil</h1>
                  <p className="text-gray-600 mt-1">
                    {loading ? 'Cargando productos...' : `Mostrando ${products.length} de ${totalProducts} productos`}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center mt-3 md:mt-0">
                  {/* Toggle filtros en móvil */}
                  <button 
                    className="lg:hidden bg-white border border-gray-300 hover:border-yellow-500 text-gray-800 font-medium px-4 py-2 rounded-lg flex items-center transition-all shadow-sm"
                    onClick={() => setFilterOpen(true)}
                    aria-label="Mostrar filtros"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                    Filtros
                    {hasActiveFilters() && (
                      <span className="ml-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {filters.sizes.length + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0)}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
          {/* Chips para filtros activos (móvil y escritorio) - Rediseñados */}
          {hasActiveFilters() && (
              <div className="flex flex-wrap gap-2 mb-4 bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="mr-2 text-sm font-medium text-gray-700">Filtros activos:</div>
                {filters.minPrice && (
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-white text-sm font-bold px-3 py-1.5 rounded-lg flex items-center shadow-sm">
                    Desde: ${filters.minPrice}
                    <button onClick={() => handleFilterChange('minPrice', '')} className="ml-2 focus:outline-none text-yellow-100 hover:text-white transition-colors" aria-label="Eliminar filtro de precio mínimo">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                {filters.maxPrice && (
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-white text-sm font-bold px-3 py-1.5 rounded-lg flex items-center shadow-sm">
                    Hasta: ${filters.maxPrice}
                    <button onClick={() => handleFilterChange('maxPrice', '')} className="ml-2 focus:outline-none text-yellow-100 hover:text-white transition-colors" aria-label="Eliminar filtro de precio máximo">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                {filters.sizes.map(size => (
                  <div key={size} className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-white text-sm font-bold px-3 py-1.5 rounded-lg flex items-center shadow-sm">
                    {size}"
                    <button onClick={() => handleFilterChange('size', size)} className="ml-2 focus:outline-none text-yellow-100 hover:text-white transition-colors" aria-label={`Eliminar filtro de tamaño ${size} pulgadas`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                {hasActiveFilters() && (
                  <button 
                    onClick={handleClearFilters}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ml-auto"
                  >
                    Limpiar todos
                  </button>
                )}
              </div>
            )}
          
        {/* Estado de carga - Rediseñado */}
        {loading && (
              <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-md border border-gray-100">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-yellow-500 border-r-transparent border-b-transparent border-l-transparent absolute top-0 left-0"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Cargando productos de alta calidad...</p>
              </div>
            )}
            
            {/* Mensaje de error - Rediseñado */}
            {error && !loading && (
              <div className="bg-white rounded-xl shadow-md p-8 border border-red-200 mb-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-red-100 p-4 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Ocurrió un problema</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <button 
                    onClick={() => fetchProducts()}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all transform hover:scale-105"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}
            
            {/* Sin resultados - Rediseñado */}
            {!loading && !error && products.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 mb-6 text-center">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/5572/5572518.png" 
                  alt="Sin resultados" 
                  className="h-24 w-auto mx-auto mb-4 opacity-70"
                />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No encontramos productos</h3>
                <p className="text-gray-600 mb-6">No hay rines que coincidan con los filtros seleccionados.</p>
                {hasActiveFilters() && (
                  <button
                    onClick={handleClearFilters}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all transform hover:scale-105"
                  >
                    Limpiar filtros y ver todos
                  </button>
                )}
              </div>
            )}
            
            {/* Grid de productos - Rediseñado con efecto de aparición */}
            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {products.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Pasamos la función onAddToCart al ProductCard */}
                    <ProductCard 
                      product={product} 
                      onAddToCart={handleAddToCart(product)}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Paginación - Rediseñada */}
            {totalPages > 1 && !loading && (
              <div className="mt-12 mb-6">
                <div className="flex justify-center">
                  <nav className="flex items-center rounded-xl shadow-sm bg-white border border-gray-100 overflow-hidden" aria-label="Paginación">
                    {/* Botón anterior */}
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className={`relative flex items-center px-4 py-3 ${
                        page === 1
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-yellow-500'
                      } text-sm font-bold transition-colors border-r border-gray-200`}
                      aria-label="Página anterior"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden sm:inline-block ml-1">Anterior</span>
                    </button>
                    
                    {/* Números de página - Diseño mejorado */}
                    <div className="hidden sm:flex">
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const pageNumber = i + 1;
                        const isCurrentPage = pageNumber === page;
                        
                        // Mostrar siempre la primera y última página, y 1-2 páginas alrededor de la actual
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= page - 1 && pageNumber <= page + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`relative inline-flex items-center justify-center min-w-[3rem] py-3 
                                border-r border-gray-200 text-sm font-bold ${
                                isCurrentPage
                                  ? 'bg-yellow-500 text-white shadow-inner'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-yellow-500'
                              } transition-colors`}
                              aria-current={isCurrentPage ? "page" : undefined}
                              aria-label={`Página ${pageNumber}`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          (pageNumber === 2 && page > 3) ||
                          (pageNumber === totalPages - 1 && page < totalPages - 2)
                        ) {
                          // Puntos suspensivos para páginas intermedias
                          return (
                            <span
                              key={pageNumber}
                              className="relative inline-flex items-center justify-center min-w-[3rem] py-3 border-r border-gray-200 bg-white text-sm font-medium text-gray-700"
                            >
                              &hellip;
                            </span>
                          );
                        }
                        
                        return null;
                      })}
                    </div>
                    
                    {/* Indicador de página actual para móvil */}
                    <div className="flex sm:hidden items-center px-4 font-medium">
                      Página {page} de {totalPages}
                    </div>
                    
                    {/* Botón siguiente */}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className={`relative flex items-center px-4 py-3 ${
                        page === totalPages
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-yellow-500'
                      } text-sm font-bold transition-colors`}
                      aria-label="Página siguiente"
                    >
                      <span className="hidden sm:inline-block mr-1">Siguiente</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Banner promocional */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="md:flex items-center">
              <div className="md:w-2/3 mb-8 md:mb-0 md:pr-8">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                  ¿Quieres renovar el <span className="text-yellow-500">estilo</span> de tu auto?
                </h2>
                <p className="text-gray-300 text-lg mb-6">
                  Nuestros especialistas pueden ayudarte a elegir los rines perfectos para tu vehículo. 
                  Contamos con instalación profesional y asesoría personalizada.
                </p>
                <a 
                  href="/contacto" 
                  className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition-colors shadow-lg transform hover:scale-105"
                >
                  Contactar ahora
                </a>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/2554/2554978.png" 
                  alt="Servicio de instalación" 
                  className="h-40 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Superposición para pantallas móviles cuando se muestran filtros */}
      {filterOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setFilterOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      
      {/* Panel de filtros para móvil - Rediseñado */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white shadow-xl transform ${filterOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto`}
        aria-labelledby="filter-heading-mobile"
        aria-hidden={!filterOpen}
        role="dialog"
      >
        <div className="p-5 h-full flex flex-col">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <h2 id="filter-heading-mobile" className="text-xl font-bold">Filtros</h2>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setFilterOpen(false)}
              aria-label="Cerrar panel de filtros"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            {/* Filtro de precio - Móvil */}
            <div className="mb-8">
              <h3 className="text-gray-900 font-bold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                Precio
              </h3>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full pl-7 pr-3 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      placeholder="Mínimo"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      aria-label="Precio mínimo"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full pl-7 pr-3 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      placeholder="Máximo"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      aria-label="Precio máximo"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Filtro por tamaño de rin - Móvil */}
            <div className="mb-6">
              <h3 className="text-gray-900 font-bold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Tamaño (pulgadas)
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {availableSizes.map((size) => (
                  <div 
                    key={size} 
                    onClick={() => handleFilterChange('size', size)}
                    className={`cursor-pointer flex items-center justify-center py-2 px-3 rounded-lg border text-center transition-all ${
                      filters.sizes.includes(size) 
                        ? 'bg-yellow-500 text-white border-yellow-500 font-bold shadow-md' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400'
                    }`}
                  >
                    {size}"
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Botones de filtro - Móvil (fijados abajo) */}
          <div className="mt-auto border-t pt-4 flex flex-col space-y-3">
            <button
              onClick={applyFilters}
              className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md"
              aria-label="Aplicar filtros y cerrar"
            >
              Aplicar filtros
            </button>
            
            {hasActiveFilters() && (
              <button
                onClick={handleClearFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                aria-label="Limpiar todos los filtros"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toast container para notificaciones */}
      <ToastContainer 
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Estilos globales */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default RinesAutomovilPage;