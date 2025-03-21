// // src/App.jsx
// import React, { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './AuthContext';
// import CartProvider from './CartContext';
// import Header from './Header';
// import Footer from './Footer';
// import HomePage from './HomePage';
// import RinesAutomovilPage from './RinesAutomovilPage';
// import RinesCamionetaPage from './RinesCamionetaPage';
// import ReviewsPage from './ReviewsPage';
// import ProductDetailPage from './ProductDetailPage'; // Importamos la nueva página de detalle
// import ProtectedRoute from './ProtectedRoute';
// import AdminLogin from './AdminLogin';
// import AdminLayout from './AdminLayout';
// import AdminDashboard from './AdminDashboard';
// import AdminProducts from './AdminProducts';
// import AdminProductForm from './AdminProductForm';
// import AdminCategories from './AdminCategories';
// import AdminOrders from './AdminOrders';
// import AdminStats from './AdminStats';
// import AdminSettings from './AdminSettings';
// import AdminReviews from './AdminReviews';
// import AccessDenied from './AccessDenied';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import CartNotification from './components/CartNotification';
// import CartPanel from './components/CartPanel'; // Importamos el panel del carrito

// function App() {
//   // Estado para controlar la apertura/cierre del panel del carrito
//   const [isCartOpen, setIsCartOpen] = useState(false);

//   // Funciones para abrir/cerrar el panel del carrito
//   const openCart = () => setIsCartOpen(true);
//   const closeCart = () => setIsCartOpen(false);

//   // Componente Header que incluye la función para abrir el carrito
//   const HeaderWithCart = () => <Header onCartOpen={openCart} />;

//   return (
//     <AuthProvider>
//       <CartProvider>
//         <Router>
//           <div className="flex flex-col min-h-screen">
//             <Routes>
//               {/* Nuevas rutas con HeaderWithCart */}
//               <Route path="/rines-automovil" element={
//                 <>
//                   <HeaderWithCart />
//                   <main className="flex-grow">
//                     <RinesAutomovilPage />
//                   </main>
//                   <Footer />
//                 </>
//               } />
//               <Route path="/rines-camioneta" element={
//                 <>
//                   <HeaderWithCart />
//                   <main className="flex-grow">
//                     <RinesCamionetaPage />
//                   </main>
//                   <Footer />
//                 </>
//               } />

//               {/* Ruta principal - Modificamos para usar HeaderWithCart */}
//               <Route path="/" element={<HomePage onCartOpen={openCart} />} />

//               {/* Rutas públicas con HeaderWithCart */}
//               <Route path="/productos/automovil" element={
//                 <>
//                   <HeaderWithCart />
//                   <main className="flex-grow">
//                     <RinesAutomovilPage />
//                   </main>
//                   <Footer />
//                 </>
//               } />
//               <Route path="/productos/camioneta" element={
//                 <>
//                   <HeaderWithCart />
//                   <main className="flex-grow">
//                     <RinesCamionetaPage />
//                   </main>
//                   <Footer />
//                 </>
//               } />
              
//               {/* Actualizada: Ruta de detalle de producto con el nuevo componente */}
//               <Route path="/producto/:slug" element={
//                 <ProductDetailPage onCartOpen={openCart} />
//               } />

//               {/* Nueva ruta para la página de opiniones */}
//               <Route path="/opiniones" element={
//                 <>
//                   <HeaderWithCart />
//                   <ReviewsPage />
//                 </>
//               } />

//               {/* Ruta de acceso denegado */}
//               <Route path="/acceso-denegado" element={<AccessDenied />} />

//               {/* Rutas de administración - sin header y footer públicos */}
//               <Route path="/admin" element={<AdminLogin />} />

//               {/* Rutas con AdminLayout */}
//               <Route path="/admin/dashboard" element={
//                 <ProtectedRoute>
//                   <AdminLayout activeRoute="dashboard">
//                     <AdminDashboard />
//                   </AdminLayout>
//                 </ProtectedRoute>
//               } />

//               {/* Rutas de Productos */}
//               <Route path="/admin/productos" element={
//                 <ProtectedRoute>
//                   <AdminLayout activeRoute="productos">
//                     <AdminProducts />
//                   </AdminLayout>
//                 </ProtectedRoute>
//               } />

