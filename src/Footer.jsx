// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { API_BASE } from './utils/apiConfig';
// const Footer = () => {
//   const [hoverLink, setHoverLink] = useState(null);
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [emailInput, setEmailInput] = useState('');
//   const [subscribed, setSubscribed] = useState(false);
  
//   // Estados para la información de contacto desde la base de datos
//   const [storeInfo, setStoreInfo] = useState({
//     storeName: 'RINESMAX',
//     address: 'Av. Principal #123, Ciudad de México',
//     addressLine2: '',
//     city: '',
//     state: '',
//     zipCode: '',
//     country: 'México',
//     phone: '+52 55 1234 5678',
//     email: 'info@rinesmax.com',
//     contactHours: {
//       monday: { start: '09:00', end: '19:00', enabled: true },
//       tuesday: { start: '09:00', end: '19:00', enabled: true },
//       wednesday: { start: '09:00', end: '19:00', enabled: true },
//       thursday: { start: '09:00', end: '19:00', enabled: true },
//       friday: { start: '09:00', end: '19:00', enabled: true },
//       saturday: { start: '10:00', end: '16:00', enabled: true },
//       sunday: { start: '00:00', end: '00:00', enabled: false }
//     }
//   });
  
//   // Cargar configuraciones desde la API
//   useEffect(() => {
//     const fetchStoreInfo = async () => {
//       try {
//         // API Base URL
//         // const API_BASE = import.meta.env.DEV 
//         //   ? import.meta.env.VITE_API_URL || 'http://localhost:3000'
//         //   : '';
        
//         const response = await fetch(`${API_BASE}/api/settings/general`);
        
//         if (response.ok) {
//           const data = await response.json();
          
//           // Mezclar los datos recibidos con los valores predeterminados para asegurar
//           // que tenemos valores para todos los campos incluso si alguno falta
//           setStoreInfo(prevInfo => ({
//             ...prevInfo,
//             ...data,
//             // Si contactHours viene como string (JSON), parsearlo
//             contactHours: typeof data.contactHours === 'string' 
//               ? JSON.parse(data.contactHours) 
//               : data.contactHours || prevInfo.contactHours
//           }));
//         }
//       } catch (error) {
//         console.error('Error al cargar información de la tienda:', error);
//       }
//     };
    
//     fetchStoreInfo();
//   }, []);

//   // Detectar cambios de tamaño de pantalla
//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const handleSubscribe = (e) => {
//     e.preventDefault();
//     if (emailInput.trim() !== '') {
//       setSubscribed(true);
//       setEmailInput('');
//       // Resetear después de 3 segundos
//       setTimeout(() => {
//         setSubscribed(false);
//       }, 3000);
//     }
//   };

//   // Formatear la dirección completa
//   const getFormattedAddress = () => {
//     const parts = [];
//     if (storeInfo.address) parts.push(storeInfo.address);
//     if (storeInfo.addressLine2) parts.push(storeInfo.addressLine2);
    
//     const locationParts = [];
//     if (storeInfo.city) locationParts.push(storeInfo.city);
//     if (storeInfo.state) locationParts.push(storeInfo.state);
//     if (storeInfo.zipCode) locationParts.push(storeInfo.zipCode);
    
//     if (locationParts.length > 0) {
//       parts.push(locationParts.join(', '));
//     }
    
//     if (storeInfo.country && storeInfo.country !== locationParts[locationParts.length - 1]) {
//       parts.push(storeInfo.country);
//     }
    
//     return parts.join(', ');
//   };
  
//   // Formatear los horarios de contacto
//   const getFormattedHours = () => {
//     const dayTranslations = {
//       monday: 'Lun',
//       tuesday: 'Mar',
//       wednesday: 'Mié',
//       thursday: 'Jue',
//       friday: 'Vie',
//       saturday: 'Sáb',
//       sunday: 'Dom'
//     };
    
//     // Agrupar días con el mismo horario
//     const hourGroups = {};
    
//     Object.entries(storeInfo.contactHours || {}).forEach(([day, settings]) => {
//       if (settings.enabled) {
//         const hourKey = `${settings.start}-${settings.end}`;
//         if (!hourGroups[hourKey]) {
//           hourGroups[hourKey] = [];
//         }
//         hourGroups[hourKey].push(day);
//       }
//     });
    
