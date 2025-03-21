# # proxy_server.py
# # Estas son las únicas importaciones que necesitas para http.server
# from http.server import HTTPServer, BaseHTTPRequestHandler
# import urllib.request
# import urllib.error
# import sys
# import socket
# import datetime
# import threading
# import webbrowser
# import json
# import os
# from urllib.parse import urlparse, parse_qs

# # Configuración
# FRONTEND_URL = "http://localhost:5173"
# BACKEND_URL = "http://localhost:3000"
# PORT = 8000
# ACCESS_LOG_FILE = "access_log.json"

# # Diccionario para almacenar estadísticas de acceso
# access_stats = {
#     "total_requests": 0,
#     "visitors": {},
#     "started_at": datetime.datetime.now().isoformat(),
#     "last_access": None
# }

# # Cargar logs anteriores si existen
# if os.path.exists(ACCESS_LOG_FILE):
#     try:
#         with open(ACCESS_LOG_FILE, 'r') as f:
#             access_stats = json.load(f)
#     except:
#         pass

# def get_public_ip():
#     """Obtiene la IP pública del servidor"""
#     try:
#         external_ip = urllib.request.urlopen('https://api.ipify.org').read().decode('utf8')
#         return external_ip
#     except:
#         return "No se pudo detectar IP pública"

# def save_access_log():
#     """Guarda el registro de accesos en un archivo JSON"""
#     with open(ACCESS_LOG_FILE, 'w') as f:
#         json.dump(access_stats, f, indent=2)

# class ProxyHTTPRequestHandler(BaseHTTPRequestHandler):
#     # resto del código igual
#     def log_request(self, code='-', size='-'):
#         # Sobrescribe el método para evitar logs por defecto
#         pass
    
#     def do_GET(self):
#         # Ruta especial para el dashboard de estadísticas
#         if self.path == '/proxy-status':
#             self.send_response(200)
#             self.send_header('Content-type', 'text/html')
#             self.end_headers()
            
#             html = f"""
#             <!DOCTYPE html>
#             <html>
#             <head>
#                 <title>Proxy Status - Tienda Rines</title>
#                 <meta charset="utf-8">
#                 <meta name="viewport" content="width=device-width, initial-scale=1">
#                 <style>
#                     body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }}
#                     .container {{ max-width: 1000px; margin: 0 auto; }}
#                     .card {{ background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
#                     table {{ width: 100%; border-collapse: collapse; }}
#                     th, td {{ text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }}
#                     th {{ background-color: #f2f2f2; }}
#                     tr:hover {{ background-color: #f5f5f5; }}
#                     .stat-value {{ font-size: 24px; font-weight: bold; }}
#                     .stat-label {{ color: #666; }}
#                     .refresh {{ margin-top: 20px; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }}
#                 </style>
#             </head>
#             <body>
#                 <div class="container">
#                     <h1>Proxy Status - Tienda Rines</h1>
                    
#                     <div class="card">
#                         <h2>Información de conexión</h2>
#                         <p><strong>URL de acceso:</strong> <a href="http://{get_public_ip()}:{PORT}" target="_blank">http://{get_public_ip()}:{PORT}</a></p>
#                         <p><strong>Servidor iniciado:</strong> {access_stats["started_at"]}</p>
#                         <p><strong>Último acceso:</strong> {access_stats["last_access"] or "Ninguno"}</p>
#                     </div>
                    
#                     <div class="card">
#                         <h2>Estadísticas</h2>
#                         <div style="display: flex; flex-wrap: wrap; gap: 20px;">
#                             <div style="flex: 1;">
#                                 <div class="stat-value">{access_stats["total_requests"]}</div>
#                                 <div class="stat-label">Peticiones totales</div>
#                             </div>
#                             <div style="flex: 1;">
#                                 <div class="stat-value">{len(access_stats["visitors"])}</div>
#                                 <div class="stat-label">Visitantes únicos</div>
#                             </div>
#                         </div>
#                     </div>
                    
#                     <div class="card">
#                         <h2>Visitantes recientes</h2>
#                         <table>
#                             <tr>
#                                 <th>IP</th>
#                                 <th>Solicitudes</th>
#                                 <th>Primer acceso</th>
#                                 <th>Último acceso</th>
#                             </tr>
#                             {"".join([f"<tr><td>{ip}</td><td>{data['count']}</td><td>{data['first_access']}</td><td>{data['last_access']}</td></tr>" 
#                                      for ip, data in list(access_stats["visitors"].items())[-10:]])}
#                         </table>
#                     </div>
                    
