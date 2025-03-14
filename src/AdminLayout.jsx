// src/AdminLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminLayout = ({ children, activeRoute }) => {
  return (
    <div className="flex">
      <div className="w-64 bg-gray-800 min-h-screen text-white p-4">
        <h2 className="text-xl font-bold mb-6">Panel Admin</h2>
        <nav className="space-y-2">
          <Link 
            to="/admin/dashboard" 
            className={`block py-2 px-4 rounded ${activeRoute === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            Dashboard
          </Link>
          <Link 
            to="/admin/productos" 
            className={`block py-2 px-4 rounded ${activeRoute === 'productos' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            Productos
          </Link>
          <Link 
            to="/admin/pedidos" 
            className={`block py-2 px-4 rounded ${activeRoute === 'pedidos' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            Pedidos
          </Link>
          <Link 
            to="/admin/estadisticas" 
            className={`block py-2 px-4 rounded ${activeRoute === 'estadisticas' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            Estadísticas
          </Link>
          <Link 
            to="/admin/configuracion" 
            className={`block py-2 px-4 rounded ${activeRoute === 'configuracion' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            Configuración
          </Link>
          <Link to="/" className="block py-2 px-4 hover:bg-gray-700 rounded mt-12">
            Ver Tienda
          </Link>
          <Link to="/admin" className="block py-2 px-4 hover:bg-gray-700 rounded text-red-300">
            Cerrar Sesión
          </Link>
        </nav>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;