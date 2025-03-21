// src/AccessDenied.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AccessDenied = () => {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-red-600 p-6">
          <div className="flex justify-center">
            <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-white">
            Acceso Denegado
          </h2>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            No tienes los permisos necesarios para acceder a esta sección. Esta área está reservada para administradores.
          </p>
          
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ir a la página principal
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cerrar sesión e iniciar con otra cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;