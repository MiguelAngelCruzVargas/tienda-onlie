// src/components/FilterSidebar.jsx
import React, { useState, useEffect } from 'react';

// Diámetros comunes para rines de automóvil
const COMMON_DIAMETERS = ['13', '14', '15', '16', '17', '18', '19', '20', '21', '22'];

// Marcas populares (podrían cargarse desde la API en una implementación real)
const POPULAR_BRANDS = [
  'Vossen', 'BBS', 'Enkei', 'Work', 'OZ Racing', 'Rays', 'ADV.1', 
  'HRE', 'Rotiform', 'Konig', 'American Racing', 'TSW'
];

const FilterSidebar = ({ currentFilters, onApplyFilters, onClose, showMobileCloseButton = false }) => {
  // Estado local para los filtros que se están editando
  const [localFilters, setLocalFilters] = useState({
    minPrice: currentFilters.minPrice || '',
    maxPrice: currentFilters.maxPrice || '',
    diameters: [...(currentFilters.diameters || [])],
    brands: [...(currentFilters.brands || [])]
  });
  
  // Actualizar estado local cuando cambien los filtros de prop
  useEffect(() => {
    setLocalFilters({
      minPrice: currentFilters.minPrice || '',
      maxPrice: currentFilters.maxPrice || '',
      diameters: [...(currentFilters.diameters || [])],
      brands: [...(currentFilters.brands || [])]
    });
  }, [currentFilters]);
  
  // Manejar cambios en el rango de precios
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({
      ...localFilters,
      [name]: value
    });
  };
  
  // Manejar cambios en diámetros (checkboxes)
  const handleDiameterChange = (diameter) => {
    const newDiameters = localFilters.diameters.includes(diameter)
      ? localFilters.diameters.filter(d => d !== diameter)
      : [...localFilters.diameters, diameter];
    
    setLocalFilters({
      ...localFilters,
      diameters: newDiameters
    });
  };
  
  // Manejar cambios en marcas (checkboxes)
  const handleBrandChange = (brand) => {
    const newBrands = localFilters.brands.includes(brand)
      ? localFilters.brands.filter(b => b !== brand)
      : [...localFilters.brands, brand];
    
    setLocalFilters({
      ...localFilters,
      brands: newBrands
    });
  };
  
  // Aplicar filtros
  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
    if (onClose) onClose();
  };
  
  // Limpiar todos los filtros
  const handleClearFilters = () => {
    const clearedFilters = {
      minPrice: '',
      maxPrice: '',
      diameters: [],
      brands: []
    };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };
  
  // Comprobar si hay algún filtro aplicado
  const hasActiveFilters = () => {
    return localFilters.minPrice || 
           localFilters.maxPrice || 
           localFilters.diameters.length > 0 || 
           localFilters.brands.length > 0;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5 sticky top-24">
      {/* Mobile Close Button */}
      {showMobileCloseButton && (
        <div className="flex justify-between items-center md:hidden mb-4">
          <h2 className="text-lg font-semibold">Filtros</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Desktop Title */}
      <div className="hidden md:block mb-4">
        <h2 className="text-lg font-semibold">Filtros</h2>
      </div>
      
      {/* Price Range Filter */}
      <div className="mb-6">
        <h3 className="text-gray-700 font-medium mb-3">Rango de Precio</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="minPrice" className="block text-sm text-gray-600 mb-1">Mínimo</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                min="0"
                value={localFilters.minPrice}
                onChange={handlePriceChange}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label htmlFor="maxPrice" className="block text-sm text-gray-600 mb-1">Máximo</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                min="0"
                value={localFilters.maxPrice}
                onChange={handlePriceChange}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="50,000"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Diameters Filter */}
      <div className="mb-6">
        <h3 className="text-gray-700 font-medium mb-3">Diámetro (pulgadas)</h3>
        <div className="grid grid-cols-3 gap-2">
          {COMMON_DIAMETERS.map(diameter => (
            <div key={diameter} className="flex items-center">
              <input
                type="checkbox"
                id={`diameter-${diameter}`}
                checked={localFilters.diameters.includes(diameter)}
                onChange={() => handleDiameterChange(diameter)}
                className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <label htmlFor={`diameter-${diameter}`} className="ml-2 text-sm text-gray-700">
                {diameter}"
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Brands Filter */}
      <div className="mb-6">
        <h3 className="text-gray-700 font-medium mb-3">Marcas</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {POPULAR_BRANDS.map(brand => (
            <div key={brand} className="flex items-center">
              <input
                type="checkbox"
                id={`brand-${brand.replace(/\s+/g, '-').toLowerCase()}`}
                checked={localFilters.brands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
                className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <label 
                htmlFor={`brand-${brand.replace(/\s+/g, '-').toLowerCase()}`} 
                className="ml-2 text-sm text-gray-700"
              >
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={handleApplyFilters}
          className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-md transition-colors duration-300"
        >
          Aplicar Filtros
        </button>
        
        {hasActiveFilters() && (
          <button
            onClick={handleClearFilters}
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors duration-300"
          >
            Limpiar Filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;