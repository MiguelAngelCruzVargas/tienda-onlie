// src/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Obtener la ruta a la que redirigir después del login
  const from = location.state?.from?.pathname || '/admin/dashboard';

  // Efecto para la animación de entrada
  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const result = await login({ email, password });
      
      if (result.success) {
        // Iniciar animación de desbloqueo antes de navegar
        setUnlocking(true);
        
        // Esperar a que termine la animación antes de redirigir
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1500); // Duración de la animación
      } else {
        setError(result.message || 'Credenciales incorrectas');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error durante el inicio de sesión:', err);
      setError('Ocurrió un error al iniciar sesión. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-yellow-500 rounded-full opacity-10 mix-blend-multiply"></div>
        <div className="absolute top-full -right-20 w-80 h-80 bg-blue-400 rounded-full opacity-10 mix-blend-multiply transform -translate-y-1/2"></div>
        <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-indigo-500 rounded-full opacity-10 mix-blend-multiply"></div>
      </div>
      
      <div className={`max-w-md w-full transition-all duration-700 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="text-center mb-8">
          <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-full ${unlocking ? 'bg-green-500' : 'bg-yellow-500'} text-white mb-5 shadow-lg transition-colors duration-500`}>
            {/* Candado con animación */}
            <div className={`transform transition-all duration-1000 ${unlocking ? 'translate-y-0 scale-110' : ''}`}>
              {unlocking ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            {/* Efecto de apertura del candado */}
            {unlocking && (
              <>
                {/* Arco giratorio */}
                <div className="absolute top-0 left-1/2 w-6 h-6 -mt-1 transform -translate-x-1/2 origin-bottom">
                  <div className="absolute top-0 left-0 w-full h-full border-t-2 border-l-2 border-r-2 border-white rounded-t-full animate-unlock"></div>
                </div>
                
                {/* Partículas de destello */}
                <div className="absolute inset-0">
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-particle-1"></div>
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-particle-2"></div>
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-particle-3"></div>
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-particle-4"></div>
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-particle-5"></div>
                </div>
                
                {/* Ondas de desbloqueo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-2 border-white opacity-0 animate-ripple-1"></div>
                  <div className="absolute w-full h-full rounded-full border-2 border-white opacity-0 animate-ripple-2"></div>
                </div>
              </>
            )}
          </div>
          
          <h2 className="text-3xl font-extrabold text-white">
            Panel de Administración
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            {unlocking ? "Acceso concedido, redirigiendo..." : "Ingresa tus credenciales para acceder"}
          </p>
        </div>
        
        <div className="backdrop-blur-md bg-white/10 rounded-xl shadow-xl overflow-hidden p-6 border border-white/20">
          {error && (
            <div className="mb-6 bg-red-400/20 backdrop-blur-sm border border-red-400/40 text-white px-4 py-3 rounded-lg relative transition-all duration-300 ease-in-out" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form className={`space-y-6 transition-opacity duration-500 ${unlocking ? 'opacity-50 pointer-events-none' : 'opacity-100'}`} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-200 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border-0 text-white bg-white/5 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 sm:text-sm transition-all duration-200"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={unlocking}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-10 py-3 border-0 text-white bg-white/5 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 sm:text-sm transition-all duration-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={unlocking}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-400 hover:text-white focus:outline-none"
                    disabled={unlocking}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
                  disabled={unlocking}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Recordarme
                </label>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading || unlocking}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black ${unlocking ? 'bg-green-500' : 'bg-yellow-500 hover:bg-yellow-400'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 shadow-lg`}
              >
                {loading && !unlocking ? (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                ) : null}
                <span className={loading && !unlocking ? "pl-8" : ""}>
                  {unlocking ? "Acceso concedido" : loading ? 'Verificando...' : 'Iniciar sesión'}
                </span>
              </button>
            </div>
          </form>
        </div>
        
        <p className="mt-6 text-center text-sm text-gray-400">
          <a href="/" className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors">
            Volver a la tienda
          </a>
        </p>
      </div>
    </div>
  );
};



export default AdminLogin;