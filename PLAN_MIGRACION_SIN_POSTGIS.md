# Plan de Migración: Remover PostGIS de APROMAM

**Objetivo**: Eliminar dependencia de PostGIS para deployment en hosting sin PostGIS
**Tiempo estimado**: 3-4 horas
**Riesgo**: Bajo (funcionalidades no usadas)

---

## Fase 1: Repositories (1.5 horas)

### 1.1 ProductorRepository.ts

**Ubicación**: `backend/src/repositories/ProductorRepository.ts`

#### Cambio 1: Eliminar función `findNearby()`

**Líneas**: 195-245

**ANTES:**
```typescript
async findNearby(latitude: number, longitude: number, radiusMeters: number = 1000): Promise<Productor[]> {
  // Usa ST_Distance, ST_DWithin, ST_SetSRID, ST_Point
}
```

**DESPUÉS:**
```typescript
// ELIMINADO - No se usa en UI
// Si se necesita en el futuro, implementar con geolib en JavaScript
```

**Acción**: Comentar o eliminar completamente la función (líneas 195-245)

---

#### Cambio 2: Eliminar uso de `coordenadas_domicilio` en CREATE

**Líneas**: 286-330

**ANTES:**
```typescript
const coordenadasWKT = productor.getCoordenadasWKT();

const query = {
  text: `
    INSERT INTO productores (
      ...
      coordenadas_domicilio,  ← Campo GEOGRAPHY
      latitud_domicilio,
      longitud_domicilio,
      ...
    ) VALUES (..., ST_GeomFromText($X, 4326), $Y, $Z, ...)  ← PostGIS
  `,
  values: [..., coordenadasWKT, insertData.latitud_domicilio, ...]
};
```

**DESPUÉS:**
```typescript
// YA NO necesitamos coordenadasWKT

const query = {
  text: `
    INSERT INTO productores (
      ...
      latitud_domicilio,       ← Solo DECIMAL
      longitud_domicilio,
      ...
    ) VALUES (..., $Y, $Z, ...)  ← Sin PostGIS
  `,
  values: [..., insertData.latitud_domicilio || null, insertData.longitud_domicilio || null, ...]
};
```

**Acción**:
1. Eliminar línea `const coordenadasWKT = productor.getCoordenadasWKT();`
2. Eliminar columna `coordenadas_domicilio` del INSERT
3. Eliminar `ST_GeomFromText($X, 4326)` del VALUES
4. Ajustar índices de parámetros ($1, $2, etc.)

---

#### Cambio 3: Eliminar uso de `coordenadas_domicilio` en UPDATE

**Líneas**: 370-420 (aproximadas)

**ANTES:**
```typescript
const coordenadasWKT = productor.getCoordenadasWKT();

UPDATE productores
SET coordenadas_domicilio = ST_GeomFromText($2, 4326),
    latitud_domicilio = $3,
    ...
```

**DESPUÉS:**
```typescript
UPDATE productores
SET latitud_domicilio = $2,
    longitud_domicilio = $3,
    ...
```

**Acción**:
1. Eliminar línea `const coordenadasWKT = ...`
2. Eliminar `coordenadas_domicilio = ST_GeomFromText(...)`
3. Ajustar índices de parámetros

---

### 1.2 ParcelaRepository.ts

**Ubicación**: `backend/src/repositories/ParcelaRepository.ts`

#### Cambio 1: Eliminar función `findNearby()`

**Líneas**: 103-149

**ANTES:**
```typescript
async findNearby(latitude: number, longitude: number, radiusMeters: number = 1000): Promise<Parcela[]> {
  // Usa ST_Distance, ST_DWithin
}
```

**DESPUÉS:**
```typescript
// ELIMINADO - No se usa en UI
```

**Acción**: Comentar o eliminar completamente (líneas 103-149)

---

#### Cambio 2: Eliminar uso de `coordenadas` en CREATE

**Líneas**: 194-224

**ANTES:**
```typescript
const coordenadasWKT = parcela.getCoordenadasWKT();

INSERT INTO parcelas (
  ...
  coordenadas,  ← GEOGRAPHY
  latitud_sud,
  longitud_oeste,
  ...
) VALUES (..., ST_GeomFromText($4, 4326), $5, $6, ...)
```

**DESPUÉS:**
```typescript
INSERT INTO parcelas (
  ...
  latitud_sud,
  longitud_oeste,
  ...
) VALUES (..., $4, $5, ...)
```

