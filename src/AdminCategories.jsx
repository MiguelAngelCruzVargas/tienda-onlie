// src/AdminCategories.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE } from './utils/apiConfig';
const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Estado para el formulario de categoría
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    status: 'active',
    featured: false
  });

  const { currentUser } = useAuth();

  // Añadir estilos CSS de animaciones
  useEffect(() => {
    const cssInJs = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out forwards;
      }
    `;

    const style = document.createElement('style');
    style.textContent = cssInJs;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError('');



        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE}/api/categories?flat=true`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setCategories(data.categories);
        } else {
          throw new Error(data.message || 'Error al cargar categorías');
        }
      } catch (err) {
        console.error('Error al cargar categorías:', err);
        setError('No se pudieron cargar las categorías. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Reiniciar formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentId: '',
      status: 'active',
      featured: false
    });
    setEditingCategory(null);
  };

  // Mostrar formulario para nueva categoría
  const showNewCategoryForm = () => {
    resetForm();
    setShowForm(true);

    // Scroll al formulario en dispositivos móviles
    setTimeout(() => {
      const formElement = document.getElementById('category-form');
      if (formElement && window.innerWidth < 768) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Mostrar formulario para editar categoría existente
  const showEditForm = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || '',
      status: category.status || 'active',
      featured: category.featured || false
    });
    setEditingCategory(category);
    setShowForm(true);

    // Scroll al formulario en dispositivos móviles
    setTimeout(() => {
      const formElement = document.getElementById('category-form');
      if (formElement && window.innerWidth < 768) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setFormSubmitting(true);
      setError('');
      setSuccess('');


      const token = localStorage.getItem('token');

      const isEditing = !!editingCategory;
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `${API_BASE}/api/categories/${editingCategory.id}`
        : `${API_BASE}/api/categories`;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(isEditing ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente');

        // Actualizar la lista de categorías
        const updatedCategoriesResponse = await fetch(`${API_BASE}/api/categories?flat=true`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const updatedData = await updatedCategoriesResponse.json();
        if (updatedData.success) {
          setCategories(updatedData.categories);
        }

        // Cerrar formulario y limpiar
        setShowForm(false);
        resetForm();

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    } catch (err) {
      console.error('Error al guardar categoría:', err);
      setError(`Error al guardar: ${err.message}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Confirmar eliminación
  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Eliminar categoría
  const deleteCategory = async () => {
    try {
      setLoading(true);


      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/api/categories?flat=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      // Cerrar modal
      setDeleteModalOpen(false);
      setCategoryToDelete(null);

      // Actualizar lista
      const updatedCategoriesResponse = await fetch(`${API_BASE}/api/categories?flat=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const updatedData = await updatedCategoriesResponse.json();
      if (updatedData.success) {
        setCategories(updatedData.categories);
      }

      setSuccess('Categoría eliminada correctamente');

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error al eliminar categoría:', err);
      setError(`Error al eliminar: ${err.message}`);

      // Limpiar mensaje de error después de 3 segundos
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener nombre de categoría padre
  const getParentCategoryName = (parentId) => {
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : 'Ninguna';
  };

  // Componente para mostrar un esqueleto de carga
  const CategoriesSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-16 bg-gray-200 rounded-t-lg"></div>
      {[...Array(5)].map((_, index) => (
        <div key={index} className="h-16 bg-gray-100 border-b border-gray-200">
          <div className="flex flex-col md:flex-row h-full p-4">
            <div className="h-4 w-32 bg-gray-300 rounded"></div>
            <div className="h-4 w-20 bg-gray-300 rounded mt-2 md:mt-0 md:ml-auto"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Categorías</h1>
        <button
          onClick={showNewCategoryForm}
          className="mt-3 md:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Añadir Categoría
        </button>
      </div>

      {/* Mensajes de éxito/error con animación */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg shadow-sm transition-all duration-500 ease-in-out animate-fadeIn">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg shadow-sm transition-all duration-500 ease-in-out animate-fadeIn">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div id="category-form" className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-200 transition-all duration-300 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                  placeholder="Ej. Rines Deportivos"
                />
              </div>

              {/* Categoría Padre */}
              <div>
                <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría Padre
                </label>
                <select
                  id="parentId"
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleChange}
                  className="w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Ninguna (Categoría Principal)</option>
                  {categories
                    .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              {/* Estado */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="active">Activa</option>
                  <option value="inactive">Inactiva</option>
                </select>
              </div>

              {/* Destacado */}
              <div className="flex items-center h-full mt-6">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Marcar como categoría destacada
                </label>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
                placeholder="Describe la categoría..."
              ></textarea>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center transition-colors"
              >
                {formSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Categoría'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de categorías */}
      <div className="bg-white shadow-sm overflow-hidden rounded-lg border border-gray-200">
        {loading && categories.length === 0 ? (
          <CategoriesSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Categoría Padre
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p>No hay categorías disponibles</p>
                        <button
                          onClick={showNewCategoryForm}
                          className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Añadir primera categoría
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-start flex-col">
                          <div className="text-sm font-medium text-gray-900 flex items-center flex-wrap">
                            {category.name}
                            {category.featured && (
                              <span className="ml-2 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Destacada
                              </span>
                            )}
                            <span className="md:hidden ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {category.status === 'active' ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                          {category.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs mt-1">
                              {category.description}
                            </div>
                          )}
                          {/* Mostrar categoría padre solo en móvil */}
                          <div className="md:hidden text-xs text-gray-500 mt-1">
                            <span className="font-medium">Categoría padre:</span> {category.parentId ? getParentCategoryName(category.parentId) : 'Ninguna'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-900">
                          {category.parentId ? getParentCategoryName(category.parentId) : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {category.status === 'active' ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => showEditForm(category)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => confirmDelete(category)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      {deleteModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay de fondo con animación */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Esta línea es para centrar el modal verticalmente */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal con animación */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-fadeIn">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirmar eliminación
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que quieres eliminar la categoría "{categoryToDelete?.name}"? Esta acción no se puede deshacer.
                      </p>
                      {/* Advertencia de subcategorías */}
                      {categories.some(cat => cat.parentId === categoryToDelete?.id) && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-600 font-medium flex items-center">
                            <svg className="h-5 w-5 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            ¡Atención! Esta categoría tiene subcategorías
                          </p>
                          <p className="text-sm text-red-600 mt-1">
                            Las subcategorías serán eliminadas o reasignadas según la configuración del sistema.
                          </p>
                        </div>
                      )}

                      {/* Categorías hijas - solo visible si hay subcategorías */}
                      {categories.some(cat => cat.parentId === categoryToDelete?.id) && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Subcategorías afectadas:</p>
                          <ul className="mt-1 text-sm text-gray-600 list-disc pl-5 space-y-1">
                            {categories
                              .filter(cat => cat.parentId === categoryToDelete?.id)
                              .map(cat => (
                                <li key={cat.id}>{cat.name}</li>
                              ))
                            }
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={deleteCategory}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : 'Eliminar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setCategoryToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;