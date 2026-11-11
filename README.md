# Desafío Halloween - Votación de disfraces

Aplicación web con arquitectura API REST para registrar usuarios y votar disfraces de Halloween.
Backend en PHP (PDO) con MySQL; frontend en HTML, CSS y JavaScript vanilla (fetch).

## Requisitos
- XAMPP con Apache y MySQL

## Instalación
1. Copiar la carpeta `halloween` dentro de `C:\xampp\htdocs\`.
2. Iniciar **Apache** y **MySQL** desde el panel de XAMPP.
3. Abrir `http://localhost/phpmyadmin`, ir a **Importar** y cargar `db/halloween.sql` (crea la base `halloween`, las tablas y 4 disfraces de ejemplo).
4. Abrir `http://localhost/halloween/`.

Los datos de conexión están en `api/conexion.php` (usuario `root`, sin contraseña, valores por defecto de XAMPP).

## Crear el usuario administrador
El rol de administrador no se puede elegir desde el registro (por seguridad):
1. Registrar un usuario desde `registro.html` (por ejemplo `admin`).
2. En phpMyAdmin, ejecutar:
   ```sql
   UPDATE usuarios SET es_admin = 1 WHERE nombre = 'admin';
   ```
3. Cerrar sesión y volver a iniciarla. Aparece el enlace **Administración**.

## Endpoints de la API
| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| GET | `api/disfraces.php` | Lista los disfraces activos | Público |
| POST | `api/registro.php` | Registra un usuario (hash bcrypt) | Público |
| POST | `api/login.php` | Inicia sesión | Público |
| GET | `api/sesion.php` | Devuelve el usuario de la sesión | Sesión (401 si no hay) |
| POST | `api/logout.php` | Cierra la sesión | Público |
| POST | `api/votar.php` | Vota un disfraz (sin duplicados) | Sesión (401) |
| POST / PUT / DELETE | `api/admin_disfraces.php` | Alta, modificación y baja lógica | Admin (401 / 403) |
| POST | `api/subir_foto.php` | Sube la foto de un disfraz | Admin (401 / 403) |

## Seguridad aplicada
- Contraseñas hasheadas con `password_hash` (bcrypt) y validadas con `password_verify`.
- Consultas con PDO y prepared statements (previene inyección SQL).
- `session_regenerate_id(true)` al iniciar sesión.
- Votos duplicados bloqueados por la base de datos (`UNIQUE` en `votos`) y manejados con transacción.
- Rutas de administración protegidas en el servidor (401 sin sesión, 403 sin rol admin).
- Subida de fotos: validación del tipo real con `finfo`, límite de 2 MB y nombre generado por el servidor.
- Datos mostrados en pantalla con `textContent` (previene XSS).
- Baja lógica de disfraces (`eliminado = 1`) para conservar el historial de votos.

## Reglas de votación
Cada usuario registrado puede votar una vez por cada disfraz.