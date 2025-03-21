// src/AdminProducts.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { API_BASE } from './utils/apiConfig';
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [categories, setCategories] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Añadir estilos CSS de animaciones
  useEffect(() => {
    // Estilos CSS para animaciones
    const cssInJs = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes unlock {
        0% { transform: rotate(0); }
        100% { transform: rotate(-20deg) translateY(-5px); }
      }
      
      @keyframes particle {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
        100% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1); opacity: 0; }
      }
      
      @keyframes ripple {
        0% { transform: scale(0.8); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out forwards;
      }
      
      .animate-unlock {
        animation: unlock 0.5s ease-out forwards;
      }
      
      .animate-ripple-1 {
        animation: ripple 1s ease-out 0.2s forwards;
      }
      
      .animate-ripple-2 {
        animation: ripple 1s ease-out 0.5s forwards;
      }
      
      .animate-particle-1 {
        --x: 15px;
        --y: -15px;
        animation: particle 0.8s ease-out 0.1s forwards;
      }
      
      .animate-particle-2 {
        --x: -15px;
        --y: -15px;
        animation: particle 0.8s ease-out 0.2s forwards;
      }
      
      .animate-particle-3 {
        --x: 15px;
        --y: 15px;
        animation: particle 0.8s ease-out 0.3s forwards;
      }
      
      .animate-particle-4 {
        --x: -15px;
        --y: 15px;
        animation: particle 0.8s ease-out 0.4s forwards;
      }
      
      .animate-particle-5 {
        --x: 0;
        --y: -20px;
        animation: particle 0.8s ease-out 0.5s forwards;
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = cssInJs;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
       
        const response = await fetch(`${API_BASE}/api/categories?flat=true`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.categories) {
          console.log('Categorías cargadas:', data.categories);
          setCategories(data.categories);
        } else {
          console.warn('Respuesta de categorías sin datos:', data);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };

    fetchCategories();
  }, []);

  // Cargar productos cuando cambian los filtros, la paginación o el ordenamiento
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');

      
        const token = localStorage.getItem('token');

        // Construir la URL con parámetros de consulta
        const params = new URLSearchParams({
          page: currentPage,
          limit: productsPerPage,
          sort: sortField,
          order: sortOrder
        });

        // Añadir filtros si están establecidos
        if (filter !== 'all') {
          params.append('status', filter);
        }

        if (category) {
          params.append('category', category);
        }

        if (minPrice) {
          params.append('minPrice', minPrice);
        }

        if (maxPrice) {
          params.append('maxPrice', maxPrice);
        }

        if (searchTerm) {
          params.append('search', searchTerm);
        }

        const url = `${API_BASE}/api/products?${params.toString()}`;
        console.log('Fetching URL:', url);

        const headers = {
          'Content-Type': 'application/json'
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: headers
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message ||
            `Error HTTP: ${response.status} - ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.success) {
          setProducts(data.products || []);
          setTotalPages(data.totalPages || 1);
        } else {
          throw new Error(data.message || 'Error desconocido al cargar productos');
        }
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError(err.message || 'No se pudieron cargar los productos. Por favor, intenta de nuevo más tarde.');
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    if (currentPage && productsPerPage) {
      fetchProducts();
    }
  }, [currentPage, filter, category, minPrice, maxPrice, searchTerm, sortField, sortOrder, productsPerPage]);

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll al inicio cuando cambiamos de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manejar cambio de filtro
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  // Manejar búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setMobileFiltersOpen(false); // Cerrar filtros móviles después de buscar
  };

  // Manejar ordenamiento
  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortOrder('ASC');
    }
    setCurrentPage(1);
  };

  // Manejar selección de productos
  const handleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(productId => productId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  // Seleccionar/deseleccionar todos los productos
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product.id));
    }
  };

  // Abrir modal de confirmación para eliminar
  const confirmDelete = (product = null) => {
    if (product) {
      setProductToDelete(product);
    } else if (selectedProducts.length > 0) {
      setProductToDelete({ id: 'multiple', name: `${selectedProducts.length} productos` });
    }
    setDeleteModalOpen(true);
  };

  // Eliminar producto(s)
  const deleteProduct = async () => {
    try {
      setLoading(true);

     
      const token = localStorage.getItem('token');

      if (productToDelete.id === 'multiple') {
        // Eliminar múltiples productos
        const deletePromises = selectedProducts.map(id =>
          fetch(`${API_BASE}/api/products/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        );

        await Promise.all(deletePromises);
        setSuccessMessage(`Se han eliminado ${selectedProducts.length} productos.`);
        setSelectedProducts([]);
      } else {
        // Eliminar un solo producto
        const response = await fetch(`${API_BASE}/api/products/${productToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }

        setSuccessMessage(`El producto "${productToDelete.name}" ha sido eliminado.`);
      }

      // Cerrar modal y limpiar
      setDeleteModalOpen(false);
      setProductToDelete(null);

      // Recargar productos
      const updatedProductsResponse = await fetch(
        `${API_BASE}/api/products?page=${currentPage}&limit=${productsPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const updatedData = await updatedProductsResponse.json();
      if (updatedData.success) {
        setProducts(updatedData.products);
        setTotalPages(updatedData.totalPages);

        // Si eliminamos todos los productos de la página actual y no es la primera página,
        // volvemos a la página anterior
        if (updatedData.products.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error al eliminar producto(s):', err);
      setError(`Error al eliminar: ${err.message}`);

      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado del producto
  const changeProductStatus = async (productId, newStatus) => {
    try {
      setLoading(true);

     
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/api/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      // Actualizar producto en la lista local
      setProducts(products.map(product =>
        product.id === productId ? { ...product, status: newStatus } : product
      ));

      setSuccessMessage(`Estado del producto actualizado a ${newStatus}.`);

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error al cambiar estado del producto:', err);
      setError(`Error al cambiar estado: ${err.message}`);

      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de varios productos a la vez
  const bulkChangeStatus = async (newStatus) => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');

      const updatePromises = selectedProducts.map(id =>
        fetch(`${API_BASE}/api/products/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        })
      );

      await Promise.all(updatePromises);

      // Actualizar productos en la lista local
      setProducts(products.map(product =>
        selectedProducts.includes(product.id) ? { ...product, status: newStatus } : product
      ));

      setSuccessMessage(`Estado de ${selectedProducts.length} productos actualizado a ${newStatus}.`);
      setSelectedProducts([]);
      setMobileActionsOpen(false);

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error al cambiar estado de productos:', err);
      setError(`Error al cambiar estado: ${err.message}`);

      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  // Mapear estados para mostrar en interfaz
  const statusLabels = {
    active: { text: 'Activo', class: 'bg-green-100 text-green-800' },
    draft: { text: 'Borrador', class: 'bg-gray-100 text-gray-800' },
    archived: { text: 'Archivado', class: 'bg-red-100 text-red-800' }
  };

  // Componente para mostrar skeleton durante la carga
  const ProductsSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-16 bg-gray-200 rounded-t-lg"></div>
      {[...Array(5)].map((_, index) => (
        <div key={index} className="h-24 md:h-16 bg-gray-100 border-b border-gray-200">
          <div className="flex flex-col md:flex-row h-full p-4">
            <div className="flex items-center space-x-3">
              <div className="h-4 w-4 bg-gray-300 rounded"></div>
              <div className="h-12 w-12 bg-gray-300 rounded-md"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
                <div className="h-3 w-20 bg-gray-300 rounded mt-2"></div>
              </div>
            </div>
            <div className="flex justify-between mt-3 md:mt-0 md:ml-auto">
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
              <div className="h-6 w-16 bg-gray-300 rounded mx-4"></div>
              <div className="h-6 w-24 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Productos</h1>
        <Link
          to="/admin/productos/nuevo"
          className="mt-3 md:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Añadir Producto
        </Link>
      </div>

      {/* Mensajes de éxito/error con animación */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg shadow-sm transition-all duration-500 ease-in-out animate-fadeIn">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg shadow-sm transition-all duration-500 ease-in-out animate-fadeIn">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Botón para mostrar/ocultar filtros en móvil */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="w-full flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-700"
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros y búsqueda
          </span>
          <svg className={`h-5 w-5 transition-transform ${mobileFiltersOpen ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} md:block mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-300`}>
        <div className="flex flex-col space-y-4">
          {/* Barra de búsqueda principal */}
          <form
            onSubmit={handleSearch}
            className="w-full flex"
          >
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="search"
                placeholder="Buscar por nombre, SKU o descripción..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full rounded-l-md border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500 transition-colors"
            >
              Buscar
            </button>
          </form>

          {/* Grid de filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro de Estado */}
            <div className="w-full">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={filter}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="draft">Borradores</option>
                <option value="archived">Archivados</option>
              </select>
            </div>

            {/* Filtro de Categoría */}
            <div className="w-full">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => {
                  setCurrentPage(1);
                  setCategory(e.target.value);
                }}
                className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Filtro de Precio */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rango de precio
              </label>
              <div className="flex space-x-2">
                <div className="relative rounded-md shadow-sm flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    placeholder="Mín"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="block w-full rounded-md border-0 py-2 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="relative rounded-md shadow-sm flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="block w-full rounded-md border-0 py-2 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Indicadores de filtros activos */}
          {(searchTerm || filter !== 'all' || category || minPrice || maxPrice) && (
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
              <div className="flex flex-wrap gap-2 mt-2">
                {searchTerm && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Búsqueda: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-200 text-indigo-600 hover:bg-indigo-300"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {filter !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Estado: {
                      {
                        'active': 'Activos',
                        'draft': 'Borradores',
                        'archived': 'Archivados'
                      }[filter]
                    }
                    <button
                      onClick={() => setFilter('all')}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {category && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Categoría: {categories.find(c => c.id.toString() === category.toString())?.name}
                    <button
                      onClick={() => setCategory('')}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-200 text-green-600 hover:bg-green-300"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Precio: {minPrice ? `$${minPrice}` : 'Min'} - {maxPrice ? `$${maxPrice}` : 'Max'}
                    <button
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                      }}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-yellow-200 text-yellow-600 hover:bg-yellow-300"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>

              {(searchTerm || filter !== 'all' || category || minPrice || maxPrice) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                    setCategory('');
                    setMinPrice('');
                    setMaxPrice('');
                    setCurrentPage(1);
                  }}
                  className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading && products.length === 0 ? (
          <ProductsSkeleton />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        <span>Producto</span>
                        {sortField === 'name' && (
                          <svg 
                            className={`ml-1 w-4 h-4 ${sortOrder === 'ASC' ? '' : 'transform rotate-180'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hidden md:table-cell"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center">
                        <span>Precio</span>
                        {sortField === 'price' && (
                          <svg 
                            className={`ml-1 w-4 h-4 ${sortOrder === 'ASC' ? '' : 'transform rotate-180'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hidden md:table-cell"
                      onClick={() => handleSort('inventory')}
                    >
                      <div className="flex items-center">
                        <span>Inventario</span>
                        {sortField === 'inventory' && (
                          <svg 
                            className={`ml-1 w-4 h-4 ${sortOrder === 'ASC' ? '' : 'transform rotate-180'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Estado
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p>No se encontraron productos</p>
                          {(searchTerm || filter !== 'all' || category || minPrice || maxPrice) && (
                            <button
                              onClick={() => {
                                setSearchTerm('');
                                setFilter('all');
                                setCategory('');
                                setMinPrice('');
                                setMaxPrice('');
                                setCurrentPage(1);
                              }}
                              className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                            >
                              Limpiar filtros
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {product.thumbnail ? (
                                <img
                                  className="h-10 w-10 rounded-md object-cover"
                                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${product.thumbnail}`}
                                  alt={product.name}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/100?text=Sin+Imagen';
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <Link
                                to={`/admin/productos/${product.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                              >
                                {product.name}
                              </Link>
                              <div className="text-xs text-gray-500">
                                {product.sku ? `SKU: ${product.sku}` : ''}
                                <span className="md:hidden ml-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusLabels[product.status]?.class || 'bg-gray-100 text-gray-800'}`}>
                                    {statusLabels[product.status]?.text || product.status}
                                  </span>
                                  {product.featured && (
                                    <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      ★
                                    </span>
                                  )}
                                </span>
                              </div>
                              {/* Visible solo en móvil */}
                              <div className="md:hidden mt-1 flex items-center">
                                <span className="text-sm text-gray-900 font-medium">{formatPrice(product.price)}</span>
                                <span className="mx-2 text-gray-300">|</span>
                                <span className={`text-sm ${product.inventory <= 5 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                  {product.inventory} en stock
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-900 font-medium">{formatPrice(product.price)}</div>
                          {product.compareAtPrice > 0 && product.compareAtPrice > product.price && (
                            <div className="text-xs text-gray-500 line-through">
                              {formatPrice(product.compareAtPrice)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className={`text-sm font-medium ${product.inventory <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                            {product.inventory}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusLabels[product.status]?.class || 'bg-gray-100 text-gray-800'}`}>
                            {statusLabels[product.status]?.text || product.status}
                          </span>
                          {product.featured && (
                            <span className="ml-2 px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Destacado
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {/* Pantallas grandes - botones separados */}
                            <div className="hidden md:flex space-x-2">
                              <Link
                                to={`/admin/productos/${product.id}`}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                              >
                                Editar
                              </Link>
                              
                              <div className="relative group">
                                <button
                                  type="button"
                                  className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                  Estado ▼
                                </button>
                                <div className="hidden group-hover:block absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                  <div className="py-1" role="menu" aria-orientation="vertical">
                                    <button
                                      onClick={() => changeProductStatus(product.id, 'active')}
                                      disabled={product.status === 'active'}
                                      className={`w-full text-left block px-4 py-2 text-sm ${product.status === 'active' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                      role="menuitem"
                                    >
                                      Marcar como Activo
                                    </button>
                                    <button
                                      onClick={() => changeProductStatus(product.id, 'draft')}
                                      disabled={product.status === 'draft'}
                                      className={`w-full text-left block px-4 py-2 text-sm ${product.status === 'draft' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                      role="menuitem"
                                    >
                                      Marcar como Borrador
                                    </button>
                                    <button
                                      onClick={() => changeProductStatus(product.id, 'archived')}
                                      disabled={product.status === 'archived'}
                                      className={`w-full text-left block px-4 py-2 text-sm ${product.status === 'archived' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                      role="menuitem"
                                    >
                                      Archivar Producto
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => confirmDelete(product)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                              >
                                Eliminar
                              </button>
                            </div>
                            
                            {/* Pantallas móviles - menú desplegable */}
                            <div className="md:hidden">
                              <button
                                className="text-gray-700 hover:text-indigo-600"
                                onClick={() => {
                                  // Abrir menú móvil de acciones para este producto
                                  if (mobileActionsOpen === product.id) {
                                    setMobileActionsOpen(null);
                                  } else {
                                    setMobileActionsOpen(product.id);
                                  }
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>
                              
                              {mobileActionsOpen === product.id && (
                                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                  <div className="py-1" role="menu">
                                    <Link
                                      to={`/admin/productos/${product.id}`}
                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Editar
                                    </Link>
                                    <button
                                      onClick={() => changeProductStatus(product.id, 'active')}
                                      disabled={product.status === 'active'}
                                      className={`w-full text-left block px-4 py-2 text-sm ${product.status === 'active' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                      Marcar como Activo
                                    </button>
                                    <button
                                      onClick={() => changeProductStatus(product.id, 'draft')}
                                      disabled={product.status === 'draft'}
                                      className={`w-full text-left block px-4 py-2 text-sm ${product.status === 'draft' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                      Marcar como Borrador
                                    </button>
                                    <button
                                      onClick={() => changeProductStatus(product.id, 'archived')}
                                      disabled={product.status === 'archived'}
                                      className={`w-full text-left block px-4 py-2 text-sm ${product.status === 'archived' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                      Archivar
                                    </button>
                                    <button
                                      onClick={() => confirmDelete(product)}
                                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Acciones en lote - Versión móvil */}
      {selectedProducts.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-700 font-medium">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold mr-2">
              {selectedProducts.length}
            </span>
            {selectedProducts.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="sm:relative w-full md:w-auto">
              <button
                type="button"
                onClick={() => setMobileActionsOpen(mobileActionsOpen === 'bulk' ? null : 'bulk')}
                className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Acciones en lote
                <svg className={`ml-1 w-4 h-4 transition-transform ${mobileActionsOpen === 'bulk' ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {mobileActionsOpen === 'bulk' && (
                <div className="sm:absolute left-0 z-10 mt-2 w-full sm:w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      onClick={() => bulkChangeStatus('active')}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Marcar como Activos
                    </button>
                    <button
                      onClick={() => bulkChangeStatus('draft')}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Marcar como Borradores
                    </button>
                    <button
                      onClick={() => bulkChangeStatus('archived')}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Archivar Productos
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => confirmDelete()}
              className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar Seleccionados
            </button>
          </div>
        </div>
      )}

     {/* Paginación */}
     {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * productsPerPage + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * productsPerPage, products.length)}
                </span>{' '}
                de <span className="font-medium">{products.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Paginación inteligente */}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNumber = i + 1;
                  // Mostrar siempre primera, última y páginas cercanas a la actual
                  const showPage = pageNumber === 1 || pageNumber === totalPages || 
                                 Math.abs(pageNumber - currentPage) <= 1;
                  
                  // Mostrar ellipsis para indicar páginas omitidas
                  if (!showPage) {
                    if (pageNumber === 2 || pageNumber === totalPages - 1) {
                      return (
                        <span key={`ellipsis-${pageNumber}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNumber ? 'bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                    >
                      {pageNumber}
                    </button>
                  );
                }).filter(Boolean)}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {deleteModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay de fondo con animación */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Esta línea es para centrar el modal verticalmente */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal con animación */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-fadeIn">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirmar eliminación
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {productToDelete?.id === 'multiple'
                          ? `¿Estás seguro de que quieres eliminar ${productToDelete?.name}? Esta acción no se puede deshacer.`
                          : `¿Estás seguro de que quieres eliminar el producto "${productToDelete?.name}"? Esta acción no se puede deshacer.`
                        }
                      </p>
                      {productToDelete?.id !== 'multiple' && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            {productToDelete?.thumbnail ? (
                              <img
                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${productToDelete.thumbnail}`}
                                alt={productToDelete.name}
                                className="h-10 w-10 rounded object-cover mr-3"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/100?text=Sin+Imagen';
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{productToDelete?.name}</div>
                              {productToDelete?.sku && (
                                <div className="text-xs text-gray-500">SKU: {productToDelete.sku}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={deleteProduct}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : 'Eliminar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setProductToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;