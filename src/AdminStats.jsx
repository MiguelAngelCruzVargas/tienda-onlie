// src/AdminStats.jsx
import React, { useState, useEffect } from 'react';

// Importación simplificada de Recharts para evitar problemas
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const AdminStats = () => {
  const [statsData, setStatsData] = useState({
    sales: [],
    visitors: [],
    topProducts: [],
    comparisons: {
      salesGrowth: 0,
      visitorsGrowth: 0,
      conversionRateChange: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    // Función para cargar las estadísticas desde la API
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Aquí irían las llamadas a la API para obtener las estadísticas
        // Ejemplo:
        // const response = await fetch(`/api/stats?timeRange=${timeRange}`);
        // if (!response.ok) throw new Error('Error al cargar las estadísticas');
        // const data = await response.json();
        // setStatsData(data);
        
        // Para fines de desarrollo, usamos datos de ejemplo
        const mockData = generateMockData(timeRange);
        setStatsData(mockData);
        
        setIsLoading(false);
      } catch (err) {
        setError(`Error al cargar las estadísticas: ${err.message}`);
        setIsLoading(false);
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, [timeRange]);

  // Función para generar datos de ejemplo basados en el rango de tiempo
  const generateMockData = (range) => {
    let days = 30;
    if (range === 'week') days = 7;
    if (range === 'year') days = 12; // Meses en lugar de días para un año
    
    // Crear ventas simuladas
    const sales = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      if (range === 'year') {
        date.setMonth(date.getMonth() - (days - i - 1));
        date.setDate(1);
      } else {
        date.setDate(date.getDate() - (days - i - 1));
      }
      
      // Valores aleatorios para ventas diarias entre 1000 y 5000
      const amount = Math.floor(Math.random() * 4000) + 1000;
      
      return {
        date: date.toISOString(),
        amount,
        // Añadir nombre del mes para visualización en el gráfico anual
        name: range === 'year' 
          ? date.toLocaleDateString('es-MX', { month: 'short' }) 
          : date.toLocaleDateString('es-MX', { day: '2-digit' })
      };
    });
    
    // Crear visitantes simulados
    const visitors = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      if (range === 'year') {
        date.setMonth(date.getMonth() - (days - i - 1));
        date.setDate(1);
      } else {
        date.setDate(date.getDate() - (days - i - 1));
      }
      
      // Valores aleatorios para visitantes diarios entre 100 y 500
      const count = Math.floor(Math.random() * 400) + 100;
      
      return {
        date: date.toISOString(),
        count
      };
    });
    
    // Crear productos más vendidos simulados
    const productNames = [
      'Rin Deportivo 17"',
      'Llanta All-Terrain 265/70R17',
      'Rin de Lujo 19" Chrome',
      'Kit de 4 Rines Clásicos 15"',
      'Rin de Aleación Premium 20"'
    ];
    
    const topProducts = productNames.map((name, i) => {
      const sales = Math.floor(Math.random() * 50) + 10;
      const amount = sales * (Math.floor(Math.random() * 2000) + 1000);
      
      return {
        id: i + 1,
        name,
        sales,
        amount
      };
    }).sort((a, b) => b.amount - a.amount);
    
    // Calcular crecimientos comparados con el periodo anterior
    const salesGrowth = (Math.random() * 30) - 10;
    const visitorsGrowth = (Math.random() * 25) - 5;
    const conversionRateChange = (Math.random() * 15) - 3;
    
    return {
      sales,
      visitors,
      topProducts,
      comparisons: {
        salesGrowth: parseFloat(salesGrowth.toFixed(1)),
        visitorsGrowth: parseFloat(visitorsGrowth.toFixed(1)),
        conversionRateChange: parseFloat(conversionRateChange.toFixed(1))
      }
    };
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const toggleChartType = () => {
    setChartType(chartType === 'line' ? 'bar' : 'line');
  };

  // Calcular totales
  const totalSales = statsData.sales.reduce((sum, day) => sum + day.amount, 0);
  const totalVisitors = statsData.visitors.reduce((sum, day) => sum + day.count, 0);
  const conversionRate = totalVisitors > 0 
    ? ((statsData.sales.length / totalVisitors) * 100).toFixed(2) 
    : '0.00';

  // Formatear datos para el gráfico de ventas/visitantes
  const chartData = statsData.sales.map((sale, index) => {
    const visitor = statsData.visitors[index] || { count: 0 };
    return {
      name: sale.name || new Date(sale.date).toLocaleDateString('es-MX', { day: '2-digit' }),
      ventas: sale.amount,
      visitantes: visitor.count
    };
  });

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-center">
          <div className="spinner-border text-indigo-600" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2">Cargando estadísticas...</p>
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
      <h1 className="text-2xl font-bold mb-6">Estadísticas y Análisis</h1>
      
      {/* Filtros de tiempo */}
      <div className="mb-6">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => handleTimeRangeChange('week')}
            className={`px-4 py-2 rounded-md ${
              timeRange === 'week' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Última Semana
          </button>
          <button
            onClick={() => handleTimeRangeChange('month')}
            className={`px-4 py-2 rounded-md ${
              timeRange === 'month' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Último Mes
          </button>
          <button
            onClick={() => handleTimeRangeChange('year')}
            className={`px-4 py-2 rounded-md ${
              timeRange === 'year' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Último Año
          </button>
        </div>
      </div>
      
      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Ventas Totales</div>
          <div className="text-2xl font-bold">${totalSales.toLocaleString()}</div>
          <div className={`mt-2 text-sm ${statsData.comparisons.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {statsData.comparisons.salesGrowth >= 0 ? '+' : ''}{statsData.comparisons.salesGrowth}% comparado con periodo anterior
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Visitantes</div>
          <div className="text-2xl font-bold">{totalVisitors.toLocaleString()}</div>
          <div className={`mt-2 text-sm ${statsData.comparisons.visitorsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {statsData.comparisons.visitorsGrowth >= 0 ? '+' : ''}{statsData.comparisons.visitorsGrowth}% comparado con periodo anterior
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Tasa de Conversión</div>
          <div className="text-2xl font-bold">{conversionRate}%</div>
          <div className={`mt-2 text-sm ${statsData.comparisons.conversionRateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {statsData.comparisons.conversionRateChange >= 0 ? '+' : ''}{statsData.comparisons.conversionRateChange}% comparado con periodo anterior
          </div>
        </div>
      </div>
      
      {/* Gráfica de ventas - Componente básico que no usa Recharts */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Ventas Diarias</h2>
        {statsData.sales.length > 0 ? (
          <div className="h-64 w-full">
            {/* Gráfico simple sin usar Recharts */}
            <div className="h-full flex items-end space-x-2">
              {statsData.sales.map((day, index) => {
                const height = statsData.sales.length > 0 
                  ? (day.amount / Math.max(...statsData.sales.map(d => d.amount))) * 100 
                  : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-indigo-500 rounded-t-sm" 
                      style={{height: `${height}%`}}
                      title={`$${day.amount.toLocaleString()}`}
                    ></div>
                    <div className="text-xs mt-1 text-gray-500">
                      {new Date(day.date).toLocaleDateString('es-MX', { day: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-64 w-full flex items-center justify-center text-gray-500">
            No hay datos de ventas disponibles para este periodo.
          </div>
        )}
      </div>
      
      {/* Productos más vendidos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Productos Más Vendidos</h2>
        {statsData.topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidades Vendidas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% del Total</th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {statsData.topProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.sales} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${product.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-2">
                          {totalSales > 0 ? ((product.amount / totalSales) * 100).toFixed(1) : '0.0'}%
                        </span>
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${totalSales > 0 ? ((product.amount / totalSales) * 100) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-lg text-gray-500 mb-2">No hay datos de productos vendidos para este periodo.</p>
            <p className="text-gray-400">Los productos más vendidos aparecerán aquí cuando haya ventas registradas.</p>
          </div>
        )}
      </div>
      
      {/* Acciones rápidas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-indigo-50 rounded-lg p-6 hover:bg-indigo-100 transition-colors cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-indigo-800 font-medium mb-1">Exportar Reporte</h3>
              <p className="text-sm text-indigo-600">Generar reporte detallado en PDF/Excel</p>
            </div>
            <div className="bg-indigo-200 rounded-lg p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-6 hover:bg-green-100 transition-colors cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-green-800 font-medium mb-1">Ver Órdenes</h3>
              <p className="text-sm text-green-600">Revisar pedidos recientes</p>
            </div>
            <div className="bg-green-200 rounded-lg p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 hover:bg-blue-100 transition-colors cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-blue-800 font-medium mb-1">Inventario</h3>
              <p className="text-sm text-blue-600">Gestionar stock de productos</p>
            </div>
            <div className="bg-blue-200 rounded-lg p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 rounded-lg p-6 hover:bg-amber-100 transition-colors cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-amber-800 font-medium mb-1">Configuración</h3>
              <p className="text-sm text-amber-600">Ajustar preferencias de la tienda</p>
            </div>
            <div className="bg-amber-200 rounded-lg p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;