//     // Formatear los grupos de horarios
//     const formattedGroups = Object.entries(hourGroups).map(([hours, days]) => {
//       const [start, end] = hours.split('-');
//       const formattedDays = days
//         .sort((a, b) => {
//           const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
//           return order.indexOf(a) - order.indexOf(b);
//         })
//         .map(day => dayTranslations[day] || day);
      
//       // Combinar días consecutivos con guiones
//       let result = '';
//       let rangeStart = null;
      
//       for (let i = 0; i < formattedDays.length; i++) {
//         const dayIndex = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].indexOf(formattedDays[i]);
//         const prevDayIndex = i > 0 ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].indexOf(formattedDays[i-1]) : -2;
        
//         if (dayIndex - prevDayIndex !== 1) {
//           // No consecutivo
//           if (rangeStart !== null) {
//             result += (result ? ', ' : '') + (rangeStart === formattedDays[i-1] ? rangeStart : `${rangeStart} - ${formattedDays[i-1]}`);
//             rangeStart = formattedDays[i];
//           } else {
//             rangeStart = formattedDays[i];
//           }
//         } else if (i === formattedDays.length - 1) {
//           // Último día y consecutivo
//           result += (result ? ', ' : '') + `${rangeStart} - ${formattedDays[i]}`;
//         } else if (i === 0) {
//           // Primer día
//           rangeStart = formattedDays[i];
//         }
//       }
      
//       // Si solo hay un día o el último no formó parte de un rango
//       if (formattedDays.length === 1 || rangeStart === formattedDays[formattedDays.length - 1]) {
//         result += (result ? ', ' : '') + rangeStart;
//       }
      
//       // Formatear horas en formato de 12 horas
//       const formatTime = (time) => {
//         const [hours, minutes] = time.split(':');
//         const hour = parseInt(hours);
//         return `${hour % 12 || 12}${minutes !== '00' ? `:${minutes}` : ''}${hour >= 12 ? 'pm' : 'am'}`;
//       };
      
//       return `${result}: ${formatTime(start)} - ${formatTime(end)}`;
//     });
    
//     return formattedGroups.join('<br />');
//   };

//   // Efecto hover para iconos sociales
//   const SocialIcon = ({ href, children }) => {
//     const [isHovered, setIsHovered] = useState(false);
//     return (
//       <a
//         href={href}
//         className="relative group"
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//       >
//         <div className={`absolute inset-0 bg-yellow-500 rounded-full transform transition-all duration-300 ${isHovered ? 'scale-100 opacity-20' : 'scale-50 opacity-0'}`}></div>
//         <div className={`relative text-gray-400 transition-all duration-300 transform ${isHovered ? 'text-white translate-y-[-3px]' : ''}`}>
//           {children}
//         </div>
//       </a>
//     );
//   };

//   return (
//     <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-white pt-12 pb-8 relative overflow-hidden">
//       {/* Elementos decorativos de fondo */}
//       <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 rounded-full bg-yellow-500 opacity-5 transform translate-x-1/2 -translate-y-1/2"></div>
//       <div className="hidden lg:block absolute bottom-0 left-0 w-48 h-48 rounded-full bg-yellow-500 opacity-5 transform -translate-x-1/2 translate-y-1/2"></div>

//       <div className="container mx-auto px-4 relative z-10">
//         <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 md:grid-cols-4 gap-8'}`}>
//           {/* Información de la empresa */}
//           <div className="transform transition-transform duration-500 hover:translate-y-[-5px]">
//             <h3 className="text-xl font-bold mb-4 relative inline-block">
//               {storeInfo.storeName || 'RINESPORT'}<span className="text-yellow-500">CESAR</span>
//               <span className="absolute left-0 bottom-0 w-1/2 h-0.5 bg-yellow-500"></span>
//             </h3>
//             <p className="text-gray-400 mb-6">
//               La mejor tienda de rines y accesorios para tu vehículo con más de 10 años de experiencia.
//             </p>

//             <div className="flex space-x-4">
//               <SocialIcon href="#">
//                 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
//                 </svg>
//               </SocialIcon>
//               <SocialIcon href="#">
//                 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.077 10.077 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.095a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
//                 </svg>
//               </SocialIcon>
//               <SocialIcon href="#">
//                 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
//                 </svg>
//               </SocialIcon>
//               <SocialIcon href="#">
//                 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
//                 </svg>
//               </SocialIcon>
//             </div>

