// src/CustomerAuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const CustomerAuthContext = createContext();

export const useCustomerAuth = () => useContext(CustomerAuthContext);

export const CustomerAuthProvider = ({ children }) => {
  const [customerToken, setCustomerToken] = useState(localStorage.getItem('customerToken'));
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar token al cargar
  useEffect(() => {
    const validateToken = async () => {
      if (customerToken) {
        try {
          // Configurar el token en los headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${customerToken}`;
          
          // Obtener datos del perfil
          const response = await axios.get('/api/customers/profile');
          setCustomerData(response.data.customer);
        } catch (error) {
          console.error('Error al validar token:', error);
          // Si hay error, eliminar el token
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    validateToken();
  }, [customerToken]);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/customers/login', { email, password });
      const { token, customer } = response.data;
      
      // Guardar token en localStorage
      localStorage.setItem('customerToken', token);
      
      // Actualizar estado
      setCustomerToken(token);
      setCustomerData(customer);
      
      // Configurar token en los headers para futuras peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };

  // Función para registrarse
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/customers/register', userData);
      const { token, customer } = response.data;
      
      // Guardar token en localStorage
      localStorage.setItem('customerToken', token);
      
      // Actualizar estado
      setCustomerToken(token);
      setCustomerData(customer);
      
      // Configurar token en los headers para futuras peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
    } catch (error) {
      console.error('Error de registro:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al registrarse' 
      };
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Eliminar token del localStorage
    localStorage.removeItem('customerToken');
    
    // Limpiar estado
    setCustomerToken(null);
    setCustomerData(null);
    
    // Eliminar token de los headers
    delete axios.defaults.headers.common['Authorization'];
  };

  // Verificar si el cliente está autenticado
  const isAuthenticated = !!customerToken && !!customerData;

  return (
    <CustomerAuthContext.Provider
      value={{
        customerToken,
        customerData,
        loading,
        login,
        register,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};