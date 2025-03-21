// // src/CartContext.jsx
// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// // Crear el contexto
// const CartContext = createContext();

// // Hook personalizado para usar el contexto
// export const useCart = () => {
//   return useContext(CartContext);
// };

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [totalPrice, setTotalPrice] = useState(0);
//   const [totalItems, setTotalItems] = useState(0);
//   const [showCartNotification, setShowCartNotification] = useState(false);
//   const [lastAddedItem, setLastAddedItem] = useState(null);

//   // Cargar el carrito desde localStorage al iniciar
//   useEffect(() => {
//     const loadCart = () => {
//       try {
//         const storedCart = localStorage.getItem('cart');
//         if (storedCart) {
//           const parsedCart = JSON.parse(storedCart);
          
//           // Validar cada item para evitar errores si la estructura ha cambiado
//           const validCart = Array.isArray(parsedCart) ? 
//             parsedCart.filter(item => 
//               item && 
//               typeof item === 'object' && 
//               item.id && 
//               typeof item.quantity === 'number'
//             ) : [];
            
//           setCartItems(validCart);
//         }
//       } catch (error) {
//         console.error('Error al cargar el carrito:', error);
//         // En caso de error, aseguramos que el carrito esté vacío
//         setCartItems([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadCart();
    
//     // Evento para sincronizar el carrito entre pestañas
//     const handleStorageChange = (e) => {
//       if (e.key === 'cart') {
//         loadCart();
//       }
//     };
    
//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // Actualizar localStorage cuando cambia el carrito
//   useEffect(() => {
//     try {
//       localStorage.setItem('cart', JSON.stringify(cartItems));
      
//       // Calcular totales
//       const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
//       const totalAmount = cartItems.reduce((total, item) => {
//         // Verificar si hay precio de descuento y usarlo si está disponible
//         const itemPrice = item.compareAtPrice && item.compareAtPrice < item.price 
//           ? item.compareAtPrice
//           : item.price;
//         return total + (itemPrice * item.quantity);
//       }, 0);
      
//       setTotalItems(itemCount);
//       setTotalPrice(totalAmount);
      
//       // Disparar evento para otros componentes que necesiten saber cuando cambia el carrito
//       const event = new CustomEvent('cartUpdated', {
//         detail: { items: cartItems, count: itemCount, total: totalAmount }
//       });
//       window.dispatchEvent(event);
//     } catch (error) {
//       console.error('Error al guardar el carrito:', error);
//     }
//   }, [cartItems]);

//   // Mostrar notificación temporal cuando se añade un producto
//   const showAddedNotification = useCallback((product) => {
//     setLastAddedItem(product);
//     setShowCartNotification(true);
    
//     // Ocultar la notificación después de 3 segundos
//     setTimeout(() => {
//       setShowCartNotification(false);
//     }, 3000);
//   }, []);

//   // Añadir un producto al carrito
//   const addToCart = useCallback((product, quantity = 1, showNotification = true) => {
//     if (!product || !product.id) {
//       console.error('Producto inválido:', product);
//       return;
//     }
    
//     setCartItems(currentItems => {
//       // Verificar si el producto ya está en el carrito
//       const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
      
//       let newCartItems;
//       if (existingItemIndex > -1) {
//         // Producto existente, actualizar cantidad
//         newCartItems = [...currentItems];
//         newCartItems[existingItemIndex] = {
//           ...newCartItems[existingItemIndex],
//           quantity: newCartItems[existingItemIndex].quantity + quantity
//         };
//       } else {
//         // Nuevo producto, añadir al carrito con propiedades esenciales
//         const newItem = {
//           id: product.id,
//           name: product.name,
//           price: product.price,
//           compareAtPrice: product.compareAtPrice,
//           thumbnail: product.thumbnail || product.images?.[0] || '',
//           slug: product.slug,
//           quantity
//         };
//         newCartItems = [...currentItems, newItem];
//       }
      
//       // Mostrar notificación si se solicita
//       if (showNotification) {
//         showAddedNotification(product);
//       }
      
//       return newCartItems;
//     });
//   }, [showAddedNotification]);

//   // Remover un producto del carrito
//   const removeFromCart = useCallback((productId) => {
//     setCartItems(currentItems => 
//       currentItems.filter(item => item.id !== productId)
//     );
//   }, []);

//   // Actualizar la cantidad de un producto
//   const updateQuantity = useCallback((productId, quantity) => {
//     if (quantity <= 0) {
//       removeFromCart(productId);
//       return;
//     }
    
//     setCartItems(currentItems => 
//       currentItems.map(item => 
//         item.id === productId ? { ...item, quantity } : item
//       )
//     );
//   }, [removeFromCart]);

//   // Limpiar el carrito
//   const clearCart = useCallback(() => {
//     setCartItems([]);
//   }, []);
  
//   // Verificar si un producto está en el carrito
//   const isInCart = useCallback((productId) => {
//     return cartItems.some(item => item.id === productId);
//   }, [cartItems]);
  