//           </div>

//           {/* Secciones colapsables en móvil */}
//           {isMobile ? (
//             <>
//               {/* Sección de Enlaces Rápidos */}
//               <div>
//                 <details className="group">
//                   <summary className="flex justify-between items-center font-semibold cursor-pointer list-none border-b border-gray-700 pb-2">
//                     <h3 className="text-xl">Enlaces Rápidos</h3>
//                     <span className="transition group-open:rotate-180">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                       </svg>
//                     </span>
//                   </summary>
//                   <ul className="mt-4 space-y-2">
//                     {[
//                       { to: "/", label: "Inicio" },
//                       { to: "/productos", label: "Productos" },
//                       { to: "/ofertas", label: "Ofertas" },
//                       { to: "/sucursales", label: "Sucursales" },
//                       { to: "/blog", label: "Blog" }
//                     ].map((link) => (
//                       <li key={link.to}>
//                         <Link
//                           to={link.to}
//                           className="text-gray-400 hover:text-white block py-1"
//                         >
//                           {link.label}
//                         </Link>
//                       </li>
//                     ))}
//                   </ul>
//                 </details>
//               </div>

//               {/* Sección de Ayuda */}
//               <div>
//                 <details className="group">
//                   <summary className="flex justify-between items-center font-semibold cursor-pointer list-none border-b border-gray-700 pb-2">
//                     <h3 className="text-xl">Ayuda</h3>
//                     <span className="transition group-open:rotate-180">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                       </svg>
//                     </span>
//                   </summary>
//                   <ul className="mt-4 space-y-2">
//                     {[
//                       { to: "/faq", label: "Preguntas Frecuentes" },
//                       { to: "/envios", label: "Envíos" },
//                       { to: "/devoluciones", label: "Devoluciones" },
//                       { to: "/garantia", label: "Garantía" },
//                       { to: "/contacto", label: "Contacto" }
//                     ].map((link) => (
//                       <li key={link.to}>
//                         <Link
//                           to={link.to}
//                           className="text-gray-400 hover:text-white block py-1"
//                         >
//                           {link.label}
//                         </Link>
//                       </li>
//                     ))}
//                   </ul>
//                 </details>
//               </div>
//             </>
//           ) : (
//             <>
//               {/* Secciones normales para escritorio */}
//               <div>
//                 <h3 className="text-xl font-bold mb-4 relative inline-block">
//                   Enlaces Rápidos
//                   <span className="absolute left-0 bottom-0 w-1/2 h-0.5 bg-yellow-500"></span>
//                 </h3>
//                 <ul className="space-y-2">
//                   {[
//                     { to: "/", label: "Inicio" },
//                     { to: "/productos", label: "Productos" },
//                     { to: "/ofertas", label: "Ofertas" },
//                     { to: "/sucursales", label: "Sucursales" },
//                     { to: "/blog", label: "Blog" }
//                   ].map((link, index) => (
//                     <li key={link.to} style={{ transitionDelay: `${index * 50}ms` }}>
//                       <Link
//                         to={link.to}
//                         className="text-gray-400 hover:text-white flex items-center group transition-all duration-300"
//                         onMouseEnter={() => setHoverLink(link.to)}
//                         onMouseLeave={() => setHoverLink(null)}
//                       >
//                         <span className={`inline-block w-0 overflow-hidden transition-all duration-300 ${hoverLink === link.to ? 'w-3 mr-1' : 'w-0'}`}>
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                           </svg>
//                         </span>
//                         <span className="relative overflow-hidden">
//                           {link.label}
//                           <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
//                         </span>
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <div>
//                 <h3 className="text-xl font-bold mb-4 relative inline-block">
//                   Ayuda
//                   <span className="absolute left-0 bottom-0 w-1/2 h-0.5 bg-yellow-500"></span>
//                 </h3>
//                 <ul className="space-y-2">
//                   {[
//                     { to: "/faq", label: "Preguntas Frecuentes" },
//                     { to: "/envios", label: "Envíos" },
//                     { to: "/devoluciones", label: "Devoluciones" },
//                     { to: "/garantia", label: "Garantía" },
//                     { to: "/contacto", label: "Contacto" }
//                   ].map((link, index) => (
//                     <li key={link.to} style={{ transitionDelay: `${index * 50}ms` }}>
//                       <Link
//                         to={link.to}
//                         className="text-gray-400 hover:text-white flex items-center group transition-all duration-300"
//                         onMouseEnter={() => setHoverLink(link.to)}
//                         onMouseLeave={() => setHoverLink(null)}
//                       >
//                         <span className={`inline-block w-0 overflow-hidden transition-all duration-300 ${hoverLink === link.to ? 'w-3 mr-1' : 'w-0'}`}>
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                           </svg>
//                         </span>
//                         <span className="relative overflow-hidden">
//                           {link.label}
//                           <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
//                         </span>
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </>
//           )}

