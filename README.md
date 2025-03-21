# Proyecto: Tienda Online de Rines Deportivos - Estado Actual

## Objetivo del Proyecto
Desarrollar una tienda en línea completa para la venta de rines deportivos, con un panel de administración para gestionar productos, categorías, pedidos y configuraciones, y una tienda online para los clientes.

## Estado Actual del Proyecto

### Backend (Completado)
- ✅ Configuración de la base de datos con MySQL/MariaDB usando Sequelize
- ✅ Implementación de modelos para:
  - Usuarios (User)
  - Productos (Product)
  - Categorías (Category)
  - Pedidos (Order)
- ✅ Implementación de controladores para:
  - Autenticación (auth.controller.js)
  - Productos (product.controller.js)
  - Categorías (category.controller.js)
  - Pedidos (order.controller.js)
  - Dashboard (dashboard.controller.js)
- ✅ Configuración de rutas API RESTful
- ✅ Implementación de autenticación y autorización con JWT
- ✅ Relaciones entre modelos configuradas correctamente

### Frontend (En Progreso)
- ✅ Implementación del panel de administración (estructura básica)
- ✅ Componente de login funcional
- ✅ Componente de dashboard con estadísticas
- ✅ Formulario de productos (AdminProductForm.jsx) para agregar/editar productos
- ✅ Listado de productos (AdminProducts.jsx) para gestionar el inventario
- ⏳ Gestión de categorías (pendiente)
- ⏳ Gestión de pedidos (pendiente)
- ⏳ Tienda online (pendiente)

### Estructura de la Base de Datos
La estructura de la base de datos ha sido modificada para incluir los siguientes campos:

#### Usuarios (Users)
```sql
- id (INT, PRIMARY KEY)
- email (VARCHAR, UNIQUE)
- password (VARCHAR)
- role (ENUM: 'admin', 'editor', 'viewer')
- lastLogin (DATETIME)
- createdAt (DATETIME)
- updatedAt (DATETIME)
- deletedAt (DATETIME, para soft delete)
```

#### Productos (Products)
```sql
- id (INT, PRIMARY KEY)
- name (VARCHAR)
- slug (VARCHAR, UNIQUE)
- description (TEXT)
- price (DECIMAL)
- compareAtPrice (DECIMAL)
- sku (VARCHAR)
- inventory (INT)
- weight (FLOAT)
- width (FLOAT)
- height (FLOAT)
- depth (FLOAT)
- images (TEXT, JSON)
- thumbnail (VARCHAR)
- featured (BOOLEAN)
- status (ENUM: 'active', 'draft', 'archived')
- categoryId (INT, FOREIGN KEY)
- tags (TEXT, JSON)
- attributes (TEXT, JSON)
- metaTitle (VARCHAR)
- metaDescription (TEXT)
- metaKeywords (VARCHAR)
- searchTerms (TEXT)
- rating (FLOAT)
- reviewCount (INT)
- soldCount (INT)
- createdAt (DATETIME)
- updatedAt (DATETIME)
- deletedAt (DATETIME, para soft delete)
```

#### Categorías (Categories)
```sql
- id (INT, PRIMARY KEY)
- name (VARCHAR)
- slug (VARCHAR, UNIQUE)
- description (TEXT)
- image (VARCHAR)
- parentId (INT, FOREIGN KEY)
- order (INT)
- status (ENUM: 'active', 'inactive')
- featured (BOOLEAN)
- metaTitle (VARCHAR)
- metaDescription (TEXT)
- metaKeywords (VARCHAR)
- createdAt (DATETIME)
- updatedAt (DATETIME)
- deletedAt (DATETIME, para soft delete)
```

#### Pedidos (Orders)
```sql
- id (INT, PRIMARY KEY)
- userId (INT, FOREIGN KEY)
- status (ENUM: 'pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')
- total (DECIMAL)
- subtotal (DECIMAL)
- tax (DECIMAL)
- shipping (DECIMAL)
- discount (DECIMAL)
- trackingNumber (VARCHAR)
- shippingAddress (TEXT)
- billingAddress (TEXT)
- paymentMethod (VARCHAR)
- paymentStatus (ENUM: 'pending', 'paid', 'failed', 'refunded')
- notes (TEXT)
- customerName (VARCHAR)
- customerEmail (VARCHAR)
- customerPhone (VARCHAR)
- transactionId (VARCHAR)
- createdAt (DATETIME)
- updatedAt (DATETIME)
- deletedAt (DATETIME, para soft delete)
```

## Desafíos Resueltos
1. Configuración correcta de las relaciones entre modelos
2. Sincronización de modelos con la base de datos
3. Implementación de autenticación con JWT
4. Ajuste de la estructura de la base de datos para soportar todas las características planeadas
5. Creación de interfaces de usuario modernas y responsivas para el panel de administración

## Próximos Pasos
1. **Corto plazo:**
   - Finalizar la implementación del componente de gestión de categorías
   - Implementar validaciones en formularios
   - Completar la gestión de imágenes de productos

2. **Mediano plazo:**
   - Implementar la gestión de pedidos
   - Desarrollar la interfaz de la tienda en línea
   - Implementar el carrito de compras

3. **Largo plazo:**
   - Integrar pasarelas de pago
   - Implementar sistema de valoraciones y reseñas
   - Añadir funcionalidades de marketing (descuentos, cupones, etc.)
   - Implementar SEO y analytics

## Tecnologías Utilizadas
- **Backend**: Node.js, Express, Sequelize (MySQL/MariaDB)
- **Frontend**: React con Vite, TailwindCSS
- **Autenticación**: JWT (JSON Web Tokens)
- **Almacenamiento**: MySQL/MariaDB