**Acción**:
1. Eliminar `const coordenadasWKT = ...`
2. Eliminar columna `coordenadas`
3. Eliminar `ST_GeomFromText($4, 4326)`
4. Ajustar índices de parámetros

---

#### Cambio 3: Eliminar uso de `coordenadas` en UPDATE

**Líneas**: 288-315

**ANTES:**
```typescript
const coordenadasWKT = parcela.getCoordenadasWKT();

UPDATE parcelas
SET coordenadas = ST_GeomFromText($2, 4326),
    latitud_sud = $3,
    ...
```

**DESPUÉS:**
```typescript
UPDATE parcelas
SET latitud_sud = $2,
    longitud_oeste = $3,
    ...
```

---

#### Cambio 4: Actualizar queries que chequean `coordenadas`

**Líneas**: 376-387, 391-420

**ANTES:**
```sql
WHERE coordenadas IS NOT NULL AND activo = true
```

**DESPUÉS:**
```sql
WHERE latitud_sud IS NOT NULL AND longitud_oeste IS NOT NULL AND activo = true
```

**Funciones afectadas:**
- `countWithCoordinates()` - línea 376
- `findWithoutCoordinates()` - línea 391
- `getEstadisticas()` - línea 423

---

### 1.3 FichaRepository.ts

**Ubicación**: `backend/src/repositories/FichaRepository.ts`

**Cambios**: Eliminar uso de `ST_SetSRID`, `ST_MakePoint` en actualizaciones de parcelas

#### Búsqueda de ocurrencias:

```bash
# Buscar todas las ocurrencias
grep -n "ST_SetSRID\|ST_MakePoint" backend/src/repositories/FichaRepository.ts
```

**Líneas afectadas** (aproximadas): 973, 1775

**ANTES:**
```sql
UPDATE parcelas
SET latitud_sud = COALESCE($6, latitud_sud),
    longitud_oeste = COALESCE($7, longitud_oeste),
    coordenadas = CASE
      WHEN $6 IS NOT NULL AND $7 IS NOT NULL
      THEN ST_SetSRID(ST_MakePoint($7, $6), 4326)
      ELSE coordenadas
    END
WHERE id_parcela = $1
```

**DESPUÉS:**
```sql
UPDATE parcelas
SET latitud_sud = COALESCE($6, latitud_sud),
    longitud_oeste = COALESCE($7, longitud_oeste)
WHERE id_parcela = $1
```

**Acción**: Eliminar el bloque `coordenadas = CASE ... END` completamente

---

## Fase 2: Entities (30 minutos)

### 2.1 Productor.ts

**Ubicación**: `backend/src/entities/Productor.ts`

#### Cambio 1: Eliminar método `getCoordenadasWKT()`

**Líneas**: 421-450 (aproximadas)

**ANTES:**
```typescript
getCoordenadasWKT(): string | null {
  if (!this.tieneCoordenadas()) {
    return null;
  }

  return createPointWKT(
    this.data.longitud_domicilio!,
    this.data.latitud_domicilio!
  );
}
```

**DESPUÉS:**
```typescript
// ELIMINADO - Ya no se usa sin PostGIS
```

**Acción**: Comentar o eliminar el método completo

---

### 2.2 Parcela.ts

**Ubicación**: `backend/src/entities/Parcela.ts`

#### Cambio 1: Eliminar método `getCoordenadasWKT()`

**Líneas**: 302-313 (aproximadas)

**ANTES:**
```typescript
getCoordenadasWKT(): string | null {
  if (!this.tieneCoordenadas()) {
    return null;
  }

  return createPointWKT(this.data.longitud_oeste!, this.data.latitud_sud!);
}
```

**DESPUÉS:**
```typescript
// ELIMINADO - Ya no se usa sin PostGIS
```

---

## Fase 3: Utilities (15 minutos)

### 3.1 postgis.utils.ts

**Ubicación**: `backend/src/utils/postgis.utils.ts`

#### Opción A: Eliminar `createPointWKT()` (Recomendado)

**Líneas**: Buscar función `createPointWKT`

**ANTES:**
```typescript
export function createPointWKT(longitude: number, latitude: number): string {
  return `POINT(${longitude} ${latitude})`;
}
```

