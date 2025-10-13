<div align="center">
  <img src="https://apromam.com/wp-content/uploads/2021/01/cropped-LOGO-APROMAM-H-1024x322.png" alt="APROMAM Logo" width="600"/>

  <h1>Sistema de Certificación Orgánica APROMAM</h1>

  <p>
    <strong>Sistema de gestión integral para certificación orgánica de productores agrícolas</strong>
  </p>

![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![PostGIS](https://img.shields.io/badge/PostGIS-3.4+-6DB33F?style=for-the-badge&logo=postgresql&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5.6-000000?style=for-the-badge&logo=fastify&logoColor=white)

</div>

---

## 📋 Tabla de Contenidos

- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Características Principales](#-características-principales)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
  - [1. Clonar el Repositorio](#1-clonar-el-repositorio)
  - [2. Configurar Base de Datos](#2-configurar-base-de-datos-postgresql--postgis)
  - [3. Configurar Backend](#3-configurar-el-backend)
  - [4. Configurar Frontend](#4-configurar-el-frontend)
  - [5. Iniciar el Proyecto](#5-iniciar-el-proyecto)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Sistema de Roles](#-sistema-de-roles)
- [Soporte](#-soporte)

---

## 🌾 Acerca del Proyecto

**APROMAM Sistema** es una plataforma integral diseñada para la **Asociación de Productores de Mani (APROMAM)** en Bolivia, que facilita la gestión y certificación orgánica de productores agrícolas. El sistema incorpora funcionalidades avanzadas de geolocalización GPS/PostGIS para el registro preciso de ubicaciones y búsqueda por proximidad.

### Objetivos

- Gestionar productores agrícolas y sus parcelas
- Realizar inspecciones y fichas de certificación
- Administrar técnicos y comunidades
- Geolocalizar productores y parcelas con precisión GPS
- Generar reportes de certificación orgánica
- Funcionar offline mediante Progressive Web App (PWA)

---

## ✨ Características Principales

<details>
<summary><strong>🗺️ Geolocalización GPS/PostGIS</strong></summary>

- Validación de coordenadas dentro de Bolivia
- Búsqueda de productores por proximidad geográfica
- Mapas interactivos con Leaflet/React-Leaflet
- Captura de ubicación desde dispositivos móviles y desktop
- Precisión mínima de 6 decimales (±0.1 metros)

</details>

<details>
<summary><strong>👥 Gestión de Usuarios y Roles</strong></summary>

- Sistema RBAC (Role-Based Access Control)
- 5 roles: Administrador, Gerente, Técnico, Invitado, Productor
- Permisos granulares por recurso
- Autenticación JWT con refresh tokens
- Sesiones seguras

</details>

<details>
<summary><strong>🌍 Administración Geográfica</strong></summary>

- Gestión de Provincias, Municipios y Comunidades
- Cascada de selección geográfica
- Asignación de técnicos por comunidad

</details>

<details>
<summary><strong>📊 Dashboard Dinámico</strong></summary>

- Vistas específicas por rol
- Estadísticas en tiempo real
- Acciones rápidas contextuales
- Responsive design

</details>

<details>
<summary><strong>📱 Progressive Web App (PWA)</strong></summary>

- Funcionalidad offline para trabajo en campo
- Sincronización automática al recuperar conexión
- Instalable en dispositivos móviles
- Optimizado para bajo ancho de banda

</details>

---

## 🛠️ Tecnologías

### Frontend

- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultrarrápido
- **React Router v7** - Enrutamiento
- **Zustand** - Gestión de estado global
- **React Hook Form + Zod** - Manejo y validación de formularios
- **TailwindCSS** - Estilos utility-first
- **Leaflet + React-Leaflet** - Mapas interactivos
- **Axios** - Cliente HTTP
- **Lucide React** - Iconografía

### Backend

- **Node.js 20+** - Runtime JavaScript
- **TypeScript** - Tipado estático
- **Fastify** - Framework web de alto rendimiento
- **PostgreSQL 16+** - Base de datos relacional
- **PostGIS 3.4+** - Extensión geoespacial
- **JWT** - Autenticación
- **Zod** - Validación de esquemas
- **Pino** - Logger de alto rendimiento

---

## 📦 Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:

| Herramienta    | Versión Mínima | Verificar Versión                   |
| -------------- | -------------- | ----------------------------------- |
| **Node.js**    | 20.x           | `node --version`                    |
| **npm**        | 10.x           | `npm --version`                     |
| **PostgreSQL** | 16.x           | `psql --version`                    |
| **PostGIS**    | 3.4.x          | `SELECT PostGIS_Version();` en psql |
| **Git**        | 2.x            | `git --version`                     |

<details>
<summary><strong>📥 ¿No tienes alguna herramienta instalada? Click aquí</strong></summary>

### Instalar Node.js

- **Windows/Mac**: Descarga desde [nodejs.org](https://nodejs.org/)
- **Linux (Ubuntu/Debian)**:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

### Instalar PostgreSQL con PostGIS

- **Windows**: Descarga desde [postgresql.org](https://www.postgresql.org/download/windows/) (incluye Stack Builder para PostGIS)
- **Mac** (con Homebrew):
  ```bash
  brew install postgresql postgis
  ```
- **Linux (Ubuntu/Debian)**:
  ```bash
  sudo apt update
  sudo apt install postgresql postgresql-contrib postgis
  ```

### Instalar Git

- **Windows**: Descarga desde [git-scm.com](https://git-scm.com/)
- **Mac**: `brew install git`
- **Linux**: `sudo apt install git`

</details>

---

## 🚀 Instalación

Sigue estos pasos cuidadosamente para configurar el proyecto en tu máquina local.

### 1. Clonar el Repositorio

```bash
git clone https://github.com/ImGrid/apromam-project.git
cd apromam-project
```

---

### 2. Configurar Base de Datos (PostgreSQL + PostGIS)

#### 2.1. Crear la Base de Datos

```bash
# Conectar a PostgreSQL como superusuario
psql -U postgres

# Crear base de datos
CREATE DATABASE apromam_db;

# Conectar a la base de datos
\c apromam_db

# Habilitar extensión PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

# Verificar que PostGIS está instalado
SELECT PostGIS_Version();

# Salir de psql
\q
```

#### 2.2. Importar el Schema

Si tienes un archivo SQL de schema (por ejemplo, `schema.sql`):

```bash
psql -U postgres -d apromam_db -f backend/database/schema.sql
```

<details>
<summary><strong>⚠️ Problemas comunes con PostgreSQL</strong></summary>

**Error: "psql: error: connection to server failed"**

- Verifica que PostgreSQL esté corriendo:

  ```bash
  # Windows
  net start postgresql-x64-16

  # Mac
  brew services start postgresql

  # Linux
  sudo systemctl start postgresql
  ```

**Error: "FATAL: role 'postgres' does not exist"**

- Crea el usuario postgres:
  ```bash
  createuser -s postgres
  ```

**Error: "CREATE EXTENSION postgis" falla**

- Instala PostGIS para tu versión de PostgreSQL
- Verifica la instalación: `apt list --installed | grep postgis`

</details>

---

### 3. Configurar el Backend

#### 3.1. Instalar Dependencias

```bash
cd backend
npm install
```

#### 3.2. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/`:

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# === SERVIDOR ===
PORT=3000
NODE_ENV=development

# === BASE DE DATOS ===
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apromam_db
DB_USER=postgres
DB_PASSWORD=tu_password_postgresql

# === JWT ===
JWT_SECRET=tu_clave_secreta_super_segura_cambiala_en_produccion
JWT_REFRESH_SECRET=otra_clave_secreta_diferente_para_refresh
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# === CORS ===
CORS_ORIGIN=http://localhost:5173

# === ARCHIVOS ===
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# === LOGS ===
LOG_LEVEL=info
```

#### 3.3. Verificar Conexión a la Base de Datos

```bash
npm run dev
```

Si ves algo como `✓ Database connected successfully` y `Server listening on http://localhost:3000`, ¡todo está bien! 🎉

<details>
<summary><strong>🔧 Comandos útiles del Backend</strong></summary>

```bash
# Modo desarrollo con hot-reload
npm run dev

# Compilar TypeScript a JavaScript
npm run build

# Iniciar en producción (después de compilar)
npm start

# Ver logs en tiempo real
tail -f logs/app.log
```

</details>

---

### 4. Configurar el Frontend

#### 4.1. Instalar Dependencias

```bash
cd ../frontend
npm install
```

#### 4.2. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `frontend/`:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
# URL del backend API
VITE_API_BASE_URL=http://localhost:3000

# Mapas (OpenStreetMap)
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_MAP_ATTRIBUTION=© OpenStreetMap contributors

# Configuración de GPS
VITE_GPS_ACCURACY_THRESHOLD=50
VITE_GPS_TIMEOUT=10000

# Modo de desarrollo
VITE_ENABLE_DEVTOOLS=true
```

#### 4.3. Verificar que el Frontend Corre

```bash
npm run dev
```

Abre tu navegador en [http://localhost:5173](http://localhost:5173) y deberías ver la página de login.

<details>
<summary><strong>🎨 Comandos útiles del Frontend</strong></summary>

```bash
# Modo desarrollo con hot-reload
npm run dev

# Compilar para producción
npm run build

# Vista previa de la build de producción
npm run preview

# Linter (detectar problemas)
npm run lint

# Linter con auto-corrección
npm run lint:fix

# Formatear código con Prettier
npm run format

# Verificar formato sin modificar
npm run format:check
```

</details>

---

### 5. Iniciar el Proyecto

Una vez configurado todo, abre **dos terminales**:

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

✅ Espera a ver: `Server listening on http://localhost:3000`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

✅ Espera a ver: `Local: http://localhost:5173`

### 🎊 ¡Listo!

Ahora puedes acceder a:

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **API Docs (Swagger)**: [http://localhost:3000/documentation](http://localhost:3000/documentation)

---

## 📁 Estructura del Proyecto

```
apromam-sistema/
├── backend/               # API REST con Fastify
│   ├── src/
│   │   ├── controllers/  # Controladores HTTP
│   │   ├── routes/       # Definición de rutas
│   │   ├── services/     # Lógica de negocio
│   │   ├── repositories/ # Acceso a datos (DAL)
│   │   ├── entities/     # Modelos de dominio
│   │   ├── schemas/      # Validaciones Zod
│   │   ├── utils/        # Utilidades (postgis, etc.)
│   │   ├── config/       # Configuraciones
│   │   └── app.ts        # Punto de entrada
│   ├── database/         # Scripts SQL
│   ├── uploads/          # Archivos subidos
│   └── package.json
│
├── frontend/             # Aplicación React
│   ├── src/
│   │   ├── app/          # Configuración de la app
│   │   ├── features/     # Módulos por dominio
│   │   │   ├── auth/
│   │   │   ├── usuarios/
│   │   │   ├── productores/
│   │   │   ├── comunidades/
│   │   │   ├── geograficas/
│   │   │   ├── catalogos/
│   │   │   └── dashboard/
│   │   ├── shared/       # Código compartido
│   │   │   ├── components/  # Componentes reutilizables
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── services/    # Servicios API
│   │   │   ├── utils/       # Utilidades
│   │   │   └── config/      # Configs (permisos, rutas)
│   │   ├── pages/        # Páginas globales
│   │   └── main.tsx      # Punto de entrada
│   ├── public/           # Archivos estáticos
│   └── package.json
│
└── README.md             # Este archivo
```

---

## 🐛 Solución de Problemas

<details>
<summary><strong>El backend no inicia</strong></summary>

1. Verifica que PostgreSQL esté corriendo
2. Confirma las credenciales en `.env`
3. Verifica que la base de datos existe: `psql -U postgres -l`
4. Revisa los logs: `tail -f backend/logs/error.log`

</details>

<details>
<summary><strong>El frontend no se conecta al backend</strong></summary>

1. Verifica que el backend esté corriendo en `http://localhost:3000`
2. Confirma `VITE_API_BASE_URL` en `frontend/.env`
3. Revisa la consola del navegador (F12) para errores CORS
4. Asegúrate de que `CORS_ORIGIN` en backend incluya `http://localhost:5173`

</details>

<details>
<summary><strong>Los mapas no se muestran</strong></summary>

1. Verifica que `leaflet` y `react-leaflet` estén instalados
2. Confirma que el CSS de Leaflet se importa en `main.tsx`:
   ```typescript
   import "leaflet/dist/leaflet.css";
   ```
3. Verifica que el fix de íconos esté aplicado (ver documentación de Leaflet + Vite)

</details>

<details>
<summary><strong>Error "Cannot find module"</strong></summary>

```bash
# Limpia node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

</details>