//               <Route path="/admin/productos/nuevo" element={
//                 <ProtectedRoute>
//                   <AdminLayout activeRoute="productos">
//                     <AdminProductForm />
//                   </AdminLayout>
//                 </ProtectedRoute>
//               } />

//               <Route path="/admin/productos/:id" element={
//                 <ProtectedRoute>
//                   <AdminLayout activeRoute="productos">
//                     <AdminProductForm />
//                   </AdminLayout>
//                 </ProtectedRoute>
//               } />

//               {/* Rutas de Categorías - Nuevas */}
//               <Route path="/admin/categorias" element={
//                 <ProtectedRoute>
//                   <AdminLayout activeRoute="categorias">
//                     <AdminCategories />
//                   </AdminLayout>
//                 </ProtectedRoute>
//               } />

//               {/* Rutas de Pedidos */}
//               <Route path="/admin/pedidos" element={
//                 <ProtectedRoute>
//                   <AdminLayout activeRoute="pedidos">
//                     <AdminOrders />
//                   </AdminLayout>
//                 </ProtectedRoute>
//               } />

//               {/* Rutas de Estadísticas */}
//               <Route path="/admin/estadisticas" element={
//                 <ProtectedRoute>
//                   <AdminLayout activeRoute="estadisticas">
//                     <AdminStats />
//                   </AdminLayout>
//                 </ProtectedRoute>
//               } />

//               {/* Ruta para administración de reseñas */}
//               <Route path="/admin/opiniones" element={
//                 <ProtectedRoute>
//                   <AdminLayout activeRoute="opiniones">
//                     <AdminReviews />
//                   </AdminLayout>
//                 </ProtectedRoute>
//               } />

//               {/* Rutas de Configuración */}
//               <Route path="/admin/configuracion" element={
//                 <ProtectedRoute>
//                   <AdminLayout activeRoute="configuracion">
//                     <AdminSettings />
//                   </AdminLayout>
//                 </ProtectedRoute>
//               } />

//               {/* Ruta para cualquier otra URL no definida */}
//               <Route path="*" element={
//                 <>
//                   <HeaderWithCart />
//                   <main className="flex-grow flex items-center justify-center">
//                     <div className="text-center">
//                       <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
//                       <p className="text-xl text-gray-600 mb-6">Página no encontrada</p>
//                       <a href="/" className="bg-yellow-500 text-black px-6 py-3 rounded-md font-medium hover:bg-yellow-600 transition-colors">
//                         Volver al inicio
//                       </a>
//                     </div>
//                   </main>
//                   <Footer />
//                 </>
//               } />
//             </Routes>

//             {/* Panel del carrito - se muestra/oculta según el estado isCartOpen */}
//             <CartPanel isOpen={isCartOpen} onClose={closeCart} />

//             {/* Notificación del carrito con la función para abrir el panel */}
//             <CartNotification onViewCart={openCart} />

//             {/* Uso de un solo ToastContainer para toda la aplicación */}
//             <ToastContainer
//               position="bottom-right"
//               autoClose={5000}
//               hideProgressBar={false}
//               newestOnTop
//               closeOnClick
//               rtl={false}
//               pauseOnFocusLoss
//               draggable
//               pauseOnHover
//               theme="light"
//             />
//           </div>
//         </Router>
//       </CartProvider>
//     </AuthProvider>
//   );
// }

// export default App;
// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { CustomerAuthProvider } from './CustomerAuthContext'; // Importamos el provider de autenticación de clientes
import CartProvider from './CartContext';
import Header from './Header';
import Footer from './Footer';
import HomePage from './HomePage';
import RinesAutomovilPage from './RinesAutomovilPage';
import RinesCamionetaPage from './RinesCamionetaPage';
import ReviewsPage from './ReviewsPage';
import ProductDetailPage from './ProductDetailPage';
import CustomerLogin from './CustomerLogin'; // Importamos la página de login de clientes
import CustomerRegister from './CustomerRegister'; // Importamos la página de registro de clientes
import CustomerProfile from './CustomerProfile'; // Importamos el componente de perfil de cliente
import CustomerOrders from './CustomerOrders'; // Importamos el componente de pedidos de cliente
import ProtectedRoute from './ProtectedRoute';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminProductForm from './AdminProductForm';
import AdminCategories from './AdminCategories';
import AdminOrders from './AdminOrders';
import AdminStats from './AdminStats';
import AdminSettings from './AdminSettings';
import AdminReviews from './AdminReviews';
import AccessDenied from './AccessDenied';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CartNotification from './components/CartNotification';
import CartPanel from './components/CartPanel';

