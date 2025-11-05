# Análisis: Remover PostGIS del Sistema APROMAM

**Fecha**: 5 de Noviembre de 2025
**Decisión**: Remover PostGIS porque el hosting NO lo soporta
**Impacto**: Mínimo - Solo funcionalidades no usadas

---

## 1. Situación Actual

### 1.1 ¿Qué es PostGIS?

PostGIS es una extensión de PostgreSQL para trabajar con datos geoespaciales.
Permite almacenar geometrías (puntos, líneas, polígonos) y hacer consultas espaciales avanzadas.

**Problema**: Bolivia Host (hosting compartido) NO tiene PostGIS habilitado y no pueden instalarlo.

---

### 1.2 ¿Cómo usa APROMAM PostGIS actualmente?

El sistema usa un **patrón HÍBRIDO**:

#### **Backend - Base de Datos:**

**Tabla: `productores`**
```sql
-- Campos DECIMALES (NO requieren PostGIS)
latitud_domicilio DECIMAL(10, 7)   -- Ejemplo: -19.0436782
longitud_domicilio DECIMAL(11, 7)  -- Ejemplo: -65.2593443
altitud_domicilio DECIMAL(6, 2)    -- Ejemplo: 2750.50

-- Campo GEOGRAPHY (SÍ requiere PostGIS)
coordenadas_domicilio GEOGRAPHY(POINT, 4326)  -- Punto GPS PostGIS
```

**Tabla: `parcelas`**
```sql
-- Campos DECIMALES (NO requieren PostGIS)
latitud_sud DECIMAL(10, 7)
longitud_oeste DECIMAL(11, 7)

-- Campo GEOGRAPHY (SÍ requiere PostGIS)
coordenadas GEOGRAPHY(POINT, 4326)  -- Punto GPS PostGIS
```

**¿Por qué están duplicados?**
- Campos **DECIMALES**: Para leer/escribir coordenadas normales
- Campos **GEOGRAPHY**: Para búsquedas espaciales avanzadas (nearby, distancias)

---

## 2. Análisis de Uso de PostGIS

### 2.1 Backend - Archivos que usan PostGIS

#### **Archivo 1: `ProductorRepository.ts`**

**Función que USA PostGIS:**
```typescript
async findNearby(latitude: number, longitude: number, radiusMeters: number = 1000)
```

**Qué hace:**
Busca productores cercanos a una ubicación dentro de un radio.

**Query SQL:**
```sql
SELECT *,
  ST_Distance(p.coordenadas_domicilio::geography,
              ST_SetSRID(ST_Point($2, $1), 4326)::geography) as distancia_metros
FROM productores p
WHERE ST_DWithin(p.coordenadas_domicilio::geography,
                 ST_SetSRID(ST_Point($2, $1), 4326)::geography,
                 $3)
```

**Funciones PostGIS usadas:**
- `ST_Distance()` - Calcula distancia en metros
- `ST_DWithin()` - Filtra por radio
- `ST_SetSRID()` - Define sistema de coordenadas
- `ST_Point()` - Crea punto GPS

**¿Se usa en el sistema?** ❌ NO
- Endpoint definido: `POST /api/productores/nearby`
- Service frontend: Existe la función `searchNearby()`
- UI: **NO hay botón ni componente que la llame**

---

#### **Archivo 2: `ParcelaRepository.ts`**

**Función que USA PostGIS:**
```typescript
async findNearby(latitude: number, longitude: number, radiusMeters: number = 1000)
```

**Qué hace:**
Busca parcelas cercanas a una ubicación dentro de un radio.

**Query SQL:**
```sql
SELECT *,
  ST_Distance(pa.coordenadas::geography,
              ST_SetSRID(ST_Point($2, $1), 4326)::geography) as distancia_metros
FROM parcelas pa
WHERE ST_DWithin(pa.coordenadas::geography,
                 ST_SetSRID(ST_Point($2, $1), 4326)::geography,
                 $3)
```

**¿Se usa en el sistema?** ❌ NO
- Endpoint definido: `POST /api/parcelas/nearby`
- Service frontend: Existe la función (no confirmado)
- UI: **NO hay botón ni componente que la llame**

---

