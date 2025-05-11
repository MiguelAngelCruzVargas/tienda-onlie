<?php
require 'config.php';
verificarAutenticacion();

// Inicializar variables
$mensaje = '';
$tipo_mensaje = '';

// Obtener información del usuario
$stmt = $pdo->prepare("SELECT username, email FROM admin_users WHERE id = ?");
$stmt->execute([$_SESSION['usuario_id']]);
$admin = $stmt->fetch();


// Procesar eliminación de producto si se solicita
// Procesar eliminación de producto si se solicita
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['eliminar_id'])) {

  // Validar que sea un número entero válido
  $id_eliminar = filter_var($_POST['eliminar_id'], FILTER_VALIDATE_INT);
  if (!$id_eliminar) {
    $mensaje = "ID inválido para eliminación.";
    $tipo_mensaje = "error";
  } else {
    try {
      // Iniciar transacción
      $pdo->beginTransaction();

      // Eliminar imágenes adicionales
      $stmt = $pdo->prepare("DELETE FROM imagenes_producto WHERE producto_id = ?");
      $stmt->execute([$id_eliminar]);

      // Eliminar el producto
      $stmt = $pdo->prepare("DELETE FROM productos WHERE id = ?");
      $stmt->execute([$id_eliminar]);

      // Confirmar cambios
      $pdo->commit();

      $mensaje = "Producto eliminado correctamente";
      $tipo_mensaje = "success";

      // Registrar acción
      registrarAccion($pdo, $_SESSION['usuario_id'], "Eliminó el producto ID: $id_eliminar");

      // Redirigir para evitar la doble eliminación al refrescar
      echo "<script>window.location.href = 'productos.php?mensaje=" . urlencode($mensaje) . "&tipo=" . $tipo_mensaje . "';</script>";
      exit;
    } catch (PDOException $e) {
      // Revertir cambios en caso de error
      $pdo->rollBack();
      $mensaje = "Error al eliminar el producto: " . $e->getMessage();
      $tipo_mensaje = "error";
    }
  }
}



// Leer mensajes pasados por redirección (después de eliminar)
if (isset($_GET['mensaje']) && isset($_GET['tipo'])) {
  $mensaje = $_GET['mensaje'];
  $tipo_mensaje = $_GET['tipo'];
}

// Configuración de paginación
$productos_por_pagina = 10;
$pagina_actual = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
$offset = ($pagina_actual - 1) * $productos_por_pagina;

// Filtros
$filtro_categoria = $_GET['categoria'] ?? '';
$filtro_tamano = $_GET['tamano'] ?? '';
$filtro_modelo = $_GET['modelo'] ?? '';
$filtro_estado = $_GET['estado'] ?? '';
$busqueda = trim($_GET['busqueda'] ?? '');

// Construir consulta SQL base
$sql_base = "FROM productos p 
            LEFT JOIN categorias c ON p.id_categoria = c.id 
            LEFT JOIN modelos m ON p.id_modelo = m.id 
            LEFT JOIN tamanos t ON p.id_tamano = t.id
            WHERE 1=1";
$params = [];

// Aplicar filtros si están definidos
if (!empty($filtro_categoria)) {
  $sql_base .= " AND p.id_categoria = ?";
  $params[] = $filtro_categoria;
}
if (!empty($filtro_tamano)) {
  $sql_base .= " AND p.id_tamano = ?";
  $params[] = $filtro_tamano;
}
if (!empty($filtro_modelo)) {
  $sql_base .= " AND p.id_modelo = ?";
  $params[] = $filtro_modelo;
}
if (!empty($filtro_estado)) {
  switch ($filtro_estado) {
    case 'nuevo':
      $sql_base .= " AND p.es_nuevo = 1";
      break;

    case 'destacado':
      $sql_base .= " AND p.es_destacado = 1";
      break;
  }
}
if (!empty($busqueda)) {
  $sql_base .= " AND (p.nombre LIKE ? OR p.descripcion LIKE ?)";
  $params[] = "%$busqueda%";
  $params[] = "%$busqueda%";
}

// Contar total de productos para paginación
$sql_count = "SELECT COUNT(*) as total $sql_base";
$stmt = $pdo->prepare($sql_count);
$stmt->execute($params);
$total_productos = $stmt->fetch()['total'];
$total_paginas = ceil($total_productos / $productos_por_pagina);

// Obtener productos
$sql_productos = "SELECT p.*, c.nombre as categoria, m.nombre_modelo as modelo, t.valor as tamano $sql_base 
                 ORDER BY p.creado_en DESC LIMIT $offset, $productos_por_pagina";
$stmt = $pdo->prepare($sql_productos);
$stmt->execute($params);
$productos = $stmt->fetchAll();

// Obtener categorías, modelos y tamaños para los filtros
$stmt = $pdo->query("SELECT id, nombre FROM categorias ORDER BY nombre");
$categorias = $stmt->fetchAll();

$stmt = $pdo->query("SELECT id, nombre_modelo FROM modelos ORDER BY nombre_modelo");
$modelos = $stmt->fetchAll();

$stmt = $pdo->query("SELECT id, valor FROM tamanos ORDER BY valor");
$tamanos = $stmt->fetchAll();
?>


