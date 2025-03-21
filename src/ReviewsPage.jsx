// src/ReviewsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Filter, ArrowLeft, Award, ShoppingBag, Store, MessageSquare, Camera, X, Image } from 'lucide-react';

import { API_BASE } from './utils/apiConfig';
const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(0); // 0 = todas, 1-5 = por estrellas
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'product', 'general'
  const [sort, setSort] = useState('newest'); // newest, highest, lowest
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: {}
  });

  // Nuevo estado para manejo del formulario
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    customerName: '',
    isReviewType: 'general', // 'general' o 'product'
    isSubmitting: false,
    isCompressing: false, // Nuevo estado para compresión
    submitMessage: '',
    photos: [] // Para subir fotos
  });

  // Referencia para el input de tipo file
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchReviews();
  }, [filter, typeFilter, sort, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      //  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';;

      // Construir los parámetros de la URL
      let url = `${API_BASE}/api/reviews?page=${page}&limit=6`;

      // Agregar parámetros de ordenamiento
      if (sort === 'newest') {
        url += '&sort=createdAt&order=DESC';
      } else if (sort === 'highest') {
        url += '&sort=rating&order=DESC';
      } else if (sort === 'lowest') {
        url += '&sort=rating&order=ASC';
      }

      // Filtrar por calificación
      if (filter > 0) {
        url += `&rating=${filter}`;
      }

      // Filtrar por tipo de reseña
      if (typeFilter === 'product') {
        url += '&productType=product';
      } else if (typeFilter === 'general') {
        url += '&productType=general';
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();


      if (data.success) {
        // Si es la primera página, reemplazar los datos, si no, agregar
        if (page === 1) {
          setReviews(
            data.reviews.map(review => ({
              ...review,
              photos: Array.isArray(review.photos) ? review.photos : [] // Aseguramos que photos sea array
            }))
          );
        } else {
          setReviews(prev => [
            ...prev,
            ...data.reviews.map(review => ({
              ...review,
              photos: Array.isArray(review.photos) ? review.photos : [] // Aseguramos que photos sea array
            }))
          ]);
        }

        setHasMore(data.hasNextPage);


        // Calcular estadísticas básicas
        // Calcular estadísticas básicas
        if (page === 1) {
          // Procesar reseñas una sola vez para ambos casos (estado y estadísticas)
          const processedReviews = data.reviews.map(review => ({
            ...review,
            photos: Array.isArray(review.photos) ? review.photos : []
          }));

          const tempStats = {
            total: data.count,
            average: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          };

          let sum = 0;

          // Usar las reseñas procesadas
          processedReviews.forEach(review => {
            tempStats.distribution[review.rating] = (tempStats.distribution[review.rating] || 0) + 1;
            sum += review.rating;
          });

          tempStats.average = data.count > 0 ? (sum / data.count).toFixed(1) : 0;
          setStats(tempStats);

          // Actualizar estado con las reseñas procesadas
          setReviews(processedReviews);
        }
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


  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleFilterChange = (starRating) => {
    setFilter(starRating);
    setPage(1); // Reset a la primera página
  };

  const handleTypeFilterChange = (type) => {
    setTypeFilter(type);
    setPage(1); // Reset a la primera página
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1); // Reset a la primera página
  };

  // Manejo de cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejo de cambio de calificación (estrellas)
  const handleRatingChange = (rating) => {
    setFormData({
      ...formData,
      rating
    });
  };

  // Manejo de cambio de tipo de reseña
  const handleReviewTypeChange = (type) => {
    setFormData({
      ...formData,
      isReviewType: type
    });
  };

  // ACTUALIZADO: Función para comprimir imágenes antes de convertirlas a base64
  const compressImage = async (file, maxSizeKB = 95) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          // Crear un canvas para comprimir la imagen
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calcular proporción para mantener relación de aspecto
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * MAX_WIDTH / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * MAX_HEIGHT / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Reducir calidad para disminuir el tamaño
          let quality = 0.7; // Empezar con calidad de 70%
          let result = canvas.toDataURL('image/jpeg', quality);

          // Reducir calidad si es necesario para cumplir con el tamaño máximo
          while (result.length > maxSizeKB * 1024 && quality > 0.1) {
            quality -= 0.1;
            result = canvas.toDataURL('image/jpeg', quality);
          }

          console.log(`Imagen comprimida: ${Math.round(event.target.result.length / 1024)}KB → ${Math.round(result.length / 1024)}KB (${Math.round(quality * 100)}% calidad)`);

          resolve(result);
        };

        img.onerror = (error) => {
          reject(error);
        };
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // ACTUALIZADO: Manejo de selección de fotos (con compresión)
  const handlePhotosChange = async (e) => {
    const files = Array.from(e.target.files);

    // Validar que sean imágenes y no más de 3
    const validFiles = files.filter(file =>
      file.type.startsWith('image/') &&
      file.size <= 5 * 1024 * 1024 // Max 5MB
    ).slice(0, 3);

    if (validFiles.length < files.length) {
      alert('Solo se permiten imágenes de hasta 5MB y un máximo de 3 fotos.');
    }

    try {
      // Mostrar estado de compresión
      setFormData({
        ...formData,
        isCompressing: true
      });

      // Procesar cada archivo
      const processedPhotos = [];

      for (const file of validFiles) {
        // Crear URL para vista previa
        const preview = URL.createObjectURL(file);

        // Comprimir la imagen
        const compressedData = await compressImage(file, 95); // 95KB máximo por imagen

        processedPhotos.push({
          file,
          preview,
          compressedData
        });
      }

      setFormData({
        ...formData,
        photos: [...formData.photos, ...processedPhotos].slice(0, 3), // Máximo 3 fotos
        isCompressing: false
      });
    } catch (error) {
      console.error('Error al comprimir imágenes:', error);
      alert('Hubo un error al procesar las imágenes. Intenta con archivos más pequeños o en otro formato.');
      setFormData({
        ...formData,
        isCompressing: false
      });
    }
  };

  // ACTUALIZADO: Eliminar una foto
  const removePhoto = (index) => {
    const newPhotos = [...formData.photos];

    // Liberar URL para evitar memory leaks
    URL.revokeObjectURL(newPhotos[index].preview);

    newPhotos.splice(index, 1);
    setFormData({
      ...formData,
      photos: newPhotos
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { rating, comment, customerName, isReviewType, photos } = formData;

    // Validaciones con mensajes más claros
    if (!rating || rating === 0) {
      setFormData({
        ...formData,
        submitMessage: 'Por favor, selecciona una calificación (1-5 estrellas)'
      });
      return;
    }

    if (!comment || comment.trim().length < 10) {
      setFormData({
        ...formData,
        submitMessage: 'El comentario debe tener al menos 10 caracteres'
      });
      return;
    }

    if (!customerName || customerName.trim().length === 0) {
      setFormData({
        ...formData,
        submitMessage: 'Por favor, ingresa tu nombre'
      });
      return;
    }

    try {
      setFormData({
        ...formData,
        isSubmitting: true,
        submitMessage: ''
      });

      //  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';;

      // ACTUALIZADO: Usar las imágenes ya comprimidas
      // En la función handleSubmit, modificar:
      const photoList = (photos || []).map(photo => photo.compressedData); // <-- Validar array

      // Crear un objeto con los datos básicos
      const reviewData = {
        rating: Number(rating),
        comment,
        customerName
      };

      // Solo agregar fotos si hay alguna
      if (photoList.length > 0) {
        reviewData.photos = photoList;
      }

      // Calcular el tamaño aproximado de la solicitud
      const jsonSize = JSON.stringify(reviewData).length;
      const kilobytes = Math.round(jsonSize / 1024);

      // Advertir si el tamaño es cercano al límite del servidor
      if (kilobytes > 90) {
        console.warn(`Advertencia: El tamaño de la solicitud es de ${kilobytes}KB, cerca del límite del servidor de 100KB`);
      }

      console.log(`Enviando reseña: ${kilobytes}KB, ${photoList.length} fotos`);

      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      // En caso de error, mostrar más detalles
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error ${response.status}: ${errorText}`);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Liberar URLs de vista previa para evitar memory leaks
        formData.photos.forEach(photo => URL.revokeObjectURL(photo.preview));

        setFormData({
          rating: 0,
          comment: '',
          customerName: '',
          isReviewType: 'general',
          isSubmitting: false,
          isCompressing: false,
          submitMessage: data.message || 'Gracias por tu opinión. Será revisada pronto.',
          photos: []
        });

        // Si la reseña fue aprobada automáticamente, actualizar la lista
        if (data.review && data.review.status === 'approved') {
          fetchReviews();
        }
      } else {
        setFormData({
          ...formData,
          isSubmitting: false,
          submitMessage: data.message || 'Hubo un error al enviar tu opinión'
        });
      }
    } catch (error) {
      console.error('Error al enviar opinión:', error);
      setFormData({
        ...formData,
        isSubmitting: false,
        submitMessage: error.message.includes('entity too large')
          ? 'Las imágenes son demasiado grandes. Intenta con fotos más pequeñas o menos fotos.'
          : 'No se pudo enviar la opinión. Intenta de nuevo. ' + error.message
      });
    }
  };

  // Renderizar estrellas
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`${index < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
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

  return (
    <>
      
      <main className="min-h-screen bg-gray-50">
        {/* Banner principal - Mantener igual */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white py-10 md:py-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
            <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-white"></div>
            <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-white"></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Opiniones de Nuestros Clientes</h1>
            <p className="text-lg max-w-3xl mx-auto text-white/90 backdrop-blur-sm bg-black/5 p-3 rounded-lg">
              Descubre lo que opinan nuestros clientes sobre su experiencia comprando rines deportivos en nuestra tienda.
            </p>

            {/* Indicador de calificación global */}
            {stats.average > 0 && (
              <div className="mt-6 inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
                <div className="flex mr-2">
                  {renderStars(Math.round(stats.average))}
                </div>
                <span className="font-bold text-xl">{stats.average}</span>
                <span className="text-sm ml-1 mr-2">/5</span>
                <span className="text-sm opacity-80">de {stats.total} opiniones</span>
              </div>
            )}
          </div>
        </div>

        {/* Sección principal rediseñada */}
        <div className="container mx-auto px-4 max-w-7xl py-8">
          {/* Filtros mejorados */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-y-4">
              {/* Filtros por estrellas */}
              <div>
                <h3 className="font-medium mb-2">Filtrar por estrellas:</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange(0)}
                    className={`px-3 py-1 rounded-full text-sm ${filter === 0
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                  >
                    Todas
                  </button>
                  {[5, 4, 3, 2, 1].map(star => (
                    <button
                      key={star}
                      onClick={() => handleFilterChange(star)}
                      className={`flex items-center px-3 py-1 rounded-full text-sm ${filter === star
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                      {star} <Star size={12} className="ml-1" fill={filter === star ? 'white' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro por tipo de reseña - NUEVO */}
              <div>
                <h3 className="font-medium mb-2">Tipo de reseña:</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTypeFilterChange('all')}
                    className={`px-3 py-1 rounded-full text-sm ${typeFilter === 'all'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => handleTypeFilterChange('general')}
                    className={`flex items-center px-3 py-1 rounded-full text-sm ${typeFilter === 'general'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                  >
                    <Store size={12} className="mr-1" />
                    Tienda
                  </button>
                  <button
                    onClick={() => handleTypeFilterChange('product')}
                    className={`flex items-center px-3 py-1 rounded-full text-sm ${typeFilter === 'product'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                  >
                    <ShoppingBag size={12} className="mr-1" />
                    Productos
                  </button>
                </div>
              </div>

              {/* Ordenamiento */}
              <div>
                <h3 className="font-medium mb-2">Ordenar por:</h3>
                <select
                  className="bg-gray-100 border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="newest">Más recientes</option>
                  <option value="highest">Mayor calificación</option>
                  <option value="lowest">Menor calificación</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Opiniones */}
          {loading && page === 1 ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
              <p className="text-red-600 mb-2">{error}</p>
              <button
                onClick={() => { setPage(1); fetchReviews(); }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500 mb-4">No hay opiniones disponibles</p>
              <a
                href="#dejar-opinion"
                className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 inline-block"
              >
                Sé el primero en opinar
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {reviews.map(review => {
                  const isProduct = isProductReview(review);
                  return (
                    <div
                      key={review.id}
                      className={`bg-white rounded-lg shadow-sm p-4 border-t-4 ${isProduct
                        ? 'border-blue-500'
                        : 'border-purple-500'
                        } transition-all duration-300 hover:shadow-md`}
                    >
                      {/* Tipo de reseña - NUEVO */}
                      <div className="flex justify-between items-start mb-3">
                        <div className={`inline-flex items-center ${isProduct ? 'text-blue-600 bg-blue-50' : 'text-purple-600 bg-purple-50'
                          } px-2 py-1 rounded-md text-xs font-medium`}>
                          {isProduct ? (
                            <>
                              <ShoppingBag size={12} className="mr-1" />
                              Reseña de Producto
                            </>
                          ) : (
                            <>
                              <Store size={12} className="mr-1" />
                              Reseña de Tienda
                            </>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                      </div>

                      <div className="flex mb-3">
                        {renderStars(review.rating)}
                      </div>

                      {/* NUEVO: Mostrar el producto al que pertenece, si es de producto */}
                      {isProduct && (
                        <div className="bg-blue-50 rounded p-2 text-sm text-blue-700 mb-3 flex items-center">
                          <ShoppingBag size={14} className="mr-1 flex-shrink-0" />
                          <span>{review.productName || (review.product ? review.product.name : 'Producto')}</span>
                        </div>
                      )}

                      <p className="text-gray-700 mb-4">{review.comment}</p>

                      {/* NUEVO: Mostrar fotos si existen */}
                      {(review.photos || []).length > 0 && (  // <-- Añadir chequeo de array
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {(review.photos || []).map((photo, index) => (  // <-- Asegurar array
                              <a
                                key={index}
                                href={photo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img
                                  src={photo}
                                  alt={`Foto ${index + 1} de ${review.customerName}`}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full ${isProduct ? 'bg-blue-500' : 'bg-purple-500'
                            } flex items-center justify-center text-white font-medium text-sm mr-2`}>
                            {review.customerName
                              ? review.customerName.charAt(0).toUpperCase()
                              : (review.user ? review.user.name.charAt(0).toUpperCase() : 'A')}
                          </div>
                          <span className="font-medium">
                            {review.customerName || (review.user ? review.user.name : 'Cliente Anónimo')}
                          </span>
                        </div>

                        {review.isVerifiedPurchase && (
                          <div className="flex items-center text-green-600 text-xs">
                            <Award size={14} className="mr-1" />
                            Compra verificada
                          </div>
                        )}
                      </div>

                      {/* Información del producto si es reseña de producto */}
                      {isProduct && review.product && (
                        <div className="mt-3 pt-3 border-t border-gray-100 bg-blue-50 p-2 rounded-md">
                          <Link
                            to={`/producto/${review.product.slug}`}
                            className="text-sm text-blue-600 hover:underline flex items-center"
                          >
                            <ShoppingBag size={14} className="mr-1" />
                            Ver: {review.product.name}
                          </Link>
                        </div>
                      )}

                      {/* Respuesta de la tienda */}
                      {review.adminResponse && (
                        <div className="mt-3 pt-3 border-t border-gray-100 bg-gray-50 p-3 rounded text-sm">
                          <p className="font-bold text-gray-700 mb-1 flex items-center">
                            <MessageSquare size={14} className="mr-1" />
                            Respuesta de la tienda:
                          </p>
                          <p className="text-gray-700">{review.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Botón "Cargar más" */}
              {hasMore && (
                <div className="text-center mb-8">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className={`px-6 py-2 rounded-lg ${loading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                      }`}
                  >
                    {loading ? 'Cargando...' : 'Cargar más opiniones'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Sección para dejar opinión */}
          <div id="dejar-opinion" className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Comparte tu Experiencia</h2>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              {/* Selección de tipo de reseña - NUEVO */}
              <div className="mb-6">
                <label className="block font-medium mb-2">¿Qué quieres comentar?</label>
                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => handleReviewTypeChange('general')}
                    className={`flex items-center justify-center px-4 py-2 border rounded-lg ${formData.isReviewType === 'general'
                      ? 'bg-purple-100 border-purple-500 text-purple-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <Store size={18} className="mr-2" />
                    Sobre la Tienda
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewTypeChange('product')}
                    className={`flex items-center justify-center px-4 py-2 border rounded-lg ${formData.isReviewType === 'product'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <ShoppingBag size={18} className="mr-2" />
                    Sobre un Producto
                  </button>
                </div>

                {/* Nota para usar el selector de productos */}
                {formData.isReviewType === 'product' && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                    <p className="flex items-start">
                      <ShoppingBag size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                      Para reseñas de productos, te recomendamos ir directamente a la página del producto que quieres comentar. Así podrás seleccionarlo específicamente.
                    </p>
                  </div>
                )}
              </div>

              {/* Calificación con estrellas */}
              <div className="mb-6">
                <label className="block font-medium mb-2">Califica tu experiencia:</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={32}
                      className={`cursor-pointer transition-colors ${star <= formData.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300 hover:text-yellow-500'
                        }`}
                      onClick={() => handleRatingChange(star)}
                    />
                  ))}
                </div>
                {formData.rating > 0 && (
                  <p className="text-center mt-2 text-sm text-gray-600">
                    {formData.rating === 5 ? 'Excelente' :
                      formData.rating === 4 ? 'Muy bueno' :
                        formData.rating === 3 ? 'Bueno' :
                          formData.rating === 2 ? 'Regular' : 'Necesita mejorar'}
                  </p>
                )}
              </div>

              {/* Comentario */}
              <div className="mb-6">
                <label htmlFor="comment" className="block font-medium mb-2">Tu comentario:</label>
                <textarea
                  id="comment"
                  name="comment"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Comparte detalles de tu experiencia..."
                  value={formData.comment}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              {/* ACTUALIZADO: Subida de fotos con compresión */}
              <div className="mb-6">
                <label className="block font-medium mb-2">Añade fotos (opcional):</label>

                {/* Vista previa de fotos */}
                {formData.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo.preview}
                          alt={`Vista previa ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handlePhotosChange}
                  className="hidden"
                  disabled={formData.photos.length >= 3 || formData.isCompressing}
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    disabled={formData.photos.length >= 3 || formData.isCompressing}
                    className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${formData.photos.length >= 3 || formData.isCompressing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                      }`}
                  >
                    {formData.isCompressing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-b-transparent border-gray-500 rounded-full animate-spin mr-2"></div>
                        Comprimiendo...
                      </>
                    ) : (
                      <>
                        <Camera size={18} className="mr-2" />
                        Subir fotos
                      </>
                    )}
                  </button>

                  <span className="text-xs text-gray-500 self-center">
                    {formData.photos.length}/3 fotos • Máx. 5MB por foto
                  </span>
                </div>
              </div>

              {/* Nombre */}
              <div className="mb-6">
                <label htmlFor="customerName" className="block font-medium mb-2">Tu nombre:</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="¿Cómo te llamas?"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Mensaje de respuesta */}
              {formData.submitMessage && (
                <div className={`p-4 rounded-lg text-center mb-6 ${formData.submitMessage.includes('error') || formData.submitMessage.includes('Error')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
                  }`}>
                  {formData.submitMessage}
                </div>
              )}

              {/* Botón de envío */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={formData.isSubmitting || formData.isCompressing}
                  className={`px-6 py-3 rounded-lg ${formData.isSubmitting || formData.isCompressing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : formData.isReviewType === 'general'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white transition-colors'
                      : 'bg-yellow-500 hover:bg-yellow-600 transition-colors'
                    }`}
                >
                  {formData.isSubmitting ? 'Enviando...' :
                    formData.isCompressing ? 'Procesando imágenes...' :
                      'Enviar mi opinión'}
                </button>
              </div>
            </form>
          </div>

          {/* Botón para volver */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-yellow-600 hover:text-yellow-700"
            >
              <ArrowLeft size={16} className="mr-2" />
              Volver a la tienda
            </Link>
          </div>
        </div>
      </main>
     
    </>
  );
};

export default ReviewsPage;