#                     <button class="refresh" onclick="location.reload()">Actualizar datos</button>
#                 </div>
#             </body>
#             </html>
#             """
            
#             self.wfile.write(html.encode())
#             return
            
#         self._handle_request('GET')
        
#     def do_POST(self):
#         self._handle_request('POST')
        
#     def do_PUT(self):
#         self._handle_request('PUT')
        
#     def do_DELETE(self):
#         self._handle_request('DELETE')
        
#     def do_OPTIONS(self):
#         self._handle_request('OPTIONS')
        
#     def do_PATCH(self):
#         self._handle_request('PATCH')
    
#     def _handle_request(self, method):
#         try:
#             # Registrar información de acceso
#             client_ip = self.client_address[0]
#             now = datetime.datetime.now().isoformat()
            
#             # Actualizar estadísticas
#             access_stats["total_requests"] += 1
#             access_stats["last_access"] = now
            
#             if client_ip not in access_stats["visitors"]:
#                 access_stats["visitors"][client_ip] = {
#                     "count": 0,
#                     "first_access": now,
#                     "last_access": now,
#                     "paths": []
#                 }
            
#             access_stats["visitors"][client_ip]["count"] += 1
#             access_stats["visitors"][client_ip]["last_access"] = now
            
#             # Añadir información de la ruta (limitado a las últimas 10)
#             request_path = self.path
#             visitor_paths = access_stats["visitors"][client_ip]["paths"]
#             visitor_paths.append({"path": request_path, "time": now, "method": method})
#             access_stats["visitors"][client_ip]["paths"] = visitor_paths[-10:]
            
#             # Guardar el log de acceso
#             threading.Thread(target=save_access_log).start()
            
#             # Log en consola
#             print(f"[{now}] {client_ip} - {method} {self.path}")
            
#             # Determinar si la solicitud es para el backend o frontend
#             if self.path.startswith('/api/'):
#                 target_url = BACKEND_URL + self.path
#             else:
#                 target_url = FRONTEND_URL + self.path
            
#             # Obtener headers y cuerpo de la petición
#             headers = {key: val for key, val in self.headers.items()}
#             content_length = int(self.headers.get('Content-Length', 0))
#             body = self.rfile.read(content_length) if content_length > 0 else None
            
#             # Crear petición
#             req = urllib.request.Request(
#                 target_url, 
#                 data=body,
#                 headers=headers,
#                 method=method
#             )
            
#             # Realizar petición
#             response = urllib.request.urlopen(req)
            
#             # Enviar respuesta al cliente
#             self.send_response(response.status)
            
#             # Añadir headers CORS
#             self.send_header('Access-Control-Allow-Origin', '*')
#             self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
#             self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            
#             # Copiar headers de respuesta
#             for header, value in response.getheaders():
#                 if header.lower() != 'transfer-encoding':
#                     self.send_header(header, value)
            
#             self.end_headers()
#             self.wfile.write(response.read())
            
#         except Exception as e:
#             error_msg = str(e)
#             print(f"Error: {error_msg}", file=sys.stderr)
#             self.send_response(500)
#             self.send_header('Content-type', 'text/plain')
#             self.end_headers()
#             self.wfile.write(f"Error: {error_msg}".encode())

# def open_browser():
#     """Abre el navegador para mostrar información del proxy"""
#     try:
#         webbrowser.open(f"http://localhost:{PORT}/proxy-status")
#     except:
#         pass

# def get_local_ip():
#     """Obtiene la IP local del servidor"""
#     s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
#     try:
#         # no importa a dónde conectarse, solo necesitamos crear el socket
#         s.connect(('10.255.255.255', 1))
#         local_ip = s.getsockname()[0]
#     except:
#         local_ip = '127.0.0.1'
#     finally:
#         s.close()
#     return local_ip

# # Reemplaza estas líneas al final del script
# if __name__ == "__main__":
#     # Mostrar información de conexión
#     public_ip = get_public_ip()
#     local_ip = get_local_ip()
    
#     print("\n" + "="*70)
#     print(f"🚀 Servidor proxy de Tienda Rines iniciado en puerto {PORT}")
#     print("="*70)
#     print(f"📡 Rutas configuradas:")
#     print(f"   Frontend: {FRONTEND_URL}")
#     print(f"   Backend:  {BACKEND_URL}")
#     print("\n📊 Acceso al panel de estado:")
#     print(f"   Local:    http://localhost:{PORT}/proxy-status")
#     print(f"   Red:      http://{local_ip}:{PORT}/proxy-status")
#     print("\n🌐 URLs de acceso:")
#     print(f"   Dentro de tu red:  http://{local_ip}:{PORT}")
#     print(f"   Desde Internet:    http://{public_ip}:{PORT}")
#     print(f"   (Requiere que el puerto {PORT} esté abierto en tu router)")
#     print("="*70 + "\n")

