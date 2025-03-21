// src/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  
  // Si todavía está cargando, mostrar un indicador de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }
  
  // Si no hay usuario autenticado, redirigir al login
  if (!currentUser) {
    return <Navigate to="/admin" replace />;
  }
  
  // Si hay un usuario autenticado pero no es admin, redirigir a acceso denegado
  if (currentUser.role !== 'admin') {
    return <Navigate to="/acceso-denegado" replace />;
  }
  
  // Si hay un usuario admin autenticado, mostrar la ruta protegida
  return children;
};

export default ProtectedRoute;