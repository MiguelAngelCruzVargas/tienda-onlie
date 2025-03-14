// src/mockData.js
export const mockProducts = [
    {
      id: 1,
      name: "BBS CH-R Platinum Silver",
      price: 12500,
      originalPrice: 14800,
      imageUrl: "https://via.placeholder.com/400x300",
      brand: "BBS",
      size: 18,
      color: "Plata",
      rating: 4.8,
      reviewCount: 156,
      inStock: true,
      discount: 15
    },
    {
      id: 2,
      name: "Enkei RPF1 Black",
      price: 8900,
      originalPrice: null,
      imageUrl: "https://via.placeholder.com/400x300",
      brand: "Enkei",
      size: 17,
      color: "Negro",
      rating: 4.6,
      reviewCount: 98,
      inStock: true,
      discount: 0
    },
    {
      id: 3,
      name: "OZ Racing Superturismo",
      price: 15300,
      originalPrice: 17800,
      imageUrl: "https://via.placeholder.com/400x300",
      brand: "OZ Racing",
      size: 19,
      color: "Negro Mate",
      rating: 4.9,
      reviewCount: 214,
      inStock: true,
      discount: 14
    },
    {
      id: 4,
      name: "Vossen CV3-R Gloss Black",
      price: 22500,
      originalPrice: null,
      imageUrl: "https://via.placeholder.com/400x300",
      brand: "Vossen",
      size: 20,
      color: "Negro Brillante",
      rating: 4.7,
      reviewCount: 182,
      inStock: false,
      discount: 0
    }
  ];
  
  export const mockCategories = [
    {
      id: 1,
      name: "Rines Automóvil",
      imageUrl: "https://via.placeholder.com/300x200",
      description: "Rines para todo tipo de automóviles"
    },
    {
      id: 2,
      name: "Rines Camioneta",
      imageUrl: "https://via.placeholder.com/300x200",
      description: "Rines resistentes para camionetas"
    },
    {
      id: 3,
      name: "Llantas",
      imageUrl: "https://via.placeholder.com/300x200",
      description: "Llantas de alto rendimiento"
    },
    {
      id: 4,
      name: "Accesorios",
      imageUrl: "https://via.placeholder.com/300x200",
      description: "Accesorios para personalizar tu vehículo"
    }
  ];
  
  export const mockPromotions = [
    {
      id: 1,
      title: "Ofertas de Verano",
      description: "Hasta 30% de descuento en rines seleccionados",
      imageUrl: "https://via.placeholder.com/1200x400"
    },
    {
      id: 2,
      title: "Nuevos modelos BBS",
      description: "Descubre la nueva colección exclusiva",
      imageUrl: "https://via.placeholder.com/1200x400"
    }
  ];