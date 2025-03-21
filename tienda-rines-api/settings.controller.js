// tienda-rines-api/settings.controller.js
const Setting = require('./settings.model');

class SettingsController {
  // Método auxiliar para obtener configuraciones por categoría
  static async getSettingsByCategory(category) {
    try {
      const settings = await Setting.findAll({
        where: { category }
      });
      
      // Convertir a objeto para facilitar su uso
      const settingsObj = {};
      settings.forEach(setting => {
        // Intentar convertir valores a su tipo correspondiente
        let value = setting.value;
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(value) && value !== '') value = Number(value);
        
        settingsObj[setting.key] = value;
      });
      
      return settingsObj;
    } catch (error) {
      console.error(`Error al obtener configuraciones de ${category}:`, error);
      throw error;
    }
  }
  

  // En settings.controller.js
static async getProductPageSettings() {
  try {
    // Obtener configuraciones de la base de datos
    const settings = await this.getSettingsByCategory('product_page');
    
    // Configuraciones por defecto
    const defaultSettings = {
      showRelatedProducts: true,
      showCTA: true,
      showSpecs: true,
      phoneNumber: '+5255123456789',
      whatsappNumber: '+5255123456789'
    };

    // Si no hay configuraciones en la base de datos, devolver las por defecto
    if (Object.keys(settings).length === 0) {
      return defaultSettings;
    }

    // Combinar configuraciones de la base de datos con las por defecto
    return { ...defaultSettings, ...settings };
  } catch (error) {
    console.error('Error al obtener configuraciones de página de producto:', error);
    
    // En caso de error, devolver configuraciones por defecto
    return {
      showRelatedProducts: true,
      showCTA: true,
      showSpecs: true,
      phoneNumber: '+5255123456789',
      whatsappNumber: '+5255123456789'
    };
  }
}


  // Método auxiliar para guardar configuraciones por categoría
  static async saveSettingsByCategory(category, settings) {
    try {
      const promises = [];
      
      for (const [key, value] of Object.entries(settings)) {
        // Solo guardar si la clave no es undefined o null
        if (key !== undefined && key !== null) {
          promises.push(
            Setting.upsert({
              category,
              key,
              value: String(value) // Convertir todos los valores a string para guardar
            })
          );
        }
      }
      
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error(`Error al guardar configuraciones de ${category}:`, error);
      throw error;
    }
  }
  
  // Método para verificar si las configuraciones están inicializadas
  static async areSettingsInitialized() {
    try {
      const categories = ['general', 'shipping', 'payment', 'notifications', 'contact'];
      
      for (const category of categories) {
        const settings = await this.getSettingsByCategory(category);
        if (Object.keys(settings).length === 0) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error al verificar inicialización de configuraciones:', error);
      return false;
    }
  }
  
  // Método para inicializar configuraciones si no existen
  static async initializeSettings() {
    try {
      // Verificar si ya están inicializadas
      const isInitialized = await this.areSettingsInitialized();
      if (isInitialized) {
        return false;
      }
      
      // Definir categorías y sus configuraciones iniciales
      const settingsToInitialize = {
        general: [
          { key: 'storeName', value: '' },
          { key: 'email', value: '' },
          { key: 'phone', value: '' },
          { key: 'address', value: '' },
          { key: 'addressLine2', value: '' },
          { key: 'city', value: '' },
          { key: 'state', value: '' },
          { key: 'zipCode', value: '' },
          { key: 'country', value: 'México' },
          { key: 'currency', value: 'MXN' },
          { key: 'taxRate', value: '0' },
          // Almacenar los horarios de contacto como JSON
          { key: 'contactHours', value: JSON.stringify({
            monday: { start: '09:00', end: '19:00', enabled: true },
            tuesday: { start: '09:00', end: '19:00', enabled: true },
            wednesday: { start: '09:00', end: '19:00', enabled: true },
            thursday: { start: '09:00', end: '19:00', enabled: true },
            friday: { start: '09:00', end: '19:00', enabled: true },
            saturday: { start: '10:00', end: '16:00', enabled: true },
            sunday: { start: '00:00', end: '00:00', enabled: false }
          })}
        ],
        shipping: [
          { key: 'enableFreeShipping', value: 'false' },
          { key: 'freeShippingMinimum', value: '0' },
          { key: 'flatRate', value: '0' },
          { key: 'localPickupEnabled', value: 'false' }
        ],
        payment: [
          { key: 'enableMercadoPago', value: 'false' },
          { key: 'enableBankTransfer', value: 'false' },
          { key: 'enableCashOnDelivery', value: 'false' },
          { key: 'enableCreditCard', value: 'false' }
        ],
        notifications: [
          { key: 'newOrderEmail', value: 'false' },
          { key: 'newOrderSMS', value: 'false' },
          { key: 'lowStockAlert', value: 'false' },
          { key: 'lowStockThreshold', value: '5' },
          { key: 'marketingEmails', value: 'false' }
        ],
        contact: [
          { key: 'address', value: '' },
          { key: 'phone', value: '' },
          { key: 'email', value: '' },
          { key: 'businessHoursWeekday', value: '' },
          { key: 'businessHoursSaturday', value: '' }
        ]
      };
      
      // Guardar configuraciones iniciales
      for (const [category, settings] of Object.entries(settingsToInitialize)) {
        for (const setting of settings) {
          await Setting.create({
            category,
            key: setting.key,
            value: setting.value
          });
        }
      }
      
      console.log('Configuraciones inicializadas correctamente');
      return true;
    } catch (error) {
      console.error('Error al inicializar configuraciones:', error);
      throw error;
    }
  }
  
  // Métodos para obtener y guardar configuraciones por categoría
  static async getGeneral() {
    try {
      const settings = await this.getSettingsByCategory('general');
      
      // Procesar el campo contactHours si existe
      if (settings.contactHours && typeof settings.contactHours === 'string') {
        try {
          settings.contactHours = JSON.parse(settings.contactHours);
        } catch (e) {
          // Si hay error al parsear, establecer un valor por defecto
          settings.contactHours = {
            monday: { start: '09:00', end: '19:00', enabled: true },
            tuesday: { start: '09:00', end: '19:00', enabled: true },
            wednesday: { start: '09:00', end: '19:00', enabled: true },
            thursday: { start: '09:00', end: '19:00', enabled: true },
            friday: { start: '09:00', end: '19:00', enabled: true },
            saturday: { start: '10:00', end: '16:00', enabled: true },
            sunday: { start: '00:00', end: '00:00', enabled: false }
          };
        }
      }
      
      return settings;
    } catch (error) {
      console.error('Error al obtener configuraciones generales:', error);
      throw error;
    }
  }
  
  static async saveGeneral(settings) {
    try {
      // Procesar campos especiales antes de guardar
      const settingsToSave = { ...settings };
      
      // Convertir contactHours a string si es un objeto
      if (settingsToSave.contactHours && typeof settingsToSave.contactHours === 'object') {
        settingsToSave.contactHours = JSON.stringify(settingsToSave.contactHours);
      }
      
      return this.saveSettingsByCategory('general', settingsToSave);
    } catch (error) {
      console.error('Error al guardar configuraciones generales:', error);
      throw error;
    }
  }
  
  static async getShipping() {
    return this.getSettingsByCategory('shipping');
  }
  
  static async saveShipping(settings) {
    return this.saveSettingsByCategory('shipping', settings);
  }
  
  static async getPayment() {
    return this.getSettingsByCategory('payment');
  }
  
  static async savePayment(settings) {
    return this.saveSettingsByCategory('payment', settings);
  }
  
  static async getNotifications() {
    return this.getSettingsByCategory('notifications');
  }
  
  static async saveNotifications(settings) {
    return this.saveSettingsByCategory('notifications', settings);
  }
  
  // Métodos para configuración de contacto
  static async getContact() {
    return this.getSettingsByCategory('contact');
  }
  
  static async saveContact(settings) {
    return this.saveSettingsByCategory('contact', settings);
  }
}

module.exports = SettingsController;