<!DOCTYPE html>
<html lang="es" class="scroll-smooth">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Productos - Catálogo de Rines</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary-color: #3b82f6;
      --primary-dark: #2563eb;
      --secondary-color: #8b5cf6;
      --accent-color: #06b6d4;
      --success-color: #10b981;
      --warning-color: #f59e0b;
      --danger-color: #ef4444;
      --dark-bg: #0f172a;
      --card-bg: rgba(30, 41, 59, 0.8);
    }

    * {
      font-family: 'Poppins', sans-serif;
    }

    body {
      background-color: var(--dark-bg);
      background-image:
        radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(6, 182, 212, 0.1) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%);
      background-attachment: fixed;
    }

    .glass-card {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      border-radius: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .glass-card:hover {
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.12);
    }

    .stats-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      position: relative;
    }

    .stats-card:hover {
      transform: translateY(-5px);
    }

    .stats-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transform: translateX(-100%);
      transition: transform 0.8s;
      pointer-events: none;
    }

    .stats-card:hover::before {
      transform: translateX(100%);
    }

    .sidebar {
      background: linear-gradient(180deg, var(--dark-bg) 0%, rgba(30, 41, 59, 0.95) 100%);
      box-shadow: 5px 0 25px rgba(0, 0, 0, 0.15);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar-link {
      position: relative;
      z-index: 1;
      transition: all 0.3s ease;
    }

    .sidebar-link::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 0;
      background: linear-gradient(90deg, var(--primary-color) 0%, transparent 100%);
      opacity: 0.1;
      transition: width 0.3s ease;
      z-index: -1;
      border-radius: 8px;
    }

    .sidebar-link:hover::before,
    .sidebar-link.active::before {
      width: 100%;
    }

    .sidebar-link.active::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background: var(--primary-color);
      border-radius: 8px;
    }

    .sidebar-icon {
      transition: all 0.3s ease;
    }

    .sidebar-link:hover .sidebar-icon {
      transform: translateX(3px);
    }

    .glow {
      position: relative;
    }

    .glow::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: inherit;
      box-shadow: 0 0 25px rgba(59, 130, 246, 0.5);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .glow:hover::after {
      opacity: 1;
    }

    .animated-gradient {
      background-size: 200% 200%;
      animation: gradientAnimation 5s ease infinite;
    }

    @keyframes gradientAnimation {
      0% {
        background-position: 0% 50%;
      }

      50% {
        background-position: 100% 50%;
      }

      100% {
        background-position: 0% 50%;
      }
    }

    .fade-in {
      animation: fadeIn 0.5s ease-out forwards;
      opacity: 0;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .avatar-ring {
      position: relative;
    }

    .avatar-ring::after {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 2px solid var(--primary-color);
      opacity: 0.7;
      animation: pulseRing 2s infinite;
    }

    @keyframes pulseRing {
      0% {
        transform: scale(1);
        opacity: 0.7;
      }

      50% {
        transform: scale(1.1);
        opacity: 0;
      }

      100% {
        transform: scale(1);
        opacity: 0;
      }
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .backdrop {
      backdrop-filter: blur(8px);
    }

    .image-shine {
      position: relative;
      overflow: hidden;
    }

    .image-shine::before {
      content: '';
      position: absolute;
      top: 0;
      left: -75%;
      z-index: 2;
      width: 50%;
      height: 100%;
      background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 100%);
      transform: skewX(-25deg);
      transition: all 0.75s;
    }

    .image-shine:hover::before {
      animation: shine 0.75s;
    }

    @keyframes shine {
      100% {
        left: 125%;
      }
    }

    /* Animación para cargas/transiciones */
    .loading-bar {
      height: 3px;
      width: 100%;
      position: fixed;
      top: 0;
      left: 0;
      background: linear-gradient(to right, var(--primary-color), var(--secondary-color), var(--accent-color));
      z-index: 1000;
      background-size: 200% 200%;
      animation: gradientAnimation 2s ease infinite;
    }

    /* Modal y overlay */
    .modal {
      transform: translate(-50%, -50%) scale(0.95);
      opacity: 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }

    .modal.open {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }

    .modal-overlay {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .modal-overlay.open {
      opacity: 1;
    }

    /* Animación de notificaciones */
    .notification {
      right: -100%;
      transition: right 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    }

    .notification.show {
      right: 1rem;
    }

    /* Badge colores */
    .badge-primary {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    }

    .badge-success {
      background: linear-gradient(135deg, var(--success-color), #059669);
    }

    .badge-warning {
      background: linear-gradient(135deg, var(--warning-color), #d97706);
    }

    .badge-danger {
      background: linear-gradient(135deg, var(--danger-color), #dc2626);
    }

    .badge-secondary {
      background: linear-gradient(135deg, var(--secondary-color), #7c3aed);
    }

    /* Form elementos */
    .input-field {
      background-color: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .input-field:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      background-color: rgba(15, 23, 42, 0.8);
    }

    .select-field {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.5rem center;
      background-repeat: no-repeat;
      background-size: 1.5em 1.5em;
      padding-right: 2.5rem;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }

    /* Checkbox personalizado */
    .custom-checkbox {
      position: relative;
      cursor: pointer;
    }

    .custom-checkbox input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      z-index: 1;
      width: 100%;
      height: 100%;
    }

    .custom-checkbox .checkmark {
      position: relative;
      display: inline-block;
      width: 20px;
      height: 20px;
      background-color: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .custom-checkbox input:checked~.checkmark {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }

    .custom-checkbox .checkmark:after {
      content: '';
      position: absolute;
      display: none;
      left: 7px;
      top: 3px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    .custom-checkbox input:checked~.checkmark:after {
      display: block;
    }

    .custom-checkbox:hover .checkmark {
      border-color: var(--primary-color);
    }

    /* File upload */
    .file-drop-area {
      position: relative;
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      transition: all 0.3s ease;
      background-color: rgba(15, 23, 42, 0.4);
    }

    .file-drop-area.highlight {
      border-color: var(--primary-color);
      background-color: rgba(59, 130, 246, 0.1);
    }

    .file-input {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 100%;
      opacity: 0;
      cursor: pointer;
    }

    /* Animaciones para las secciones principales */
    .animate-delay-100 {
      animation-delay: 0.1s;
    }

    .animate-delay-200 {
      animation-delay: 0.2s;
    }

    .animate-delay-300 {
      animation-delay: 0.3s;
    }

    .animate-delay-400 {
      animation-delay: 0.4s;
    }

    .animate-delay-500 {
      animation-delay: 0.5s;
    }
  </style>
</head>

<body class="text-gray-200" x-data="productosApp()">
  <!-- Loading Bar - Solo visible durante transiciones -->
  <div class="loading-bar" x-show="isLoading"></div>

  <!-- Notificación -->
  <div
    x-show="notification.show"
    x-transition:enter="transition ease-out duration-300"
    x-transition:enter-start="opacity-0 transform translate-x-full"
    x-transition:enter-end="opacity-100 transform translate-x-0"
    x-transition:leave="transition ease-in duration-300"
    x-transition:leave-start="opacity-100 transform translate-x-0"
    x-transition:leave-end="opacity-0 transform translate-x-full"
    class="fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg backdrop glass-card border border-l-4"
    :class="{
      'border-green-500': notification.type === 'success',
      'border-red-500': notification.type === 'error',
      'border-blue-500': notification.type === 'info',
      'border-yellow-500': notification.type === 'warning'
    }">
    <div class="flex items-center space-x-3">
      <div class="p-1 rounded-full"
        :class="{
          'bg-green-500/20 text-green-500': notification.type === 'success',
          'bg-red-500/20 text-red-500': notification.type === 'error',
          'bg-blue-500/20 text-blue-500': notification.type === 'info',
          'bg-yellow-500/20 text-yellow-500': notification.type === 'warning'
        }">
        <i class="fas"
          :class="{
            'fa-check-circle': notification.type === 'success',
            'fa-exclamation-circle': notification.type === 'error',
            'fa-info-circle': notification.type === 'info',
            'fa-exclamation-triangle': notification.type === 'warning'
          }"></i>
      </div>
      <div>
        <h4 class="font-medium text-sm" x-text="notification.title"></h4>
        <p class="text-xs text-gray-400" x-text="notification.message"></p>
      </div>
    </div>
    <button
      @click="closeNotification()"
      class="absolute top-2 right-2 text-gray-400 hover:text-white">
      <i class="fas fa-times text-xs"></i>
    </button>
  </div>

  <!-- Menú móvil - Botón hamburguesa -->
  <button
    @click="toggleSidebar()"
    class="fixed z-50 bottom-4 right-4 p-3 rounded-full bg-blue-600 text-white shadow-lg lg:hidden hover:bg-blue-700 transition-all">
    <i class="fas" :class="sidebarOpen ? 'fa-times' : 'fa-bars'"></i>
  </button>

  <!-- Sidebar Overlay (Mobile) -->
  <div
    class="fixed inset-0 bg-black/50 backdrop z-40 lg:hidden transition-opacity duration-300"
    x-show="sidebarOpen"
    x-transition:enter="transition ease-out duration-300"
    x-transition:enter-start="opacity-0"
    x-transition:enter-end="opacity-100"
    x-transition:leave="transition ease-in duration-300"
    x-transition:leave-start="opacity-100"
    x-transition:leave-end="opacity-0"
    @click="sidebarOpen = false">
  </div>

  <!-- Sidebar -->
  <aside
    class="sidebar fixed inset-y-0 left-0 w-64 lg:w-72 z-40 overflow-y-auto custom-scrollbar transform transition-transform duration-300 ease-in-out"
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">

    <!-- Logo & Brand -->
    <div class="p-6">
      <div class="flex items-center space-x-3">
        <img src="https://cdn-icons-png.flaticon.com/512/954/954591.png" alt="Logo" class="w-10 h-10">
        <h1 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
          Catálogo Rines
        </h1>
      </div>
      <p class="text-gray-400 text-xs mt-1">Panel de administración</p>
    </div>

    <!-- Divider -->
    <div class="mx-6 mb-6 border-b border-gray-700/50"></div>

    <!-- User Profile -->
    <div class="px-6 mb-6">
      <div class="flex items-center space-x-3">
        <div class="avatar-ring">
          <img
            src="https://ui-avatars.com/api/?name=<?= urlencode($admin['username']) ?>&background=3b82f6&color=fff&bold=true"
            alt="<?= htmlspecialchars($admin['username']) ?>"
            class="w-10 h-10 rounded-full border-2 border-blue-500">
        </div>
        <div>
          <h3 class="font-medium text-sm text-white"><?= htmlspecialchars($admin['username']) ?></h3>
          <p class="text-xs text-gray-400"><?= htmlspecialchars($admin['email'] ?? 'Admin') ?></p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="px-4 pb-6">
      <h3 class="text-xs uppercase text-gray-400 font-semibold px-3 mb-4">Menú principal</h3>

      <!-- Links de navegación -->
      <div class="space-y-1">
        <a href="dashboard.php" class="sidebar-link flex items-center px-3 py-2.5 text-sm rounded-lg">
          <i class="fas fa-home sidebar-icon mr-3 w-5 text-center text-blue-400"></i>
          <span>Dashboard</span>
        </a>

        <a href="productos.php" class="sidebar-link active flex items-center px-3 py-2.5 text-sm rounded-lg">
          <i class="fas fa-tags sidebar-icon mr-3 w-5 text-center text-indigo-400"></i>
          <span>Productos</span>
        </a>

        <a href="categorias.php" class="sidebar-link flex items-center px-3 py-2.5 text-sm rounded-lg">
          <i class="fas fa-layer-group sidebar-icon mr-3 w-5 text-center text-purple-400"></i>
          <span>Categorías</span>
        </a>

        <!-- Agregar este nuevo enlace para Modelos -->
        <a href="modelos.php" class="sidebar-link flex items-center px-3 py-2.5 text-sm rounded-lg">
          <i class="fas fa-car sidebar-icon mr-3 w-5 text-center text-cyan-400"></i>
          <span>Modelos</span>
        </a>

        <a href="promociones.php" class="sidebar-link flex items-center px-3 py-2.5 text-sm rounded-lg">
          <i class="fas fa-percentage sidebar-icon mr-3 w-5 text-center text-amber-400"></i>
          <span>Promociones</span>
        </a>

        <a href="#" @click.prevent="expandMenu = !expandMenu" class="sidebar-link flex items-center justify-between px-3 py-2.5 text-sm rounded-lg">
          <div class="flex items-center">
            <i class="fas fa-cog sidebar-icon mr-3 w-5 text-center text-cyan-400"></i>
            <span>Configuración</span>
          </div>
          <i class="fas fa-chevron-down text-xs transition-transform" :class="expandMenu ? 'rotate-180' : ''"></i>
        </a>

        <!-- Submenú -->
        <div x-show="expandMenu" x-collapse class="pl-10 space-y-1 pt-1">
          <a href="testimonios.php" class="sidebar-link flex items-center px-3 py-2 text-sm rounded-lg">
            <i class="fas fa-comment-dots sidebar-icon mr-3 w-5 text-center text-teal-400"></i>
            <span>Testimonios</span>
          </a>

          <a href="footer.php" class="sidebar-link flex items-center px-3 py-2 text-sm rounded-lg">
            <i class="fas fa-pager sidebar-icon mr-3 w-5 text-center text-green-400"></i>
            <span>Footer & Contacto</span>
          </a>

          <a href="social.php" class="sidebar-link flex items-center px-3 py-2 text-sm rounded-lg">
            <i class="fas fa-share-alt sidebar-icon mr-3 w-5 text-center text-amber-400"></i>
            <span>Redes Sociales</span>
          </a>
        </div>
      </div>

      <!-- Información de soporte -->
      <div class="mt-8 mx-3 p-4 rounded-lg bg-blue-600/10 border border-blue-600/20">
        <h4 class="font-medium text-blue-400 text-sm mb-2">¿Necesitas ayuda?</h4>
        <p class="text-xs text-gray-400 mb-3">Si tienes dudas sobre el panel, contacta al soporte técnico.</p>
        <a href="#" class="text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-1.5 rounded inline-flex items-center">
          <i class="fas fa-headset mr-1.5"></i>
          <span>Contactar soporte</span>
        </a>
      </div>
    </nav>

    <!-- Logout -->
    <div class="mt-auto p-4 border-t border-gray-800/50">
      <a href="logout.php" class="flex items-center justify-center space-x-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 hover:text-red-400 transition-colors px-4 py-2 rounded-lg">
        <i class="fas fa-sign-out-alt"></i>
        <span class="font-medium">Cerrar sesión</span>
      </a>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="lg:ml-72 min-h-screen transition-all duration-300 relative">
    <!-- Header / Navbar -->
    <header class="py-4 px-6 sticky top-0 z-30 bg-opacity-70 backdrop bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-b border-gray-800/50 shadow-lg">
      <div class="flex items-center justify-between">
        <!-- Título de la página -->
        <div class="flex items-center space-x-2">
          <h1 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            Productos
          </h1>
          <div class="hidden md:flex items-center text-sm text-gray-400">
            <i class="fas fa-chevron-right text-xs mx-2 text-gray-600"></i>
            <span>Administrar productos</span>
          </div>
        </div>

        <!-- Acciones rápidas -->
        <div class="flex items-center space-x-3">
          <button
            @click="showProductForm('new')"
            class="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg hover:shadow-xl">
            <i class="fas fa-plus text-xs"></i>
            <span class="hidden sm:inline-block">Nuevo producto</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Filtros y búsqueda -->
        <div class="glass-card p-6 mb-6 fade-in">
          <form action="productos.php" method="get" class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Búsqueda -->
            <div class="md:col-span-4 relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                name="busqueda"
                placeholder="Buscar productos..."
                value="<?= htmlspecialchars($busqueda) ?>"
                class="input-field w-full pl-10 pr-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none">
            </div>

            <!-- Filtros -->
            <div>
              <label class="block text-sm text-gray-400 mb-1">Categoría</label>
              <select name="categoria" class="input-field select-field w-full p-2 rounded-lg focus:outline-none">
                <option value="">Todas las categorías</option>
                <?php foreach ($categorias as $cat): ?>
                  <option value="<?= $cat['id'] ?>" <?= $filtro_categoria == $cat['id'] ? 'selected' : '' ?>>
                    <?= htmlspecialchars($cat['nombre']) ?>
                  </option>
                <?php endforeach; ?>
              </select>
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Tamaño</label>
              <select name="tamano" class="input-field select-field w-full p-2 rounded-lg focus:outline-none">
                <option value="">Todos los tamaños</option>
                <?php foreach ($tamanos as $tam): ?>
                  <option value="<?= $tam['id'] ?>" <?= $filtro_tamano == $tam['id'] ? 'selected' : '' ?>>
                    <?= htmlspecialchars($tam['valor']) ?>
                  </option>
                <?php endforeach; ?>
              </select>
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Modelo</label>
              <select name="modelo" class="input-field select-field w-full p-2 rounded-lg focus:outline-none">
                <option value="">Todos los modelos</option>
                <?php foreach ($modelos as $mod): ?>
                  <option value="<?= $mod['id'] ?>" <?= $filtro_modelo == $mod['id'] ? 'selected' : '' ?>>
                    <?= htmlspecialchars($mod['nombre_modelo']) ?>
                  </option>
                <?php endforeach; ?>
              </select>
            </div>

            <div>
              <label class="block text-sm text-gray-400 mb-1">Estado</label>
              <select name="estado" class="input-field select-field w-full p-2 rounded-lg focus:outline-none">
                <option value="">Todos los estados</option>
                <option value="nuevo" <?= $filtro_estado == 'nuevo' ? 'selected' : '' ?>>Nuevos</option>

                <option value="destacado" <?= $filtro_estado == 'destacado' ? 'selected' : '' ?>>Destacados</option>
              </select>
            </div>

            <div class="md:col-span-4 flex items-center justify-center mt-2">
              <button type="submit" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mr-3 transition-colors">
                <i class="fas fa-filter mr-2"></i>Aplicar filtros
              </button>
              <a href="productos.php" class="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                <i class="fas fa-times mr-2"></i>Limpiar
              </a>
            </div>
          </form>
        </div>

        <!-- Tabla de productos -->
        <div class="glass-card overflow-hidden fade-in animate-delay-200">
          <!-- Resumen -->
          <div class="p-6 border-b border-gray-800/50">
            <div class="flex flex-wrap items-center justify-between">
              <h3 class="text-lg font-medium text-white">Productos (<?= $total_productos ?>)</h3>
              <p class="text-sm text-gray-400">
                Mostrando <?= min($productos_por_pagina, count($productos)) ?> de <?= $total_productos ?> productos
              </p>
            </div>
          </div>

          <!-- Tabla -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-800/50 border-b border-gray-700/50">
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Producto</th>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Categoría</th>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tamaño</th>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Precio</th>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                  <th class="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800/30">
                <?php if (empty($productos)): ?>
                  <tr>
                    <td colspan="6" class="py-8 text-center text-gray-400">
                      <i class="fas fa-box-open text-3xl mb-2 block"></i>
                      <p>No se encontraron productos</p>
                      <p class="text-sm mt-1">Intenta cambiar los filtros o agrega nuevos productos</p>
                    </td>
                  </tr>
                <?php else: ?>
                  <?php foreach ($productos as $producto): ?>
                    <tr class="hover:bg-white/5 transition-colors">
                      <td class="py-4 px-4">
                        <div class="flex items-center space-x-3">
                          <div class="w-12 h-12 rounded-lg overflow-hidden image-shine flex-shrink-0">
                            <?php if (!empty($producto['imagen_principal'])): ?>
                              <img src="<?= htmlspecialchars($producto['imagen_principal']) ?>" alt="<?= htmlspecialchars($producto['nombre']) ?>" class="w-full h-full object-cover">
                            <?php else: ?>
                              <div class="w-full h-full flex items-center justify-center bg-gray-700">
                                <i class="fas fa-image text-gray-500"></i>
                              </div>
                            <?php endif; ?>
                          </div>
                          <div>
                            <p class="font-medium text-white"><?= htmlspecialchars($producto['nombre']) ?></p>
                            <p class="text-xs text-gray-400 line-clamp-1"><?= htmlspecialchars(substr($producto['descripcion'], 0, 60)) . (strlen($producto['descripcion']) > 60 ? '...' : '') ?></p>
                          </div>
                        </div>
                      </td>
                      <td class="py-4 px-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                          <?= htmlspecialchars($producto['categoria'] ?? 'N/A') ?>
                        </span>
                      </td>
                      <td class="py-4 px-4 text-gray-300">
                        <?= htmlspecialchars($producto['tamano'] ?? 'N/A') ?>
                      </td>
                      <td class="py-4 px-4 font-medium text-white">
                        $<?= number_format($producto['precio'], 2) ?>
                      </td>
                      <td class="py-4 px-4">
                        <div class="flex flex-wrap gap-1">
                          <?php if ($producto['es_nuevo']): ?>
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium badge-success">
                              Nuevo
                            </span>
                          <?php endif; ?>



                          <?php if ($producto['es_destacado']): ?>
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium badge-secondary">
                              Destacado
                            </span>
                          <?php endif; ?>
                        </div>
                      </td>
                      <td class="py-4 px-4 text-right">
                        <div class="flex items-center justify-end space-x-2">
                          <button
                            @click="showProductForm('edit', <?= $producto['id'] ?>)"
                            class="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                            title="Editar producto">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button
                            @click="confirmDelete(<?= $producto['id'] ?>, '<?= htmlspecialchars(addslashes($producto['nombre'])) ?>')"
                            class="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Eliminar producto">
                            <i class="fas fa-trash-alt"></i>
                          </button>
                          <button
                            @click="showProductDetail(<?= $producto['id'] ?>)"
                            class="p-1.5 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                            title="Ver detalles">
                            <i class="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  <?php endforeach; ?>
                <?php endif; ?>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <?php if ($total_paginas > 1): ?>
            <div class="p-4 border-t border-gray-800/50">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-400">
                  Página <?= $pagina_actual ?> de <?= $total_paginas ?>
                </p>
                <div class="flex items-center space-x-2">
                  <?php if ($pagina_actual > 1): ?>
                    <a href="?pagina=1<?= !empty($busqueda) ? '&busqueda=' . urlencode($busqueda) : '' ?><?= !empty($filtro_categoria) ? '&categoria=' . $filtro_categoria : '' ?><?= !empty($filtro_tamano) ? '&tamano=' . $filtro_tamano : '' ?><?= !empty($filtro_modelo) ? '&modelo=' . $filtro_modelo : '' ?><?= !empty($filtro_estado) ? '&estado=' . $filtro_estado : '' ?>" class="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <i class="fas fa-angle-double-left text-gray-400"></i>
                    </a>
                    <a href="?pagina=<?= $pagina_actual - 1 ?><?= !empty($busqueda) ? '&busqueda=' . urlencode($busqueda) : '' ?><?= !empty($filtro_categoria) ? '&categoria=' . $filtro_categoria : '' ?><?= !empty($filtro_tamano) ? '&tamano=' . $filtro_tamano : '' ?><?= !empty($filtro_modelo) ? '&modelo=' . $filtro_modelo : '' ?><?= !empty($filtro_estado) ? '&estado=' . $filtro_estado : '' ?>" class="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <i class="fas fa-angle-left text-gray-400"></i>
                    </a>
                  <?php endif; ?>

                  <div class="flex items-center">
                    <?php
                    $inicio = max(1, $pagina_actual - 2);
                    $fin = min($total_paginas, $pagina_actual + 2);

                    for ($i = $inicio; $i <= $fin; $i++):
                    ?>
                      <a href="?pagina=<?= $i ?><?= !empty($busqueda) ? '&busqueda=' . urlencode($busqueda) : '' ?><?= !empty($filtro_categoria) ? '&categoria=' . $filtro_categoria : '' ?><?= !empty($filtro_tamano) ? '&tamano=' . $filtro_tamano : '' ?><?= !empty($filtro_modelo) ? '&modelo=' . $filtro_modelo : '' ?><?= !empty($filtro_estado) ? '&estado=' . $filtro_estado : '' ?>" class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors <?= $i == $pagina_actual ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10' ?>">
                        <?= $i ?>
                      </a>
                    <?php endfor; ?>
                  </div>

                  <?php if ($pagina_actual < $total_paginas): ?>
                    <a href="?pagina=<?= $pagina_actual + 1 ?><?= !empty($busqueda) ? '&busqueda=' . urlencode($busqueda) : '' ?><?= !empty($filtro_categoria) ? '&categoria=' . $filtro_categoria : '' ?><?= !empty($filtro_tamano) ? '&tamano=' . $filtro_tamano : '' ?><?= !empty($filtro_modelo) ? '&modelo=' . $filtro_modelo : '' ?><?= !empty($filtro_estado) ? '&estado=' . $filtro_estado : '' ?>" class="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <i class="fas fa-angle-right text-gray-400"></i>
                    </a>
                    <a href="?pagina=<?= $total_paginas ?><?= !empty($busqueda) ? '&busqueda=' . urlencode($busqueda) : '' ?><?= !empty($filtro_categoria) ? '&categoria=' . $filtro_categoria : '' ?><?= !empty($filtro_tamano) ? '&tamano=' . $filtro_tamano : '' ?><?= !empty($filtro_modelo) ? '&modelo=' . $filtro_modelo : '' ?><?= !empty($filtro_estado) ? '&estado=' . $filtro_estado : '' ?>" class="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <i class="fas fa-angle-double-right text-gray-400"></i>
                    </a>
                  <?php endif; ?>
                </div>
              </div>
            </div>
          <?php endif; ?>
        </div>

        <!-- Footer -->
        <footer class="mt-8 text-center text-sm text-gray-500 pb-6">
          <p>© <?= date('Y') ?> Catálogo de Rines | Todos los derechos reservados</p>
        </footer>
      </div>
    </div>
  </main>

  <!-- Modal para confirmar eliminación -->
  <div
    x-show="confirmDeleteModal.show"
    class="fixed inset-0 z-50 flex items-center justify-center"
    x-transition:enter="transition ease-out duration-300"
    x-transition:enter-start="opacity-0"
    x-transition:enter-end="opacity-100"
    x-transition:leave="transition ease-in duration-200"
    x-transition:leave-start="opacity-100"
    x-transition:leave-end="opacity-0">
    <div class="absolute inset-0 bg-black/60 backdrop" @click="confirmDeleteModal.show = false"></div>
    <div
      class="glass-card p-6 rounded-xl w-full max-w-md z-10 relative"
      x-transition:enter="transition ease-out duration-300"
      x-transition:enter-start="opacity-0 transform scale-95"
      x-transition:enter-end="opacity-100 transform scale-100"
      x-transition:leave="transition ease-in duration-200"
      x-transition:leave-start="opacity-100 transform scale-100"
      x-transition:leave-end="opacity-0 transform scale-95">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
        </div>
        <h3 class="text-xl font-semibold text-white">Confirmar eliminación</h3>
        <p class="text-gray-400 mt-2">¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.</p>
        <p class="text-white font-medium mt-2" x-text="'Producto: ' + confirmDeleteModal.productName"></p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="confirmDeleteModal.show = false"
          class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
          Cancelar
        </button>
        <a
          href="#"
          @click.prevent="submitEliminarProducto(confirmDeleteModal.productId)"
          class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-center">
          Eliminar
        </a>

      </div>
    </div>
  </div>

  <script>
    function productosApp() {
      return {
        sidebarOpen: false,
        expandMenu: true,
        isLoading: false,
        notification: {
          show: <?= !empty($mensaje) ? 'true' : 'false' ?>,
          type: '<?= $tipo_mensaje ?>',
          title: '<?= $tipo_mensaje === 'success' ? 'Éxito' : ($tipo_mensaje === 'error' ? 'Error' : 'Notificación') ?>',
          message: '<?= addslashes($mensaje) ?>'
        },
        confirmDeleteModal: {
          show: false,
          productId: null,
          productName: ''
        },

        toggleSidebar() {
          this.sidebarOpen = !this.sidebarOpen;
        },

        showProductForm(mode, productId = null) {
          // Redirigir a la página de formulario
          if (mode === 'new') {
            window.location.href = 'agregar_producto.php';
          } else {
            window.location.href = 'editar_producto.php?id=' + productId;
          }
        },

        showProductDetail(productId) {
          window.location.href = 'detalle_producto.php?id=' + productId;
        },

        confirmDelete(productId, productName) {
          this.confirmDeleteModal.productId = productId;
          this.confirmDeleteModal.productName = productName;
          this.confirmDeleteModal.show = true;
        },

        closeNotification() {
          this.notification.show = false;
        },

        showNotification(type, title, message) {
          this.notification.type = type;
          this.notification.title = title;
          this.notification.message = message;
          this.notification.show = true;

          // Auto cerrar después de 5 segundos
          setTimeout(() => {
            this.notification.show = false;
          }, 5000);
        },

        init() {
          // Auto cerrar notificación después de 5 segundos
          if (this.notification.show) {
            setTimeout(() => {
              this.notification.show = false;
            }, 5000);
          }
        }
      };
    }
    function submitEliminarProducto(id) {
    const form = document.getElementById('formEliminarProducto');
    document.getElementById('eliminar_id').value = id;
    form.submit();
  }
  </script>
 

</body>

</html>

moficacion 2
<?php
ob_start(); // Iniciar el buffering de salida al principio

require_once 'header.php'; // header.php DEBE manejar session_start()
require_once '../admin/config.php';

// --- Validaciones Iniciales ---
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    // Considera redirigir a una página de error o mostrar un mensaje más amigable
    die("ID de producto no válido.");
}
$id = (int) $_GET['id'];

// --- Constante para limitar opiniones en esta página ---
define('MAX_OPINIONES_EN_DETALLE', 3); // Correcto, esto limitará las opiniones iniciales

// --- Obtener Información del Producto ---
// ... (Tu código para obtener $producto, $promocion_data, $imagenes_adicionales, etc. permanece igual)
$stmt_producto = $pdo->prepare("SELECT p.*, c.nombre AS categoria, m.nombre_modelo AS modelo, t.valor AS tamano
                                 FROM productos p
                                 LEFT JOIN categorias c ON p.id_categoria = c.id
                                 LEFT JOIN modelos m ON p.id_modelo = m.id
                                 LEFT JOIN tamanos t ON p.id_tamano = t.id
                                 WHERE p.id = ?");
$stmt_producto->execute([$id]);
$producto = $stmt_producto->fetch();

if (!$producto) {
    die("Producto no encontrado.");
}

// --- Obtener Información de Promoción (si existe, activa y vigente) ---
$stmt_promocion = $pdo->prepare("SELECT * FROM promociones WHERE producto_id = ? AND activa = 1 AND fecha_inicio <= CURDATE() AND fecha_fin >= CURDATE() LIMIT 1");
$stmt_promocion->execute([$id]);
$promocion_data = $stmt_promocion->fetch();

// --- Obtener Imágenes Adicionales ---
$stmt_imagenes = $pdo->prepare("SELECT url_imagen FROM imagenes_producto WHERE producto_id = ?");
$stmt_imagenes->execute([$id]);
$imagenes_adicionales = $stmt_imagenes->fetchAll();

// --- Lógica de Gestión de Opiniones ---
$usuario_logueado = isset($_SESSION['usuario_id']);
$id_usuario_actual = $usuario_logueado ? (int)$_SESSION['usuario_id'] : null;
$nombre_usuario_actual = $usuario_logueado ? ($_SESSION['usuario_nombre'] ?? 'Usuario') : null;

$comentario_existente_usuario = null;
if ($usuario_logueado) {
    $stmt_check_opinion = $pdo->prepare("SELECT * FROM testimonios WHERE producto_id = ? AND usuario_id = ? LIMIT 1");
    $stmt_check_opinion->execute([$id, $id_usuario_actual]);
    $comentario_existente_usuario = $stmt_check_opinion->fetch();
}

$mostrar_formulario_para_crear_o_editar = false;
if ($usuario_logueado) {
    if (!$comentario_existente_usuario) {
        $mostrar_formulario_para_crear_o_editar = true;
    } else {
        if (isset($_GET['editar_opinion']) && $_GET['editar_opinion'] == '1') {
            $mostrar_formulario_para_crear_o_editar = true;
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['accion_opinion'])) {
    // ... (Tu lógica de procesamiento de envío de opinión permanece igual)
    if (!$usuario_logueado) {
        $_SESSION['mensaje_envio'] = "Debes iniciar sesión para enviar o editar tu opinión.";
        header("Location: detalle_producto.php?id=" . $id . "&opinion_procesada=1#escribe-opinion-seccion");
        exit;
    }

    $mensaje_opinion_contenido = trim($_POST['mensaje_opinion_input'] ?? '');
    $rating = isset($_POST['rating']) ? (int)$_POST['rating'] : 0;
    $accion = $_POST['accion_opinion'];

    if ($mensaje_opinion_contenido && $rating >= 1 && $rating <= 5) {
        if ($accion === 'crear' && !$comentario_existente_usuario) {
            $stmt_insert = $pdo->prepare("INSERT INTO testimonios (nombre_cliente, mensaje, rating, producto_id, usuario_id, publicado, creado_en, editado_en)
                                          VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())");
            if ($stmt_insert->execute([$nombre_usuario_actual, $mensaje_opinion_contenido, $rating, $id, $id_usuario_actual])) {
                $_SESSION['mensaje_envio'] = "Tu opinión ha sido publicada exitosamente.";
            } else {
                $_SESSION['mensaje_envio'] = "Error al guardar tu opinión. Inténtalo de nuevo.";
            }
        } elseif ($accion === 'editar' && $comentario_existente_usuario) {
            $id_opinion_a_editar = (int)$comentario_existente_usuario['id'];
            $stmt_update = $pdo->prepare("UPDATE testimonios
                                          SET mensaje = ?, rating = ?, editado_en = NOW()
                                          WHERE id = ? AND usuario_id = ?");
            if ($stmt_update->execute([$mensaje_opinion_contenido, $rating, $id_opinion_a_editar, $id_usuario_actual])) {
                $_SESSION['mensaje_envio'] = "Tu opinión ha sido actualizada exitosamente.";
            } else {
                $_SESSION['mensaje_envio'] = "Error al actualizar tu opinión. Inténtalo de nuevo.";
            }
        } else {
            $_SESSION['mensaje_envio'] = "Acción no válida o ya has comentado este producto.";
        }
    } else {
        $_SESSION['mensaje_envio'] = "Por favor completa todos los campos correctamente (opinión y calificación).";
    }
    header("Location: detalle_producto.php?id=" . $id . "&opinion_procesada=1#escribe-opinion-seccion");
    exit;
}

$mensaje_envio_feedback = '';
if (isset($_SESSION['mensaje_envio'])) {
    $mensaje_envio_feedback = $_SESSION['mensaje_envio'];
    unset($_SESSION['mensaje_envio']);
}

// --- Obtener Opiniones para Mostrar (las primeras MAX_OPINIONES_EN_DETALLE) ---
$stmt_count_opiniones = $pdo->prepare("SELECT COUNT(*) FROM testimonios WHERE producto_id = ? AND publicado = 1");
$stmt_count_opiniones->execute([$id]);
$total_opiniones_producto = (int)$stmt_count_opiniones->fetchColumn(); // Total de opiniones para este producto

$opiniones_para_mostrar = [];
if ($total_opiniones_producto > 0) {
    $stmt_opiniones_detalle = $pdo->prepare("SELECT * FROM testimonios WHERE producto_id = :producto_id AND publicado = 1 ORDER BY creado_en DESC LIMIT :limit");
    $stmt_opiniones_detalle->bindValue(':producto_id', $id, PDO::PARAM_INT);
    $stmt_opiniones_detalle->bindValue(':limit', MAX_OPINIONES_EN_DETALLE, PDO::PARAM_INT); // Usa la constante
    $stmt_opiniones_detalle->execute();
    $opiniones_para_mostrar = $stmt_opiniones_detalle->fetchAll();
}

// --- Calcular Rating Promedio ---
// ... (Tu código para calcular $rating_promedio permanece igual)
$rating_promedio = 0;
if ($total_opiniones_producto > 0) {
    $stmt_sum_rating = $pdo->prepare("SELECT SUM(rating) FROM testimonios WHERE producto_id = ? AND publicado = 1");
    $stmt_sum_rating->execute([$id]);
    $sum_ratings = (float)$stmt_sum_rating->fetchColumn();
    $rating_promedio = $sum_ratings / $total_opiniones_producto;
}

// --- Productos Relacionados ---
// ... (Tu código para $productos_relacionados permanece igual)
$stmt_relacionados = $pdo->prepare("SELECT id, nombre, imagen_principal, precio FROM productos
                                     WHERE (id_categoria = ? OR id_modelo = ?) AND id != ?
                                     LIMIT 4");
$stmt_relacionados->execute([($producto['id_categoria'] ?? null), ($producto['id_modelo'] ?? null), $id]);
$productos_relacionados = $stmt_relacionados->fetchAll();

// --- Cálculo de Precio con Promoción y Ahorro ---
// ... (Tu código para $precio_final, $precio_original, $ahorro, $porcentaje_ahorro permanece igual)
$precio_base_producto = (float) $producto['precio'];
$precio_final = $precio_base_producto;
$precio_original = null;
$ahorro = 0;
$porcentaje_ahorro = 0;

if ($promocion_data) {
    $valor_promocion_num = (float) ($promocion_data['valor_promocion'] ?? 0);
    $tipo_promocion_actual = $promocion_data['tipo_promocion'] ?? '';

    if ($tipo_promocion_actual === 'descuento' && $valor_promocion_num > 0) {
        $descuento_calculado = $precio_base_producto * ($valor_promocion_num / 100);
        $precio_final = $precio_base_producto - $descuento_calculado;
        $precio_original = $precio_base_producto;
    } elseif ($tipo_promocion_actual === 'descuento_fijo' && $valor_promocion_num > 0) {
        $precio_final = $precio_base_producto - $valor_promocion_num;
        $precio_original = $precio_base_producto;
    }

    if ($precio_final < 0) $precio_final = 0;

    if ($precio_original !== null && $precio_original > $precio_final) {
        $ahorro = $precio_original - $precio_final;
        if ($precio_original > 0) {
            $porcentaje_ahorro = round(($ahorro / $precio_original) * 100);
        }
    } else {
        $precio_original = null;
    }
}

// --- Agrupar Imágenes ---
// ... (Tu código para $todas_imagenes permanece igual)
$todas_imagenes = array();
if (!empty($producto['imagen_principal'])) {
    $todas_imagenes[] = $producto['imagen_principal'];
}
foreach ($imagenes_adicionales as $img) {
    $todas_imagenes[] = $img['url_imagen'];
}

// --- Validar Pestaña de Promoción ---
// ... (Tu código para $promocion_tab_valida permanece igual)
$promocion_tab_valida = false;
if ($promocion_data) {
    $tipo_promo = $promocion_data['tipo_promocion'] ?? '';
    $valor_promo = (float)($promocion_data['valor_promocion'] ?? 0);
    $descripcion_promo = trim($promocion_data['descripcion'] ?? '');
    if (($tipo_promo && $tipo_promo !== 'otro' && $valor_promo > 0) ||
        (in_array($tipo_promo, ['regalo', 'envio_gratis'])) ||
        ($tipo_promo === 'otro' && !empty($descripcion_promo)) ||
        (!empty($promocion_data['fecha_inicio']) && !empty($promocion_data['fecha_fin']))
    ) {
        $promocion_tab_valida = true;
    }
}

// --- URL Canónica ---
$producto_url_canonica = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'] . strtok($_SERVER["REQUEST_URI"], '?') . "?id=" . $id;

// --- Función para mostrar etiquetas de producto ---
if (!function_exists('mostrar_etiqueta_producto_con_estilo')) {
    function mostrar_etiqueta_producto_con_estilo($valor, $clase_color_fondo_texto, $texto_por_defecto_si_vacio = 'N/A', $es_circulo_si_vacio = true) {
        $valor_limpio = trim((string)$valor);
        
        $clase_final_etiqueta = 'etiqueta-producto-base ' . $clase_color_fondo_texto;
        $contenido_span = '';

        if (!empty($valor_limpio)) {
            $contenido_span = htmlspecialchars($valor_limpio);
        } elseif ($es_circulo_si_vacio) {
            $clase_final_etiqueta .= ' etiqueta-circulo-vacio';
        } elseif (!empty($texto_por_defecto_si_vacio) && $texto_por_defecto_si_vacio !== 'N/A') { 
            $contenido_span = htmlspecialchars($texto_por_defecto_si_vacio);
        } elseif ($texto_por_defecto_si_vacio === 'N/A' && !$es_circulo_si_vacio) {
            $contenido_span = htmlspecialchars($texto_por_defecto_si_vacio);
        }
        
        if (!empty($contenido_span) || strpos($clase_final_etiqueta, 'etiqueta-circulo-vacio') !== false) {
?>
            <span class="<?= $clase_final_etiqueta ?>">
                <?= $contenido_span ?>
            </span>
<?php
        }
    }
}
?>

<style>
    /* ... (Tus estilos permanecen iguales) ... */
    html, body { max-width: 100%; overflow-x: hidden; }
    .fade-in { opacity: 0; animation: fadeIn 0.8s forwards; }
    @keyframes fadeIn { to { opacity: 1; } }
    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; }
    .delay-400 { animation-delay: 0.4s; }
    .delay-500 { animation-delay: 0.5s; }
    
    .share-modal-container {
        background: rgba(30, 41, 59, 0.85); 
        backdrop-filter: blur(10px); 
        -webkit-backdrop-filter: blur(10px); 
        border: 1px solid rgba(71, 85, 105, 0.5); 
        color: #e2e8f0; 
        border-radius: 0.75rem; 
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); 
        overflow: hidden; 
    }
    .share-modal-header {
        background-color: #f5b401; 
        color: #1e293b; 
        padding: 1rem 1.5rem; 
    }
    .share-modal-header h3 { color: #1e293b; }
    .share-modal-header .brand-name { font-size: 0.8rem; color: #334155; margin-top: 0.1rem; }
    .share-modal-body { padding: 1.5rem; }
    .share-modal-body label { color: #94a3b8; }
    .share-modal-body input[type="text"] { background-color: rgba(51, 65, 85, 0.7); border-color: #475569; color: #e2e8f0; }
    .share-modal-body input[type="text"]::placeholder { color: #64748b; }
    .share-modal-body .copy-button { background-color: #f5b401; color: #1e293b; }
    .share-modal-body .copy-button:hover { background-color: #eab308; }
    .share-modal-body .social-share-button { background-color: #334155; color: #e2e8f0; }
    .share-modal-body .social-share-button:hover { background-color: #475569; }
    .share-modal-close-button { color: #4b5563; }
    .share-modal-close-button:hover { color: #1f2937; }

    @supports not ((backdrop-filter: blur(8px)) or (-webkit-backdrop-filter: blur(8px))) { 
        .share-modal-container { background: rgba(30, 41, 59, 0.95); } 
    }

    .glass { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); }
    .bg-blur { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
    .gallery-thumb { transition: all 0.3s ease; border: 2px solid transparent; }
    .gallery-thumb:hover { transform: scale(1.05); }
    .gallery-thumb.active { border-color: #f5b401; transform: scale(1.05); }
    .badge-pulse { animation: pulseEffect 2s infinite; }
    @keyframes pulseEffect { 0% { box-shadow: 0 0 0 0 rgba(245, 180, 1, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(245, 180, 1, 0); } 100% { box-shadow: 0 0 0 0 rgba(245, 180, 1, 0); } }
    .promo-badge { background: linear-gradient(135deg, #f5b401, #ff9800); }
    .spec-table td { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .spec-table tr:not(:last-child) td { border-bottom: 1px solid rgba(75, 85, 99, 0.7); }

    .etiqueta-producto-base {
        display: inline-block;
        padding: 0.25rem 0.75rem; /* py-1 px-3 */
        border-radius: 9999px; /* rounded-full */
        font-size: 0.75rem; /* text-xs */
        font-weight: 600; /* font-semibold */
        margin-right: 0.5rem; 
        margin-bottom: 0.5rem; /* Asegura espacio si se van a la siguiente línea */
    }

    .etiqueta-circulo-vacio {
        width: 20px; 
        height: 20px; 
        padding: 0 !important; 
        text-indent: -9999px; /* Oculta cualquier texto residual */
        overflow: hidden;
    }
    .hidden { display: none !important; }
</style>

<div x-data="{ 
    showShareModal: false, 
    shareUrl: '<?= htmlspecialchars($producto_url_canonica) ?>', 
    productName: '<?= htmlspecialchars(addslashes($producto['nombre'])) ?>',
    showOpinionesSeccion: <?= (count($opiniones_para_mostrar) > 0 && !isset($_GET['opinion_procesada'])) ? 'true' : 'false' ?>, // Modificado para mostrar por defecto si hay opiniones y no se está procesando una
    ratingValueForm: <?= $comentario_existente_usuario ? (int)$comentario_existente_usuario['rating'] : 0 ?>
}">
    <div class="relative py-8 bg-slate-900 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
            <img src="<?= !empty($producto['imagen_principal']) ? htmlspecialchars($producto['imagen_principal']) : '/sitio/assets/img/placeholder.jpg' ?>"
                 alt="Fondo de <?= htmlspecialchars($producto['nombre']) ?>"
                 class="w-full h-full object-cover blur-sm opacity-20">
            <div class="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900"></div>
        </div>

        <div class="container mx-auto px-4 relative z-10">
            <div class="flex text-sm text-slate-400 mb-4 items-center">
                <a href="index.php" class="hover:text-white transition-colors">Inicio</a>
                <span class="mx-2">/</span>
                <a href="productos.php" class="hover:text-white transition-colors">Productos</a>
                <span class="mx-2">/</span>
                <a href="productos.php?categoria=<?= $producto['id_categoria'] ?? '' ?>" class="hover:text-white transition-colors">
                    <?= htmlspecialchars($producto['categoria'] ?? 'General') ?>
                </a>
                <span class="mx-2">/</span>
                <span class="text-white font-medium"><?= htmlspecialchars($producto['nombre']) ?></span>
            </div>

            <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 fade-in">
                <?= htmlspecialchars($producto['nombre']) ?>
            </h1>

            <div class="flex flex-wrap gap-x-2 gap-y-1 mb-6 fade-in delay-100">
                <?php mostrar_etiqueta_producto_con_estilo($producto['categoria'], 'bg-sky-700/50 text-sky-200', 'N/A', true); ?>
                <?php mostrar_etiqueta_producto_con_estilo($producto['modelo'], 'bg-indigo-700/50 text-indigo-200', 'N/A', true); ?>
                <?php mostrar_etiqueta_producto_con_estilo($producto['tamano'], 'bg-purple-700/50 text-purple-200', 'N/A', true); ?>
                
                <?php if ($producto['es_nuevo']): ?>
                    <span class="etiqueta-producto-base bg-green-700/50 text-green-200">Nuevo</span>
                <?php endif; ?>
                <?php if ($producto['es_destacado']): ?>
                    <span class="etiqueta-producto-base bg-amber-700/50 text-amber-200">Destacado</span>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <div class="bg-slate-900 py-12">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div class="fade-in">
                    <div x-data="{ 
                            activeImage: '<?= !empty($todas_imagenes) ? htmlspecialchars($todas_imagenes[0]) : '' ?>',
                            showLightbox: false,
                            lightboxImg: '',
                            openLightbox(img) {
                                this.lightboxImg = img;
                                this.showLightbox = true;
                                document.body.style.overflow = 'hidden';
                            },
                            closeLightbox() {
                                this.showLightbox = false;
                                document.body.style.overflow = '';
                            }
                        }">
                        <div class="bg-slate-800 rounded-2xl overflow-hidden mb-4 relative aspect-square shadow-xl">
                            <template x-if="activeImage">
                                <img
                                    :src="activeImage"
                                    @click="openLightbox(activeImage)"
                                    class="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 hover:scale-105"
                                    alt="Imagen principal de <?= htmlspecialchars($producto['nombre']) ?>">
                            </template>
                            <?php if ($promocion_data): ?>
                                <?php
                                $badge_text_detail = '';
                                $apply_pulse_to_badge = false;
                                switch ($promocion_data['tipo_promocion']) {
                                    case 'descuento': 
                                        if ($ahorro > 0) { 
                                            $badge_text_detail = '-' . (float)$promocion_data['valor_promocion'] . '%';
                                            $apply_pulse_to_badge = true;
                                        }
                                        break;
                                    case 'descuento_fijo':
                                        if ($ahorro > 0) {
                                            $badge_text_detail = '-$' . number_format((float)$promocion_data['valor_promocion'], 2);
                                            $apply_pulse_to_badge = true;
                                        }
                                        break;
                                    case 'regalo': $badge_text_detail = 'Con Regalo'; break;
                                    case 'envio_gratis': $badge_text_detail = 'Envío Gratis'; break;
                                    default: if ($promocion_tab_valida) { $badge_text_detail = 'Oferta'; } break;
                                }
                                ?>
                                <?php if (!empty($badge_text_detail)): ?>
                                    <div class="absolute top-4 right-4 promo-badge text-slate-900 font-bold py-1.5 px-3.5 rounded-full text-sm shadow-lg <?= ($apply_pulse_to_badge) ? 'badge-pulse' : '' ?>">
                                        <?= htmlspecialchars($badge_text_detail) ?>
                                    </div>
                                <?php endif; ?>
                            <?php endif; ?>
                            <button @click="openLightbox(activeImage)" title="Ampliar imagen" class="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                            </button>
                        </div>
                        <?php if (count($todas_imagenes) > 1): ?>
                            <div class="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                <?php foreach ($todas_imagenes as $index => $img): ?>
                                    <div @click="activeImage = '<?= htmlspecialchars($img) ?>'" class="gallery-thumb aspect-square rounded-lg overflow-hidden cursor-pointer bg-slate-800" :class="{'active': activeImage === '<?= htmlspecialchars($img) ?>'}">
                                        <img src="<?= htmlspecialchars($img) ?>" class="w-full h-full object-cover" alt="Miniatura <?= $index + 1 ?> de <?= htmlspecialchars($producto['nombre']) ?>">
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>

                        <div x-show="showLightbox" @keydown.escape.window="closeLightbox" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-transition:leave="transition ease-in duration-200" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0" style="display: none;">
                            <div @click.away="closeLightbox" class="relative max-w-4xl max-h-[90vh] w-auto h-auto flex items-center justify-center">
                                <button @click="closeLightbox" title="Cerrar" class="absolute -top-2 -right-2 sm:top-2 sm:right-2 z-10 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                <img :src="lightboxImg" alt="Imagen ampliada" class="max-h-[inherit] max-w-full object-contain rounded-lg shadow-2xl">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="fade-in delay-200" x-data="{ activeTab: 'descripcion' }">
                    <div class="mb-6">
                        <div class="flex items-baseline gap-3"> 
                            <span class="text-5xl font-bold text-amber-400">$<?= number_format($precio_final, 2) ?></span>
                            <?php if ($precio_original !== null && $precio_original > $precio_final): ?>
                                <span class="text-2xl text-slate-400 line-through">$<?= number_format($precio_original, 2) ?></span>
                            <?php endif; ?>
                        </div>
                        <?php if ($ahorro > 0): ?>
                            <div class="mt-2">
                                <span class="inline-block text-lg font-bold text-green-300 bg-green-600/30 px-3 py-1.5 rounded-lg shadow-lg">¡AHORRAS $<?= number_format($ahorro, 2) ?> (<?= $porcentaje_ahorro ?>%)!</span>
                            </div>
                        <?php endif; ?>
                    </div>
                    <?php if ($total_opiniones_producto > 0): ?>
                        <div class="flex items-center mt-3 mb-6"> 
                            <div class="flex">
                                <?php for ($i = 1; $i <= 5; $i++): ?>
                                    <svg class="w-5 h-5 <?= ($i <= round($rating_promedio)) ? 'text-yellow-400' : 'text-slate-500' ?>" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                <?php endfor; ?>
                            </div>
                            <a href="#lista-opiniones-seccion" @click.prevent="showOpinionesSeccion = true; setTimeout(() => { const el = document.getElementById('lista-opiniones-seccion'); if(el) el.scrollIntoView({ behavior: 'smooth' }); }, 50);" class="ml-2 text-sm text-slate-400 hover:text-yellow-400 transition-colors">
                                <?= number_format($rating_promedio, 1) ?> (<?= $total_opiniones_producto ?> <?= $total_opiniones_producto === 1 ? 'opinión' : 'opiniones' ?>)
                            </a>
                        </div>
                    <?php endif; ?>
                    
                    <div class="mb-8" id="tabs-section">
                        <div class="flex border-b border-slate-700">
                            <button @click="activeTab = 'descripcion'" :class="activeTab === 'descripcion' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'" class="py-3 px-4 font-semibold text-sm transition-colors focus:outline-none border-b-2 -mb-px">Descripción</button>
                            <button @click="activeTab = 'especificaciones'" :class="activeTab === 'especificaciones' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'" class="py-3 px-4 font-semibold text-sm transition-colors focus:outline-none border-b-2 -mb-px">Especificaciones</button>
                            <?php if ($promocion_tab_valida): ?>
                                <button @click="activeTab = 'promocion'" :class="activeTab === 'promocion' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'" class="py-3 px-4 font-semibold text-sm transition-colors focus:outline-none border-b-2 -mb-px">Promoción</button>
                            <?php endif; ?>
                        </div>
                        <div class="py-6">
                            <div x-show="activeTab === 'descripcion'" class="text-slate-300 space-y-4 text-sm md:text-base prose prose-sm prose-invert max-w-none"><?php if (!empty($producto['descripcion'])): ?><?= nl2br(htmlspecialchars($producto['descripcion'])) ?><?php else: ?><p class="italic text-slate-500">Este producto aún no tiene descripción disponible.</p><?php endif; ?></div>
                            <div x-show="activeTab === 'especificaciones'" class="text-slate-300 text-sm md:text-base space-y-10">
                                <?php 
                                $info_basica = ['categoria' => 'Categoría', 'modelo' => 'Modelo', 'tamano' => 'Tamaño', 'precio' => ['label' => 'Precio Base', 'value' => '$' . number_format($producto['precio'], 2)]];
                                $tecnicas = ['material' => 'Material', 'acabado' => 'Acabado/Color', 'ancho_pulgadas' => 'Ancho del rin (pulgadas)', 'num_birlos' => 'Número de birlos/orificios', 'pcd' => 'Patrón de pernos/PCD', 'diametro_central' => 'Diámetro central (mm)', 'offset' => 'Offset/ET', 'peso' => 'Peso (kg)', 'stock' => 'Stock disponible', 'marca' => 'Marca/Fabricante'];
                                $adicional = ['garantia' => 'Garantía', 'tiempo_entrega' => 'Tiempo estimado de entrega', 'estilo' => 'Estilo', 'caracteristicas_destacadas' => 'Características destacadas', 'compatibilidad' => 'Vehículos compatibles'];
                                
                                if (!function_exists('print_spec_group')) {
                                    function print_spec_group($title, $color_class, $specs, $data_array) {
                                        $has_content = false;
                                        foreach (array_keys($specs) as $key) {
                                            if (!empty($data_array[$key]) || (is_array($specs[$key]) && !empty($specs[$key]['value']))) {
                                                $has_content = true;
                                                break;
                                            }
                                        }
                                        if (!$has_content) return;

                                        echo "<div>";
                                        echo "<h3 class=\"text-lg font-semibold " . $color_class . " mb-3 border-b border-" . explode('-', $color_class)[1] . "-400/30 pb-2\">" . htmlspecialchars($title) . "</h3>";
                                        echo "<table class=\"w-full text-left spec-table\"><tbody>";
                                        foreach ($specs as $clave => $etiqueta_o_config) {
                                            $etiqueta = is_array($etiqueta_o_config) ? $etiqueta_o_config['label'] : $etiqueta_o_config;
                                            $valor = is_array($etiqueta_o_config) ? $etiqueta_o_config['value'] : ($data_array[$clave] ?? null);
                                            
                                            if ($valor !== null && $valor !== '') { 
                                                echo '<tr>';
                                                echo '<td class="pr-3 text-slate-400 w-2/5 md:w-1/3">' . htmlspecialchars($etiqueta) . '</td>';
                                                echo '<td class="font-medium text-white whitespace-pre-wrap">' . nl2br(htmlspecialchars($valor)) . '</td>';
                                                echo '</tr>';
                                            }
                                        }
                                        echo "</tbody></table></div>";
                                    }
                                }
                                print_spec_group('Información Básica', 'text-sky-400', $info_basica, $producto);
                                print_spec_group('Especificaciones Técnicas', 'text-indigo-400', $tecnicas, $producto);
                                print_spec_group('Información Adicional', 'text-purple-400', $adicional, $producto);
                                ?>
                            </div>
                            <?php if ($promocion_tab_valida && $promocion_data): ?>
                                <div x-show="activeTab === 'promocion'" class="text-slate-300 space-y-4 text-sm md:text-base">
                                    <div class="bg-gradient-to-r from-yellow-600/20 to-yellow-500/10 p-5 rounded-lg border border-yellow-500/30 shadow-md">
                                        <h3 class="text-yellow-300 text-xl font-semibold mb-3">
                                            <?php
                                            switch ($promocion_data['tipo_promocion']) {
                                                case 'descuento': echo "¡" . (float)$promocion_data['valor_promocion'] . "% de descuento!"; break;
                                                case 'descuento_fijo': echo "¡$" . number_format((float)$promocion_data['valor_promocion'], 2) . " de descuento!"; break;
                                                case 'regalo': echo "¡Regalo incluido con tu compra!"; break;
                                                case 'envio_gratis': echo "¡Disfruta de Envío Gratuito!"; break;
                                                default: echo "¡Promoción Especial Aplicada!"; break;
                                            }
                                            ?>
                                        </h3>
                                        <?php if (!empty($promocion_data['descripcion'])): ?><p class="mb-3 prose prose-sm prose-invert max-w-none"><?= nl2br(htmlspecialchars($promocion_data['descripcion'])) ?></p><?php endif; ?>
                                        <?php if (!empty($promocion_data['fecha_inicio']) && !empty($promocion_data['fecha_fin'])): ?><div class="text-xs text-slate-400">Válido del <?= date('d/m/Y', strtotime($promocion_data['fecha_inicio'])) ?> al <?= date('d/m/Y', strtotime($promocion_data['fecha_fin'])) ?></div><?php endif; ?>
                                    </div>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:justify-start gap-4 mb-8">
                        <a href="mi_carrito.php?agregar=<?= $id ?>" 
                           class="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 text-center inline-flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-slate-900">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Agregar al carrito
                        </a>
                        <button @click="showShareModal = true" id="shareButton"
                                class="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-medium py-3.5 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-900">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            Compartir
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-center bg-slate-800/70 p-4 rounded-lg shadow"><div class="h-10 w-10 rounded-full bg-sky-600/30 flex items-center justify-center text-sky-300 mr-4 flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div><div><h3 class="font-medium text-white text-sm">Garantía Confiable</h3><p class="text-slate-400 text-xs"><?= htmlspecialchars($producto['garantia'] ?? '1 año contra defectos') ?></p></div></div>
                        <div class="flex items-center bg-slate-800/70 p-4 rounded-lg shadow"><div class="h-10 w-10 rounded-full bg-sky-600/30 flex items-center justify-center text-sky-300 mr-4 flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg></div><div><h3 class="font-medium text-white text-sm">Envío Protegido</h3><p class="text-slate-400 text-xs"><?= htmlspecialchars($producto['tiempo_entrega'] ?? 'Consultar tiempos') ?></p></div></div>
                    </div>
                </div>
            </div> 
            
            <div class="fade-in"> 
                <div id="escribe-opinion-seccion" class="bg-slate-800/60 rounded-xl p-6 md:p-8 mt-10 shadow-xl mx-auto w-full max-w-xl">
                    <h3 class="text-2xl font-bold text-white mb-2 text-center">
                        <?= $comentario_existente_usuario ? 'Edita tu opinión' : 'Escribe tu opinión' ?>
                    </h3>
                    <p class="text-sm text-slate-400 mb-6 text-center">
                        Sobre el producto: <span class="text-white font-semibold"><?= htmlspecialchars($producto['nombre']) ?></span>
                    </p>

                    <?php if ($mensaje_envio_feedback): 
                        $esExitoOpinion = (stripos($mensaje_envio_feedback, 'exitosa') !== false || stripos($mensaje_envio_feedback, 'gracias') !== false);
                        $claseBgOpinion = $esExitoOpinion ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30';
                        $claseTextOpinion = $esExitoOpinion ? 'text-green-300' : 'text-red-300';
                    ?>
                        <div id="mensaje-opinion-procesada" class="<?= $claseBgOpinion ?> p-4 rounded-lg border mb-6 text-sm shadow">
                            <p class="<?= $claseTextOpinion ?>"><?= htmlspecialchars($mensaje_envio_feedback) ?></p>
                        </div>
                    <?php endif; ?>

                    <?php if ($usuario_logueado): ?>
                        <?php if ($mostrar_formulario_para_crear_o_editar): ?>
                            <form method="post" action="detalle_producto.php?id=<?= $id ?>#escribe-opinion-seccion" class="space-y-5">
                                <input type="hidden" name="accion_opinion" value="<?= $comentario_existente_usuario ? 'editar' : 'crear' ?>">
                                
                                <p class="text-slate-400 text-sm">Opinión como <strong class="text-white font-medium"><?= htmlspecialchars($nombre_usuario_actual) ?></strong></p>
                                
                                <div>
                                    <label for="rating_input_field" class="block mb-1.5 text-sm font-medium text-slate-300">Calificación</label>
                                    <div class="flex items-center space-x-1">
                                        <?php for ($s = 1; $s <= 5; $s++): ?>
                                            <button type="button" @click="ratingValueForm = <?= $s ?>; document.getElementById('rating_input_field').value = <?= $s ?>;" class="focus:outline-none p-1 rounded-md hover:bg-slate-700 transition-colors">
                                                <svg :class="{'text-yellow-400': ratingValueForm >= <?= $s ?>, 'text-slate-500 hover:text-slate-400': ratingValueForm < <?= $s ?>}" class="w-6 h-6 cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                            </button>
                                        <?php endfor; ?>
                                        <input type="hidden" id="rating_input_field" name="rating" x-model.number="ratingValueForm" required>
                                        <span class="text-sm text-slate-400 ml-2" x-text="ratingValueForm ? `${ratingValueForm}/5 estrellas` : 'Selecciona tu calificación'"></span>
                                    </div>
                                </div>
                                <div>
                                    <label for="mensaje_opinion_input" class="block mb-1.5 text-sm font-medium text-slate-300">Tu opinión</label>
                                    <textarea id="mensaje_opinion_input" name="mensaje_opinion_input" rows="4" required class="w-full p-3 bg-slate-900/70 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors placeholder-slate-500"><?= $comentario_existente_usuario ? htmlspecialchars($comentario_existente_usuario['mensaje']) : '' ?></textarea>
                                </div>
                                <button type="submit" class="w-full sm:w-auto bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                                    <?= $comentario_existente_usuario ? 'Actualizar Opinión' : 'Enviar opinión' ?>
                                </button>
                            </form>
                        <?php else: ?>
                             <div class="text-center py-6 bg-slate-900/30 rounded-lg">
                                 <p class="text-slate-300">Ya has dejado una opinión para este producto.</p>
                                 <p class="text-slate-400 text-sm mt-1">Puedes editarla si lo deseas.</p>
                                 <button @click="window.location.href = 'detalle_producto.php?id=<?= $id ?>&editar_opinion=1#escribe-opinion-seccion';"
                                         class="mt-3 inline-block bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                                     Editar mi Opinión
                                 </button>
                             </div>
                        <?php endif; ?>
                    <?php else: ?>
                        <div class="text-center py-6">
                            <p class="text-slate-400">Debes <a href="login.php" class="text-sky-400 hover:text-sky-300 font-semibold">iniciar sesión</a> o <a href="registro.php" class="text-sky-400 hover:text-sky-300 font-semibold">registrarte</a> para dejar una opinión.</p>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <div class="mt-16 fade-in delay-300">
                <div class="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                    <h2 class="text-3xl font-bold text-white">Opiniones de Clientes</h2>
                    <?php if (count($opiniones_para_mostrar) > 0): // Solo mostrar el botón si hay opiniones iniciales ?>
                        <button @click="showOpinionesSeccion = !showOpinionesSeccion" 
                                class="text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                                :class="showOpinionesSeccion ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-sky-600 hover:bg-sky-700 text-white'">
                            <span x-text="showOpinionesSeccion ? 'Ocultar Opiniones (<?= count($opiniones_para_mostrar) ?>)' : 'Mostrar Opiniones (<?= count($opiniones_para_mostrar) ?>)'"></span>
                        </button>
                    <?php endif; ?>
                </div>

                <?php if (count($opiniones_para_mostrar) > 0): ?>
                    <div id="lista-opiniones-seccion" x-show="showOpinionesSeccion" x-transition>
                        <div class="space-y-8 mb-10"> 
                            <?php foreach ($opiniones_para_mostrar as $op): ?>
                                <div class="bg-slate-800/60 rounded-xl p-5 md:p-6 shadow-lg">
                                    <div class="flex items-start">
                                        <div class="w-10 h-10 rounded-full bg-sky-700/50 flex items-center justify-center text-sky-200 font-bold mr-4 flex-shrink-0 text-lg"><?= strtoupper(substr(htmlspecialchars($op['nombre_cliente']), 0, 1)) ?></div>
                                        <div class="flex-1">
                                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1.5">
                                                <h3 class="font-semibold text-white text-md"><?= htmlspecialchars($op['nombre_cliente']) ?></h3>
                                                <span class="text-xs text-slate-400 mt-1 sm:mt-0"><?= date('d \d\e F \d\e Y', strtotime($op['creado_en'])) ?></span>
                                            </div>
                                            <div class="flex mb-3">
                                                <?php for ($s_star = 1; $s_star <= 5; $s_star++): ?><svg class="w-4 h-4 <?= ($s_star <= $op['rating']) ? 'text-yellow-400' : 'text-slate-600' ?>" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg><?php endfor; ?>
                                            </div>
                                            <p class="text-slate-300 text-sm leading-relaxed mb-4 prose prose-sm prose-invert max-w-none"><?= nl2br(htmlspecialchars($op['mensaje'])) ?></p>
                                            <?php if (!empty($op['respuesta'])): ?>
                                                <div class="bg-slate-900/70 rounded-md p-4 border-l-4 border-sky-500 mt-4"><p class="text-sky-300 font-semibold text-xs mb-1">Respuesta del Vendedor</p><p class="text-slate-300 text-xs leading-relaxed prose prose-xs prose-invert max-w-none"><?= nl2br(htmlspecialchars($op['respuesta'])) ?></p></div>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        
                        <?php if ($total_opiniones_producto > MAX_OPINIONES_EN_DETALLE): ?>
                            <div class="text-center mt-6 mb-12"> {/* Botón "Ver más" fuera del div que tenía el scroll */}
                                <a href="testimonios.php?id_producto=<?= $id ?>" 
                                   class="inline-flex items-center justify-center bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 font-bold py-3 px-6 rounded-xl transition-all duration-300 text-center shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-slate-900">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 -ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                                    </svg>
                                    Ver <?= ($total_opiniones_producto - MAX_OPINIONES_EN_DETALLE) ?> opiniones más
                                </a>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php elseif (empty($mensaje_envio_feedback)): // Solo mostrar si no hay feedback pendiente y no hay opiniones iniciales ?>
                    <div class="text-center py-12 bg-slate-800/50 rounded-xl shadow">
                        <div class="text-slate-500 mb-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg></div>
                        <h3 class="text-lg font-medium text-white mb-1">Aún no hay opiniones</h3>
                        <p class="text-slate-400 text-sm">¡Anímate y sé el primero en compartir tu experiencia!</p>
                    </div>
                <?php endif; ?>
            </div>
            <?php if (count($productos_relacionados) > 0): ?>
                <div class="mt-20 fade-in delay-400">
                    <h2 class="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">También te podría interesar</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        <?php foreach ($productos_relacionados as $rel): ?>
                            <a href="detalle_producto.php?id=<?= $rel['id'] ?>" class="group block bg-slate-800/60 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div class="aspect-square overflow-hidden"><img src="<?= htmlspecialchars($rel['imagen_principal']) ?>" alt="<?= htmlspecialchars($rel['nombre']) ?>" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"></div>
                                <div class="p-5"><h3 class="text-white font-semibold text-md mb-2 truncate group-hover:text-yellow-400 transition-colors"><?= htmlspecialchars($rel['nombre']) ?></h3><p class="text-sky-400 font-bold text-lg">$<?= number_format($rel['precio'], 2) ?></p></div>
                            </a>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endif; ?>
        </div> </div> <div x-show="showShareModal" 
         @keydown.escape.window="showShareModal = false"
         class="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/80 p-4"
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         style="display: none;">
        <div @click.away="showShareModal = false" class="share-modal-container w-full max-w-md sm:max-w-lg relative">
            <div class="share-modal-header relative">
                <h3 class="text-xl sm:text-2xl font-semibold">Compartir Producto</h3>
                <p class="brand-name">Rinesport</p>
                <button @click="showShareModal = false" title="Cerrar modal" class="share-modal-close-button absolute top-3 right-3 sm:top-4 sm:right-4 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <div class="share-modal-body">
                <p class="mb-4 text-sm">Comparte <strong x-text="productName" class="font-semibold"></strong> con tus amigos:</p>

                <div class="mb-5">
                    <label for="share-url-input" class="block text-xs mb-1">Enlace del producto:</label>
                    <div class="flex">
                        <input id="share-url-input" type="text" :value="shareUrl" readonly 
                               class="w-full p-2.5 border rounded-l-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
                        <button @click="navigator.clipboard.writeText(shareUrl); $el.innerText = '¡Copiado!'; setTimeout(() => $el.innerText = 'Copiar', 2000)"
                                class="copy-button font-semibold py-2.5 px-3 sm:px-4 rounded-r-lg transition-colors text-sm whitespace-nowrap">
                            Copiar
                        </button>
                    </div>
                </div>

                <p class="text-sm mb-3">O comparte directamente en:</p>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <a :href="'https://wa.me/?text=' + encodeURIComponent(productName + ': ' + shareUrl)" target="_blank" rel="noopener noreferrer" class="social-share-button flex items-center justify-center gap-2 font-medium py-2.5 px-2 sm:px-3 rounded-lg transition-colors text-xs sm:text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.525.074-.798.372c-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.289.173-1.413z"/></svg>
                        WhatsApp
                    </a>
                    <a :href="'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl)" target="_blank" rel="noopener noreferrer" class="social-share-button flex items-center justify-center gap-2 font-medium py-2.5 px-2 sm:px-3 rounded-lg transition-colors text-xs sm:text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                        Facebook
                    </a>
                    <a :href="'https://twitter.com/intent/tweet?url=' + encodeURIComponent(shareUrl) + '&text=' + encodeURIComponent('Echa un vistazo a ' + productName + ': ')" target="_blank" rel="noopener noreferrer" class="social-share-button flex items-center justify-center gap-2 font-medium py-2.5 px-2 sm:px-3 rounded-lg transition-colors text-xs sm:text-sm">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-.422.724-.665 1.56-.665 2.452 0 1.606.816 3.024 2.054 3.849-.758-.024-1.474-.233-2.102-.578v.062c0 2.243 1.595 4.112 3.712 4.543-.387.105-.796.161-1.21.161-.299 0-.589-.029-.871-.081.588 1.834 2.299 3.171 4.326 3.208-1.583 1.241-3.582 1.981-5.755 1.981-.374 0-.743-.022-1.107-.065 2.049 1.317 4.485 2.086 7.14 2.086 8.568 0 13.255-7.099 13.255-13.254 0-.202-.005-.403-.014-.603.91-.658 1.7-1.476 2.323-2.41z"/></svg>
                        Twitter
                    </a>
                    <a :href="'mailto:?subject=' + encodeURIComponent('Mira este producto: ' + productName) + '&body=' + encodeURIComponent('Hola,\n\nCreo que te podría interesar este producto: ' + productName + '\n\n' + shareUrl)" class="social-share-button flex items-center justify-center gap-2 font-medium py-2.5 px-2 sm:px-3 rounded-lg transition-colors text-xs sm:text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Email
                    </a>
                </div>
            </div>
        </div>
    </div>
</div> 

<script>
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const opinionProcesada = params.has('opinion_procesada');
    const editarOpinionFlag = params.has('editar_opinion');
    const alpineComponent = document.querySelector('[x-data]'); 

    if (editarOpinionFlag && alpineComponent && alpineComponent.__x) {
        const escribeOpinionSection = document.getElementById('escribe-opinion-seccion');
        if (escribeOpinionSection) {
            if (alpineComponent.__x.hasOwnProperty('showOpinionesSeccion')) {
                <?php if (count($opiniones_para_mostrar) > 0 || $comentario_existente_usuario): ?>
                    alpineComponent.__x.showOpinionesSeccion = true; 
                <?php endif; ?>
            }
            setTimeout(() => { 
                escribeOpinionSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
        }
    } else if (opinionProcesada) {
        setTimeout(() => { 
            const escribeOpinionSection = document.getElementById('escribe-opinion-seccion');
            if (escribeOpinionSection) {
                escribeOpinionSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            if (alpineComponent && alpineComponent.__x && alpineComponent.__x.hasOwnProperty('showOpinionesSeccion')) {
                <?php if (count($opiniones_para_mostrar) > 0): // Solo mostrar si hay opiniones iniciales ?>
                    alpineComponent.__x.showOpinionesSeccion = true;
                <?php endif; ?>
            }
        }, 150); 
    } else if (window.location.hash === '#lista-opiniones-seccion') {
        if (alpineComponent && alpineComponent.__x && alpineComponent.__x.hasOwnProperty('showOpinionesSeccion')) {
            <?php if (count($opiniones_para_mostrar) > 0): ?>
                alpineComponent.__x.showOpinionesSeccion = true; 
                setTimeout(() => {
                    const listaOpiniones = document.getElementById('lista-opiniones-seccion');
                    if (listaOpiniones) {
                        listaOpiniones.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            <?php endif; ?>
        }
    } else { // MODIFICADO: Comportamiento por defecto
        if (alpineComponent && alpineComponent.__x && alpineComponent.__x.hasOwnProperty('showOpinionesSeccion')) {
             <?php if (count($opiniones_para_mostrar) > 0 ): ?>
                alpineComponent.__x.showOpinionesSeccion = true; // Mostrar por defecto si hay opiniones
            <?php else: ?>
                alpineComponent.__x.showOpinionesSeccion = false; // Ocultar si no hay opiniones iniciales
            <?php endif; ?>
        }
    }

    const mensajeOpinionProcesadaEl = document.getElementById('mensaje-opinion-procesada');
    if (mensajeOpinionProcesadaEl) {
        setTimeout(() => {
            mensajeOpinionProcesadaEl.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            mensajeOpinionProcesadaEl.style.opacity = '0';
            mensajeOpinionProcesadaEl.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                mensajeOpinionProcesadaEl.classList.add('hidden');
                mensajeOpinionProcesadaEl.style.opacity = '1'; 
                mensajeOpinionProcesadaEl.style.transform = 'translateY(0)';
            }, 500); 
        }, 4000); 
    }
});
</script>

<?php 
require_once 'footer.php'; 
ob_end_flush(); 
?>
