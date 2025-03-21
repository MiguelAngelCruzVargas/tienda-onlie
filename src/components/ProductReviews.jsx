// src/components/ProductReviews.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Star, Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { API_BASE } from '../utils/apiConfig';

const ProductReviews = ({ productId, productName, productSKU }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: {}
  });

  // Estado para manejo de paginación
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    customerName: '',
    isSubmitting: false,
    isCompressing: false, // Nuevo estado para compresión
    submitMessage: '',
    photos: []
  });

  // Referencia para el input de tipo file
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchReviews();
  }, [productId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
     
      let url = `${API_BASE}/api/reviews?page=${page}&limit=5`;

      // Filtrar por producto
      if (productId) {
        url += `&productId=${productId}`;
      }

      // Ordenamiento
      url += '&sort=createdAt&order=DESC';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Si es la primera página, reemplazar los datos, si no, agregar
        if (page === 1) {
          setReviews(data.reviews);
        } else {
          setReviews(prev => [...prev, ...data.reviews]);
        }

        setHasMore(data.hasNextPage);

        // Calcular estadísticas si es la primera página
        if (page === 1) {
          const tempStats = {
            total: data.count,
            average: data.averageRating || 0,
            distribution: data.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          };

          setStats(tempStats);
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

  // Función para comprimir imágenes antes de convertirlas a base64
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

  // Manejo de selección de fotos (actualizado con compresión)
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

  // Eliminar una foto
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

    const { rating, comment, customerName, photos } = formData;

    // Validaciones
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

    

      // Usar las imágenes ya comprimidas
      const photoList = photos.map(photo => photo.compressedData);

      // Preparar datos para la reseña específica del producto
      const reviewData = {
        rating: Number(rating),
        comment,
        customerName,
        productId: productId || null,
        productName: productName || null,
        productSKU: productSKU || null
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

  return (
    <div className="space-y-8">
      {/* Estadísticas generales de reseñas */}
      {stats.total > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
            <div className="mb-6 md:mb-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-gray-900 mb-1">{stats.average}</div>
              <div className="flex mb-2">
                {renderStars(Math.round(stats.average))}
              </div>
              <div className="text-gray-500 text-sm">{stats.total} opiniones</div>
            </div>

            <div className="flex-1">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.distribution[star] || 0;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                  return (
                    <div key={star} className="flex items-center">
                      <div className="flex items-center w-16">
                        <span className="text-sm font-medium text-gray-700 mr-2">{star}</span>
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
                        <div
                          className="bg-yellow-500 h-2.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-500 w-16 text-right">
                        {count} ({Math.round(percentage)}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario para dejar opinión */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Deja tu opinión sobre este producto</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos del producto (destacados claramente) */}
          <div className="bg-blue-50 p-4 rounded-lg text-sm border border-blue-100">
            <p className="font-medium text-gray-700">Estás escribiendo una reseña para:</p>
            <p className="text-blue-900 font-semibold text-lg">{productName}</p>
            {productSKU && <p className="text-gray-500 text-xs">SKU: {productSKU}</p>}
          </div>

          {/* Calificación con estrellas */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">Califica este producto:</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => handleRatingChange(star)}
                  className="p-2 focus:outline-none"
                >
                  <Star
                    size={28}
                    className={`cursor-pointer transition-colors ${star <= formData.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300 hover:text-yellow-400'
                      }`}
                  />
                </button>
              ))}
            </div>
            {formData.rating > 0 && (
              <p className="mt-1 text-sm text-gray-600">
                {formData.rating === 5 ? 'Excelente' :
                  formData.rating === 4 ? 'Muy bueno' :
                    formData.rating === 3 ? 'Bueno' :
                      formData.rating === 2 ? 'Regular' : 'Necesita mejorar'}
              </p>
            )}
          </div>

          {/* Comentario */}
          <div>
            <label htmlFor="comment" className="block font-medium mb-2 text-gray-700">Tu comentario:</label>
            <textarea
              id="comment"
              name="comment"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="¿Qué te gustó o disgustó? ¿Para qué usas este producto?"
              value={formData.comment}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="customerName" className="block font-medium mb-2 text-gray-700">Tu nombre:</label>
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

          {/* Subida de fotos - ACTUALIZADO */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">Añade fotos (opcional):</label>

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

          {/* Mensaje de respuesta */}
          {formData.submitMessage && (
            <div className={`p-4 rounded-lg ${formData.submitMessage.includes('error') || formData.submitMessage.includes('Error')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
              }`}>
              {formData.submitMessage}
            </div>
          )}

          {/* Botón de envío */}
          <div>
            <button
              type="submit"
              disabled={formData.isSubmitting || formData.isCompressing}
              className={`px-6 py-3 rounded-lg font-medium ${formData.isSubmitting || formData.isCompressing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600 transition-colors'
                }`}
            >
              {formData.isSubmitting ? 'Enviando...' : 'Enviar mi opinión'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de opiniones */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Opiniones de otros clientes</h3>

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
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            <p className="text-gray-500 mb-4">Aún no hay opiniones para este producto</p>
            <p className="text-gray-600">¡Sé el primero en compartir tu experiencia!</p>
          </div>
        ) : (
          <>
            {reviews.map(review => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500 border-x border-b transition-all duration-300 hover:shadow-md"
              >
                {/* Identificador claro del producto */}
                <div className="mb-3 bg-blue-50 rounded p-2 flex items-center text-sm text-blue-700">
                  <ImageIcon size={16} className="mr-2" />
                  <span>Reseña sobre: <span className="font-semibold">{review.productName || productName}</span></span>
                </div>

                <div className="flex justify-between items-start mb-3">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                </div>

                <p className="text-gray-700 mb-4">{review.comment}</p>

                {/* Mostrar fotos si existen */}
                {review.photos && Array.isArray(review.photos) && review.photos.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Fotos del cliente:</p>
                    <div className="flex flex-wrap gap-2">
                      {review.photos.map((photo, index) => (
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
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm mr-2">
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Compra verificada
                    </div>
                  )}
                </div>

                {review.adminResponse && (
                  <div className="mt-3 pt-3 border-t border-gray-100 bg-blue-50 p-3 rounded text-sm">
                    <p className="font-bold text-blue-700 mb-1">Respuesta de la tienda:</p>
                    <p className="text-gray-700">{review.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Botón "Cargar más" */}
            {hasMore && (
              <div className="text-center">
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
      </div>
    </div>
  );
};

export default ProductReviews;