**DESPUÉS:**
```typescript
// ELIMINADO - Ya no se usa sin PostGIS
```

---

#### Opción B: Mantener validaciones (las usamos)

**Funciones a MANTENER:**
- `validateBolivianCoordinates()` ✅
- `validateGPSPrecision()` ✅
- `type Coordinates` ✅

Estas NO dependen de PostGIS, son validaciones JavaScript puras.

---

### 3.2 connection.ts

**Ubicación**: `backend/src/config/connection.ts`

#### Cambio 1: Eliminar `calculateDistance()`

**Líneas**: 454-476 (aproximadas)

**ANTES:**
```typescript
static async calculateDistance(lat1, lng1, lat2, lng2): Promise<number> {
  // Usa ST_Distance_Sphere
}
```

**DESPUÉS:**
```typescript
// ELIMINADO - Ya no se usa
// Si se necesita, usar geolib en JavaScript
```

---

#### Cambio 2: Eliminar `findNearby()`

**Líneas**: 478-500 (aproximadas)

**ANTES:**
```typescript
static async findNearby(tableName, latitude, longitude, radiusMeters) {
  // Usa ST_Distance_Sphere, ST_DWithin
}
```

**DESPUÉS:**
```typescript
// ELIMINADO - Ya no se usa
```

---

## Fase 4: Routes (15 minutos)

### 4.1 productores.routes.ts

**Ubicación**: `backend/src/routes/productores.routes.ts`

#### Cambio 1: Comentar o eliminar ruta `/nearby`

**Líneas**: 131-150 (aproximadas)

**ANTES:**
```typescript
// POST /api/productores/nearby
fastify.post("/nearby", {
  schema: { ... },
  handler: async (request, reply) => {
    return productoresController.searchNearby(request, reply);
  }
});
```

**DESPUÉS - Opción A (Comentar):**
```typescript
// DESHABILITADO - PostGIS no disponible en hosting
// POST /api/productores/nearby
// fastify.post("/nearby", { ... });
```

**DESPUÉS - Opción B (Retornar 501):**
```typescript
// POST /api/productores/nearby
fastify.post("/nearby", {
  schema: { ... },
  handler: async (request, reply) => {
    return reply.code(501).send({
      error: "Not Implemented",
      message: "Búsqueda espacial no disponible (PostGIS no instalado)"
    });
  }
});
```

---

### 4.2 parcelas.routes.ts

**Ubicación**: `backend/src/routes/parcelas.routes.ts`

#### Cambio 1: Comentar o eliminar ruta `/parcelas/nearby`

**Líneas**: 215-235 (aproximadas)

**Acción**: Igual que `productores.routes.ts`

---

## Fase 5: Controllers (Opcional - 10 minutos)

### 5.1 productores.controller.ts

**Ubicación**: `backend/src/controllers/productores.controller.ts`

#### Opción A: Comentar función `searchNearby()`

**ANTES:**
```typescript
async searchNearby(request, reply) {
  // Llama a repository.findNearby()
}
```

**DESPUÉS:**
```typescript
// DESHABILITADO - PostGIS no disponible
// async searchNearby(request, reply) { ... }
```

---

### 5.2 parcelas.controller.ts

Similar a productores.controller.ts

---

## Fase 6: Frontend (Opcional - 15 minutos)

### 6.1 Eliminar servicio `searchNearby()` (Opcional)

**Ubicación**: `frontend/src/features/productores/services/productores.service.ts`

**Línea**: 82

**ANTES:**
```typescript
async searchNearby(params: ProximitySearchInput): Promise<ProductoresListResponse> {
  return apiClient.post(ENDPOINTS.PRODUCTORES.NEARBY, params);
}
```

**DESPUÉS:**
```typescript
// DESHABILITADO - Backend sin PostGIS
// async searchNearby(...) { ... }
```

---

## Fase 7: Testing (1 hora)

### 7.1 Testing local

#### Test 1: Crear productor con coordenadas

```bash
# Iniciar backend
cd backend
npm run dev

# Probar endpoint
POST http://localhost:3001/api/productores
{
  "nombre_productor": "Test PostGIS",
  "id_comunidad": "...",
  "latitud_domicilio": -19.0436782,
  "longitud_domicilio": -65.2593443,
  ...
}
```

**Esperado**: ✅ Se crea correctamente (sin error de PostGIS)

---

#### Test 2: Crear parcela con coordenadas

