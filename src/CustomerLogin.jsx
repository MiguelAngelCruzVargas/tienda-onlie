// src/CustomerLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from './CustomerAuthContext';
import { toast } from 'react-toastify';

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useCustomerAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success('Inicio de sesión exitoso');
        
        // Verificar si hay una acción pendiente del carrito
        const pendingCartAddition = sessionStorage.getItem('pendingCartAddition');
        const pendingCheckout = sessionStorage.getItem('pendingCheckout');
        
        if (pendingCartAddition) {
          const { redirect } = JSON.parse(pendingCartAddition);
          if (redirect && redirect !== '/login' && redirect !== '/registro') {
            navigate(redirect); // Ir a la página donde intentaba agregar al carrito
          } else {
            navigate('/'); // Ir al inicio si no hay una página específica
          }
        } else if (pendingCheckout) {
          navigate('/checkout'); // Ir al checkout si estaba intentando comprar
        } else {
          navigate(-1); // Regresar a la página anterior en otros casos
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      toast.error('Error al iniciar sesión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Encabezado del formulario */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-8 sm:p-10">
          <h2 className="text-3xl font-extrabold text-white text-center">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-center text-white text-opacity-90">
            Accede a tu cuenta para realizar compras
          </p>
        </div>
        
        {/* Contenido del formulario */}
        <div className="px-6 py-8">
          <p className="text-sm text-gray-600 text-center mb-6">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors">
              Regístrate aquí
            </Link>
          </p>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <Link to="/recuperar-password" className="text-xs font-medium text-yellow-600 hover:text-yellow-500 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-black bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </>
                ) : 'Iniciar sesión'}
              </button>
            </div>
            
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-sm font-medium text-gray-600 hover:text-gray-500 transition-colors"
              >
                Volver atrás
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Acceso rápido y seguridad */}
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Compra segura</span>
          </div>
        </div>
        
        <p className="mt-4 text-center text-xs text-gray-500">
          Este sitio está protegido con un sistema seguro de autenticación.
          <br />
          Tus datos personales están protegidos según nuestra {' '}
          <Link to="/privacidad" className="font-medium text-yellow-600 hover:text-yellow-500">
            política de privacidad
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CustomerLogin;