//   // Obtener la cantidad de un producto en el carrito
//   const getItemQuantity = useCallback((productId) => {
//     const item = cartItems.find(item => item.id === productId);
//     return item ? item.quantity : 0;
//   }, [cartItems]);

//   // Valor que proporcionará el contexto
//   const value = {
//     cartItems,
//     loading,
//     totalPrice,
//     totalItems,
//     lastAddedItem,
//     showCartNotification,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     clearCart,
//     isInCart,
//     getItemQuantity
//   };

//   return (
//     <CartContext.Provider value={value}>
//       {children}
//     </CartContext.Provider>
//   );
// };

// export default CartProvider;

// src/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useCustomerAuth } from './CustomerAuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Crear el contexto
const CartContext = createContext();

// Hook personalizado para usar el contexto
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const { isAuthenticated, customerData } = useCustomerAuth();
  const navigate = useNavigate();

  // Cargar el carrito cuando cambia el estado de autenticación
  useEffect(() => {
    const loadCart = () => {
      try {
        setLoading(true);
        
        // Definir la clave del carrito basada en si el usuario está autenticado
        const cartKey = isAuthenticated && customerData?.id 
          ? `cart_customer_${customerData.id}` 
          : 'cart_guest';
        
        console.log(`Cargando carrito con clave: ${cartKey}`);
        const storedCart = localStorage.getItem(cartKey);
        
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          
          // Validar cada item para evitar errores
          const validCart = Array.isArray(parsedCart) ? 
            parsedCart.filter(item => 
              item && 
              typeof item === 'object' && 
              item.id && 
              typeof item.quantity === 'number'
            ) : [];
            
          setCartItems(validCart);
          console.log(`Carrito cargado - ${validCart.length} productos`);
        } else {
          setCartItems([]);
          console.log('No se encontró ningún carrito guardado');
        }
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    // Cuando un usuario inicia sesión, intentar fusionar el carrito de invitado con su carrito
    const mergeGuestCartIfNeeded = () => {
      // Solo proceder si el usuario ha iniciado sesión
      if (isAuthenticated && customerData?.id) {
        try {
          const guestCartKey = 'cart_guest';
          const userCartKey = `cart_customer_${customerData.id}`;
          
          // Obtener el carrito de invitado
          const guestCartStr = localStorage.getItem(guestCartKey);
          if (!guestCartStr) return; // No hay carrito de invitado para fusionar
          
          const guestCart = JSON.parse(guestCartStr);
          if (!Array.isArray(guestCart) || guestCart.length === 0) return;
          
          // Obtener el carrito del usuario
          const userCartStr = localStorage.getItem(userCartKey);
          const userCart = userCartStr ? JSON.parse(userCartStr) : [];
          
          // Fusionar los carritos
          const mergedCart = [...userCart];
          
          guestCart.forEach(guestItem => {
            const existingIndex = mergedCart.findIndex(item => item.id === guestItem.id);
            
            if (existingIndex >= 0) {
              // Si el producto ya existe, sumar las cantidades
              mergedCart[existingIndex] = {
                ...mergedCart[existingIndex],
                quantity: mergedCart[existingIndex].quantity + guestItem.quantity
              };
            } else {
              // Si es un producto nuevo, añadirlo
              mergedCart.push(guestItem);
            }
          });
          
          // Guardar el carrito fusionado
          localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
          
          // Limpiar el carrito de invitado
          localStorage.removeItem(guestCartKey);
          
          // Actualizar el estado del carrito
          setCartItems(mergedCart);
          
          console.log('Carrito de invitado fusionado con carrito de usuario');
        } catch (error) {
          console.error('Error al fusionar carritos:', error);
        }
      }
    };

    // Primero intentar fusionar, luego cargar el carrito
    mergeGuestCartIfNeeded();
    loadCart();
    
  }, [isAuthenticated, customerData]);

  // Mostrar notificación temporal cuando se añade un producto
  const showAddedNotification = useCallback((product) => {
    setLastAddedItem(product);
    setShowCartNotification(true);
    
    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      setShowCartNotification(false);
    }, 3000);
  }, []);

  // Añadir un producto al carrito
  const addToCart = useCallback((product, quantity = 1, showNotification = true) => {
    if (!product || !product.id) {
      console.error('Producto inválido:', product);
      return;
    }
    
    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      // Guardar el intento de agregar al carrito en sessionStorage para retomarlo después del login
      sessionStorage.setItem('pendingCartAddition', JSON.stringify({ 
        productId: product.id, 
        quantity,
        productData: product, // Guardar los datos completos del producto
        redirect: window.location.pathname 
      }));
      
      // Mostrar mensaje y redirigir al login
      toast.info('Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }
    
    setCartItems(currentItems => {
      // Verificar si el producto ya está en el carrito
      const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
      
      let newCartItems;
      if (existingItemIndex > -1) {
        // Producto existente, actualizar cantidad
        newCartItems = [...currentItems];
        newCartItems[existingItemIndex] = {
          ...newCartItems[existingItemIndex],
          quantity: newCartItems[existingItemIndex].quantity + quantity
        };
      } else {
        // Nuevo producto, añadir al carrito con propiedades esenciales
        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          thumbnail: product.thumbnail || product.images?.[0] || '',
          slug: product.slug,
          quantity
        };
        newCartItems = [...currentItems, newItem];
      }
      
      // Mostrar notificación si se solicita
      if (showNotification) {
        showAddedNotification(product);
      }
      
      return newCartItems;
    });
  }, [isAuthenticated, navigate, showAddedNotification]);

  // Verificar si hay un intento de agregar al carrito pendiente después de login exitoso
  useEffect(() => {
    if (isAuthenticated && customerData?.id) {
      const pendingCartAddition = sessionStorage.getItem('pendingCartAddition');
      if (pendingCartAddition) {
        try {
          const { productId, quantity, productData, redirect } = JSON.parse(pendingCartAddition);
          
          // Si tenemos los datos completos del producto, lo agregamos
          if (productData) {
            setCartItems(currentItems => {
              const existingItemIndex = currentItems.findIndex(item => item.id === productData.id);
              
              let newCartItems;
              if (existingItemIndex > -1) {
                newCartItems = [...currentItems];
                newCartItems[existingItemIndex] = {
                  ...newCartItems[existingItemIndex],
                  quantity: newCartItems[existingItemIndex].quantity + quantity
                };
              } else {
                const newItem = {
                  id: productData.id,
                  name: productData.name,
                  price: productData.price,
                  compareAtPrice: productData.compareAtPrice,
                  thumbnail: productData.thumbnail || productData.images?.[0] || '',
                  slug: productData.slug,
                  quantity
                };
                newCartItems = [...currentItems, newItem];
              }
              
              showAddedNotification(productData);
              return newCartItems;
            });
          }
          
          // Limpiar la sesión
          sessionStorage.removeItem('pendingCartAddition');
          
          // Mostrar mensaje de éxito
          toast.success('Producto agregado al carrito');
          
          // Redirigir a la página original si está disponible
          if (redirect && redirect !== '/login' && redirect !== '/registro') {
            navigate(redirect);
          }
        } catch (error) {
          console.error('Error al procesar la adición pendiente al carrito:', error);
        }
      }
      
      // Verificar si hay un checkout pendiente
      const pendingCheckout = sessionStorage.getItem('pendingCheckout');
      if (pendingCheckout) {
        sessionStorage.removeItem('pendingCheckout');
        navigate('/checkout');
      }
    }
  }, [isAuthenticated, customerData, navigate, showAddedNotification]);

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    // No guardar durante la carga inicial para evitar sobrescribir
    if (loading) return;
    
    try {
      const cartKey = isAuthenticated && customerData?.id 
        ? `cart_customer_${customerData.id}` 
        : 'cart_guest';
      
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
      console.log(`Carrito guardado en localStorage con clave ${cartKey}`);
      
      // Calcular totales
      const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
      const totalAmount = cartItems.reduce((total, item) => {
        const itemPrice = item.compareAtPrice && item.compareAtPrice < item.price 
          ? item.compareAtPrice
          : item.price;
        return total + (itemPrice * item.quantity);
      }, 0);
      
      setTotalItems(itemCount);
      setTotalPrice(totalAmount);
      
      // Disparar evento para otros componentes
      const event = new CustomEvent('cartUpdated', {
        detail: { items: cartItems, count: itemCount, total: totalAmount }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error al guardar el carrito:', error);
    }
  }, [cartItems, isAuthenticated, customerData, loading]);

  // Remover un producto del carrito
  const removeFromCart = useCallback((productId) => {
    setCartItems(currentItems => 
      currentItems.filter(item => item.id !== productId)
    );
  }, []);

  // Actualizar la cantidad de un producto
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(currentItems => 
      currentItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  // Limpiar el carrito
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);
  
  // Verificar si un producto está en el carrito
  const isInCart = useCallback((productId) => {
    return cartItems.some(item => item.id === productId);
  }, [cartItems]);
  
  // Obtener la cantidad de un producto en el carrito
  const getItemQuantity = useCallback((productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  // Procesar compra (requiere autenticación)
  const checkout = useCallback(() => {
    if (!isAuthenticated) {
      toast.info('Debes iniciar sesión para completar la compra');
      // Guardar la información del carrito para continuar después del login
      sessionStorage.setItem('pendingCheckout', 'true');
      navigate('/login');
      return false;
    }
    
    // Aquí iría la lógica para procesar la compra
    return true;
  }, [isAuthenticated, navigate]);

  // Valor que proporcionará el contexto
  const value = {
    cartItems,
    loading,
    totalPrice,
    totalItems,
    lastAddedItem,
    showCartNotification,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    checkout,
    isAuthenticated
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;