//           {/* Contacto (siempre visible) */}
//           <div className={`${isMobile ? 'col-span-full' : ''}`}>
//             <h3 className="text-xl font-bold mb-4 relative inline-block">
//               Contacto
//               <span className="absolute left-0 bottom-0 w-1/2 h-0.5 bg-yellow-500"></span>
//             </h3>
//             <ul className={`space-y-3 ${isMobile ? 'grid grid-cols-2 gap-4' : ''}`}>
//               <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
//                 <span className="mr-3 mt-1 p-1.5 bg-gray-700 rounded-full text-yellow-500 transform transition-transform duration-300 hover:rotate-12">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                   </svg>
//                 </span>
//                 <span className="text-gray-300 text-sm">{getFormattedAddress()}</span>
//               </li>
//               <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
//                 <span className="mr-3 mt-1 p-1.5 bg-gray-700 rounded-full text-yellow-500 transform transition-transform duration-300 hover:rotate-12">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                   </svg>
//                 </span>
//                 <span className="text-gray-300 text-sm">{storeInfo.phone}</span>
//               </li>
//               <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
//                 <span className="mr-3 mt-1 p-1.5 bg-gray-700 rounded-full text-yellow-500 transform transition-transform duration-300 hover:rotate-12">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                   </svg>
//                 </span>
//                 <span className="text-gray-300 text-sm">{storeInfo.email}</span>
//               </li>
//               <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
//                 <span className="mr-3 mt-1 p-1.5 bg-gray-700 rounded-full text-yellow-500 transform transition-transform duration-300 hover:rotate-12">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </span>
//                 <span 
//                   className="text-gray-300 text-sm"
//                   dangerouslySetInnerHTML={{ __html: getFormattedHours() }}
//                 />
//               </li>
//             </ul>
//           </div>
//         </div>

//        {/* Línea divisoria */}
//        <div className="border-t border-gray-700 mt-8 pt-8">
//           <div className="flex flex-col md:flex-row justify-between items-center">
//             <p className="text-gray-400 text-sm text-center md:text-left">&copy; {new Date().getFullYear()} {storeInfo.storeName || 'RINESMAX'}. Todos los derechos reservados.</p>
//             <div className={`mt-4 md:mt-0 flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-2 ${isMobile ? 'w-full' : ''}`}>
//               <Link to="/terminos" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">Términos y condiciones</Link>
//               <Link to="/privacidad" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">Política de privacidad</Link>
//               <Link to="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">Política de cookies</Link>
//               <Link to="/admin" className="text-sm text-gray-700 hover:text-gray-500 transition-colors duration-200">Admin</Link>
//             </div>
//           </div>
//         </div>

//         {/* "Flecha hacia arriba" para volver al inicio */}
//         <button
//           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
//           className={`back-to-top fixed bottom-8 right-8 bg-yellow-500 text-gray-900 p-2 rounded-full shadow-lg hover:bg-yellow-400 transition-all duration-300 hover:transform hover:scale-110 focus:outline-none z-50 ${isMobile ? 'bottom-4 right-4 p-1.5' : ''}`}
//           aria-label="Volver arriba"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
//           </svg>
//         </button>
//       </div>
//     </footer>
//   );
// };

// export default Footer;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from './utils/apiConfig';

