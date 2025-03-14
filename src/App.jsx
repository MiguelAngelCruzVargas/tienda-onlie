// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Header from './Header';
import Footer from './Footer';
import HomePage from './HomePage';
import ProtectedRoute from './ProtectedRoute';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminProductForm from './AdminProductForm';
import AdminOrders from './AdminOrders';
import AdminStats from './AdminStats';
import AdminSettings from './AdminSettings';
import AccessDenied from './AccessDenied'; // Necesitarás crear este componente

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Routes>
            {/* Rutas públicas - incluyen header y footer */}
            <Route path="/" element={
              <>
                <Header />
                <main className="flex-grow">
                  <HomePage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/automovil" element={
              <>
                <Header />
                <main className="flex-grow">
                  {/* Componente de categoría Automóvil */}
                  <div>Contenido de categoría Automóvil</div>
                </main>
                <Footer />
              </>
            } />
            <Route path="/camioneta" element={
              <>
                <Header />
                <main className="flex-grow">
                  {/* Componente de categoría Camioneta */}
                  <div>Contenido de categoría Camioneta</div>
                </main>
                <Footer />
              </>
            } />
            <Route path="/producto/:id" element={
              <>
                <Header />
                <main className="flex-grow">
                  {/* Componente de detalle de Producto */}
                  <div>Detalle de producto</div>
                </main>
                <Footer />
              </>
            } />
            
            {/* Ruta de acceso denegado */}
            <Route path="/acceso-denegado" element={<AccessDenied />} />
            
            {/* Rutas de administración - sin header y footer públicos */}
            <Route path="/admin" element={<AdminLogin />} />
            
            {/* Rutas con AdminLayout */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminLayout activeRoute="dashboard">
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/productos" element={
              <ProtectedRoute>
                <AdminLayout activeRoute="productos">
                  <AdminProducts />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/productos/nuevo" element={
              <ProtectedRoute>
                <AdminLayout activeRoute="productos">
                  <AdminProductForm />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/productos/editar/:id" element={
              <ProtectedRoute>
                <AdminLayout activeRoute="productos">
                  <AdminProductForm />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/pedidos" element={
              <ProtectedRoute>
                <AdminLayout activeRoute="pedidos">
                  <AdminOrders />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/estadisticas" element={
              <ProtectedRoute>
                <AdminLayout activeRoute="estadisticas">
                  <AdminStats />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/configuracion" element={
              <ProtectedRoute>
                <AdminLayout activeRoute="configuracion">
                  <AdminSettings />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            {/* Ruta para cualquier otra URL no definida */}
            <Route path="*" element={
              <>
                <Header />
                <main className="flex-grow flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-6">Página no encontrada</p>
                    <a href="/" className="bg-yellow-500 text-black px-6 py-3 rounded-md font-medium hover:bg-yellow-600 transition-colors">
                      Volver al inicio
                    </a>
                  </div>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;