```bash
POST http://localhost:3001/api/parcelas
{
  "codigo_productor": "...",
  "numero_parcela": 1,
  "superficie_ha": 2.5,
  "latitud_sud": -19.0436782,
  "longitud_oeste": -65.2593443,
  ...
}
```

**Esperado**: ✅ Se crea correctamente

---

#### Test 3: Crear ficha de inspección con GPS

```bash
POST http://localhost:3001/api/fichas
{
  "codigo_productor": "...",
  "detalles_cultivo": [
    {
      "id_parcela": "...",
      "id_tipo_cultivo": "...",
      "superficie_ha": 1.5
    }
  ],
  ...
}
```

**Esperado**: ✅ Se crea y actualiza parcelas correctamente

---

#### Test 4: Verificar endpoints nearby (deben fallar o retornar 501)

```bash
POST http://localhost:3001/api/productores/nearby
{
  "latitude": -19.04,
  "longitude": -65.26,
  "radius": 5000
}
```

**Esperado**: ❌ Error 501 o endpoint comentado

---

### 7.2 Testing frontend

1. **Abrir aplicación** en navegador
2. **Crear productor** con GPS manual
3. **Crear parcela** con GPS manual
4. **Crear ficha** de inspección
5. **Ver mapa** en productor/parcela
6. **Verificar** que todo funciona

**Esperado**: ✅ Todo funciona normal (mapas se ven, GPS se guarda)

---

## Fase 8: Base de Datos (Deployment)

### 8.1 Crear base de datos en cPanel

1. Ir a: **Bases de datos PostgreSQL**
2. Crear base de datos: `ecvimpacto_apromam` (o nombre que prefieras)
3. Crear usuario y asignar permisos
4. **Anotar credenciales**

---

### 8.2 Schema SQL sin PostGIS

**Crear archivo**: `backend/database/schema_sin_postgis.sql`

```sql
-- PRODUCTORES
CREATE TABLE productores (
  codigo_productor VARCHAR(10) PRIMARY KEY,
  nombre_productor VARCHAR(200) NOT NULL,
  ci_documento VARCHAR(20),
  id_comunidad UUID NOT NULL REFERENCES comunidades(id_comunidad),
  id_organizacion UUID REFERENCES organizaciones(id_organizacion),
  año_ingreso_programa INTEGER NOT NULL,

  -- Coordenadas como DECIMAL (sin PostGIS)
  latitud_domicilio DECIMAL(10, 7),   -- Rango: -90 a 90
  longitud_domicilio DECIMAL(11, 7),  -- Rango: -180 a 180
  altitud_domicilio DECIMAL(6, 2),    -- Metros

  categoria_actual VARCHAR(2) NOT NULL,
  superficie_total_has DECIMAL(10, 4) NOT NULL,
  numero_parcelas_total INTEGER NOT NULL DEFAULT 0,
  inicio_conversion_organica DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- PARCELAS
CREATE TABLE parcelas (
  id_parcela UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_productor VARCHAR(10) NOT NULL REFERENCES productores(codigo_productor),
  numero_parcela INTEGER NOT NULL,
  superficie_ha DECIMAL(10, 4) NOT NULL,

  -- Coordenadas como DECIMAL (sin PostGIS)
  latitud_sud DECIMAL(10, 7),
  longitud_oeste DECIMAL(11, 7),

  utiliza_riego BOOLEAN NOT NULL DEFAULT false,
  tipo_barrera VARCHAR(10) NOT NULL DEFAULT 'ninguna',
  insumos_organicos TEXT,
  rotacion BOOLEAN NOT NULL DEFAULT false,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE(codigo_productor, numero_parcela)
);

-- Índices para búsquedas por coordenadas (opcional)
CREATE INDEX idx_productores_latitud ON productores(latitud_domicilio) WHERE latitud_domicilio IS NOT NULL;
CREATE INDEX idx_productores_longitud ON productores(longitud_domicilio) WHERE longitud_domicilio IS NOT NULL;
CREATE INDEX idx_parcelas_latitud ON parcelas(latitud_sud) WHERE latitud_sud IS NOT NULL;
CREATE INDEX idx_parcelas_longitud ON parcelas(longitud_oeste) WHERE longitud_oeste IS NOT NULL;
```

**Acción**: Importar este schema en la BD de producción

---

## Fase 9: Deployment Final

