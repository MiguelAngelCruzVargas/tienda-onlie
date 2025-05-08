<?php
// sitio/gracias.php
declare(strict_types=1);

// --- 1. INICIALIZACIÓN Y CONFIGURACIÓN DE SESIÓN ---
session_set_cookie_params([
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_name('TIENDA_SESSION');
session_start();

// --- 2. INCLUSIÓN DE ARCHIVOS DE CONFIGURACIÓN Y DEPENDENCIAS ---
// Autoload de Composer es necesario para las clases de MercadoPago y Dotenv
require_once __DIR__ . '/../vendor/autoload.php';
// Incluir la configuración de la BD
require_once __DIR__ . '/../admin/config.php';
// Incluir la configuración de Mercado Pago (ESTE ARCHIVO YA CONFIGURA EL SDK GLOBALMENTE)
require_once __DIR__ . '/../admin/mp_config.php';
// Incluir la cabecera HTML
require_once __DIR__ . '/header.php';

// Usar la clase necesaria del SDK de Mercado Pago
use MercadoPago\Client\Payment\PaymentClient;
// Ya no se necesita 'use MercadoPago\SDK;' específicamente para setAccessToken aquí

// --- 3. OBTENCIÓN DE PARÁMETROS DESDE LA URL ---
$payment_id_mp_str = $_GET['payment_id'] ?? null;
$id_pedido_interno = $_GET['pedido_interno'] ?? null; // Este es el ID de tu tabla 'registro_pedidos'
error_log("[gracias.php] Parámetros recibidos: payment_id_mp_str=$payment_id_mp_str, id_pedido_interno=$id_pedido_interno");

// --- 4. OBTENCIÓN DINÁMICA DE LA URL DE WHATSAPP ---
$whatsapp_base_url_para_resumen = '';
try {
    $stmt_redes = $pdo->prepare("SELECT url FROM redes_sociales WHERE LOWER(plataforma) LIKE '%whatsapp%' LIMIT 1");
    $stmt_redes->execute();
    $red_whatsapp = $stmt_redes->fetch(PDO::FETCH_ASSOC);
    if ($red_whatsapp && !empty($red_whatsapp['url'])) {
        $whatsapp_base_url_para_resumen = $red_whatsapp['url'];
        error_log("[gracias.php] URL de WhatsApp obtenida: " . $whatsapp_base_url_para_resumen);
    } else {
        error_log("[gracias.php] ADVERTENCIA: No se encontró URL de WhatsApp en redes_sociales.");
        if (defined('FALLBACK_WHATSAPP_URL')) $whatsapp_base_url_para_resumen = FALLBACK_WHATSAPP_URL;
    }
} catch (PDOException $e) {
    error_log("[gracias.php] ERROR PDO al obtener URL de WhatsApp: " . $e->getMessage());
}

// --- 5. REGISTRO DETALLADO DEL PAGO EN TABLA `pagos` ---
// Se confía en que mp_config.php ya configuró el Access Token globalmente.
// Solo intentar si los IDs necesarios están presentes y el pago no se ha guardado ya.
if ($payment_id_mp_str && $id_pedido_interno && !isset($_SESSION['pago_guardado_detalle_' . $payment_id_mp_str])) {
    error_log("[gracias.php] Intentando registrar pago ID MP: $payment_id_mp_str para pedido interno: $id_pedido_interno");
    $client = new PaymentClient(); // Crear instancia del cliente
    try {
        $payment_id_mp_int = (int) $payment_id_mp_str;
        if ($payment_id_mp_int <= 0) {
            throw new Exception("ID de pago de MP inválido después de conversión a entero: $payment_id_mp_str");
        }

        error_log("[gracias.php] Solicitando detalles del pago a MP para ID (int): $payment_id_mp_int (usando token global)");
        // La llamada a ->get() usará el Access Token configurado globalmente por mp_config.php
        $payment = $client->get($payment_id_mp_int);

        if ($payment) {
            error_log("[gracias.php] Detalles del pago obtenidos de MP: " . print_r($payment, true));

            // Asumiendo que tu tabla `pagos` NO tiene `datos_completos_mp`
            $stmt_pago = $pdo->prepare("
                INSERT INTO pagos (payment_id, status, status_detail, payment_type, monto, fecha_pago, email_comprador, pedido_id)
                VALUES (:payment_id, :status, :status_detail, :payment_type, :monto, :fecha_pago, :email_comprador, :pedido_id)
                ON DUPLICATE KEY UPDATE
                    status = VALUES(status),
                    status_detail = VALUES(status_detail),
                    monto = VALUES(monto),
                    fecha_pago = VALUES(fecha_pago)
            ");

            $fecha_aprobacion = null;
            if ($payment->date_approved) {
                $date = new DateTime($payment->date_approved);
                $fecha_aprobacion = $date->format('Y-m-d H:i:s');
            }

            $email_comprador = $payment->payer && $payment->payer->email ? $payment->payer->email : null;

            $execute_params = [
                ':payment_id' => $payment->id,
                ':status' => $payment->status,
                ':status_detail' => $payment->status_detail,
                ':payment_type' => $payment->payment_type_id,
                ':monto' => $payment->transaction_amount,
                ':fecha_pago' => $fecha_aprobacion,
                ':email_comprador' => $email_comprador,
                ':pedido_id' => $id_pedido_interno
            ];

            error_log("[gracias.php] Parámetros para ejecutar INSERT en pagos: " . print_r($execute_params, true));
            $stmt_pago->execute($execute_params);

            $_SESSION['pago_guardado_detalle_' . $payment_id_mp_str] = true;
            error_log("[gracias.php] Detalles del pago ID MP $payment_id_mp_str guardados en 'pagos' para pedido interno $id_pedido_interno. Filas afectadas: " . $stmt_pago->rowCount());
        } else {
            error_log("[gracias.php] No se pudieron obtener detalles del pago ID MP $payment_id_mp_str desde Mercado Pago (respuesta vacía o inválida de MP).");
        }
    } catch (Exception $e) { // Captura excepciones de MP SDK y otras
        error_log("[gracias.php] ERROR al obtener/guardar detalles del pago (ID STR: $payment_id_mp_str): " . $e->getMessage() . " Trace: " . $e->getTraceAsString());
        // Es importante revisar este log si la inserción falla. Podría ser un problema de conexión con MP o un error en los datos.
    }
} elseif (isset($_SESSION['pago_guardado_detalle_' . $payment_id_mp_str])) {
     error_log("[gracias.php] Detalles del pago ID MP $payment_id_mp_str ya estaban guardados.");
}


// --- 6. OBTENER PRODUCTOS DEL PEDIDO PARA MOSTRAR RESUMEN ---
$pedido_productos = $_SESSION['ultimo_pedido'] ?? [];
$productos_info_map = [];
if (!empty($pedido_productos)) {
    $product_ids = array_keys($pedido_productos);
    if (!empty($product_ids)) {
        $placeholders = implode(',', array_fill(0, count($product_ids), '?'));
        try {
            $stmt_prods = $pdo->prepare("SELECT id, nombre, precio FROM productos WHERE id IN ($placeholders)");
            $stmt_prods->execute($product_ids);
            $productos_bd = $stmt_prods->fetchAll(PDO::FETCH_ASSOC);
            foreach ($productos_bd as $prod_db) {
                $productos_info_map[$prod_db['id']] = $prod_db;
            }
        } catch (PDOException $e) {
            error_log("[gracias.php] ERROR PDO al obtener información de productos para resumen: " . $e->getMessage());
        }
    }
} else {
    error_log("[gracias.php] ADVERTENCIA: _SESSION['ultimo_pedido'] está vacío. No se mostrará resumen detallado de productos.");
}

// --- 7. CARGAR DATOS DEL USUARIO ---
$usuario = null;
$perfil_completo = false;
if (isset($_SESSION['usuario_id'])) {
    try {
        $stmt_user = $pdo->prepare("SELECT nombre, apellidos, telefono, calle, colonia, ciudad, estado, codigo_postal, email FROM usuarios WHERE id = ?");
        $stmt_user->execute([$_SESSION['usuario_id']]);
        $usuario = $stmt_user->fetch(PDO::FETCH_ASSOC);

        if ($usuario) {
            // Verifica que los campos no sean null Y no sean string vacíos
            $perfil_completo = !in_array(null, [
                $usuario['nombre'], $usuario['apellidos'], $usuario['telefono'],
                $usuario['calle'], $usuario['colonia'], $usuario['ciudad'],
                $usuario['estado'], $usuario['codigo_postal']
            ], true) && !in_array('', [
                $usuario['nombre'], $usuario['apellidos'], $usuario['telefono'],
                $usuario['calle'], $usuario['colonia'], $usuario['ciudad'],
                $usuario['estado'], $usuario['codigo_postal']
            ], true);
        }
    } catch (PDOException $e) {
        error_log("[gracias.php] ERROR PDO al obtener datos del usuario: " . $e->getMessage());
    }
}

// --- 8. LÓGICA DE ACTUALIZACIÓN DE STOCK (CONDICIONAL FALLBACK) ---
// Esta lógica solo se ejecuta si mp_success.php no marcó el stock como actualizado.
if (!empty($pedido_productos) && !isset($_SESSION['stock_actualizado'])) {
    error_log("[gracias.php] ADVERTENCIA: El stock no fue marcado como actualizado por mp_success.php. Intentando actualizar ahora (FALLBACK)...");
    $pdo->beginTransaction();
    try {
        foreach ($pedido_productos as $id_prod => $cantidad) {
            $cantidad_int = (int)$cantidad;
            $id_prod_int = (int)$id_prod;
            if ($cantidad_int <= 0) continue;

            error_log("[gracias.php FALLBACK STOCK] Procesando stock para Producto ID: $id_prod_int, Cantidad: $cantidad_int");
            $stmt_stock_gracias = $pdo->prepare("UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?");
            $stmt_stock_gracias->execute([$cantidad_int, $id_prod_int, $cantidad_int]);
            $rowCount_fallback = $stmt_stock_gracias->rowCount();
            error_log("[gracias.php FALLBACK STOCK] Filas afectadas para producto ID $id_prod_int: $rowCount_fallback");

            if ($rowCount_fallback <= 0) {
                 throw new Exception("Stock insuficiente o producto no encontrado para ID: $id_prod_int (gracias.php FALLBACK)");
            }
        }
        $pdo->commit();
        $_SESSION['stock_actualizado'] = true; // Marcar como actualizado por este fallback
        error_log("[gracias.php FALLBACK STOCK] Stock actualizado desde gracias.php.");
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("[gracias.php FALLBACK STOCK] ERROR CRÍTICO al actualizar stock: " . $e->getMessage());
    }
}

// --- 9. PREPARACIÓN DEL MENSAJE Y ENLACE DE WHATSAPP ---
$enlace_whatsapp_final = '';
if (!empty($pedido_productos) && $usuario && $perfil_completo && !empty($whatsapp_base_url_para_resumen)) {
    $mensaje_whatsapp_texto = "Hola, he realizado una compra en RINESSPORT. Aquí están los detalles de mi pedido:\n\n";
    $total_calculado_resumen = 0;

    foreach ($pedido_productos as $id => $cantidad) {
        $nombre_prod = $productos_info_map[$id]['nombre'] ?? 'Producto desconocido';
        $precio_prod = (float)($productos_info_map[$id]['precio'] ?? 0);
        $subtotal_prod = $precio_prod * (int)$cantidad;
        $total_calculado_resumen += $subtotal_prod;

        $mensaje_whatsapp_texto .= "🛞 " . htmlspecialchars($nombre_prod) . "\n";
        $mensaje_whatsapp_texto .= "Cantidad: " . (int)$cantidad . "\n";
        $mensaje_whatsapp_texto .= "Subtotal: $" . number_format($subtotal_prod, 2) . "\n\n";
    }

    $mensaje_whatsapp_texto .= "🧾 Total del Pedido: $" . number_format($total_calculado_resumen, 2) . "\n\n";
    $mensaje_whatsapp_texto .= "📦 Datos del Cliente:\n";
    $mensaje_whatsapp_texto .= "Nombre: " . htmlspecialchars($usuario['nombre'] . ' ' . $usuario['apellidos']) . "\n";
    $mensaje_whatsapp_texto .= "Teléfono: " . htmlspecialchars($usuario['telefono']) . "\n";
    $mensaje_whatsapp_texto .= "Dirección: " . htmlspecialchars($usuario['calle'] . ", " . $usuario['colonia'] . ", " . $usuario['ciudad'] . ", " . $usuario['estado'] . ", CP " . $usuario['codigo_postal']) . "\n";
    if ($id_pedido_interno) {
        $mensaje_whatsapp_texto .= "ID Pedido: #" . htmlspecialchars((string)$id_pedido_interno) . "\n";
    }

    $mensaje_whatsapp_url_encoded = rawurlencode($mensaje_whatsapp_texto);

    if (strpos($whatsapp_base_url_para_resumen, '?') === false) {
        $enlace_whatsapp_final = $whatsapp_base_url_para_resumen . "?text=" . $mensaje_whatsapp_url_encoded;
    } else {
        $enlace_whatsapp_final = rtrim($whatsapp_base_url_para_resumen, '&') . "&text=" . $mensaje_whatsapp_url_encoded;
    }
    error_log("[gracias.php] Enlace de WhatsApp generado: " . $enlace_whatsapp_final);

} elseif (empty($whatsapp_base_url_para_resumen)) {
    error_log("[gracias.php] No se pudo generar enlace de WhatsApp porque la URL base de WhatsApp está vacía.");
}

?>
<main class="min-h-screen flex flex-col items-center bg-gray-100 p-4 text-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md mb-6">
        <div class="flex justify-center mb-4">
            <svg class="w-16 h-16 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">¡Gracias por tu compra!</h1>
        <?php if ($payment_id_mp_str): ?>
            <p class="text-sm text-gray-500">ID de Pago MP: <?= htmlspecialchars($payment_id_mp_str); ?></p>
        <?php endif; ?>
        <?php if ($id_pedido_interno): ?>
            <p class="text-sm text-gray-500">ID de Pedido: #<?= htmlspecialchars((string)$id_pedido_interno); ?></p>
        <?php endif; ?>
        <p class="text-gray-600 mt-3">Tu pago fue procesado exitosamente. Estamos preparando tu pedido.</p>

        <a href="index.php"
           class="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition duration-150 ease-in-out">
            Seguir comprando
        </a>
    </div>

    <?php if (!empty($pedido_productos)): ?>
    <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Resumen de tu pedido:</h2>
        <ul class="text-left text-gray-700 space-y-3">
            <?php
            $total_pedido_display = 0;
            foreach ($pedido_productos as $id => $cantidad):
                $nombre = $productos_info_map[$id]['nombre'] ?? 'Producto desconocido';
                $precio = (float)($productos_info_map[$id]['precio'] ?? 0);
                $subtotal = $precio * (int)$cantidad;
                $total_pedido_display += $subtotal;
            ?>
            <li>
                <strong class="text-gray-800"><?= htmlspecialchars($nombre) ?></strong><br>
                Cantidad: <?= (int)$cantidad ?> &nbsp; | &nbsp; Precio: $<?= number_format($precio, 2) ?><br>
                <span class="text-sm text-gray-500">Subtotal: $<?= number_format($subtotal, 2) ?></span>
            </li>
            <?php endforeach; ?>
            <li class="font-semibold text-gray-800 mt-4 pt-3 border-t border-gray-200">
                Total del Pedido: $<?= number_format($total_pedido_display, 2) ?>
            </li>
        </ul>
    </div>
    <?php endif; ?>

    <?php if (!empty($pedido_productos) && $usuario && $perfil_completo): ?>
        <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-md mt-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">¿Deseas recibir tu pedido por WhatsApp?</h2>
            <?php if (!empty($enlace_whatsapp_final)): ?>
                <a href="<?= htmlspecialchars($enlace_whatsapp_final) ?>" target="_blank"
                   class="inline-block mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-lg transition duration-150 ease-in-out">
                    <i class="fab fa-whatsapp mr-2"></i>Enviar resumen por WhatsApp
                </a>
            <?php else: ?>
                <p class="text-sm text-red-500 mt-2">No se pudo generar el enlace de WhatsApp en este momento. Por favor, contacta a soporte si necesitas ayuda.</p>
                 <?php if (empty($whatsapp_base_url_para_resumen)): ?>
                    <p class="text-xs text-gray-400 mt-1">Causa: URL de WhatsApp no configurada.</p>
                 <?php endif; ?>
            <?php endif; ?>
        </div>
    <?php elseif (!empty($pedido_productos) && $usuario && !$perfil_completo): ?>
        <div class="mt-6 max-w-md w-full text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 p-4 rounded-lg shadow">
            <p class="font-semibold">⚠️ Tu perfil está incompleto.</p>
            <p class="mt-1"> <a href="perfil_usuario.php" class="underline hover:text-yellow-800 font-medium">Completa tu información de envío</a> para poder generar el mensaje de WhatsApp con todos tus datos.</p>
        </div>
    <?php elseif (!empty($pedido_productos) && !$usuario): ?>
         <div class="mt-6 max-w-md w-full text-sm text-blue-700 bg-blue-100 border border-blue-300 p-4 rounded-lg shadow">
            <p class="font-semibold">Inicia sesión o regístrate</p>
            <p class="mt-1"> <a href="login.php" class="underline hover:text-blue-800 font-medium">Inicia sesión</a> para acceder a más opciones como el envío del resumen de tu pedido por WhatsApp.</p>
        </div>
    <?php endif; ?>
</main>

<?php require_once __DIR__ . '/footer.php'; // Pie de página HTML ?>
