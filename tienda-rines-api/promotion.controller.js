// promotion.controller.js
const Promotion = require('./promotion.model');
const { Op } = require('sequelize');

class PromotionController {
  // Obtener todas las promociones activas
  static async getActivePromotions() {
    try {
      const promotions = await Promotion.findAll({
        where: { 
          status: 'active',
          endDate: { 
            [Op.or]: [
              { [Op.gt]: new Date() }, // Promociones que no han expirado
              { [Op.eq]: null }        // O promociones sin fecha de fin
            ]
          }
        },
        order: [['startDate', 'DESC']]
      });
      return promotions;
    } catch (error) {
      console.error('Error al obtener promociones activas:', error);
      throw error;
    }
  }

  // Obtener una promoción por ID
  static async getPromotionById(id) {
    try {
      const promotion = await Promotion.findByPk(id);
      if (!promotion) {
        throw new Error('Promoción no encontrada');
      }
      return promotion;
    } catch (error) {
      console.error('Error al obtener promoción:', error);
      throw error;
    }
  }

  // Crear una nueva promoción
  static async createPromotion(promotionData) {
    try {
      const promotion = await Promotion.create(promotionData);
      return promotion;
    } catch (error) {
      console.error('Error al crear promoción:', error);
      throw error;
    }
  }

  // Actualizar una promoción
  static async updatePromotion(id, updateData) {
    try {
      const [updated] = await Promotion.update(updateData, {
        where: { id }
      });
      
      if (updated === 0) {
        throw new Error('Promoción no encontrada');
      }
      
      return this.getPromotionById(id);
    } catch (error) {
      console.error('Error al actualizar promoción:', error);
      throw error;
    }
  }

  // Eliminar una promoción
  static async deletePromotion(id) {
    try {
      const deleted = await Promotion.destroy({
        where: { id }
      });
      
      if (deleted === 0) {
        throw new Error('Promoción no encontrada');
      }
      
      return true;
    } catch (error) {
      console.error('Error al eliminar promoción:', error);
      throw error;
    }
  }
}

module.exports = PromotionController;