### 9.1 Subir código al servidor

**Opción A: FTP (sin Shell Access)**
- Subir `backend/dist/` + `node_modules/` (ver guía anterior)

**Opción B: SSH (si habilitan Shell Access)**
```bash
git clone https://github.com/tu-repo/apromam-sistema.git
cd backend
npm install --production
npm run build
npm start
```

---

### 9.2 Variables de entorno

**Archivo**: `backend/.env.production`

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecvimpacto_apromam
DB_USER=ecvimpacto_apromam_user
DB_PASSWORD=tu_password_aqui
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://ecv-impactobo.com
NODE_ENV=production
```

---

### 9.3 Verificar que NO hay errores de PostGIS

**En el servidor, revisar logs:**
```bash
# Si hay PM2 o similar
pm2 logs

# Buscar errores relacionados a PostGIS
grep -i "postgis\|ST_\|geography" logs/error.log
```

**Esperado**: ✅ Sin errores de PostGIS

---

## Checklist Final

### Backend

- [ ] `ProductorRepository.findNearby()` eliminado
- [ ] `ParcelaRepository.findNearby()` eliminado
- [ ] `ProductorRepository.create()` sin `ST_GeomFromText()`
- [ ] `ProductorRepository.update()` sin `ST_GeomFromText()`
- [ ] `ParcelaRepository.create()` sin `ST_GeomFromText()`
- [ ] `ParcelaRepository.update()` sin `ST_GeomFromText()`
- [ ] `FichaRepository` sin `ST_SetSRID()`, `ST_MakePoint()`
- [ ] `Productor.getCoordenadasWKT()` eliminado
- [ ] `Parcela.getCoordenadasWKT()` eliminado
- [ ] `connection.calculateDistance()` eliminado
- [ ] `connection.findNearby()` eliminado
- [ ] `postgis.utils.createPointWKT()` eliminado
- [ ] Rutas `/nearby` comentadas o con error 501

### Testing

- [ ] Crear productor con coordenadas ✅
- [ ] Crear parcela con coordenadas ✅
- [ ] Crear ficha de inspección ✅
- [ ] Ver mapas en frontend ✅
- [ ] Verificar que NO hay errores de PostGIS ✅

### Deployment

- [ ] Base de datos PostgreSQL creada
- [ ] Schema importado (sin campos GEOGRAPHY)
- [ ] Variables de entorno configuradas
- [ ] Código desplegado
- [ ] Servidor arrancado sin errores

---

## Rollback (Si algo sale mal)

Si necesitas volver atrás:

1. **Git**: `git revert <commit-hash>` o `git reset --hard HEAD~1`
2. **Restaurar archivos** desde backup
3. **Revertir base de datos** (si ya importaste schema)

---

## Soporte Post-Migración

Si después de remover PostGIS necesitas funcionalidad de búsqueda espacial:

**Alternativa JavaScript** (sin PostGIS):
```typescript
// Usar geolib (ya instalado)
import { getDistance, isPointWithinRadius } from 'geolib';

async findNearby(latitude: number, longitude: number, radiusMeters: number) {
  // 1. Obtener TODOS los productores con coordenadas
  const todosProductores = await this.findAll();

  // 2. Filtrar en JavaScript
  const cercanos = todosProductores.filter(p => {
    if (!p.latitudDomicilio || !p.longitudDomicilio) return false;

    return isPointWithinRadius(
      { latitude: p.latitudDomicilio, longitude: p.longitudDomicilio },
      { latitude, longitude },
      radiusMeters
    );
  });

  // 3. Calcular distancias
  return cercanos.map(p => ({
    ...p,
    distancia_metros: getDistance(
      { latitude: p.latitudDomicilio, longitude: p.longitudDomicilio },
      { latitude, longitude }
    )
  })).sort((a, b) => a.distancia_metros - b.distancia_metros);
}
```

**Ventajas**: Funciona sin PostGIS
**Desventajas**: Menos eficiente con miles de registros

---

## Notas Finales

1. **Backup**: Haz backup del código actual antes de empezar
2. **Testing**: Prueba TODO localmente antes de subir a producción
3. **Documentación**: Este documento queda como referencia
4. **Commit**: Crea un commit con mensaje claro: `"Remove PostGIS dependency"`

---

**¿Listo para empezar?** Confirma y comenzamos con Fase 1.