#### **Archivo 3: `FichaRepository.ts`**

**Funciones que USAN PostGIS:**
- `updateParcelaCoordenadasDeFicha()` - Actualiza coordenadas de parcela desde ficha
- `updateParcelaCompleta()` - Actualiza datos completos de parcela

**Query SQL (ejemplo):**
```sql
UPDATE parcelas
SET coordenadas = CASE
      WHEN $6 IS NOT NULL AND $7 IS NOT NULL
      THEN ST_SetSRID(ST_MakePoint($7, $6), 4326)
      ELSE coordenadas
    END,
    latitud_sud = COALESCE($6, latitud_sud),
    longitud_oeste = COALESCE($7, longitud_oeste)
WHERE id_parcela = $1
```

**Funciones PostGIS usadas:**
- `ST_MakePoint()` - Crea punto desde lat/lng
- `ST_SetSRID()` - Define SRID 4326 (WGS84)

**¿Se usa en el sistema?** ✅ SÍ
- Se usa al crear/actualizar fichas de inspección
- Actualiza el campo `coordenadas` (GEOGRAPHY) de parcelas

---

#### **Archivo 4: `connection.ts`**

**Funciones que USAN PostGIS:**
```typescript
static async calculateDistance(lat1, lng1, lat2, lng2): Promise<number>
static async findNearby(tableName, latitude, longitude, radiusMeters)
```

**¿Se usa en el sistema?** ❌ NO
- Son utilidades genéricas
- Llamadas solo desde `findNearby()` de repositories (que no se usan)

---

#### **Archivo 5: `postgis.utils.ts`**

**Funciones PostGIS:**
```typescript
export function createPointWKT(longitude: number, latitude: number): string
export function validateBolivianCoordinates(lat, lng)
export function validateGPSPrecision(lat, lng)
```

**Qué hacen:**
- `createPointWKT()`: Genera string WKT como `"POINT(-65.259 -19.043)"`
- Otras son validaciones de coordenadas (NO usan PostGIS)

**¿Se usa en el sistema?** ✅ SÍ (parcialmente)
- `createPointWKT()`: Usado en `getCoordenadasWKT()` de entities
- Validaciones: Usadas en entities para validar coordenadas

---

### 2.2 Entities (Clases de Dominio)

#### **Entity: `Productor.ts`**

**Campos relacionados a GPS:**
```typescript
interface ProductorData {
  latitud_domicilio?: number;      // DECIMAL
  longitud_domicilio?: number;     // DECIMAL
  altitud_domicilio?: number;      // DECIMAL
  coordenadas?: Coordinates;       // Calculado desde decimales
}
```

**Métodos que usan PostGIS:**
```typescript
getCoordenadasWKT(): string | null {
  // Retorna: "POINT(-65.259 -19.043)"
  return createPointWKT(this.data.longitud_domicilio, this.data.latitud_domicilio);
}
```

**¿Se usa?** ✅ SÍ
- Usado en `create()` y `update()` de `ProductorRepository`
- Genera WKT para `ST_GeomFromText($1, 4326)`

---

#### **Entity: `Parcela.ts`**

**Campos relacionados a GPS:**
```typescript
interface ParcelaData {
  latitud_sud?: number;       // DECIMAL
  longitud_oeste?: number;    // DECIMAL
  coordenadas?: Coordinates;  // Calculado desde decimales
}
```

**Métodos que usan PostGIS:**
```typescript
getCoordenadasWKT(): string | null {
  return createPointWKT(this.data.longitud_oeste, this.data.latitud_sud);
}
```

**¿Se usa?** ✅ SÍ
- Usado en `create()` y `update()` de `ParcelaRepository`
- Usado en actualización de parcelas desde fichas

---

### 2.3 Frontend - ¿Usa PostGIS?

**Respuesta: NO**

El frontend **NO depende de PostGIS**. Usa:

1. **Leaflet** (librería JavaScript de mapas)
   - Renderiza mapas interactivos
   - Muestra marcadores
   - NO requiere PostGIS

2. **gpsHelpers.ts** (utilidades GPS en JavaScript)
   - Valida coordenadas
   - Calcula distancias con **Haversine** (fórmula matemática)
   - NO usa PostGIS

