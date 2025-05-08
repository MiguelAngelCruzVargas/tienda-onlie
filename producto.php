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
