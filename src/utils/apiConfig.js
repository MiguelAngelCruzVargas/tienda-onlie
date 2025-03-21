// // src/utils/apiConfig.js
// export const getApiBaseUrl = () => {
//   const hostname = window.location.hostname;
//   const port = window.location.port;

//   // Caso específico para tiendarines-frontend.loca.lt
//   if (hostname.includes('tiendarines-frontend.loca.lt')) {
//     return 'https://tiendarines-api.loca.lt';
//   }

//   // Caso 1: Servidor proxy Python (puerto 8000 o túnel para el proxy)
//   if (port === '8000' || hostname.includes('tiendarines-app')) {
//     // Cuando usamos el proxy Python, usamos rutas relativas
//     return '';
//   }
  
//   // Caso 2: Túnel Localtunnel para backend específico
//   if (hostname.includes('loca.lt')) {
//     // Si estamos en el frontend a través de localtunnel, apuntamos al backend
//     return 'https://tiendarines-api.loca.lt';
//   }
  
//   // Caso 3: Túnel Ngrok 
//   if (hostname.includes('ngrok')) {
//     // Cambiar esta URL cuando uses ngrok
//     return 'https://tu-backend-id.ngrok.io';
//   }
  
//   // Caso 4: Desarrollo local por defecto
//   return 'http://localhost:3000';
// };

// // Log para debug
// console.log('API Base URL:', getApiBaseUrl());

// export const API_BASE = getApiBaseUrl();



// src/utils/apiConfig.js
export const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;

  // Configuración de mapeo de hosts y backends
  const hostMap = {
    // Localtunnel mappings
    'tiendarines-frontend.loca.lt': {
      backend: 'https://tiendarines-api.loca.lt',
      protocol: 'https:'
    },
    'tiendarines-frontend.loca.lt:443': {
      backend: 'https://tiendarines-api.loca.lt',
      protocol: 'https:'
    },
    'localhost': {
      backend: 'http://localhost:3000',
      protocol: 'http:'
    },
    '127.0.0.1': {
      backend: 'http://localhost:3000',
      protocol: 'http:'
    }
  };

  // Construcción de clave de host
  const hostKey = port ? `${hostname}:${port}` : hostname;

  // Depuración de host
  console.group('🌐 API URL Detection');
  console.log('Hostname:', hostname);
  console.log('Port:', port);
  console.log('Protocol:', protocol);
  console.log('Host Key:', hostKey);

  // Lógica de selección de backend
  let backendConfig = hostMap[hostKey] || hostMap[hostname];

  // Caso de proxy o túnel genérico
  if (!backendConfig) {
    if (hostname.includes('loca.lt')) {
      backendConfig = {
        backend: `${protocol}//tiendarines-api.loca.lt`,
        protocol: protocol
      };
    } else if (hostname.includes('ngrok')) {
      backendConfig = {
        backend: 'https://tu-backend-id.ngrok.io',
        protocol: 'https:'
      };
    } else {
      // Caso por defecto
      backendConfig = {
        backend: 'http://localhost:3000',
        protocol: 'http:'
      };
    }
  }

  // Log de configuración detectada
  console.log('Backend URL:', backendConfig.backend);
  console.groupEnd();

  return backendConfig.backend;
};

// Añadir validación adicional
export const validateApiUrl = (url) => {
  try {
    new URL(url);
    return url;
  } catch (error) {
    console.error('URL de API inválida:', url);
    return 'http://localhost:3000'; // Fallback
  }
};

// Generar URL base
export const API_BASE = validateApiUrl(getApiBaseUrl());

// Log de depuración final
console.log('🌐 Configuración final de API:', API_BASE);