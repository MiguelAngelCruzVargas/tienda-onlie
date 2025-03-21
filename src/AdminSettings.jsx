import React, { useState, useEffect } from 'react';
import { API_BASE } from './utils/apiConfig';
const AdminSettings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    storeName: '',
    email: '',
    phone: '',
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'México',
    currency: 'MXN',
    taxRate: 0,
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

  const [shippingSettings, setShippingSettings] = useState({
    enableFreeShipping: false,
    freeShippingMinimum: 0,
    flatRate: 0,
    localPickupEnabled: false
  });

  const [paymentSettings, setPaymentSettings] = useState({
    enableMercadoPago: false,
    enableBankTransfer: false,
    enableCashOnDelivery: false,
    enableCreditCard: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newOrderEmail: false,
    newOrderSMS: false,
    lowStockAlert: false,
    lowStockThreshold: 5,
    marketingEmails: false
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Traducción de días para mejorar UX
  const dayTranslations = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // API Base URL
        // const API_BASE = import.meta.env.DEV 
        //   ? import.meta.env.VITE_API_URL || 'http://localhost:3000'
        //   : '';

        // Token de autenticación
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Fetch general settings
        try {
          const generalResponse = await fetch(`${API_BASE}/api/settings/general`, { headers });
          if (generalResponse.ok) {
            const generalData = await generalResponse.json();
            setGeneralSettings(prevState => ({
              ...prevState,
              ...generalData
            }));
          }
        } catch (generalError) {
          console.warn('No se pudo cargar la configuración general:', generalError);
        }

        // Fetch shipping settings
        try {
          const shippingResponse = await fetch(`${API_BASE}/api/settings/shipping`, { headers });
          if (shippingResponse.ok) {
            const shippingData = await shippingResponse.json();
            setShippingSettings(prevState => ({
              ...prevState,
              ...shippingData
            }));
          }
        } catch (shippingError) {
          console.warn('No se pudo cargar la configuración de envío:', shippingError);
        }

        // Fetch payment settings
        try {
          const paymentResponse = await fetch(`${API_BASE}/api/settings/payment`, { headers });
          if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json();
            setPaymentSettings(prevState => ({
              ...prevState,
              ...paymentData
            }));
          }
        } catch (paymentError) {
          console.warn('No se pudo cargar la configuración de pagos:', paymentError);
        }

        // Fetch notification settings
        try {
          const notificationResponse = await fetch(`${API_BASE}/api/settings/notifications`, { headers });
          if (notificationResponse.ok) {
            const notificationData = await notificationResponse.json();
            setNotificationSettings(prevState => ({
              ...prevState,
              ...notificationData
            }));
          }
        } catch (notificationError) {
          console.warn('No se pudo cargar la configuración de notificaciones:', notificationError);
        }

      } catch (err) {
        console.error('Error al cargar configuraciones:', err);
        setError(`Error al cargar configuraciones: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleGeneralChange = (e) => {
    const { name, value, type } = e.target;

    // Manejo de cambios para campos base
    if (!name.includes('contactHours')) {
      setGeneralSettings({
        ...generalSettings,
        [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
      });
    }
  };

  const handleContactHoursChange = (day, field, value) => {
    setGeneralSettings(prev => ({
      ...prev,
      contactHours: {
        ...prev.contactHours,
        [day]: {
          ...prev.contactHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleShippingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShippingSettings({
      ...shippingSettings,
      [name]: type === 'checkbox' ? checked :
        type === 'number' ? (value === '' ? 0 : parseFloat(value)) :
          value
    });
  };

  const handlePaymentChange = (e) => {
    const { name, checked } = e.target;
    setPaymentSettings({
      ...paymentSettings,
      [name]: checked
    });
  };

  const handleNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: type === 'checkbox' ? checked :
        type === 'number' ? (value === '' ? 0 : parseInt(value)) :
          value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      // API Base URL
      // const API_BASE = import.meta.env.DEV 
      //   ? import.meta.env.VITE_API_URL || 'http://localhost:3000'
      //   : '';
      
      // Token de autenticación
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Guardar configuración general
      const generalResponse = await fetch(`${API_BASE}/api/settings/general`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(generalSettings)
      });

      if (!generalResponse.ok) {
        const generalError = await generalResponse.json();
        throw new Error(generalError.message || 'Error al guardar configuración general');
      }

      // Guardar configuración de envío
      const shippingResponse = await fetch(`${API_BASE}/api/settings/shipping`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(shippingSettings)
      });

      if (!shippingResponse.ok) {
        const shippingError = await shippingResponse.json();
        throw new Error(shippingError.message || 'Error al guardar configuración de envío');
      }

      // Guardar configuración de pagos
      const paymentResponse = await fetch(`${API_BASE}/api/settings/payment`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(paymentSettings)
      });

      if (!paymentResponse.ok) {
        const paymentError = await paymentResponse.json();
        throw new Error(paymentError.message || 'Error al guardar configuración de pagos');
      }

      // Guardar configuración de notificaciones
      const notificationResponse = await fetch(`${API_BASE}/api/settings/notifications`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(notificationSettings)
      });

      if (!notificationResponse.ok) {
        const notificationError = await notificationResponse.json();
        throw new Error(notificationError.message || 'Error al guardar configuración de notificaciones');
      }

      // Mostrar mensaje de éxito
      setSaveSuccess(true);

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error al guardar configuraciones:', err);
      setError(`Error al guardar configuraciones: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Mostrar spinner durante la carga
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center h-[calc(100vh-150px)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-700">Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Configuración de la Tienda</h1>

      {/* Mensajes de alerta */}
      {saveSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 md:p-4 mb-4 md:mb-6 rounded-md shadow flex items-center justify-between" role="alert">
          <div className="flex items-center">
            <svg className="h-5 w-5 md:h-6 md:w-6 mr-2 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="font-medium text-sm md:text-base">Configuración guardada exitosamente.</p>
          </div>
          <button
            onClick={() => setSaveSuccess(false)}
            className="text-green-700 hover:text-green-900"
          >
            <svg className="h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 md:p-4 mb-4 md:mb-6 rounded-md shadow flex items-center justify-between" role="alert">
          <div className="flex items-center">
            <svg className="h-5 w-5 md:h-6 md:w-6 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-medium text-sm md:text-base">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900"
          >
            <svg className="h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Tabs para móvil */}
      <div className="mb-6 overflow-x-auto md:hidden">
        <div className="flex space-x-2 bg-gray-100 p-1.5 rounded-lg w-full">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 text-sm rounded-md flex-1 ${activeTab === 'general' ? 'bg-white shadow-sm text-indigo-600 font-medium' : 'text-gray-600'}`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-3 py-1.5 text-sm rounded-md flex-1 ${activeTab === 'shipping' ? 'bg-white shadow-sm text-indigo-600 font-medium' : 'text-gray-600'}`}
          >
            Envío
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-3 py-1.5 text-sm rounded-md flex-1 ${activeTab === 'payment' ? 'bg-white shadow-sm text-indigo-600 font-medium' : 'text-gray-600'}`}
          >
            Pagos
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 text-sm rounded-md flex-1 ${activeTab === 'notifications' ? 'bg-white shadow-sm text-indigo-600 font-medium' : 'text-gray-600'}`}
          >
            Alertas
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        {/* Configuración General - visible en todas las pantallas o cuando el tab general está activo */}
        <div className={`bg-white shadow-md rounded-lg p-4 md:p-6 ${(activeTab === 'general' || window.innerWidth >= 768) ? 'block' : 'hidden'}`}>
          <h2 className="text-lg font-semibold mb-4">Configuración General</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="storeName">
                Nombre de la Tienda <span className="text-red-600">*</span>
              </label>
              <input
                className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="storeName"
                name="storeName"
                type="text"
                value={generalSettings.storeName}
                onChange={handleGeneralChange}
                required
                placeholder="Nombre de tu tienda"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">
                Email de Contacto <span className="text-red-600">*</span>
              </label>
              <input
                className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="email"
                name="email"
                type="email"
                value={generalSettings.email}
                onChange={handleGeneralChange}
                required
                placeholder="contacto@ejemplo.com"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="phone">
                Teléfono
              </label>
              <input
                className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="phone"
                name="phone"
                type="text"
                value={generalSettings.phone}
                onChange={handleGeneralChange}
                placeholder="+52 (123) 456-7890"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="address">
                Dirección (Línea 1)
              </label>
              <input
                className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="address"
                name="address"
                type="text"
                value={generalSettings.address}
                onChange={handleGeneralChange}
                placeholder="Calle y número"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="addressLine2">
                Dirección (Línea 2)
              </label>
              <input
                className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="addressLine2"
                name="addressLine2"
                type="text"
                value={generalSettings.addressLine2}
                onChange={handleGeneralChange}
                placeholder="Colonia, Interior, etc."
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="city">
                Ciudad
              </label>
              <input
                className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="city"
                name="city"
                type="text"
                value={generalSettings.city}
                onChange={handleGeneralChange}
                placeholder="Ciudad"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="state">
                Estado
              </label>
              <input
                className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="state"
                name="state"
                type="text"
                value={generalSettings.state}
                onChange={handleGeneralChange}
                placeholder="Estado"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="zipCode">
                Código Postal
              </label>
              <input
                className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="zipCode"
                name="zipCode"
                type="text"
                value={generalSettings.zipCode}
                onChange={handleGeneralChange}
                placeholder="Código Postal"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="country">
                País
              </label>
              <input
                className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="country"
                name="country"
                type="text"
                value={generalSettings.country}
                onChange={handleGeneralChange}
                placeholder="País"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="currency">
                Moneda
              </label>
              <select
                className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="currency"
                name="currency"
                value={generalSettings.currency}
                onChange={handleGeneralChange}
              >
                <option value="MXN">Peso Mexicano (MXN)</option>
                <option value="USD">Dólar Estadounidense (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="taxRate">
                Tasa de Impuesto (%)
              </label>
              <input
                className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="taxRate"
                name="taxRate"
                type="number"
                min="0"
                step="0.1"
                value={generalSettings.taxRate}
                onChange={handleGeneralChange}
                placeholder="16.0"
              />
            </div>
          </div>

          {/* Horarios de Contacto */}
          <div className="mt-6">
            <h3 className="text-md font-medium mb-3">Horarios de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(generalSettings.contactHours).map(([day, settings]) => (
                <div key={day} className="flex flex-wrap items-center space-x-2 p-2 bg-gray-50 rounded-md">
                  <label className="flex items-center cursor-pointer w-full md:w-auto mb-2 md:mb-0">
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(e) => handleContactHoursChange(day, 'enabled', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-400"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">{dayTranslations[day] || day}</span>
                  </label>

                  {settings.enabled && (
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                      <input
                        type="time"
                        value={settings.start}
                        onChange={(e) => handleContactHoursChange(day, 'start', e.target.value)}
                        className="shadow-sm border border-gray-300 rounded-md py-1 px-2 text-sm text-gray-700 w-24"
                      />
                      <span className="text-gray-500">a</span>
                      <input
                        type="time"
                        value={settings.end}
                        onChange={(e) => handleContactHoursChange(day, 'end', e.target.value)}
                        className="shadow-sm border border-gray-300 rounded-md py-1 px-2 text-sm text-gray-700 w-24"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Configuración de Envío - visible cuando el tab shipping está activo o en pantallas grandes */}
        <div className={`bg-white shadow-md rounded-lg p-4 md:p-6 ${(activeTab === 'shipping' || window.innerWidth >= 768) ? 'block' : 'hidden'}`}>
          <h2 className="text-lg font-semibold mb-4">Configuración de Envío</h2>

          <div className="space-y-4">
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enableFreeShipping"
                  checked={shippingSettings.enableFreeShipping}
                  onChange={handleShippingChange}
                  className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <span className="ml-2 text-sm text-gray-700">Habilitar envío gratuito</span>
              </label>
            </div>

            {shippingSettings.enableFreeShipping && (
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="freeShippingMinimum">
                  Mínimo para envío gratuito
                </label>
                <div className="flex items-center">
                  <span className="text-gray-700 mr-2">$</span>
                  <input
                    className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                    id="freeShippingMinimum"
                    name="freeShippingMinimum"
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingSettings.freeShippingMinimum}
                    onChange={handleShippingChange}
                    placeholder="1000.00"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="flatRate">
                Tarifa Plana de Envío
              </label>
              <div className="flex items-center">
                <span className="text-gray-700 mr-2">$</span>
                <input
                  className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                  id="flatRate"
                  name="flatRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingSettings.flatRate}
                  onChange={handleShippingChange}
                  placeholder="150.00"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="localPickupEnabled"
                  checked={shippingSettings.localPickupEnabled}
                  onChange={handleShippingChange}
                  className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <span className="ml-2 text-sm text-gray-700">Habilitar recogida local</span>
              </label>
            </div>
          </div>
        </div>

       {/* Métodos de Pago - visible cuando el tab payment está activo o en pantallas grandes */}
<div className={`bg-white shadow-md rounded-lg p-4 md:p-6 ${(activeTab === 'payment' || window.innerWidth >= 768) ? 'block' : 'hidden'}`}>
  <h2 className="text-lg font-semibold mb-4">Métodos de Pago</h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          name="enableMercadoPago"
          checked={paymentSettings.enableMercadoPago}
          onChange={handlePaymentChange}
          className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-400"
        />
        <span className="ml-2 text-sm text-gray-700 font-medium">Mercado Pago</span>
      </label>
      <p className="text-xs text-gray-500 mt-1 ml-6">Procesa pagos con tarjetas, QR y otros métodos disponibles en Mercado Pago.</p>
    </div>

    <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          name="enableBankTransfer"
          checked={paymentSettings.enableBankTransfer}
          onChange={handlePaymentChange}
          className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-400"
        />
        <span className="ml-2 text-sm text-gray-700 font-medium">Transferencia Bancaria</span>
      </label>
      <p className="text-xs text-gray-500 mt-1 ml-6">Permite a los clientes pagar mediante transferencia a tu cuenta bancaria.</p>
    </div>

    <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          name="enableCashOnDelivery"
          checked={paymentSettings.enableCashOnDelivery}
          onChange={handlePaymentChange}
          className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-400"
        />
        <span className="ml-2 text-sm text-gray-700 font-medium">Pago contra entrega</span>
      </label>
      <p className="text-xs text-gray-500 mt-1 ml-6">Los clientes pagan en efectivo al momento de recibir su pedido.</p>
    </div>

    <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          name="enableCreditCard"
          checked={paymentSettings.enableCreditCard}
          onChange={handlePaymentChange}
          className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-400"
        />
        <span className="ml-2 text-sm text-gray-700 font-medium">Tarjeta de Crédito/Débito</span>
      </label>
      <p className="text-xs text-gray-500 mt-1 ml-6">Procesamiento directo de tarjetas a través de la pasarela de pago.</p>
    </div>
  </div>
</div>

{/* Notificaciones - visible cuando el tab notifications está activo o en pantallas grandes */}
<div className={`bg-white shadow-md rounded-lg p-4 md:p-6 ${(activeTab === 'notifications' || window.innerWidth >= 768) ? 'block' : 'hidden'}`}>
  <h2 className="text-lg font-semibold mb-4">Notificaciones</h2>

  <div className="space-y-4">
    <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          name="newOrderEmail"
          checked={notificationSettings.newOrderEmail}
          onChange={handleNotificationChange}
          className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-400"
        />
        <span className="ml-2 text-sm text-gray-700 font-medium">Notificación por email para nuevos pedidos</span>
      </label>
      <p className="text-xs text-gray-500 mt-1 ml-6">Recibirás un correo electrónico cada vez que se genere un nuevo pedido.</p>
    </div>

    <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          name="newOrderSMS"
          checked={notificationSettings.newOrderSMS}
          onChange={handleNotificationChange}
          className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-400"
        />
        <span className="ml-2 text-sm text-gray-700 font-medium">Notificación por SMS para nuevos pedidos</span>
      </label>
      <p className="text-xs text-gray-500 mt-1 ml-6">Recibirás un mensaje de texto cada vez que se genere un nuevo pedido.</p>
    </div>

    <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          name="lowStockAlert"
          checked={notificationSettings.lowStockAlert}
          onChange={handleNotificationChange}
          className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-400"
        />
        <span className="ml-2 text-sm text-gray-700 font-medium">Alertas de stock bajo</span>
      </label>
      <p className="text-xs text-gray-500 mt-1 ml-6">Recibe alertas cuando el inventario de un producto esté por debajo del umbral establecido.</p>
    </div>

    {notificationSettings.lowStockAlert && (
      <div className="ml-6 mt-2">
        <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="lowStockThreshold">
          Umbral de stock bajo
        </label>
        <input
          className="shadow-sm border border-gray-300 rounded-md w-full max-w-xs py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
          id="lowStockThreshold"
          name="lowStockThreshold"
          type="number"
          min="1"
          value={notificationSettings.lowStockThreshold}
          onChange={handleNotificationChange}
          placeholder="5"
        />
        <p className="text-xs text-gray-500 mt-1">Se enviará una alerta cuando la cantidad de un producto sea menor o igual a este valor.</p>
      </div>
    )}

    <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          name="marketingEmails"
          checked={notificationSettings.marketingEmails}
          onChange={handleNotificationChange}
          className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-400"
        />
        <span className="ml-2 text-sm text-gray-700 font-medium">Enviar emails de marketing a clientes</span>
      </label>
      <p className="text-xs text-gray-500 mt-1 ml-6">Habilita el envío de correos de promociones y descuentos a tus clientes.</p>
    </div>
  </div>
</div>

{/* Botones de acción - siempre visibles al final del formulario */}
<div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-8">
  <button
    type="button"
    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
    onClick={() => window.location.reload()}
    disabled={isSaving}
  >
    Cancelar
  </button>
  <button
    type="submit"
    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center text-sm"
    disabled={isSaving}
  >
    {isSaving && (
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    )}
    {isSaving ? 'Guardando...' : 'Guardar Configuración'}
  </button>
</div>
</form>
</div>
);
};

export default AdminSettings;