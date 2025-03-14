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
  
  // Método auxiliar para guardar configuraciones por categoría
  static async saveSettingsByCategory(category, settings) {
    try {
      const promises = [];
      
      for (const [key, value] of Object.entries(settings)) {
        promises.push(
          Setting.upsert({
            category,
            key,
            value: String(value) // Convertir todos los valores a string para guardar
          })
        );
      }
      
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error(`Error al guardar configuraciones de ${category}:`, error);
      throw error;
    }
  }
  
  // Obtener configuración general
  static async getGeneral() {
    return this.getSettingsByCategory('general');
  }
  
  // Guardar configuración general
  static async saveGeneral(settings) {
    return this.saveSettingsByCategory('general', settings);
  }
  
  // Obtener configuración de envío
  static async getShipping() {
    return this.getSettingsByCategory('shipping');
  }
  
  // Guardar configuración de envío
  static async saveShipping(settings) {
    return this.saveSettingsByCategory('shipping', settings);
  }
  
  // Obtener configuración de pagos
  static async getPayment() {
    return this.getSettingsByCategory('payment');
  }
  
  // Guardar configuración de pagos
  static async savePayment(settings) {
    return this.saveSettingsByCategory('payment', settings);
  }
  
  // Obtener configuración de notificaciones
  static async getNotifications() {
    return this.getSettingsByCategory('notifications');
  }
  
  // Guardar configuración de notificaciones
  static async saveNotifications(settings) {
    return this.saveSettingsByCategory('notifications', settings);
  }
}

module.exports = SettingsController;