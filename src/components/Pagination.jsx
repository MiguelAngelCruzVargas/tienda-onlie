// src/components/Pagination.jsx
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) return null;
  
  // Determinar rango de páginas a mostrar
  const getPageRange = () => {
    // Para pantallas pequeñas o pocas páginas, mostrar menos botones
    const maxVisible = totalPages > 7 ? 7 : totalPages;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };
  
  const pageNumbers = getPageRange();
  
  return (
    <nav className="flex justify-center" aria-label="Paginación">
      <ul className="flex items-center -space-x-px">
        {/* Botón "Anterior" */}
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative block px-3 py-2 ml-0 leading-tight rounded-l-lg border ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-gray-300'
            }`}
            aria-label="Página anterior"
          >
            <span className="sr-only">Anterior</span>
            <svg 
              className="w-5 h-5" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                fillRule="evenodd" 
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" 
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>
        
        {/* Primera página y elipsis si necesario */}
        {pageNumbers[0] > 1 && (
          <>
            <li>
              <button
                onClick={() => onPageChange(1)}
                className="relative block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Ir a la página 1"
              >
                1
              </button>
            </li>
            {pageNumbers[0] > 2 && (
              <li>
                <span className="relative block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300">
                  ...
                </span>
              </li>
            )}
          </>
        )}
        
        {/* Páginas numeradas */}
        {pageNumbers.map((page) => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              className={`relative block px-3 py-2 leading-tight border ${
                currentPage === page
                  ? 'z-10 text-white bg-yellow-500 border-yellow-500'
                  : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'
              }`}
              aria-label={`Ir a la página ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          </li>
        ))}
        
        {/* Última página y elipsis si necesario */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <li>
                <span className="relative block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300">
                  ...
                </span>
              </li>
            )}
            <li>
              <button
                onClick={() => onPageChange(totalPages)}
                className="relative block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                aria-label={`Ir a la página ${totalPages}`}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}
        
        {/* Botón "Siguiente" */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative block px-3 py-2 leading-tight rounded-r-lg border ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-gray-300'
            }`}
            aria-label="Página siguiente"
          >
            <span className="sr-only">Siguiente</span>
            <svg 
              className="w-5 h-5" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                fillRule="evenodd" 
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;