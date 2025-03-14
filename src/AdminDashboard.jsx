// src/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    visitors: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función para cargar datos de estadísticas desde el backend
    const fetchStats = async () => {
      try {
        // Aquí irá la llamada a la API para obtener las estadísticas
        // Ejemplo: const response = await fetch('api/dashboard/stats');
        // const data = await response.json();
        // setStats(data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las estadísticas');
        setLoading(false);
        console.error('Error al cargar estadísticas:', err);
      }
    };

    // Función para cargar pedidos recientes desde el backend
    const fetchRecentOrders = async () => {
      try {
        // Aquí irá la llamada a la API para obtener los pedidos recientes
        // Ejemplo: const response = await fetch('api/orders/recent');
        // const data = await response.json();
        // setRecentOrders(data);
      } catch (err) {
        console.error('Error al cargar pedidos recientes:', err);
      }
    };

    fetchStats();
    fetchRecentOrders();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-center">
          <div className="spinner-border text-indigo-600" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
      
      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Productos Totales</div>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Pedidos</div>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <div className="text-sm text-orange-500">{stats.pendingOrders} pendientes</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Ingresos</div>
          <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Visitantes</div>
          <div className="text-2xl font-bold">{stats.visitors}</div>
        </div>
      </div>
      
      {/* Enlaces rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/admin/productos/nuevo" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold mb-2">Añadir Producto</h2>
          <p className="text-gray-500">Sube nuevos productos a la tienda</p>
        </Link>
        <Link to="/admin/pedidos" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold mb-2">Gestionar Pedidos</h2>
          <p className="text-gray-500">Ver y actualizar el estado de los pedidos</p>
        </Link>
        <Link to="/admin/estadisticas" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold mb-2">Estadísticas Detalladas</h2>
          <p className="text-gray-500">Analiza el rendimiento de tu tienda</p>
        </Link>
      </div>
      
      {/* Órdenes recientes */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Pedidos Recientes</h2>
        
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.total.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {order.status === 'pending' ? 'Pendiente' : 
                          order.status === 'completed' ? 'Completado' : 
                          order.status === 'processing' ? 'Procesando' : 
                          order.status === 'shipped' ? 'Enviado' : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Link to={`/admin/pedidos/${order.id}`} className="text-indigo-600 hover:text-indigo-900">Ver detalles</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No hay pedidos recientes para mostrar.
          </div>
        )}
        
        <div className="mt-4 text-right">
          <Link to="/admin/pedidos" className="text-indigo-600 hover:text-indigo-900">Ver todos los pedidos →</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;