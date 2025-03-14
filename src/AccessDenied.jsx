// src/AccessDenied.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AccessDenied = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
        <p className="text-gray-600 mb-6">
          No tienes permiso para acceder a esta página. Por favor, contacta con el administrador si crees que esto es un error.
        </p>
        <div className="flex flex-col space-y-3">
          <Link 
            to="/" 
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Volver a la tienda
          </Link>
          <button 
            onClick={logout} 
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;