#     # Abrir automáticamente el panel de estado
#     threading.Thread(target=open_browser).start()
    
#     # Iniciar servidor - LÍNEA CORREGIDA

#     try:
#         HTTPServer(('0.0.0.0', PORT), ProxyHTTPRequestHandler).serve_forever()
#     except KeyboardInterrupt:
#         print("\n🛑 Servidor detenido por el usuario")
#     except Exception as e:
#         print(f"\n❌ Error al iniciar el servidor: {e}")

# proxy_server.py
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import urllib.error
import sys
import socket
import datetime
import threading
import webbrowser
import json
import os
from urllib.parse import urlparse, parse_qs
from collections import defaultdict

# Configuración
FRONTEND_URL = "http://localhost:5173"
BACKEND_URL = "http://localhost:3000"
PORT = 8000
ACCESS_LOG_FILE = "access_log.json"
MAX_LOG_ENTRIES = 1000

# Funciones de verificación de conectividad
def check_url_connectivity(url, timeout=2):
    """Verifica si una URL es accesible"""
    try:
        urllib.request.urlopen(url, timeout=timeout)
        return True
    except:
        return False

def check_port_open(ip, port, timeout=2):
    """Verifica si un puerto está abierto"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(timeout)
            s.connect((ip, port))
            return True
    except:
        return False

class AccessStats:
    def __init__(self):
        self.data = {
            "total_requests": 0,
            "visitors": defaultdict(lambda: {
                "count": 0,
                "first_access": None,
                "last_access": None,
                "paths": [],
                "user_agent": None
            }),
            "started_at": datetime.datetime.now().isoformat(),
            "hourly_requests": defaultdict(int),
            "methods": defaultdict(int),
            "status_codes": defaultdict(int),
            "endpoints": defaultdict(int),
            "current_connections": 0,
            "max_concurrent": 0
        }
        self.lock = threading.Lock()
        
    def load(self):
        if os.path.exists(ACCESS_LOG_FILE):
            try:
                with open(ACCESS_LOG_FILE, 'r') as f:
                    loaded = json.load(f)
                    with self.lock:
                        for key in loaded:
                            if key in ['hourly_requests', 'methods', 'status_codes', 'endpoints']:
                                self.data[key] = defaultdict(int, loaded[key])
                            elif key == 'visitors':
                                visitors = defaultdict(lambda: {
                                    "count": 0,
                                    "first_access": None,
                                    "last_access": None,
                                    "paths": [],
                                    "user_agent": None
                                })
                                for ip, data in loaded[key].items():
                                    validated_paths = []
                                    for path_entry in data.get('paths', []):
                                        validated_paths.append({
                                            "time": path_entry.get('time', 'N/A'),
                                            "path": path_entry.get('path', 'N/A'),
                                            "method": path_entry.get('method', 'N/A'),
                                            "status": path_entry.get('status', 'N/A')
                                        })
                                    visitors[ip] = {
                                        "count": data.get('count', 0),
                                        "first_access": data.get('first_access'),
                                        "last_access": data.get('last_access'),
                                        "paths": validated_paths[-10:],
                                        "user_agent": data.get('user_agent')
                                    }
                                self.data[key] = visitors
                            else:
                                self.data[key] = loaded[key]
            except Exception as e:
                print(f"Error loading log: {e}")

    def save(self):
        with self.lock:
            data_to_save = {}
            for key, value in self.data.items():
                if isinstance(value, defaultdict):
                    data_to_save[key] = dict(value)
                else:
                    data_to_save[key] = value
            with open(ACCESS_LOG_FILE, 'w') as f:
                json.dump(data_to_save, f, indent=2, default=str)

access_stats = AccessStats()
access_stats.load()

def get_public_ip():
    try:
        return urllib.request.urlopen('https://api.ipify.org').read().decode('utf8')
    except:
        return "N/A"

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        local_ip = s.getsockname()[0]
    except:
        local_ip = '127.0.0.1'
    finally:
        s.close()
    return local_ip

class ProxyHTTPRequestHandler(BaseHTTPRequestHandler):
    def log_request(self, code='-', size='-'):
        pass
    
    def _update_stats(self, client_ip, method, path, status_code, user_agent):
        now = datetime.datetime.now()
        hour_key = now.strftime("%Y-%m-%d %H:00")
        
        with access_stats.lock:
            stats = access_stats.data
            
            stats['current_connections'] += 1
            stats['max_concurrent'] = max(stats['max_concurrent'], stats['current_connections'])
            stats['total_requests'] += 1
            stats['methods'][method] += 1
            stats['status_codes'][status_code] += 1
            stats['hourly_requests'][hour_key] += 1
            stats['endpoints'][path] += 1
            
            visitor = stats['visitors'][client_ip]
            visitor['count'] += 1
            visitor['user_agent'] = user_agent
            if not visitor['first_access']:
                visitor['first_access'] = now.isoformat()
            visitor['last_access'] = now.isoformat()
            
            if len(visitor['paths']) >= 10:
                visitor['paths'].pop(0)
            visitor['paths'].append({
                "time": now.isoformat(),
                "path": path,
                "method": method,
                "status": status_code
            })
    
    def _generate_dashboard(self):
        stats = access_stats.data
        public_ip = get_public_ip()
        local_ip = get_local_ip()
        
        all_hours = sorted(stats['hourly_requests'].keys())
        hours = all_hours[-24:] if len(all_hours) > 24 else all_hours
        hourly_data = [stats['hourly_requests'][h] for h in hours]
        
        methods_data = {
            "labels": list(stats['methods'].keys()),
            "counts": list(stats['methods'].values())
        }
        
        html = f"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Proxy Status - Tienda Rines</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                .card {{ margin-bottom: 1.5rem; }}
                .chart-container {{ height: 300px; }}
                .table-hover tbody tr {{ cursor: pointer; }}
                .badge {{ font-size: 0.9em; }}
            </style>
        </head>
        <body class="bg-light">
            <div class="container py-4">
                <h1 class="mb-4 text-primary">🚀 Panel de Control del Proxy</h1>
                
                <div class="row row-cols-1 row-cols-md-4 g-4 mb-4">
                    <div class="col">
                        <div class="card h-100 shadow">
                            <div class="card-body">
                                <h5 class="card-title">Solicitudes Totales</h5>
                                <p class="display-4 text-primary">{stats['total_requests']}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card h-100 shadow">
                            <div class="card-body">
                                <h5 class="card-title">Visitantes Únicos</h5>
                                <p class="display-4 text-info">{len(stats['visitors'])}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card h-100 shadow">
                            <div class="card-body">
                                <h5 class="card-title">Conexión Máxima</h5>
                                <p class="display-4 text-warning">{stats['max_concurrent']}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card h-100 shadow">
                            <div class="card-body">
                                <h5 class="card-title">Estado</h5>
                                <span class="badge bg-success">Activo</span>
                                <p class="text-muted mt-2">Uptime: {self._calculate_uptime()}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="card shadow">
                            <div class="card-body">
                                <h5 class="card-title">Solicitudes por Hora</h5>
                                <div class="chart-container">
                                    <canvas id="hourlyChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card shadow">
                            <div class="card-body">
                                <h5 class="card-title">Métodos HTTP</h5>
                                <div class="chart-container">
                                    <canvas id="methodsChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card shadow">
                    <div class="card-body">
                        <h5 class="card-title mb-3">Últimas Solicitudes</h5>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Hora</th>
                                        <th>Método</th>
                                        <th>Ruta</th>
                                        <th>Estado</th>
                                        <th>IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {self._generate_recent_requests()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                // Gráfico de solicitudes por hora
                new Chart(document.getElementById('hourlyChart'), {{
                    type: 'line',
                    data: {{
                        labels: {json.dumps(hours)},
                        datasets: [{{
                            label: 'Solicitudes por Hora',
                            data: {json.dumps(hourly_data)},
                            borderColor: '#3e95cd',
                            fill: false
                        }}]
                    }}
                }});
                
                // Gráfico de métodos HTTP
                new Chart(document.getElementById('methodsChart'), {{
                    type: 'doughnut',
                    data: {{
                        labels: {json.dumps(methods_data['labels'])},
                        datasets: [{{
                            data: {json.dumps(methods_data['counts'])},
                            backgroundColor: ['#3e95cd','#8e5ea2','#3cba9f','#e8c3b9','#c45850']
                        }}]
                    }}
                }});
            </script>
        </body>
        </html>
        """
        return html
    
    def _calculate_uptime(self):
        started = datetime.datetime.fromisoformat(access_stats.data['started_at'])
        delta = datetime.datetime.now() - started
        days = delta.days
        hours, remainder = divmod(delta.seconds, 3600)
        minutes = remainder // 60
        return f"{days}d {hours}h {minutes}m"
    
    def _generate_recent_requests(self):
        requests = []
        for ip, data in list(access_stats.data['visitors'].items())[-10:]:
            for req in data.get('paths', [])[-3:]:
                requests.append({
                    'time': req.get('time', 'N/A'),
                    'method': req.get('method', 'N/A'),
                    'path': req.get('path', 'N/A'),
                    'status': req.get('status', 'N/A'),
                    'ip': ip
                })
        requests.sort(key=lambda x: x.get('time', ''), reverse=True)
        
        rows = []
        for req in requests[:15]:
            status = str(req.get('status', 'N/A'))
            time = req.get('time', '')
            rows.append(f"""
                <tr>
                    <td>{time[11:19] if len(time) > 10 else 'N/A'}</td>
                    <td><span class="badge bg-primary">{req['method']}</span></td>
                    <td><code>{req['path'][:50]}</code></td>
                    <td><span class="badge bg-{'success' if status == '200' else 'danger'}">{status}</span></td>
                    <td>{req['ip']}</td>
                </tr>
            """)
        return '\n'.join(rows)
    
    def do_GET(self):
        if self.path == '/proxy-status':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(self._generate_dashboard().encode())
            return
            
        self._handle_request('GET')
    
    def _handle_request(self, method):
        client_ip = self.client_address[0]
        user_agent = self.headers.get('User-Agent', 'Desconocido')
        start_time = datetime.datetime.now()
        status = 500
        
        try:
            if self.path.startswith('/api/') or self.path == '/favicon.ico':
                target_url = BACKEND_URL + self.path
            else:
                target_url = FRONTEND_URL + self.path
            
            req = urllib.request.Request(
                target_url,
                data=self._get_request_body(),
                headers=self._clean_headers(),
                method=method
            )
            
            with urllib.request.urlopen(req) as response:
                content = response.read()
                status = response.status
                
                self._update_stats(
                    client_ip=client_ip,
                    method=method,
                    path=self.path,
                    status_code=status,
                    user_agent=user_agent
                )
                
                self.send_response(status)
                self._set_cors_headers()
                for header, value in response.getheaders():
                    if header.lower() not in ('transfer-encoding', 'content-encoding'):
                        self.send_header(header, value)
                self.end_headers()
                self.wfile.write(content)
                
        except urllib.error.HTTPError as e:
            status = e.code
            self.send_error(e.code, explain=e.reason)
        except Exception as e:
            status = 500
            self.send_error(500, explain=str(e))
        finally:
            with access_stats.lock:
                access_stats.data['current_connections'] -= 1
            duration = (datetime.datetime.now() - start_time).total_seconds()
            print(f"[{status}] {method} {self.path} - {duration:.2f}s")
    
    def _get_request_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        return self.rfile.read(content_length) if content_length > 0 else None
    
    def _clean_headers(self):
        headers = dict(self.headers)
        headers.pop('Host', None)
        headers.pop('Accept-Encoding', None)
        return headers
    
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-store, max-age=0')

