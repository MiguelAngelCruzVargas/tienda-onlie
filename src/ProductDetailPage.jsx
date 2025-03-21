// src/ProductDetailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import Header from './Header';
import Footer from './Footer';
import { toast } from 'react-toastify';
import ProductCard from './components/ProductCard';
import ProductReviews from './components/ProductReviews';
import { API_BASE } from './utils/apiConfig';
const ProductDetailPage = ({ onCartOpen }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();

  // Referencias para scroll de pestañas
  const descriptionRef = useRef(null);
  const specsRef = useRef(null);
  const reviewsRef = useRef(null);

  // Estados para el producto y UI
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [imageZoomed, setImageZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [settings, setSettings] = useState({
    showRelatedProducts: true,
    showCTA: true,
    showSpecs: true,
    phoneNumber: '+5255123456789',
    whatsappNumber: '+5255123456789'
  });

  // Carga de datos del producto
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        //  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';;
        const response = await fetch(`${API_BASE}/api/products/${slug}`);

        if (!response.ok) {
          throw new Error(`Error al cargar el producto: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);

          // Si el producto ya está en el carrito, establecer esa cantidad
          if (data.product && isInCart(data.product.id)) {
            setQuantity(getItemQuantity(data.product.id));
          } else {
            setQuantity(1);
          }

          // Resetear la imagen activa cuando cambia el producto
          setActiveImage(0);
        } else {
          throw new Error(data.message || 'Error al cargar los datos del producto');
        }

        // Cargar configuración de la tienda para configurables
        try {
          const settingsResponse = await fetch(`${API_BASE}/api/settings/product-page`);
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json();
            if (settingsData.success) {
              setSettings(prevSettings => ({
                ...prevSettings,
                ...settingsData.settings
              }));
            }
          }
        } catch (settingsError) {
          console.warn('No se pudieron cargar las configuraciones:', settingsError);
        }


      } catch (err) {
        console.error('Error al cargar el producto:', err);
        setError(err.message || 'Ocurrió un error al cargar el producto');
      } finally {
        setLoading(false);
        // Scroll hacia arriba al cargar un nuevo producto
        window.scrollTo(0, 0);
      }
    };

    if (slug) {
      fetchProductData();
    }
  }, [slug, isInCart, getItemQuantity]);

  // Función para manejar la adición al carrito
  const handleAddToCart = () => {
    if (!product || product.inventory <= 0) return;

    addToCart(product, quantity, true);

    toast.success(
      <div className="flex items-center">
        <span className="font-medium">{product.name}</span>
        <span className="mx-2">añadido al carrito</span>
        <button
          onClick={() => {
            toast.dismiss();
            if (onCartOpen) onCartOpen();
          }}
          className="px-2 py-1 bg-yellow-500 text-black rounded ml-2 text-xs hover:bg-yellow-400"
        >
          Ver carrito
        </button>
      </div>,
      {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        className: "toast-with-button"
      }
    );
  };

  // Función para incrementar/decrementar cantidad
  const updateQuantity = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity > 0 && newQuantity <= (product?.inventory || 10)) {
      setQuantity(newQuantity);
    }
  };

  // Función para manejar el zoom de la imagen
  const handleImageMouseMove = (e) => {
    if (!imageZoomed) return;

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    setZoomPosition({ x, y });
  };

  // Función para manejar clic en las pestañas
  const handleTabClick = (tab) => {
    setActiveTab(tab);

    // Scroll a la sección correspondiente
    const refs = {
      description: descriptionRef,
      specs: specsRef,
      reviews: reviewsRef
    };

    if (refs[tab] && refs[tab].current) {
      refs[tab].current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Skeleton Loading UI
  if (loading) {
    return (
      <>
        <Header onCartOpen={onCartOpen} />
        <div className="min-h-screen bg-[#f9f9f9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Migas de pan skeleton */}
            <div className="flex items-center space-x-2 mb-8 animate-pulse">
              <div className="h-2 bg-gray-200 rounded w-12"></div>
              <div className="h-2 bg-gray-200 rounded w-2"></div>
              <div className="h-2 bg-gray-200 rounded w-16"></div>
              <div className="h-2 bg-gray-200 rounded w-2"></div>
              <div className="h-2 bg-gray-200 rounded w-24"></div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Skeleton galería de imágenes */}
              <div className="lg:w-3/5">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                  <div className="grid grid-cols-5 gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skeleton información del producto */}
              <div className="lg:w-2/5 space-y-6">
                <div className="rounded-xl bg-white p-6 shadow-sm space-y-6 animate-pulse">
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-10 bg-gray-200 rounded w-2/5"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  </div>

                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                  </div>

                  <div className="h-12 bg-gray-200 rounded"></div>

                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error UI
  if (error) {
    return (
      <>
        <Header onCartOpen={onCartOpen} />
        <div className="min-h-screen bg-[#f9f9f9] py-16">
          <div className="max-w-lg mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Producto no encontrado</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
                >
                  Volver
                </button>
                <Link
                  to="/"
                  className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors shadow-md"
                >
                  Ir al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Si no hay producto, mostrar mensaje
  if (!product) {
    return (
      <>
        <Header onCartOpen={onCartOpen} />
        <div className="min-h-screen bg-[#f9f9f9] py-16">
          <div className="max-w-lg mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Sin información</h3>
              <p className="text-gray-600 mb-6">No se encontró información para el producto solicitado.</p>
              <Link
                to="/productos"
                className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors shadow-md inline-block"
              >
                Ver otros productos
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Extraer información del producto
  const {
    name,
    price,
    compareAtPrice,
    description,
    images = [],
    attributes = {},
    sku,
    inventory,
    category,
    tags = []
  } = product;

  // Asegurarse de que haya al menos una imagen (usar thumbnail si no hay imágenes)
  const productImages = images.length > 0 ? images : (product.thumbnail ? [product.thumbnail] : []);

  // Determinar el descuento si hay precio de comparación
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round((1 - (price / compareAtPrice)) * 100)
    : 0;

  // Obtener los atributos para mostrarlos en la ficha técnica
  const {
    diameter = 'N/A',
    width = 'N/A',
    material = 'N/A',
    color = 'N/A',
    boltPattern = 'N/A',
    offset = 'N/A',
    finish = 'N/A'
  } = attributes;

  // Verificar si el producto está en el carrito
  const productInCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);

  // Imagen principal con URL completa
  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    //  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';;
    return `${API_BASE}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  return (
    <>
      <Header onCartOpen={onCartOpen} />

      <main className="bg-[#f9f9f9] min-h-screen">
        {/* Migas de pan (Breadcrumbs) */}
        <nav className="border-b border-gray-200 bg-white py-3 sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-sm text-gray-500 flex items-center overflow-x-auto no-scrollbar whitespace-nowrap">
              <Link to="/" className="hover:text-yellow-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link to="/productos" className="hover:text-yellow-600 transition-colors">Productos</Link>
              {category && (
                <>
                  <span className="mx-2 text-gray-400">/</span>
                  <Link to={`/categoria/${category.slug}`} className="hover:text-yellow-600 transition-colors">{category.name}</Link>
                </>
              )}
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-800 font-medium truncate">{name}</span>
            </div>
          </div>
        </nav>

        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Lado izquierdo - Galería de imágenes */}
            <div className="lg:w-3/5">
              <div className="bg-white rounded-xl shadow-sm p-4 overflow-hidden">
                {/* Imagen principal con zoom */}
                <div
                  className="relative mb-4 rounded-lg overflow-hidden"
                  onMouseMove={handleImageMouseMove}
                  onMouseEnter={() => setImageZoomed(true)}
                  onMouseLeave={() => setImageZoomed(false)}
                >
                  {/* Etiqueta de descuento */}
                  {hasDiscount && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-1.5 px-3 rounded-full shadow-lg flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {discountPercent}% OFF
                      </div>
                    </div>
                  )}

                  {/* Insignia de inventario bajo */}
                  {inventory <= 3 && inventory > 0 && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-1.5 px-3 rounded-full shadow-lg flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        ¡Últimas unidades!
                      </div>
                    </div>
                  )}

                  {/* Contenedor de imagen con efecto zoom */}
                  <div className="aspect-square relative bg-white rounded-lg overflow-hidden group">
                    <img
                      src={getImageUrl(productImages[activeImage])}
                      alt={`${name} - Vista ${activeImage + 1}`}
                      className={`w-full h-full object-contain p-6 transition-transform duration-300 ${imageZoomed ? 'scale-150' : 'group-hover:scale-110'
                        }`}
                      style={
                        imageZoomed
                          ? {
                            transformOrigin: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`
                          }
                          : {}
                      }
                    />

                    {/* Instrucciones de zoom */}
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      {imageZoomed ? 'Moviendo el cursor para hacer zoom' : 'Pasa el cursor para hacer zoom'}
                    </div>

                    {/* Botón de vista completa */}
                    <button
                      className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all transform hover:scale-110"
                      onClick={() => window.open(getImageUrl(productImages[activeImage]), '_blank')}
                      aria-label="Ver imagen a tamaño completo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Miniaturas con diseño mejorado */}
                {productImages.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto py-2 no-scrollbar">
                    {productImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${activeImage === idx
                            ? 'ring-2 ring-yellow-500 shadow-md transform scale-105'
                            : 'ring-1 ring-gray-200 hover:ring-yellow-300'
                          }`}
                        aria-label={`Ver imagen ${idx + 1}`}
                      >
                        <img
                          src={getImageUrl(img)}
                          alt={`Miniatura ${idx + 1}`}
                          className="w-full h-full object-contain p-1"
                        />
                        {activeImage === idx && (
                          <div className="absolute inset-0 bg-yellow-500 bg-opacity-10"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lado derecho - Información del producto */}
            <div className="lg:w-2/5">
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                {/* Cabecera con categoría */}
                {category && (
                  <Link
                    to={`/categoria/${category.slug}`}
                    className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors mb-3"
                  >
                    {category.name}
                  </Link>
                )}

                {/* Nombre del producto */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{name}</h1>

                {/* SKU y disponibilidad */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                  {sku && (
                    <div className="inline-flex items-center">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">SKU: {sku}</span>
                    </div>
                  )}

                  <div className={`inline-flex items-center ${inventory > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${inventory > 0 ? 'bg-green-600' : 'bg-red-600'}`}></span>
                    {inventory > 0 ? `En stock (${inventory})` : 'Agotado'}
                  </div>
                </div>

                {/* Precio con diseño atractivo */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900 mr-3">
                      ${parseFloat(price).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {hasDiscount && (
                      <span className="text-lg text-gray-500 line-through">
                        ${parseFloat(compareAtPrice).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>

                  {hasDiscount && (
                    <div className="mt-2 flex">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-red-50 text-red-700 border border-red-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        Ahorras ${(compareAtPrice - price).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({discountPercent}%)
                      </span>
                    </div>
                  )}
                </div>

                {/* Descripción corta */}
                <div className="mb-6">
                  <div className={`text-gray-700 text-sm leading-relaxed ${!showFullDescription && 'line-clamp-3'}`}>
                    {description}
                  </div>
                  {description && description.length > 150 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-2 text-yellow-600 hover:text-yellow-700 text-sm font-medium focus:outline-none flex items-center"
                    >
                      {showFullDescription ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                          Mostrar menos
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Leer más
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Selector de cantidad y botón de agregar al carrito */}
                <div className="mb-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">Cantidad:</span>
                      {inventory > 0 && (
                        <span className="text-sm text-gray-500">
                          {inventory <= 10 ? `Solo quedan ${inventory}` : 'Disponible'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Selector de cantidad con diseño moderno */}
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateQuantity(-1)}
                          disabled={quantity <= 1}
                          className="p-3 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <span className="w-12 text-center font-medium text-gray-700">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(1)}
                          disabled={quantity >= (inventory || 10)}
                          className="p-3 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      {/* Información adicional */}
                      {productInCart && (
                        <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md">
                          {cartQuantity} en carrito
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción en fila */}
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                    {/* Botón principal */}
                    <button
                      onClick={handleAddToCart}
                      disabled={inventory <= 0}
                      className={`
                        relative overflow-hidden py-3.5 px-4 rounded-xl font-bold flex items-center justify-center
                        transition-all duration-300 shadow-md hover:shadow-lg
                        ${inventory > 0
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:from-yellow-400 hover:to-yellow-300 transform hover:-translate-y-0.5'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      {/* Efecto hover */}
                      <span className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-50 transition-opacity duration-300"></span>

                      {/* Icono y texto */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      {productInCart ? 'Actualizar carrito' : (inventory > 0 ? 'Agregar al carrito' : 'Agotado')}

                      {/* Efecto de pulse/ping al añadir */}
                      {productInCart && (
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                      )}
                    </button>

                    {/* Botones de acciones adicionales */}
                    <div className="flex gap-3">
                      {/* Botón para compartir */}
                      <button
                        onClick={() => {
                          // Función configurable desde el panel de administración
                          if (navigator.share) {
                            navigator.share({
                              title: name,
                              text: `Mira este producto: ${name}`,
                              url: window.location.href,
                            }).catch((error) => console.log('Error al compartir', error));
                          } else {
                            // Copiar al portapapeles como fallback
                            navigator.clipboard.writeText(window.location.href);
                            toast.info('Enlace copiado al portapapeles');
                          }
                        }}
                        className="flex-1 py-3.5 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center justify-center font-medium transition-colors shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Compartir
                      </button>

                      {/* Botón de WhatsApp configurable */}
                      <a
                        href={`https://wa.me/${settings.whatsappNumber}?text=Hola, me interesa este producto: ${encodeURIComponent(`${name} - ${window.location.href}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3.5 px-4 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center justify-center font-medium transition-colors shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.345.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                        Consultar
                      </a>
                    </div>
                  </div>
                </div>

                {/* Especificaciones técnicas con estilo moderno */}
                {settings.showSpecs && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-base font-bold text-gray-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        Especificaciones Técnicas
                      </h3>
                    </div>
                    {/* Contenedor grid responsive para características */}
                    <div className="grid grid-cols-2 gap-0 text-sm divide-gray-200">
                      <div className="p-4 border-b border-r">
                        <span className="block text-gray-500 text-xs uppercase mb-1">DIÁMETRO</span>
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                          <p className="font-medium text-gray-900">{diameter}"</p>
                        </div>
                      </div>
                      <div className="p-4 border-b">
                        <span className="block text-gray-500 text-xs uppercase mb-1">ANCHO</span>
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                          <p className="font-medium text-gray-900">{width}" ancho</p>
                        </div>
                      </div>
                      <div className="p-4 border-b border-r">
                        <span className="block text-gray-500 text-xs uppercase mb-1">MATERIAL</span>
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                          <p className="font-medium text-gray-900">{material}</p>
                        </div>
                      </div>
                      <div className="p-4 border-b">
                        <span className="block text-gray-500 text-xs uppercase mb-1">COLOR</span>
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                          <p className="font-medium text-gray-900">{color}</p>
                        </div>
                      </div>
                      <div className="p-4 border-b border-r">
                        <span className="block text-gray-500 text-xs uppercase mb-1">PATRÓN DE TORNILLOS</span>
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                          <p className="font-medium text-gray-900">{boltPattern}</p>
                        </div>
                      </div>
                      <div className="p-4 border-b">
                        <span className="block text-gray-500 text-xs uppercase mb-1">OFFSET</span>
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                          <p className="font-medium text-gray-900">{offset}</p>
                        </div>
                      </div>
                      <div className="p-4 col-span-2">
                        <span className="block text-gray-500 text-xs uppercase mb-1">ACABADO</span>
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                          <p className="font-medium text-gray-900">{finish}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Etiquetas y metadatos */}
                {tags && tags.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Etiquetas:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, idx) => (
                        <Link
                          key={idx}
                          to={`/productos?tag=${encodeURIComponent(tag)}`}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <span className="w-1 h-1 bg-gray-500 rounded-full mr-1.5"></span>
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección para detalles adicionales - Pestañas con diseño moderno */}
        <div className="bg-white border-t border-gray-200 py-8 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Navegación de pestañas mejorada */}
            <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200 mb-6">
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base mr-8 ${activeTab === 'description'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } transition-colors`}
                onClick={() => handleTabClick('description')}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Descripción
                </div>
              </button>

              {settings.showSpecs && (
                <button
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base mr-8 ${activeTab === 'specs'
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } transition-colors`}
                  onClick={() => handleTabClick('specs')}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    Especificaciones
                  </div>
                </button>
              )}

              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base ${activeTab === 'reviews'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } transition-colors`}
                onClick={() => handleTabClick('reviews')}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                  Opiniones
                </div>
              </button>
            </div>

            {/* Contenido de pestañas */}
            <div>
              {/* Panel de descripción */}
              <div
                ref={descriptionRef}
                className={`transition-opacity duration-300 ${activeTab === 'description' ? 'block opacity-100' : 'hidden opacity-0'}`}
              >
                <div className="prose prose-yellow max-w-none">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Descripción del producto</h3>
                    <div className="text-gray-700 space-y-4">
                      <p>{description}</p>

                      {/* Contenido adicional de la descripción */}
                      <h4 className="text-lg font-semibold mt-6">Características principales</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Diámetro:</strong> {diameter}" - perfecto para vehículos de alta gama.</li>
                        <li><strong>Ancho:</strong> {width}" - diseñado para maximizar el agarre en la carretera.</li>
                        <li><strong>Material:</strong> {material} - ligero y resistente para un rendimiento óptimo.</li>
                        <li><strong>Acabado:</strong> {finish} - diseño elegante que mejora la apariencia de tu vehículo.</li>
                        <li><strong>Compatibilidad:</strong> Ideal para vehículos con patrón de tornillos {boltPattern}.</li>
                      </ul>

                      <p className="mt-4">
                        Los rines deportivos no solo mejoran la estética de tu vehículo, sino que también pueden mejorar
                        su rendimiento y manejo. El diseño especial permite una mejor disipación del calor de los frenos
                        y reduce el peso no suspendido del vehículo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de especificaciones */}
              <div
                ref={specsRef}
                className={`transition-opacity duration-300 ${activeTab === 'specs' ? 'block opacity-100' : 'hidden opacity-0'}`}
              >
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Especificaciones técnicas detalladas</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-2">Dimensiones</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span className="text-gray-600">Diámetro:</span>
                            <span className="font-semibold">{diameter}"</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Ancho:</span>
                            <span className="font-semibold">{width}"</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Offset:</span>
                            <span className="font-semibold">{offset}</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-2">Materiales</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span className="text-gray-600">Material principal:</span>
                            <span className="font-semibold">{material}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Acabado:</span>
                            <span className="font-semibold">{finish}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Color:</span>
                            <span className="font-semibold">{color}</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-2">Compatibilidad</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span className="text-gray-600">Patrón de tornillos:</span>
                            <span className="font-semibold">{boltPattern}</span>
                          </li>
                          <li className="flex justify-between">

                          </li>
                        </ul>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-2">Información adicional</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span className="text-gray-600">SKU:</span>
                            <span className="font-semibold font-mono">{sku}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Garantía:</span>
                            <span className="font-semibold">1 año contra defectos de fabricación</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Incluye:</span>
                            <span className="font-semibold">Solo rin, no incluye neumático</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de opiniones */}
              <div
                ref={reviewsRef}
                className={`transition-opacity duration-300 ${activeTab === 'reviews' ? 'block opacity-100' : 'hidden opacity-0'}`}
              >
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Opiniones de clientes</h3>
                  </div>

                  {/* Componente de reseñas de producto */}
                  <ProductReviews
                    productId={product.id}
                    productName={product.name}
                    productSKU={product.sku}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {settings.showRelatedProducts && relatedProducts && relatedProducts.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 relative inline-block">
                <span className="relative z-10">Productos Relacionados</span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400"></span>
              </h2>

              {/* Carrusel horizontal en móvil, grid en desktop */}
              <div className="relative">
                <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:gap-6">
                  {relatedProducts.map(relatedProduct => (
                    <div
                      key={relatedProduct.id}
                      className="flex-shrink-0 w-72 snap-start lg:w-auto"
                    >
                      <ProductCard
                        product={relatedProduct}
                        onAddToCart={(e) => {
                          e.preventDefault();
                          addToCart(relatedProduct, 1, true);
                          toast.success(`${relatedProduct.name} añadido al carrito`);
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Controles de navegación - solo para responsive */}
                <div className="lg:hidden">
                  <button
                    className="absolute top-1/2 -left-3 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg border border-gray-200 focus:outline-none hover:bg-gray-50"
                    onClick={() => {
                      // Lógica para scroll hacia la izquierda
                      const container = document.querySelector('.snap-x');
                      if (container) {
                        container.scrollBy({
                          left: -300,
                          behavior: 'smooth'
                        });
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg border border-gray-200 focus:outline-none hover:bg-gray-50"
                    onClick={() => {
                      // Lógica para scroll hacia la derecha
                      const container = document.querySelector('.snap-x');
                      if (container) {
                        container.scrollBy({
                          left: 300,
                          behavior: 'smooth'
                        });
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Banner de llamada a la acción configurable */}
        {settings.showCTA && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-12 relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 border border-white/30 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="text-center md:text-left mb-6 md:mb-0">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">¿No estás seguro si es compatible?</h2>
                    <p className="text-yellow-900 sm:text-lg max-w-2xl">
                      Nuestros expertos pueden ayudarte a encontrar los rines perfectos para tu vehículo.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href={`tel:${settings.phoneNumber}`}
                      className="inline-flex items-center justify-center px-6 py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors shadow-lg transform hover:-translate-y-0.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Llamar ahora
                    </a>
                    <a
                      href={`https://wa.me/${settings.whatsappNumber}?text=Hola, me interesa el rin ${name} (${sku}). ¿Es compatible con mi vehículo?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg transform hover:-translate-y-0.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.345.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Botón flotante para volver arriba */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-yellow-500 text-black shadow-lg hover:bg-yellow-400 transition-colors z-50 transform hover:scale-110"
        aria-label="Volver arriba"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Estilos globales */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          height: 0;
          width: 0;
        }
        
        .toast-with-button button:hover {
          background-color: #f59e0b;
        }
      `}</style>
    </>
  );
};

export default ProductDetailPage;