const Footer = () => {
  const [hoverLink, setHoverLink] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  
  // Estados para la información de contacto desde la base de datos
  const [storeInfo, setStoreInfo] = useState({
    storeName: 'RINESMAX',
    address: 'Av. Principal #123, Ciudad de México',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'México',
    phone: '+52 55 1234 5678',
    email: 'info@rinesmax.com',
    contactHours: {
      monday: { start: '09:00', end: '19:00', enabled: true },
      tuesday: { start: '09:00', end: '19:00', enabled: true },
      wednesday: { start: '09:00', end: '19:00', enabled: true },
      thursday: { start: '09:00', end: '19:00', enabled: true },
      friday: { start: '09:00', end: '19:00', enabled: true },
      saturday: { start: '10:00', end: '16:00', enabled: true },
      sunday: { start: '00:00', end: '00:00', enabled: false }
    }
  });
  
  // Cargar configuraciones desde la API
  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/settings/general`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Mezclar los datos recibidos con los valores predeterminados para asegurar
          // que tenemos valores para todos los campos incluso si alguno falta
          setStoreInfo(prevInfo => ({
            ...prevInfo,
            ...data,
            // Si contactHours viene como string (JSON), parsearlo
            contactHours: typeof data.contactHours === 'string' 
              ? JSON.parse(data.contactHours) 
              : data.contactHours || prevInfo.contactHours
          }));
        }
      } catch (error) {
        console.error('Error al cargar información de la tienda:', error);
      }
    };
    
    fetchStoreInfo();
  }, []);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim() !== '') {
      setSubscribed(true);
      setEmailInput('');
      // Resetear después de 3 segundos
      setTimeout(() => {
        setSubscribed(false);
      }, 3000);
    }
  };

  // Formatear la dirección completa
  const getFormattedAddress = () => {
    const parts = [];
    if (storeInfo.address) parts.push(storeInfo.address);
    if (storeInfo.addressLine2) parts.push(storeInfo.addressLine2);
    
    const locationParts = [];
    if (storeInfo.city) locationParts.push(storeInfo.city);
    if (storeInfo.state) locationParts.push(storeInfo.state);
    if (storeInfo.zipCode) locationParts.push(storeInfo.zipCode);
    
    if (locationParts.length > 0) {
      parts.push(locationParts.join(', '));
    }
    
    if (storeInfo.country && storeInfo.country !== locationParts[locationParts.length - 1]) {
      parts.push(storeInfo.country);
    }
    
    return parts.join(', ');
  };
  
  // Formatear los horarios de contacto
  const getFormattedHours = () => {
    const dayTranslations = {
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mié',
      thursday: 'Jue',
      friday: 'Vie',
      saturday: 'Sáb',
      sunday: 'Dom'
    };
    
    // Agrupar días con el mismo horario
    const hourGroups = {};
    
    Object.entries(storeInfo.contactHours || {}).forEach(([day, settings]) => {
      if (settings.enabled) {
        const hourKey = `${settings.start}-${settings.end}`;
        if (!hourGroups[hourKey]) {
          hourGroups[hourKey] = [];
        }
        hourGroups[hourKey].push(day);
      }
    });
    
    // Formatear los grupos de horarios
    const formattedGroups = Object.entries(hourGroups).map(([hours, days]) => {
      const [start, end] = hours.split('-');
      const formattedDays = days
        .sort((a, b) => {
          const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          return order.indexOf(a) - order.indexOf(b);
        })
        .map(day => dayTranslations[day] || day);
      
      // Combinar días consecutivos con guiones
      let result = '';
      let rangeStart = null;
      
      for (let i = 0; i < formattedDays.length; i++) {
        const dayIndex = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].indexOf(formattedDays[i]);
        const prevDayIndex = i > 0 ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].indexOf(formattedDays[i-1]) : -2;
        
        if (dayIndex - prevDayIndex !== 1) {
          // No consecutivo
          if (rangeStart !== null) {
            result += (result ? ', ' : '') + (rangeStart === formattedDays[i-1] ? rangeStart : `${rangeStart} - ${formattedDays[i-1]}`);
            rangeStart = formattedDays[i];
          } else {
            rangeStart = formattedDays[i];
          }
        } else if (i === formattedDays.length - 1) {
          // Último día y consecutivo
          result += (result ? ', ' : '') + `${rangeStart} - ${formattedDays[i]}`;
        } else if (i === 0) {
          // Primer día
          rangeStart = formattedDays[i];
        }
      }
      
      // Si solo hay un día o el último no formó parte de un rango
      if (formattedDays.length === 1 || rangeStart === formattedDays[formattedDays.length - 1]) {
        result += (result ? ', ' : '') + rangeStart;
      }
      
      // Formatear horas en formato de 12 horas
      const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        return `${hour % 12 || 12}${minutes !== '00' ? `:${minutes}` : ''}${hour >= 12 ? 'pm' : 'am'}`;
      };
      
      return `${result}: ${formatTime(start)} - ${formatTime(end)}`;
    });
    
    return formattedGroups.join('<br />');
  };

  // Efecto hover para iconos sociales
  const SocialIcon = ({ href, children }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <a
        href={href}
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Redes sociales"
      >
        <div className={`absolute inset-0 bg-yellow-500 rounded-full transform transition-all duration-300 ${isHovered ? 'scale-100 opacity-20' : 'scale-50 opacity-0'}`}></div>
        <div className={`relative text-gray-400 transition-all duration-300 transform ${isHovered ? 'text-white translate-y-[-3px]' : ''}`}>
          {children}
        </div>
      </a>
    );
  };

  return (
    <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-white pt-8 sm:pt-10 md:pt-12 pb-6 sm:pb-8 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 rounded-full bg-yellow-500 opacity-5 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="hidden lg:block absolute bottom-0 left-0 w-48 h-48 rounded-full bg-yellow-500 opacity-5 transform -translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4 sm:gap-6' : 'grid-cols-2 md:grid-cols-4 gap-8'}`}>
          {/* Información de la empresa */}
          <div className="transform transition-transform duration-500 hover:translate-y-[-5px]">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 relative inline-block">
              {storeInfo.storeName || 'RINESPORT'}<span className="text-yellow-500">CESAR</span>
              <span className="absolute left-0 bottom-0 w-1/2 h-0.5 bg-yellow-500"></span>
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">
              La mejor tienda de rines y accesorios para tu vehículo con más de 10 años de experiencia.
            </p>

            <div className="flex space-x-3 sm:space-x-4">
              <SocialIcon href="#">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.077 10.077 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.095a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Secciones colapsables en móvil */}
          {isMobile ? (
            <>
              {/* Sección de Enlaces Rápidos */}
              <div>
                <details className="group">
                  <summary className="flex justify-between items-center font-semibold cursor-pointer list-none border-b border-gray-700 pb-2">
                    <h3 className="text-lg sm:text-xl">Enlaces Rápidos</h3>
                    <span className="transition group-open:rotate-180">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <ul className="mt-3 space-y-1 sm:space-y-2 pl-1">
                    {[
                      { to: "/", label: "Inicio" },
                      { to: "/productos", label: "Productos" },
                      { to: "/ofertas", label: "Ofertas" },
                      { to: "/sucursales", label: "Sucursales" },
                      { to: "/blog", label: "Blog" }
                    ].map((link) => (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          className="text-gray-400 hover:text-white block py-1 text-sm sm:text-base"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>

              {/* Sección de Ayuda */}
              <div>
                <details className="group mt-2 sm:mt-3">
                  <summary className="flex justify-between items-center font-semibold cursor-pointer list-none border-b border-gray-700 pb-2">
                    <h3 className="text-lg sm:text-xl">Ayuda</h3>
                    <span className="transition group-open:rotate-180">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <ul className="mt-3 space-y-1 sm:space-y-2 pl-1">
                    {[
                      { to: "/faq", label: "Preguntas Frecuentes" },
                      { to: "/envios", label: "Envíos" },
                      { to: "/devoluciones", label: "Devoluciones" },
                      { to: "/garantia", label: "Garantía" },
                      { to: "/contacto", label: "Contacto" }
                    ].map((link) => (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          className="text-gray-400 hover:text-white block py-1 text-sm sm:text-base"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            </>
          ) : (
            <>
              {/* Secciones normales para escritorio */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 relative inline-block">
                  Enlaces Rápidos
                  <span className="absolute left-0 bottom-0 w-1/2 h-0.5 bg-yellow-500"></span>
                </h3>
                <ul className="space-y-1 sm:space-y-2">
                  {[
                    { to: "/", label: "Inicio" },
                    { to: "/productos", label: "Productos" },
                    { to: "/ofertas", label: "Ofertas" },
                    { to: "/sucursales", label: "Sucursales" },
                    { to: "/blog", label: "Blog" }
                  ].map((link, index) => (
                    <li key={link.to} style={{ transitionDelay: `${index * 50}ms` }}>
                      <Link
                        to={link.to}
                        className="text-gray-400 hover:text-white flex items-center group transition-all duration-300"
                        onMouseEnter={() => setHoverLink(link.to)}
                        onMouseLeave={() => setHoverLink(null)}
                      >
                        <span className={`inline-block w-0 overflow-hidden transition-all duration-300 ${hoverLink === link.to ? 'w-3 mr-1' : 'w-0'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                        <span className="relative overflow-hidden">
                          {link.label}
                          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 relative inline-block">
                  Ayuda
                  <span className="absolute left-0 bottom-0 w-1/2 h-0.5 bg-yellow-500"></span>
                </h3>
                <ul className="space-y-1 sm:space-y-2">
                  {[
                    { to: "/faq", label: "Preguntas Frecuentes" },
                    { to: "/envios", label: "Envíos" },
                    { to: "/devoluciones", label: "Devoluciones" },
                    { to: "/garantia", label: "Garantía" },
                    { to: "/contacto", label: "Contacto" }
                  ].map((link, index) => (
                    <li key={link.to} style={{ transitionDelay: `${index * 50}ms` }}>
                      <Link
                        to={link.to}
                        className="text-gray-400 hover:text-white flex items-center group transition-all duration-300"
                        onMouseEnter={() => setHoverLink(link.to)}
                        onMouseLeave={() => setHoverLink(null)}
                      >
                        <span className={`inline-block w-0 overflow-hidden transition-all duration-300 ${hoverLink === link.to ? 'w-3 mr-1' : 'w-0'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                        <span className="relative overflow-hidden">
                          {link.label}
                          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Contacto (siempre visible) */}
          <div className={`${isMobile ? 'col-span-full mt-4' : ''}`}>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 relative inline-block">
              Contacto
              <span className="absolute left-0 bottom-0 w-1/2 h-0.5 bg-yellow-500"></span>
            </h3>
            <ul className={`space-y-2 sm:space-y-3 ${isSmallMobile ? '' : isMobile ? 'grid grid-cols-2 gap-3' : ''}`}>
              <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
                <span className="mr-2 sm:mr-3 mt-1 p-1 sm:p-1.5 bg-gray-700 rounded-full text-yellow-500 transform transition-transform duration-300 hover:rotate-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <span className="text-gray-300 text-xs sm:text-sm">{getFormattedAddress()}</span>
              </li>
              <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
                <span className="mr-2 sm:mr-3 mt-1 p-1 sm:p-1.5 bg-gray-700 rounded-full text-yellow-500 transform transition-transform duration-300 hover:rotate-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <span className="text-gray-300 text-xs sm:text-sm">{storeInfo.phone}</span>
              </li>
              <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
                <span className="mr-2 sm:mr-3 mt-1 p-1 sm:p-1.5 bg-gray-700 rounded-full text-yellow-500 transform transition-transform duration-300 hover:rotate-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="text-gray-300 text-xs sm:text-sm">{storeInfo.email}</span>
              </li>
              <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
                <span className="mr-2 sm:mr-3 mt-1 p-1 sm:p-1.5 bg-gray-700 rounded-full text-yellow-500 transform transition-transform duration-300 hover:rotate-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span 
                  className="text-gray-300 text-xs sm:text-sm"
                  dangerouslySetInnerHTML={{ __html: getFormattedHours() }}
                />
              </li>
            </ul>
          </div>
        </div>

       {/* Línea divisoria */}
       <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-4 sm:pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">&copy; {new Date().getFullYear()} {storeInfo.storeName || 'RINESMAX'}. Todos los derechos reservados.</p>
            <div className={`mt-3 md:mt-0 flex flex-wrap justify-center md:justify-end gap-x-3 sm:gap-x-4 gap-y-1 sm:gap-y-2 ${isMobile ? 'w-full' : ''}`}>
              <Link to="/terminos" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors duration-200">Términos y condiciones</Link>
              <Link to="/privacidad" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors duration-200">Política de privacidad</Link>
              <Link to="/cookies" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors duration-200">Política de cookies</Link>
              <Link to="/admin" className="text-xs sm:text-sm text-gray-700 hover:text-gray-500 transition-colors duration-200">Admin</Link>
            </div>
          </div>
        </div>

        {/* "Flecha hacia arriba" para volver al inicio */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`back-to-top fixed bottom-4 sm:bottom-6 right-4 sm:right-6 bg-yellow-500 text-gray-900 p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-yellow-400 transition-all duration-300 hover:transform hover:scale-110 focus:outline-none z-50`}
          aria-label="Volver arriba"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>
    </footer>
  );
};

export default Footer;