def open_browser():
    try:
        webbrowser.open(f"http://localhost:{PORT}/proxy-status")
    except:
        pass

def run_server():
    server_address = ('0.0.0.0', PORT)
    httpd = HTTPServer(server_address, ProxyHTTPRequestHandler)
    
    # Verificar conexiones
    frontend_status = "✅" if check_url_connectivity(FRONTEND_URL) else "❌"
    backend_status = "✅" if check_url_connectivity(BACKEND_URL) else "❌"
    local_ip = get_local_ip()
    public_ip = get_public_ip()
    local_port_status = "✅" if check_port_open(local_ip, PORT) else "❌"
    public_port_status = "✅" if check_port_open(public_ip, PORT) else "❌ (Verifica firewall/NAT)"
    
    print("\n" + "="*70)
    print(f"🚀 Servidor proxy de Tienda Rines iniciado en puerto {PORT}")
    print("="*70)
    print(f"📡 Servicios configurados:")
    print(f"   Frontend ({FRONTEND_URL}): {frontend_status}")
    print(f"   Backend ({BACKEND_URL}): {backend_status}")
    print(f"\n🔌 Estado de conexiones:")
    print(f"   Local:    http://{local_ip}:{PORT} {local_port_status}")
    print(f"   Internet: http://{public_ip}:{PORT} {public_port_status}")
    print(f"\n📊 Panel de control:")
    print(f"   http://localhost:{PORT}/proxy-status")
    print("="*70)
    print("\n🔍 Interpretación:")
    print("   ✅ = Conexión exitosa")
    print("   ❌ = Problemas detectados")
    print("="*70 + "\n")
    
    try:
        threading.Thread(target=open_browser).start()
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido por el usuario")
        access_stats.save()
    except Exception as e:
        print(f"\n❌ Error crítico: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_server()