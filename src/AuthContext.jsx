import React, { createContext, useState, useContext, useEffect } from 'react';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para iniciar sesión
  const login = async (credentials) => {
    try {
      // Configuración de URL base con manejo más robusto
      const API_BASE = import.meta.env.DEV 
        ? import.meta.env.VITE_API_URL || 'http://localhost:3000'
        : '';
      
      // Configuración de timeout para manejar conexiones fallidas
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
      
      try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          }),
          credentials: 'include' // Este es el cambio importante
        });
        clearTimeout(timeoutId);

        // Manejo de respuestas no exitosas
        if (!response.ok) {
          console.error(`Error HTTP: ${response.status} ${response.statusText}`);
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error de servidor: ${response.status}`);
        }

        const data = await response.json();

        if (data.token) {
          // Guardar token en localStorage
          localStorage.setItem('token', data.token);
          
          // Guardar información del usuario
          const user = {
            id: data.user?.id || 1,
            name: data.user?.name || 'Admin',
            email: data.user?.email || credentials.email,
            role: data.user?.role || 'admin'
          };
          
          localStorage.setItem('user', JSON.stringify(user));
          
          setCurrentUser(user);
          setIsAuthenticated(true);
          return { success: true };
        } else {
          return { 
            success: false, 
            message: data.message || 'Credenciales inválidas' 
          };
        }
      } catch (fetchError) {
        // Manejo específico de errores de conexión
        if (fetchError.name === 'AbortError') {
          console.error('La solicitud excedió el tiempo de espera');
          return {
            success: false,
            message: 'El servidor no responde. Por favor, verifica tu conexión.'
          };
        }

        // Error de red
        if (fetchError.message === 'Failed to fetch') {
          console.error('Error de conexión: El servidor no está disponible');
          return {
            success: false,
            message: 'No se puede conectar con el servidor. Verifica que esté funcionando.'
          };
        }

        // Otros errores de red
        console.error('Error de red:', fetchError);
        return {
          success: false,
          message: 'Error de red. Por favor, intenta de nuevo más tarde.'
        };
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      return { 
        success: false, 
        message: 'Error inesperado. Por favor, intenta de nuevo.' 
      };
    }
  };

  // Resto del código permanece igual...
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Verificar si hay un usuario en localStorage al cargar
  useEffect(() => {
    const checkUser = () => {
      try {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        
        if (token && userString) {
          const user = JSON.parse(userString);
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, []);

  // Valores que estarán disponibles en el contexto
  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};