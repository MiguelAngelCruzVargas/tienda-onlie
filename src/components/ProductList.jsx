// components/ProductList.jsx
import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';
import LoadingSpinner from './LoadingSpinner';

const ProductList = ({ 
  products = [], 
  loading = false, 
  error = null,
  title = '',
  emptyMessage = 'No hay productos disponibles.',
  showFilters = false,
  onFilterChange = null,
  filters = {},
  layout = 'grid'
}) => {
  const { addToCart } = useCart();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const prevFiltersRef = useRef(filters);
  
  useEffect(() => {
    // Actualizar productos filtrados cuando cambian los productos o filtros
    if (showFilters && onFilterChange) {
      // Si usamos filtrado externo, usamos los productos tal cual
      setFilteredProducts(products);
    } else {
      // Si usamos filtrado local
      let result = [...products];
      
      // Aplicar filtros locales si es necesario
      if (filters.minPrice) {
        result = result.filter(product => product.price >= filters.minPrice);
      }
      
      if (filters.maxPrice) {
        result = result.filter(product => product.price <= filters.maxPrice);
      }
      
      if (filters.category) {
        result = result.filter(product => product.categoryId === filters.category);
      }
      
      // Aquí puedes agregar más filtros según sea necesario
      
      setFilteredProducts(result);
    }
    
    // Guardar los filtros actuales para comparación
    prevFiltersRef.current = filters;
  }, [products, filters, showFilters, onFilterChange]);
  
  // Manejar clic en botón "Agregar al carrito"
  const handleAddToCart = (product) => {
    addToCart(product, 1, true);
  };
  
  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
        <p className="font-medium">Error al cargar productos</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  // Si no hay productos, mostrar mensaje personalizado
  if (filteredProducts.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="text-gray-500">{emptyMessage}</div>
      </div>
    );
  }
  
  // CSS classes based on layout
  const layoutClasses = {
    grid: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
    list: 'flex flex-col gap-4',
    compact: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
  };
  
  return (
    <div>
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      
      <div className={layoutClasses[layout] || layoutClasses.grid}>
        {filteredProducts.map(product => (
          <div key={product.id} className="h-full">
            <ProductCard 
              product={product} 
              onAddToCart={() => handleAddToCart(product)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;