function App() {
  // Estado para controlar la apertura/cierre del panel del carrito
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Funciones para abrir/cerrar el panel del carrito
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Componente Header que incluye la función para abrir el carrito
  const HeaderWithCart = () => <Header onCartOpen={openCart} />;

  return (
    <AuthProvider>
      <CustomerAuthProvider> {/* Añadimos el proveedor de autenticación de clientes */}
        <Router>
          <CartProvider> {/* Movemos CartProvider dentro de Router */}
            <div className="flex flex-col min-h-screen">
              <Routes>
                {/* Nuevas rutas para login y registro de clientes */}
                <Route path="/login" element={
                  <>
                    <HeaderWithCart />
                    <main className="flex-grow">
                      <CustomerLogin />
                    </main>
                    <Footer />
                  </>
                } />
                
                <Route path="/registro" element={
                  <>
                    <HeaderWithCart />
                    <main className="flex-grow">
                      <CustomerRegister />
                    </main>
                    <Footer />
                  </>
                } />
                
                {/* Rutas para perfil de cliente */}
                <Route path="/mi-cuenta" element={
                  <>
                    <HeaderWithCart />
                    <main className="flex-grow">
                      <CustomerProfile />
                    </main>
                    <Footer />
                  </>
                } />
                
                <Route path="/mis-pedidos" element={
                  <>
                    <HeaderWithCart />
                    <main className="flex-grow">
                      <CustomerOrders />
                    </main>
                    <Footer />
                  </>
                } />
                
                {/* Rutas existentes */}
                <Route path="/rines-automovil" element={
                  <>
                    <HeaderWithCart />
                    <main className="flex-grow">
                      <RinesAutomovilPage />
                    </main>
                    <Footer />
                  </>
                } />
                
                <Route path="/rines-camioneta" element={
                  <>
                    <HeaderWithCart />
                    <main className="flex-grow">
                      <RinesCamionetaPage />
                    </main>
                    <Footer />
                  </>
                } />

                {/* Ruta principal */}
                <Route path="/" element={<HomePage onCartOpen={openCart} />} />

                {/* Rutas públicas con HeaderWithCart */}
                <Route path="/productos/automovil" element={
                  <>
                    <HeaderWithCart />
                    <main className="flex-grow">
                      <RinesAutomovilPage />
                    </main>
                    <Footer />
                  </>
                } />
                
                <Route path="/productos/camioneta" element={
                  <>
                    <HeaderWithCart />
                    <main className="flex-grow">
                      <RinesCamionetaPage />
                    </main>
                    <Footer />
                  </>
                } />
                
                {/* Ruta de detalle de producto */}
                <Route path="/producto/:slug" element={
                  <ProductDetailPage onCartOpen={openCart} />
                } />

                {/* Ruta para página de opiniones */}
                <Route path="/opiniones" element={
                  <>
                    <HeaderWithCart />
                    <ReviewsPage />
                  </>
                } />

                {/* Ruta de acceso denegado */}
                <Route path="/acceso-denegado" element={<AccessDenied />} />

                {/* Rutas de administración */}
                <Route path="/admin" element={<AdminLogin />} />

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

                <Route path="/admin/productos/:id" element={
                  <ProtectedRoute>
                    <AdminLayout activeRoute="productos">
                      <AdminProductForm />
                    </AdminLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/categorias" element={
                  <ProtectedRoute>
                    <AdminLayout activeRoute="categorias">
                      <AdminCategories />
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

                <Route path="/admin/opiniones" element={
                  <ProtectedRoute>
                    <AdminLayout activeRoute="opiniones">
                      <AdminReviews />
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
                    <HeaderWithCart />
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

              {/* Panel del carrito */}
              <CartPanel isOpen={isCartOpen} onClose={closeCart} />

              {/* Notificación del carrito */}
              <CartNotification onViewCart={openCart} />

              {/* ToastContainer para notificaciones */}
              <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </div>
          </CartProvider>
        </Router>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}

export default App;