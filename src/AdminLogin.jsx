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
  const [rememberMe, setRememberMe] = useState(false);
  const [iconHover, setIconHover] = useState({ email: false, password: false });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Obtener la ruta a la que redirigir después del login
  const from = location.state?.from?.pathname || '/admin/dashboard';

  // Efecto para la animación de entrada y cargar datos de localStorage
  useEffect(() => {
    // Animación de entrada
    setAnimate(true);
    
    // Intentar cargar email y estado de recordarme
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }
    
    // Guardar o eliminar email según el estado de rememberMe
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
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
        }, 2000); // Duración aumentada para la animación
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

  const handleRememberMeChange = () => {
    // Alternar el estado de recordarme
    setRememberMe(!rememberMe);
    
    // Si se está desactivando, eliminar el email guardado
    if (rememberMe) {
      localStorage.removeItem('rememberedEmail');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-6 px-4 sm:px-6 lg:px-8">
      {/* Decorative elements - Responsive para diferentes tamaños */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-16 w-32 h-32 sm:w-56 sm:h-56 md:w-72 md:h-72 bg-yellow-500 rounded-full opacity-10 mix-blend-multiply"></div>
        <div className="absolute top-full -right-16 w-40 h-40 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-blue-400 rounded-full opacity-10 mix-blend-multiply transform -translate-y-1/2"></div>
        <div className="absolute top-1/3 left-1/2 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-indigo-500 rounded-full opacity-10 mix-blend-multiply"></div>
      </div>
      
      <div className={`w-full max-w-xs sm:max-w-sm md:max-w-md transition-all duration-700 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="text-center mb-6 sm:mb-8">
          {/* Candado con animación mejorada - Responsive con tamaños para móvil/desktop */}
          <div className={`relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full ${unlocking ? 'bg-green-500' : 'bg-yellow-500'} text-white mb-4 sm:mb-5 shadow-lg transition-colors duration-500`}>
            <div className="relative w-8 h-8 sm:w-10 sm:h-10">
              {/* Parte del candado: Arco superior */}
              <div 
                className={`absolute w-6 sm:w-8 h-4 sm:h-5 border-t-3 sm:border-t-4 border-l-3 sm:border-l-4 border-r-3 sm:border-r-4 border-white rounded-t-full left-1 
                  transition-all duration-1000 origin-bottom 
                  ${unlocking ? 'transform -translate-y-4 rotate-180' : '-top-4'}`}
                style={{
                  boxShadow: unlocking ? '0 0 10px rgba(255, 255, 255, 0.7)' : 'none',
                }}
              ></div>
              
              {/* Cuerpo del candado */}
              <div 
                className={`absolute top-0 w-full h-full rounded-lg border-3 sm:border-4 border-white overflow-hidden
                  transition-all duration-500
                  ${unlocking ? 'opacity-0' : 'opacity-100'}`}
              >
                {/* Centro del candado (agujero) */}
                <div className="absolute top-1/2 left-1/2 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              {/* Candado abierto (aparece al desbloquear) */}
              <div 
                className={`absolute top-0 w-full h-full opacity-0 transition-opacity duration-500
                  ${unlocking ? 'opacity-100' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" viewBox="0 0 20 20" fill="white">
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                </svg>
              </div>
            </div>
            
            {/* Efectos de desbloqueo */}
            {unlocking && (
              <>
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
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Panel de Administración
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-300">
            {unlocking ? "Acceso concedido, redirigiendo..." : "Ingresa tus credenciales para acceder"}
          </p>
        </div>
        
        <div className="backdrop-blur-md bg-white/10 rounded-xl shadow-xl overflow-hidden p-4 sm:p-6 border border-white/20">
          {error && (
            <div className="mb-4 sm:mb-6 bg-red-400/20 backdrop-blur-sm border border-red-400/40 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg relative transition-all duration-300 ease-in-out" role="alert">
              <span className="block sm:inline text-sm">{error}</span>
            </div>
          )}
          
          <form className={`space-y-4 sm:space-y-6 transition-opacity duration-500 ${unlocking ? 'opacity-50 pointer-events-none' : 'opacity-100'}`} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <div 
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10"
                  onMouseEnter={() => setIconHover({...iconHover, email: true})}
                  onMouseLeave={() => setIconHover({...iconHover, email: false})}
                >
                  <svg 
                    className={`h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 transition-all duration-300 ${iconHover.email ? 'scale-110' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    style={{
                      filter: `drop-shadow(0 0 ${iconHover.email ? '4px' : '2px'} rgba(250, 204, 21, 0.7))`
                    }}
                  >
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
                  className="block w-full pl-10 pr-3 py-2 sm:py-3 border-0 text-sm text-white bg-white/5 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={unlocking}
                  onFocus={() => setIconHover({...iconHover, email: true})}
                  onBlur={() => setIconHover({...iconHover, email: false})}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div 
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10"
                  onMouseEnter={() => setIconHover({...iconHover, password: true})}
                  onMouseLeave={() => setIconHover({...iconHover, password: false})}
                >
                  <svg 
                    className={`h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 transition-all duration-300 ${iconHover.password ? 'scale-110' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    style={{
                      filter: `drop-shadow(0 0 ${iconHover.password ? '4px' : '2px'} rgba(250, 204, 21, 0.7))`
                    }}
                  >
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-10 py-2 sm:py-3 border-0 text-sm text-white bg-white/5 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={unlocking}
                  onFocus={() => setIconHover({...iconHover, password: true})}
                  onBlur={() => setIconHover({...iconHover, password: false})}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-yellow-400 hover:text-yellow-300 focus:outline-none transition-all duration-150 transform hover:scale-110"
                    disabled={unlocking}
                    style={{
                      filter: 'drop-shadow(0 0 2px rgba(250, 204, 21, 0.7))'
                    }}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
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
                <div className="relative flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-gray-800 rounded cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-yellow-400/40"
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      disabled={unlocking}
                    />
                  </div>
                  <div className="ml-2 text-sm">
                    <label htmlFor="remember-me" className="block text-xs sm:text-sm text-gray-300 cursor-pointer hover:text-yellow-300 transition-colors duration-200">
                      Recordarme
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading || unlocking}
                className={`group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black ${unlocking ? 'bg-green-500' : 'bg-yellow-500 hover:bg-yellow-400'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 shadow-lg hover:shadow-yellow-500/20`}
              >
                {loading && !unlocking ? (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        
        <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-400">
          <a href="/" className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors">
            Volver a la tienda
          </a>
        </p>
      </div>
      
      {/* Estilos para las animaciones */}
      <style jsx>{`
        @keyframes particle-1 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-100px, -100px) scale(0); opacity: 0; }
        }
        @keyframes particle-2 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(100px, -100px) scale(0); opacity: 0; }
        }
        @keyframes particle-3 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-70px, 80px) scale(0); opacity: 0; }
        }
        @keyframes particle-4 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(70px, 80px) scale(0); opacity: 0; }
        }
        @keyframes particle-5 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(0, -120px) scale(0); opacity: 0; }
        }
        @keyframes ripple-1 {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes ripple-2 {
          0% { transform: scale(0.8); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        
        .animate-particle-1 {
          animation: particle-1 1.5s ease-out forwards;
          animation-delay: 0.2s;
        }
        .animate-particle-2 {
          animation: particle-2 1.5s ease-out forwards;
          animation-delay: 0.1s;
        }
        .animate-particle-3 {
          animation: particle-3 1.5s ease-out forwards;
          animation-delay: 0.3s;
        }
        .animate-particle-4 {
          animation: particle-4 1.5s ease-out forwards;
          animation-delay: 0.2s;
        }
        .animate-particle-5 {
          animation: particle-5 1.5s ease-out forwards;
          animation-delay: 0.1s;
        }
        .animate-ripple-1 {
          animation: ripple-1 1.5s ease-out forwards;
          animation-delay: 0.1s;
        }
        .animate-ripple-2 {
          animation: ripple-2 1.5s ease-out forwards;
          animation-delay: 0.3s;
        }
        
        /* Para pantallas más pequeñas, define tamaños de borde más pequeños */
        @media (max-width: 640px) {
          .border-3 {
            border-width: 3px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;