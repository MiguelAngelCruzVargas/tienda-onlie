// src/AdminSettings.jsx
import React, { useState, useEffect } from 'react';

const AdminSettings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    storeName: '',
    email: '',
    phone: '',
    address: '',
    currency: 'MXN',
    taxRate: 0
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

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función para cargar configuraciones desde la API
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Cargar configuración general
        try {
          const generalResponse = await fetch('http://localhost:5000/api/settings/general');
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
        
        // Cargar configuración de envío
        try {
          const shippingResponse = await fetch('http://localhost:5000/api/settings/shipping');
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
        
        // Cargar configuración de pagos
        try {
          const paymentResponse = await fetch('http://localhost:5000/api/settings/payment');
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
        
        // Cargar configuración de notificaciones
        try {
          const notificationResponse = await fetch('http://localhost:5000/api/settings/notifications');
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
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
    });
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
      // Guardar configuración general
      try {
        const generalResponse = await fetch('http://localhost:5000/api/settings/general', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(generalSettings)
        });
        
        if (!generalResponse.ok) {
          const generalError = await generalResponse.json();
          throw new Error(generalError.message || 'Error al guardar configuración general');
        }
      } catch (generalError) {
        console.error('Error al guardar configuración general:', generalError);
        throw new Error('Error al guardar configuración general');
      }
      
      // Guardar configuración de envío
      try {
        const shippingResponse = await fetch('http://localhost:5000/api/settings/shipping', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shippingSettings)
        });
        
        if (!shippingResponse.ok) {
          const shippingError = await shippingResponse.json();
          throw new Error(shippingError.message || 'Error al guardar configuración de envío');
        }
      } catch (shippingError) {
        console.error('Error al guardar configuración de envío:', shippingError);
        throw new Error('Error al guardar configuración de envío');
      }
      
      // Guardar configuración de pagos
      try {
        const paymentResponse = await fetch('http://localhost:5000/api/settings/payment', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentSettings)
        });
        
        if (!paymentResponse.ok) {
          const paymentError = await paymentResponse.json();
          throw new Error(paymentError.message || 'Error al guardar configuración de pagos');
        }
      } catch (paymentError) {
        console.error('Error al guardar configuración de pagos:', paymentError);
        throw new Error('Error al guardar configuración de pagos');
      }
      
      // Guardar configuración de notificaciones
      try {
        const notificationResponse = await fetch('http://localhost:5000/api/settings/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationSettings)
        });
        
        if (!notificationResponse.ok) {
          const notificationError = await notificationResponse.json();
          throw new Error(notificationError.message || 'Error al guardar configuración de notificaciones');
        }
      } catch (notificationError) {
        console.error('Error al guardar configuración de notificaciones:', notificationError);
        throw new Error('Error al guardar configuración de notificaciones');
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
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-lg text-gray-700">Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configuración de la Tienda</h1>
      
      {saveSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow flex items-center justify-between" role="alert">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-2 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">Configuración guardada exitosamente.</p>
          </div>
          <button 
            onClick={() => setSaveSuccess(false)} 
            className="text-green-700 hover:text-green-900"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow flex items-center justify-between" role="alert">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-red-700 hover:text-red-900"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Configuración General */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Configuración General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="storeName">
                Nombre de la Tienda
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email de Contacto
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                Teléfono
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="phone"
                name="phone"
                type="text"
                value={generalSettings.phone}
                onChange={handleGeneralChange}
                placeholder="+52 (123) 456-7890"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                Dirección
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                id="address"
                name="address"
                type="text"
                value={generalSettings.address}
                onChange={handleGeneralChange}
                placeholder="Calle, Ciudad, Estado"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currency">
                Moneda
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="taxRate">
                Tasa de Impuesto (%)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
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
        </div>
        
        {/* Configuración de Envío */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Configuración de Envío</h2>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enableFreeShipping"
                  checked={shippingSettings.enableFreeShipping}
                  onChange={handleShippingChange}
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <span className="ml-2 text-gray-700">Habilitar envío gratuito</span>
              </label>
            </div>
            
            {shippingSettings.enableFreeShipping && (
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="freeShippingMinimum">
                  Mínimo para envío gratuito
                </label>
                <div className="flex items-center">
                  <span className="text-gray-700 mr-2">$</span>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="flatRate">
                Tarifa Plana de Envío
              </label>
              <div className="flex items-center">
                <span className="text-gray-700 mr-2">$</span>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
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
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <span className="ml-2 text-gray-700">Habilitar recogida local</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Métodos de Pago */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Métodos de Pago</h2>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enableMercadoPago"
                  checked={paymentSettings.enableMercadoPago}
                  onChange={handlePaymentChange}
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <span className="ml-2 text-gray-700">Mercado Pago</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enableBankTransfer"
                  checked={paymentSettings.enableBankTransfer}
                  onChange={handlePaymentChange}
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <span className="ml-2 text-gray-700">Transferencia Bancaria</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enableCashOnDelivery"
                  checked={paymentSettings.enableCashOnDelivery}
                  onChange={handlePaymentChange}
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <span className="ml-2 text-gray-700">Pago contra entrega</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enableCreditCard"
                  checked={paymentSettings.enableCreditCard}
                  onChange={handlePaymentChange}
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <span className="ml-2 text-gray-700">Tarjeta de Crédito/Débito</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Notificaciones */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Notificaciones</h2>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="newOrderEmail"
                  checked={notificationSettings.newOrderEmail}
                  onChange={handleNotificationChange}
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <span className="ml-2 text-gray-700">Notificación por email para nuevos pedidos</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="newOrderSMS"
                  checked={notificationSettings.newOrderSMS}
                  onChange={handleNotificationChange}
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <span className="ml-2 text-gray-700">Notificación por SMS para nuevos pedidos</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="lowStockAlert"
                  checked={notificationSettings.lowStockAlert}
                  onChange={handleNotificationChange}
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <span className="ml-2 text-gray-700">Alertas de stock bajo</span>
              </label>
            </div>
            
            {notificationSettings.lowStockAlert && (
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lowStockThreshold">
                  Umbral de stock bajo
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-indigo-200"
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  min="1"
                  value={notificationSettings.lowStockThreshold}
                  onChange={handleNotificationChange}
                  placeholder="5"
                />
              </div>
            )}
            
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="marketingEmails"
                  checked={notificationSettings.marketingEmails}
                  onChange={handleNotificationChange}
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-400"
                />
                <span className="ml-2 text-gray-700">Enviar emails de marketing y promociones a clientes</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={() => window.location.reload()}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center"
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