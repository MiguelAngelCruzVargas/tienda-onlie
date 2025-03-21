// src/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { API_BASE } from './utils/apiConfig';  

// Importa iconos (asumiendo que usas react-icons o similar)
// Si no tienes react-icons, instálalo con: npm install react-icons
import { 
  FiPackage, FiShoppingBag, FiDollarSign, FiUsers, 
  FiPlus, FiList, FiBarChart2, FiCalendar, FiEye 
} from 'react-icons/fi';

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
  const { currentUser } = useAuth();

  useEffect(() => {
    // Sólo cargar datos si el usuario está autenticado
    if (currentUser) {
      fetchStats();
      fetchRecentOrders();
    }
  }, [currentUser]);

  // Función para cargar datos de estadísticas desde el backend
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
 
      const response = await fetch(`${API_BASE}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al cargar estadísticas: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar las estadísticas: ' + err.message);
      setLoading(false);
      console.error('Error al cargar estadísticas:', err);
    }
  };

  // Función para cargar pedidos recientes desde el backend
  const fetchRecentOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
    
      const response = await fetch(`${API_BASE}/api/dashboard/recent-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al cargar pedidos recientes: ${response.status}`);
      }
      
      const data = await response.json();
      setRecentOrders(data);
    } catch (err) {
      console.error('Error al cargar pedidos recientes:', err);
    }
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Función para formatear números con separador de miles
  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center bg-gradient-to-r from-gray-900 to-indigo-900 rounded-lg m-4">
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-xl shadow-xl">
          <div className="w-16 h-16 mx-auto border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-white font-medium">Cargando tus datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-500/30 text-red-700 px-6 py-5 rounded-xl mb-6 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-800">Ha ocurrido un error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Panel de Administración</h1>
      
      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Tarjeta de Productos */}
        <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-purple-500/20">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Productos Totales</p>
                <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800">{formatNumber(stats.totalProducts)}</h2>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <FiPackage className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
        </div>
        
        {/* Tarjeta de Pedidos */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-blue-500/20">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Pedidos</p>
                <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800">{formatNumber(stats.totalOrders)}</h2>
                <p className="text-sm text-orange-500 font-medium mt-1">
                  {formatNumber(stats.pendingOrders)} pendientes
                </p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <FiShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
        </div>
        
        {/* Tarjeta de Ingresos */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-emerald-500/20">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Ingresos</p>
                <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800">
                  ${typeof stats.revenue === 'number' ? formatNumber(stats.revenue) : stats.revenue}
                </h2>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
        </div>
        
        {/* Tarjeta de Visitantes */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-amber-500/20">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Visitantes</p>
                <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800">{formatNumber(stats.visitors)}</h2>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-lg">
                <FiUsers className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
        </div>
      </div>
      
      {/* Enlaces rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <Link to="/admin/productos/nuevo" 
          className="group bg-gradient-to-br from-purple-500/5 to-indigo-500/5 backdrop-blur-md border border-purple-500/20 rounded-xl shadow-lg p-6 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-indigo-500/10 transition-all duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">
              <FiPlus className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Añadir Producto</h3>
            <p className="text-sm text-gray-600">Sube nuevos productos a la tienda</p>
          </div>
        </Link>
        
        <Link to="/admin/pedidos" 
          className="group bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-md border border-blue-500/20 rounded-xl shadow-lg p-6 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-cyan-500/10 transition-all duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
              <FiList className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Gestionar Pedidos</h3>
            <p className="text-sm text-gray-600">Ver y actualizar el estado de los pedidos</p>
          </div>
        </Link>
        
        <Link to="/admin/estadisticas" 
          className="group bg-gradient-to-br from-emerald-500/5 to-green-500/5 backdrop-blur-md border border-emerald-500/20 rounded-xl shadow-lg p-6 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-green-500/10 transition-all duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300">
              <FiBarChart2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Estadísticas Detalladas</h3>
            <p className="text-sm text-gray-600">Analiza el rendimiento de tu tienda</p>
          </div>
        </Link>
      </div>
      
      {/* Órdenes recientes */}
      <div className="bg-gradient-to-br from-gray-800/5 to-indigo-600/5 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-indigo-500/20 mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FiCalendar className="mr-2 text-indigo-600" /> 
              Pedidos Recientes
            </h2>
            <Link to="/admin/pedidos" className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center text-sm font-medium">
              Ver todos <span className="ml-1">→</span>
            </Link>
          </div>
          
          {recentOrders && recentOrders.length > 0 ? (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-white/30 transition-colors duration-150">
                      <td className="px-4 py-4 text-sm font-medium text-gray-800">#{order.id}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{order.customer}</td>
                      <td className="px-4 py-4 text-sm text-gray-700 hidden md:table-cell">{formatDate(order.date)}</td>
                      <td className="px-4 py-4 text-sm text-gray-700 font-medium">
                        ${typeof order.total === 'number' ? formatNumber(order.total) : order.total}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full 
                          ${order.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                            order.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 
                            'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                          {order.status === 'pending' ? 'Pendiente' : 
                            order.status === 'completed' ? 'Completado' : 
                            order.status === 'processing' ? 'Procesando' : 
                            order.status === 'shipped' ? 'Enviado' : order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link to={`/admin/pedidos/${order.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center justify-end">
                          <FiEye className="mr-1" /> Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white/50 rounded-lg p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <FiShoppingBag className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No hay pedidos recientes</h3>
              <p className="text-gray-600 mb-4">Los pedidos aparecerán aquí cuando tus clientes realicen compras.</p>
              <Link 
                to="/admin/productos/nuevo"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
              >
                <FiPlus className="mr-2" /> Añadir Productos
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;