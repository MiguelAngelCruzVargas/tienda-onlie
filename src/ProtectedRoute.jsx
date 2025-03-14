// src/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const ProtectedRoute = ({ children, requiredRole = 'admin' }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Verificar si el usuario está autenticado
  if (!currentUser) {
    // Redirigir al login si no está autenticado, guardando la ubicación actual
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  // Verificar si el usuario tiene el rol requerido
  if (requiredRole && currentUser.role !== requiredRole) {
    // Redirigir a una página de acceso denegado
    return <Navigate to="/acceso-denegado" replace />;
  }

  // Usuario autenticado con el rol correcto
  return children;
};

export default ProtectedRoute;