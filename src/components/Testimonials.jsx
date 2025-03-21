import React, { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../utils/apiConfig';

const Testimonials = ({ limit = 3, showViewAll = true }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el formulario de nuevo testimonio
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Cargar testimonios al montar el componente
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true);
     
        const response = await fetch(`${API_BASE}/api/reviews?status=approved&limit=${limit}`);
        const data = await response.json();
        
        if (data.success) {
          setTestimonials(data.reviews || []);
        } else {
          setError('No se pudieron cargar los testimonios');
        }
      } catch (error) {
        console.error('Error al cargar testimonios:', error);
        setError('Ocurrió un error al cargar los testimonios');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, [limit]);

  // Lógica de envío de testimonio
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (rating === 0) {
      setSubmitMessage('Por favor, selecciona una calificación');
      return;
    }
    
    if (comment.trim().length < 10) {
      setSubmitMessage('El comentario debe tener al menos 10 caracteres');
      return;
    }
    
    if (customerName.trim().length === 0) {
      setSubmitMessage('Por favor, ingresa tu nombre');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitMessage('');

    
      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating,
          comment,
          customerName,
          productId: null // Testimonio general de la tienda
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage(data.message || 'Gracias por tu testimonio. Será revisado pronto.');
        // Limpiar formulario
        setRating(0);
        setComment('');
        setCustomerName('');
        
        // Opcionalmente, actualizar lista de testimonios si la reseña fue aprobada automáticamente
        if (data.review && data.review.status === 'approved') {
          setTestimonials([...testimonials, data.review]);
        }
      } else {
        setSubmitMessage(data.message || 'Hubo un error al enviar tu testimonio');
      }
    } catch (error) {
      console.error('Error al enviar testimonio:', error);
      setSubmitMessage('No se pudo enviar el testimonio. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizado de estrellas
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-500' : 'text-gray-300'}`}
        fill={index < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Sección de Testimonios */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center md:text-left">
            Testimonios de Clientes
          </h2>
          
          {isLoading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              <p className="mt-2">Cargando testimonios...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : testimonials.length === 0 ? (
            <div className="text-center text-gray-600">
              Aún no hay testimonios disponibles
            </div>
          ) : (
            <div className="space-y-6">
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  <p className="text-gray-600 italic mb-4">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center">
                    <div>
                      <h3 className="font-semibold">
                        {testimonial.customerName || testimonial.user?.name || 'Cliente Anónimo'}
                      </h3>
                      {testimonial.product && (
                        <p className="text-sm text-gray-500">
                          Compró: {testimonial.product.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {showViewAll && testimonials.length > 0 && (
            <div className="text-center mt-6">
              <Link 
                to="/opiniones" 
                className="inline-flex items-center text-yellow-600 hover:text-yellow-700 font-medium"
              >
                Ver todas las opiniones
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Sección de Crear Testimonio */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center md:text-left">
            Comparte tu Experiencia
          </h2>
          <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-4 text-gray-700 font-semibold">
                  Califica tu experiencia
                </label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-8 h-8 sm:w-10 sm:h-10 cursor-pointer transition-all duration-300 transform hover:scale-110 ${
                        star <= rating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                      fill={star <= rating ? 'currentColor' : 'none'}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center mt-2 text-sm text-gray-600">
                    {rating === 5 ? 'Excelente' : 
                     rating === 4 ? 'Muy bueno' : 
                     rating === 3 ? 'Bueno' : 
                     rating === 2 ? 'Regular' : 'Necesitamos mejorar'}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="comment" className="block mb-2 text-gray-700 font-semibold">
                  Tu comentario
                </label>
                <textarea
                  id="comment"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  placeholder="Comparte detalles de tu experiencia..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>

              <div>
                <label htmlFor="name" className="block mb-2 text-gray-700 font-semibold">
                  Tu nombre
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="¿Cómo te llamas?"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              {submitMessage && (
                <div className={`p-4 rounded-lg text-center text-sm ${
                  submitMessage.includes('error') 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {submitMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg transition-all duration-300 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-yellow-500 hover:bg-yellow-600 text-black hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Testimonio
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;