3. **Componentes de mapas:**
   - `MapView.tsx` - Mapa base
   - `MapMarker.tsx` - Marcadores
   - `LocationPicker.tsx` - Selector de ubicación
   - `GPSCaptureButton.tsx` - Captura GPS del navegador

**Todos funcionan con lat/lng como números simples.**

---

## 3. Impacto de Remover PostGIS

### 3.1 Funcionalidades que SE PIERDEN

#### ❌ 1. Búsqueda de productores cercanos
- **Endpoint**: `POST /api/productores/nearby`
- **UI**: NO existe botón/pantalla que lo use
- **Impacto**: NINGUNO (no se usa)

#### ❌ 2. Búsqueda de parcelas cercanas
- **Endpoint**: `POST /api/parcelas/nearby`
- **UI**: NO existe botón/pantalla que lo use
- **Impacto**: NINGUNO (no se usa)

#### ❌ 3. Cálculo de distancias preciso con PostGIS
- **Función**: `calculateDistance()` en backend
- **Alternativa**: Ya existe en frontend con Haversine
- **Impacto**: MÍNIMO (el frontend ya lo hace)

---

### 3.2 Funcionalidades que SIGUEN funcionando

#### ✅ 1. Guardar coordenadas GPS (manual o capturadas)
- Campos `latitud_*` y `longitud_*` son DECIMAL
- NO requieren PostGIS
- Funcionan perfectamente

#### ✅ 2. Mostrar mapas interactivos
- Leaflet solo necesita lat/lng como números
- NO depende de PostGIS

#### ✅ 3. Capturar GPS del navegador
- `navigator.geolocation` (API del navegador)
- NO depende de PostGIS

#### ✅ 4. Validar coordenadas bolivianas
- Validaciones están en JavaScript/TypeScript
- NO requieren PostGIS

#### ✅ 5. Crear/editar productores y parcelas con GPS
- Guardan en campos DECIMAL
- Funcionan sin PostGIS

#### ✅ 6. Fichas de inspección con GPS
- Las fichas actualizan `latitud_sud` y `longitud_oeste`
- Funcionan sin PostGIS

#### ✅ 7. Todas las demás funcionalidades
- Usuarios, comunidades, fichas, certificación, etc.
- NO usan PostGIS

---

## 4. Resumen Ejecutivo

### 4.1 ¿Qué usa PostGIS actualmente?

| Componente | Función | ¿Se usa en UI? | ¿Crítico? |
|------------|---------|----------------|-----------|
| ProductorRepository.findNearby() | Buscar productores cercanos | ❌ NO | ❌ NO |
| ParcelaRepository.findNearby() | Buscar parcelas cercanas | ❌ NO | ❌ NO |
| FichaRepository (updates) | Actualizar coord. de parcelas | ✅ SÍ | ⚠️ Reemplazable |
| ProductorRepository (create/update) | Crear punto GEOGRAPHY | ✅ SÍ | ⚠️ Reemplazable |
| ParcelaRepository (create/update) | Crear punto GEOGRAPHY | ✅ SÍ | ⚠️ Reemplazable |

### 4.2 Impacto total

**Funcionalidades que se pierden:**
- 2 endpoints de búsqueda espacial (NO usados en UI)

**Funcionalidades que se mantienen:**
- 100% del sistema core (productores, parcelas, fichas, mapas)
- Guardar y mostrar coordenadas GPS
- Mapas interactivos con Leaflet

**Porcentaje de impacto:** ~5% (solo código backend no usado)

---

## 5. Conclusión

**¿Debemos remover PostGIS?**

✅ **SÍ, es viable y recomendado**

**Razones:**
1. Bolivia Host NO tiene PostGIS
2. Solo 2 funcionalidades usan PostGIS y NO están en la UI
3. El frontend NO depende de PostGIS
4. Todas las funcionalidades core siguen funcionando
5. El sistema será más portable (cualquier PostgreSQL)
6. El cliente dijo que GPS era "opcional" (pago extra)

**Esfuerzo estimado:** 3-4 horas

**Próximo paso:** Ver documento `PLAN_MIGRACION_SIN_POSTGIS.md` para el plan de acción detallado.
