// src/AdminReviews.jsx
import { API_BASE } from './utils/apiConfig';

import React, { useState, useEffect } from 'react';
import {
  Star,
  Check,
  X,
  MessageSquare,
  RefreshCw,
  Filter,
  Search,
  BarChart2,
  Clock,
  ThumbsUp,
  Trash2,
  ChevronDown,
  AlertCircle,
  Send,
  ShoppingBag,
  Tag,
  Eye,
  Store
} from 'lucide-react';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('all'); // Valor por defecto: pendientes
  const [typeFilter, setTypeFilter] = useState('all'); // all, general, product
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [productFilter, setProductFilter] = useState('');
  const [skuFilter, setSkuFilter] = useState('');
  const [stats, setStats] = useState({
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    averageRating: 0,
    productReviews: 0,
    generalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [modalAnimateIn, setModalAnimateIn] = useState(false);
 

  // Cargar reseñas al montar y cuando cambien los filtros básicos o la página
  useEffect(() => {
    fetchReviews();
    // Solo cargar estadísticas en la primera carga
    if (page === 1) {
      fetchStats();
    }
  }, [filter, page]); // Reducido para evitar múltiples peticiones

  // Efecto para animación del modal
  useEffect(() => {
    if (selectedReview) {
      setTimeout(() => {
        setModalAnimateIn(true);
      }, 50);
    } else {
      setModalAnimateIn(false);
    }
  }, [selectedReview]);

  // Función para obtener reseñas
  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Crear un objeto para los parámetros de consulta
      const queryParams = new URLSearchParams({
        page: page,
        limit: 10
      });

      // Añadir filtros de estado (excepto si es 'all')
      if (filter !== 'all') {
        queryParams.append('status', filter);
      }

      // Añadir filtro de tipo de reseña según el controlador
      if (typeFilter === 'product') {
        // Usar el parámetro que acepta el controlador
        queryParams.append('productType', 'product');
      } else if (typeFilter === 'general') {
        queryParams.append('productType', 'general');
      }

      // Añadir filtros de producto si existen
      if (productFilter) {
        queryParams.append('productName', productFilter);
      }

      if (skuFilter) {
        queryParams.append('productSKU', skuFilter);
      }

      const url = `${API_BASE}/api/reviews?${queryParams.toString()}`;

      console.log('URL de petición:', url);

      // Obtener el token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Realizar petición
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Manejar errores
      if (!response.ok) {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMsg = `Error ${response.status}: ${errorData.message}`;
          }
        } catch (e) {
          console.error('Error al procesar la respuesta de error:', e);
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.success) {
        // Si es primera página, reemplazar; si no, añadir
        if (page === 1) {
          setReviews(data.reviews || []);
        } else {
          setReviews(prev => [...prev, ...(data.reviews || [])]);
        }

        setHasMore(data.hasNextPage || false);
      } else {
        throw new Error(data.message || 'Error al cargar reseñas');
      }
    } catch (err) {
      console.error('Error al cargar reseñas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener estadísticas
  const fetchStats = async () => {
    try {
      // Obtener el token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Usar la ruta correcta según el router
      const response = await fetch(`${API_BASE}/api/reviews/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMsg = `Error ${response.status}: ${errorData.message}`;
          }
        } catch (e) {
          console.error('Error al procesar la respuesta de error:', e);
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.success) {
        // Asegurar que tenemos todas las propiedades necesarias con valores por defecto
        setStats({
          totalReviews: data.stats?.totalReviews || 0,
          pendingReviews: data.stats?.pendingReviews || 0,
          approvedReviews: data.stats?.approvedReviews || 0,
          rejectedReviews: data.stats?.rejectedReviews || 0,
          averageRating: data.stats?.averageRating || 0,
          productReviews: data.stats?.productReviews || 0,
          generalReviews: data.stats?.generalReviews || 0,
          ratingDistribution: data.stats?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
      } else {
        console.error('Error en la respuesta de estadísticas:', data.message);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      // No mostramos el error al usuario para no bloquear la funcionalidad principal
    }
  };

  // Función para aplicar filtros avanzados
  const applyAdvancedFilters = () => {
    setPage(1);
    setError(null);
    fetchReviews();
  };

  // Función para actualizar el estado de una reseña
  const updateReviewStatus = async (reviewId, status) => {
    try {
      setIsSubmitting(true);

      // Obtener el token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Preparar datos a enviar (según el controlador)
      const updateData = { status };

      // Si hay una respuesta del admin y estamos aprobando, incluirla
      if (selectedReview?.id === reviewId && adminResponse.trim() && status === 'approved') {
        updateData.adminResponse = adminResponse.trim();
      }

      const response = await fetch(`${API_BASE}/api/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMsg = `Error ${response.status}: ${errorData.message}`;
          }
        } catch (e) {
          console.error('Error al procesar la respuesta de error:', e);
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.success) {
        // Actualizar la lista de reseñas
        // Actualizar la lista de reseñas
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, status, adminResponse: updateData.adminResponse || review.adminResponse } 
            : review
        ));

        // Actualizar estadísticas
        fetchStats();

        // Cerrar modal de respuesta
        if (selectedReview?.id === reviewId) {
          // Primero animar salida
          setModalAnimateIn(false);
          // Luego cerrar después de la animación
          setTimeout(() => {
            setSelectedReview(null);
            setAdminResponse('');
          }, 300);
        }
      } else {
        throw new Error(data.message || 'Error al actualizar estado');
      }
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para eliminar una reseña
  const deleteReview = async (reviewId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Obtener el token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Según el controlador, no se necesita body
      const response = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMsg = `Error ${response.status}: ${errorData.message}`;
          }
        } catch (e) {
          console.error('Error al procesar la respuesta de error:', e);
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.success) {
        // Actualizar la lista de reseñas
        setReviews(reviews.filter(review => review.id !== reviewId));

        // Actualizar estadísticas
        fetchStats();

        // Cerrar modal si estaba abierto
        if (selectedReview?.id === reviewId) {
          setModalAnimateIn(false);
          setTimeout(() => {
            setSelectedReview(null);
            setAdminResponse('');
          }, 300);
        }
      } else {
        throw new Error(data.message || 'Error al eliminar reseña');
      }
    } catch (err) {
      console.error('Error al eliminar reseña:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para limpiar todos los filtros
  const handleClearFilters = () => {
    setFilter('all'); // Valor por defecto según el controlador
    setTypeFilter('all');
    setSearchTerm('');
    setProductFilter('');
    setSkuFilter('');
    setPage(1);
    fetchReviews();
  };

  // Función para manejar la búsqueda
  const handleSearch = () => {
    setPage(1);
    setError(null);
    fetchReviews();
  };

  // Función para renderizar estrellas
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Determinar si una reseña es de producto o general
  const isProductReview = (review) => {
    return Boolean(
      review.productId ||
      (review.productName && review.productName.trim() !== '') ||
      (review.productSKU && review.productSKU.trim() !== '') ||
      (review.product && review.product.id)
    );
  };

  // Obtener el nombre del producto para mostrar
  const getProductName = (review) => {
    return review.productName || (review.product ? review.product.name : null);
  };

  // Filtrar reseñas por término de búsqueda
  const filteredReviews = reviews;

  // Método para cerrar modal con animación
  const closeResponseModal = () => {
    setModalAnimateIn(false);
    setTimeout(() => {
      setSelectedReview(null);
      setAdminResponse('');
    }, 300);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Gestión de Reseñas</h1>

      {/* Estadísticas mejoradas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-300 border-b-2 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Total de Reseñas</h3>
              <p className="text-2xl font-bold">{stats.totalReviews}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <BarChart2 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-300 border-b-2 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Pendientes</h3>
              <p className="text-2xl font-bold text-orange-500">{stats.pendingReviews}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-300 border-b-2 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Aprobadas</h3>
              <p className="text-2xl font-bold text-green-500">{stats.approvedReviews}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ThumbsUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Nueva estadística: Reseñas de Productos */}
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-300 border-b-2 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Reseñas de Productos</h3>
              <p className="text-2xl font-bold text-blue-500">
                {stats.productReviews || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-300 border-b-2 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Calificación Media</h3>
              <div className="flex items-center">
                <p className="text-2xl font-bold mr-2 text-yellow-600">{parseFloat(stats.averageRating).toFixed(1)}</p>
                <div className="flex mt-1">{renderStars(Math.round(stats.averageRating))}</div>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="w-6 h-6 text-yellow-600 fill-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda mejorados con diseño responsive */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col space-y-4">
          {/* Encabezado de filtros con toggle para dispositivos móviles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-indigo-600" />
              <span className="font-medium text-gray-700">Filtrar reseñas</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors hidden md:block"
              >
                {showAdvancedFilters ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'}
              </button>
              <button
                className="md:hidden bg-gray-100 p-2 rounded-md"
                onClick={() => setShowFilters(!showFilters)}
              >
                <ChevronDown className={`w-5 h-5 text-gray-600 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filtros básicos (estado) */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${showFilters || 'md:flex hidden'}`}>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setFilter('pending'); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${filter === 'pending' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => { setFilter('approved'); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${filter === 'approved' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Aprobadas
              </button>
              <button
                onClick={() => { setFilter('rejected'); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${filter === 'rejected' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Rechazadas
              </button>
              <button
                onClick={() => { setFilter('all'); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${filter === 'all' ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Todas
              </button>

              {/* Solo mostrar limpiar filtros cuando hay filtros aplicados */}
              {(filter !== 'pending' || typeFilter !== 'all' || searchTerm || productFilter || skuFilter) && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  <X size={16} className="mr-1" /> Limpiar filtros
                </button>
              )}
            </div>

            <div className="flex items-center w-full md:w-auto">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Buscar reseñas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                className="ml-2 p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
                title="Buscar"
              >
                <Search size={18} />
              </button>
              <button
                onClick={() => {
                  setPage(1);
                  setError(null);
                  fetchReviews();
                  fetchStats();
                }}
                className="ml-2 p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
                title="Actualizar"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Filtros avanzados (tipo de reseña y productos) */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-gray-200 mt-2">
              <div className="flex flex-wrap gap-2 items-center mb-4">
                <span className="text-sm font-medium text-gray-700 mr-2">Tipo de reseña:</span>
                <button
                  onClick={() => { setTypeFilter('all'); setPage(1); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${typeFilter === 'all' ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => { setTypeFilter('general'); setPage(1); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${typeFilter === 'general' ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Generales
                </button>
                <button
                  onClick={() => { setTypeFilter('product'); setPage(1); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${typeFilter === 'product' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Productos
                </button>
              </div>

              {/* Filtros de producto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por nombre de producto:
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre del producto..."
                    value={productFilter}
                    onChange={(e) => {
                      setProductFilter(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        applyAdvancedFilters();
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por SKU:
                  </label>
                  <input
                    type="text"
                    placeholder="SKU del producto..."
                    value={skuFilter}
                    onChange={(e) => {
                      setSkuFilter(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        applyAdvancedFilters();
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Botón para aplicar filtros avanzados */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={applyAdvancedFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  <Filter size={16} className="mr-2" /> Aplicar filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estados de carga y error mejorados */}
      {loading && reviews.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-16 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Cargando reseñas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg shadow-md mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Error al cargar las reseñas</h3>
              <p className="mt-2 text-red-700">{error}</p>
              <button
                onClick={() => {
                  setPage(1);
                  setError(null);
                  fetchReviews();
                  fetchStats();
                }}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
              </button>
            </div>
          </div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
            <MessageSquare className="h-8 w-8 text-gray-500" />
          </div>
          <p className="text-lg text-gray-700 mb-2">
            {searchTerm ? 'No se encontraron reseñas para tu búsqueda.' : 'No hay reseñas para mostrar.'}
          </p>
          <p className="text-sm text-gray-500">
            {filter !== 'all' || typeFilter !== 'all'
              ? 'Prueba seleccionando un filtro diferente o haz clic en "Todas".'
              : ''}
          </p>
        </div>
      ) : (
        <div className="space-y-5 mb-8">
          {filteredReviews.map(review => {
            const isProduct = isProductReview(review);
            const productName = getProductName(review);

            return (
              <div
                key={review.id}
                className={`bg-white rounded-lg shadow-sm hover:shadow transition-all duration-300 p-5 border-l-4 ${review.status === 'pending' ? 'border-orange-500' :
                  review.status === 'approved' ? 'border-green-500' :
                    'border-red-500'
                  }`}
              >
                {/* Header con estado y tipo */}
                <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${review.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        review.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                      }`}
                    >
                      {review.status === 'pending' ? 'Pendiente' :
                        review.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                    </div>

                    <div className={`inline-flex items-center ${isProduct ? 'text-blue-600 bg-blue-50' : 'text-purple-600 bg-purple-50'
                      } px-2 py-1 rounded-md text-xs font-medium`}>
                      {isProduct ? (
                        <>
                          <ShoppingBag size={12} className="mr-1" />
                          Producto
                        </>
                      ) : (
                        <>
                          <Store size={12} className="mr-1" />
                          Tienda
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                </div>

                {/* Contenido de la reseña */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                  <div className="flex-grow">
                    {/* Nombre del producto - DESTACADO */}
                    {isProduct && productName && (
                      <div className="mb-3 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                        <h3 className="font-medium text-blue-800 flex items-center">
                          <ShoppingBag size={16} className="mr-2" />
                          {productName}
                        </h3>
                        {review.productSKU && (
                          <p className="text-xs text-blue-600 mt-1">SKU: {review.productSKU}</p>
                        )}
                        {review.productId && (
                          <a
                            href={`/admin/products/${review.productId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 underline mt-1 inline-block"
                          >
                            Ver producto en catálogo
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm font-medium text-gray-600">{review.rating}/5</span>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">
                        {review.customerName || review.userName || (review.user ? review.user.name : 'Cliente Anónimo')}
                      </span>
                      {review.isVerifiedPurchase && (
                        <span className="ml-2 inline-flex items-center text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-full">
                          <Check size={12} className="mr-1" /> Compra verificada
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                  {review.title && (
                    <h4 className="text-md font-semibold mb-2">{review.title}</h4>
                  )}
                  <p className="text-gray-800 whitespace-pre-line">{review.comment}</p>
                </div>

                {review.adminResponse && (
                  <div className="bg-indigo-50 p-4 rounded-lg mb-3 border-l-2 border-indigo-300">
                    <p className="text-sm font-medium text-indigo-700 mb-1">Respuesta del administrador:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{review.adminResponse}</p>
                  </div>
                )}

                {/* Botones de acción - OPTIMIZADOS según estado */}
                <div className="flex flex-wrap gap-2 justify-end mt-3">
                  {/* Botones específicos según estado */}
                  {review.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateReviewStatus(review.id, 'rejected')}
                        className="inline-flex items-center px-3 py-1.5 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200"
                        disabled={isSubmitting}
                      >
                        <X size={16} className="mr-1" /> Rechazar
                      </button>
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="inline-flex items-center px-3 py-1.5 bg-white border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
                        disabled={isSubmitting}
                      >
                        <MessageSquare size={16} className="mr-1" /> Responder
                      </button>
                      <button
                        onClick={() => updateReviewStatus(review.id, 'approved')}
                        className="inline-flex items-center px-3 py-1.5 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors duration-200"
                        disabled={isSubmitting}
                      >
                        <Check size={16} className="mr-1" /> Aprobar
                      </button>
                    </>
                  )}

                  {review.status === 'approved' && (
                    <>
                      {!review.adminResponse && (
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="inline-flex items-center px-3 py-1.5 bg-white border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
                          disabled={isSubmitting}
                        >
                          <MessageSquare size={16} className="mr-1" /> Responder
                        </button>
                      )}
                      <button
                        onClick={() => updateReviewStatus(review.id, 'pending')}
                        className="inline-flex items-center px-3 py-1.5 bg-white border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors duration-200"
                        disabled={isSubmitting}
                      >
                        <Clock size={16} className="mr-1" /> Marcar pendiente
                      </button>
                      <button
                        onClick={() => updateReviewStatus(review.id, 'rejected')}
                        className="inline-flex items-center px-3 py-1.5 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200"
                        disabled={isSubmitting}
                      >
                        <X size={16} className="mr-1" /> Rechazar
                      </button>
                    </>
                  )}

                  {review.status === 'rejected' && (
                    <>
                      <button
                        onClick={() => updateReviewStatus(review.id, 'pending')}
                        className="inline-flex items-center px-3 py-1.5 bg-white border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors duration-200"
                        disabled={isSubmitting}
                      >
                        <Clock size={16} className="mr-1" /> Marcar pendiente
                      </button>
                      <button
                        onClick={() => updateReviewStatus(review.id, 'approved')}
                        className="inline-flex items-center px-3 py-1.5 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors duration-200"
                        disabled={isSubmitting}
                      >
                        <Check size={16} className="mr-1" /> Aprobar
                      </button>
                    </>
                  )}

                  {/* Botón eliminar siempre visible */}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="inline-flex items-center px-3 py-1.5 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    <Trash2 size={16} className="mr-1" /> Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación mejorada */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading || isSubmitting}
            className={`px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 ${loading || isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow'
              }`}
          >
            {loading ? (
              <span className="flex items-center">
                <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                Cargando...
              </span>
            ) : (
              'Cargar más reseñas'
            )}
          </button>
        </div>
      )}

      {/* Modal para responder reseñas */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Fondo oscuro */}
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={closeResponseModal}
            ></div>

            {/* Modal centrado vertical y horizontal */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >&#8203;</span>

            <div
              className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${modalAnimateIn
                ? 'sm:translate-y-0 opacity-100'
                : 'sm:translate-y-4 opacity-0'
                }`}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Responder a Reseña
                    </h3>

                    {/* Información del producto destacada - MEJORADA */}
                    {isProductReview(selectedReview) && getProductName(selectedReview) && (
                      <div className="mt-2 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                        <h3 className="font-medium text-blue-800 flex items-center">
                          <ShoppingBag size={16} className="mr-2" />
                          {getProductName(selectedReview)}
                        </h3>
                        {selectedReview.productSKU && (
                          <p className="text-xs text-blue-600 mt-1">SKU: {selectedReview.productSKU}</p>
                        )}
                        {selectedReview.productId && (
                          <a
                            href={`/admin/products/${selectedReview.productId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 underline mt-1 inline-block"
                          >
                            Ver producto en catálogo
                          </a>
                        )}
                      </div>
                    )}

                    <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {renderStars(selectedReview.rating)}
                        </div>
                        <span className="text-sm font-medium text-gray-600">{selectedReview.rating}/5</span>
                      </div>

                      {selectedReview.title && (
                        <h4 className="text-md font-semibold mb-2">{selectedReview.title}</h4>
                      )}
                      <p className="text-gray-800 whitespace-pre-line mb-2">{selectedReview.comment}</p>
                      <p className="text-sm text-gray-600">
                        Por: <span className="font-medium">{
                          selectedReview.customerName ||
                          selectedReview.userName ||
                          (selectedReview.user ? selectedReview.user.name : 'Cliente Anónimo')
                        }</span>
                      </p>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="adminResponse" className="block text-sm font-medium text-gray-700 mb-1">
                        Tu respuesta:
                      </label>
                      <div className="relative">
                        <textarea
                          id="adminResponse"
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          placeholder="Escribe tu respuesta a esta reseña..."
                          className="w-full px-4 py-3 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm min-h-[120px] text-sm"
                        ></textarea>
                        <div className="absolute right-3 bottom-3 text-xs text-gray-500">
                          {adminResponse.length} caracteres
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => updateReviewStatus(selectedReview.id, 'approved')}
                  className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Guardar y aprobar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={closeResponseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para las animaciones personalizadas */}
      <style jsx>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes slideIn {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }
        
        .animate-pulse-gentle {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminReviews;