# Análisis de Base de Datos: Elementos PostGIS en APROMAM

**Fecha**: 5 de Noviembre de 2025
**Base de datos**: `apromam_db` (PostgreSQL 17.6 + PostGIS 3.5.3)
**Objetivo**: Identificar todos los elementos PostGIS para su eliminación

---

## 1. Extensión PostGIS Instalada

```sql
SELECT * FROM pg_extension WHERE extname = 'postgis';
```

**Resultado:**
- **Nombre**: postgis
- **Versión**: 3.5.3
- **Schema**: public
- **Descripción**: PostGIS geometry and geography spatial types and functions

---

## 2. Campos GEOMETRY/GEOGRAPHY

### 2.1 Tabla: `productores`

**Campo PostGIS:**
```sql
coordenadas_domicilio geometry(Point,4326)
```

**Campos DECIMAL (se mantienen):**
```sql
latitud_domicilio numeric(12,8)
longitud_domicilio numeric(12,8)
altitud_domicilio numeric(8,2)
```

**Relación**: Los campos DECIMAL y GEOMETRY están sincronizados por un TRIGGER.

---

### 2.2 Tabla: `parcelas`

**Campo PostGIS:**
```sql
coordenadas geometry(Point,4326)
```

**Campos DECIMAL (se mantienen):**
```sql
latitud_sud numeric(12,8)
longitud_oeste numeric(12,8)
```

**Relación**: Los campos DECIMAL y GEOMETRY están sincronizados por un TRIGGER.

---

## 3. Índices PostGIS

### 3.1 Tabla `productores`

**Índice 1: Índice espacial GIST**
```sql
CREATE INDEX idx_productores_coordenadas_gist
ON productores USING gist (coordenadas_domicilio)
WHERE coordenadas_domicilio IS NOT NULL;
```
**Tipo**: GIST (índice espacial PostGIS)
**Acción**: ❌ ELIMINAR

---

**Índice 2: Índice combinado con coordenadas**
```sql
CREATE INDEX idx_productores_comunidad_coords
ON productores (id_comunidad, activo)
WHERE coordenadas_domicilio IS NOT NULL AND activo = true;
```
**Tipo**: BTREE pero depende de `coordenadas_domicilio`
**Acción**: ❌ ELIMINAR (o modificar para usar DECIMAL)

---

### 3.2 Tabla `parcelas`

**Índice 1: Índice espacial GIST**
```sql
CREATE INDEX idx_parcelas_coordenadas_gist
ON parcelas USING gist (coordenadas);
```
**Tipo**: GIST (índice espacial PostGIS)
**Acción**: ❌ ELIMINAR

---

**Índice 2: Índice numérico (se mantiene)**
```sql
CREATE INDEX idx_parcelas_coords_numerico
ON parcelas (latitud_sud, longitud_oeste)
WHERE latitud_sud IS NOT NULL AND longitud_oeste IS NOT NULL;
```
**Tipo**: BTREE con campos DECIMAL
**Acción**: ✅ MANTENER

---

## 4. Constraints (Check Constraints)

### 4.1 Tabla `productores`

**Constraint: Validación de coordenadas bolivianas**
```sql
ALTER TABLE productores ADD CONSTRAINT ck_coordenadas_bolivia
CHECK (
  coordenadas_domicilio IS NULL OR
  (
    st_y(coordenadas_domicilio) >= -22.896 AND
    st_y(coordenadas_domicilio) <= -9.680 AND
    st_x(coordenadas_domicilio) >= -69.651 AND
    st_x(coordenadas_domicilio) <= -57.453
  )
);
```

**Funciones PostGIS usadas:**
- `ST_Y()` - Obtiene latitud del punto GEOMETRY
- `ST_X()` - Obtiene longitud del punto GEOMETRY

**Acción**: ❌ ELIMINAR

**Alternativa** (si queremos validación en DECIMAL):
```sql
ALTER TABLE productores ADD CONSTRAINT ck_coordenadas_bolivia_decimal
CHECK (
  (latitud_domicilio IS NULL OR
   (latitud_domicilio >= -22.896 AND latitud_domicilio <= -9.680)) AND
  (longitud_domicilio IS NULL OR
   (longitud_domicilio >= -69.651 AND longitud_domicilio <= -57.453))
);
```

---

## 5. Triggers y Funciones

### 5.1 Tabla `productores`

**Trigger:**
```sql
CREATE TRIGGER trg_sync_productor_coordinates
BEFORE INSERT OR UPDATE ON productores
FOR EACH ROW
EXECUTE FUNCTION sync_coordinates_productor();
```

**Función asociada:**
```sql
CREATE OR REPLACE FUNCTION sync_coordinates_productor()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Prioridad 1: Si se actualiza geometry → actualizar decimales
    IF NEW.coordenadas_domicilio IS NOT NULL AND
       (OLD.coordenadas_domicilio IS NULL OR
        NOT ST_Equals(NEW.coordenadas_domicilio, OLD.coordenadas_domicilio)) THEN

        NEW.latitud_domicilio = ST_Y(NEW.coordenadas_domicilio);
        NEW.longitud_domicilio = ST_X(NEW.coordenadas_domicilio);

    -- Prioridad 2: Si se actualizan decimales → actualizar geometry
    ELSIF (NEW.latitud_domicilio IS NOT NULL AND NEW.longitud_domicilio IS NOT NULL) AND
          (OLD.latitud_domicilio IS DISTINCT FROM NEW.latitud_domicilio OR
           OLD.longitud_domicilio IS DISTINCT FROM NEW.longitud_domicilio) THEN

        NEW.coordenadas_domicilio = ST_SetSRID(
            ST_Point(NEW.longitud_domicilio, NEW.latitud_domicilio),
            4326
        );
    END IF;

    RETURN NEW;
END;
$function$
```

**Funciones PostGIS usadas:**
- `ST_Equals()` - Compara dos geometrías
- `ST_Y()` - Extrae latitud
- `ST_X()` - Extrae longitud
- `ST_SetSRID()` - Define sistema de referencia
- `ST_Point()` - Crea punto GEOMETRY

**Qué hace**: Sincroniza campos GEOMETRY con campos DECIMAL bidirecionalmente

**Acción**: ❌ ELIMINAR (trigger y función)

---

### 5.2 Tabla `parcelas`

**Trigger:**
```sql
CREATE TRIGGER trg_actualizar_coordenadas
BEFORE INSERT OR UPDATE ON parcelas
FOR EACH ROW
EXECUTE FUNCTION actualizar_coordenadas_parcela();
```

**Función asociada:**
```sql
CREATE OR REPLACE FUNCTION actualizar_coordenadas_parcela()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Prioridad 1: Si se actualiza geometry → actualizar decimales
    IF NEW.coordenadas IS NOT NULL AND
       (OLD.coordenadas IS NULL OR
        NOT ST_Equals(NEW.coordenadas, OLD.coordenadas)) THEN

        NEW.latitud_sud = ST_Y(NEW.coordenadas);
        NEW.longitud_oeste = ST_X(NEW.coordenadas);

    -- Prioridad 2: Si se actualizan decimales → actualizar geometry
    ELSIF (NEW.latitud_sud IS NOT NULL AND NEW.longitud_oeste IS NOT NULL) AND
          (OLD.latitud_sud IS DISTINCT FROM NEW.latitud_sud OR
           OLD.longitud_oeste IS DISTINCT FROM NEW.longitud_oeste) THEN

        NEW.coordenadas = ST_SetSRID(
            ST_Point(NEW.longitud_oeste, NEW.latitud_sud),
            4326
        );
    END IF;

    RETURN NEW;
END;
$function$
```

**Funciones PostGIS usadas:** Igual que productores

**Acción**: ❌ ELIMINAR (trigger y función)

---

## 6. Vistas

### 6.1 Vista: `v_productores_con_ubicacion`

**Definición:**
```sql
CREATE VIEW v_productores_con_ubicacion AS
SELECT
  p.codigo_productor,
  p.nombre_productor,
  p.categoria_actual,
  c.nombre_comunidad,
  m.nombre_municipio,
  pr.nombre_provincia,
  p.latitud_domicilio,           -- ✅ DECIMAL
  p.longitud_domicilio,          -- ✅ DECIMAL
  p.coordenadas_domicilio,       -- ❌ GEOMETRY (PostGIS)
  p.superficie_total_has,
  p.activo
FROM productores p
  JOIN comunidades c ON p.id_comunidad = c.id_comunidad
  JOIN municipios m ON c.id_municipio = m.id_municipio
  JOIN provincias pr ON m.id_provincia = pr.id_provincia
WHERE p.coordenadas_domicilio IS NOT NULL  -- ❌ Usa campo GEOMETRY
  AND p.activo = true;
```

**Problema**: Incluye campo `coordenadas_domicilio` (GEOMETRY)

**Acción**: 🔄 MODIFICAR para usar campos DECIMAL

**Nueva definición:**
```sql
CREATE OR REPLACE VIEW v_productores_con_ubicacion AS
SELECT
  p.codigo_productor,
  p.nombre_productor,
  p.categoria_actual,
  c.nombre_comunidad,
  m.nombre_municipio,
  pr.nombre_provincia,
  p.latitud_domicilio,
  p.longitud_domicilio,
  p.superficie_total_has,
  p.activo
FROM productores p
  JOIN comunidades c ON p.id_comunidad = c.id_comunidad
  JOIN municipios m ON c.id_municipio = m.id_municipio
  JOIN provincias pr ON m.id_provincia = pr.id_provincia
WHERE p.latitud_domicilio IS NOT NULL      -- ✅ Usa DECIMAL
  AND p.longitud_domicilio IS NOT NULL     -- ✅ Usa DECIMAL
  AND p.activo = true;
```

---

### 6.2 Vistas del Sistema PostGIS

**Vistas:**
- `geography_columns` - Vista del sistema PostGIS
- `geometry_columns` - Vista del sistema PostGIS

**Acción**: ⚠️ NO tocar (son del sistema, se eliminan solas si eliminamos extensión)

---

## 7. Tablas del Sistema PostGIS

### 7.1 Tabla: `spatial_ref_sys`

**Descripción**: Tabla de PostGIS con sistemas de referencia espacial (SRID).

**Contenido**: Definiciones de proyecciones geográficas (WGS84, etc.)

**Acción**: ⚠️ Se elimina automáticamente si eliminamos extensión PostGIS

---

## 8. Resumen de Elementos a Eliminar

### 8.1 Orden de Eliminación (IMPORTANTE)

**Paso 1: Eliminar vistas que dependen de campos GEOMETRY**
```sql
DROP VIEW IF EXISTS v_productores_con_ubicacion CASCADE;
```

**Paso 2: Eliminar triggers**
```sql
DROP TRIGGER IF EXISTS trg_sync_productor_coordinates ON productores;
DROP TRIGGER IF EXISTS trg_actualizar_coordenadas ON parcelas;
```

**Paso 3: Eliminar funciones de triggers**
```sql
DROP FUNCTION IF EXISTS sync_coordinates_productor();
DROP FUNCTION IF EXISTS actualizar_coordenadas_parcela();
```

**Paso 4: Eliminar constraints que usan PostGIS**
```sql
ALTER TABLE productores DROP CONSTRAINT IF EXISTS ck_coordenadas_bolivia;
```

**Paso 5: Eliminar índices PostGIS**
```sql
DROP INDEX IF EXISTS idx_productores_coordenadas_gist;
DROP INDEX IF EXISTS idx_productores_comunidad_coords;
DROP INDEX IF EXISTS idx_parcelas_coordenadas_gist;
```

**Paso 6: Eliminar campos GEOMETRY**
```sql
ALTER TABLE productores DROP COLUMN IF EXISTS coordenadas_domicilio;
ALTER TABLE parcelas DROP COLUMN IF EXISTS coordenadas;
```

**Paso 7: Eliminar extensión PostGIS (OPCIONAL)**
```sql
DROP EXTENSION IF EXISTS postgis CASCADE;
```

**Nota**: El CASCADE eliminará automáticamente:
- Todas las funciones ST_*
- Tipos GEOMETRY, GEOGRAPHY
- Tabla `spatial_ref_sys`
- Vistas `geography_columns`, `geometry_columns`

---

## 9. Campos que SE MANTIENEN

### ✅ Tabla `productores`:
```sql
latitud_domicilio numeric(12,8)    -- Se mantiene
longitud_domicilio numeric(12,8)   -- Se mantiene
altitud_domicilio numeric(8,2)     -- Se mantiene
```

### ✅ Tabla `parcelas`:
```sql
latitud_sud numeric(12,8)          -- Se mantiene
longitud_oeste numeric(12,8)       -- Se mantiene
```

### ✅ Índices que SE MANTIENEN:
```sql
idx_parcelas_coords_numerico       -- Usa DECIMAL, no PostGIS
```

---

## 10. Verificación Post-Eliminación

Después de ejecutar el script de limpieza, verificar:

### 10.1 Confirmar que NO quedan campos GEOMETRY
```sql
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (udt_name = 'geometry' OR udt_name = 'geography');
```
**Resultado esperado**: 0 filas

---

### 10.2 Confirmar que campos DECIMAL están intactos
```sql
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('productores', 'parcelas')
  AND column_name IN ('latitud_domicilio', 'longitud_domicilio', 'latitud_sud', 'longitud_oeste')
ORDER BY table_name, column_name;
```
**Resultado esperado**: 4 filas con tipos NUMERIC

---

### 10.3 Confirmar que triggers fueron eliminados
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (trigger_name LIKE '%coord%' OR trigger_name LIKE '%sync%');
```
**Resultado esperado**: 0 filas (o sin triggers de coordenadas)

---

### 10.4 Verificar extensión PostGIS (si se eliminó)
```sql
SELECT * FROM pg_extension WHERE extname = 'postgis';
```
**Resultado esperado**: 0 filas (si se eliminó la extensión)

---

## 11. Impacto en el Backend

**Archivos que fallarán después de eliminar campos GEOMETRY:**

1. `ProductorRepository.ts` - INSERTs/UPDATEs con `ST_GeomFromText()`
2. `ParcelaRepository.ts` - INSERTs/UPDATEs con `ST_GeomFromText()`
3. `FichaRepository.ts` - UPDATEs con `ST_SetSRID()`, `ST_MakePoint()`
4. `ProductorRepository.findNearby()` - Consultas con `ST_Distance()`
5. `ParcelaRepository.findNearby()` - Consultas con `ST_DWithin()`

**Estos archivos deben modificarse según el plan `PLAN_MIGRACION_SIN_POSTGIS.md`**

---

## 12. Próximo Paso

Ver documento: `SCRIPT_LIMPIEZA_POSTGIS.sql` para ejecutar la eliminación paso a paso.

---

**Fecha de análisis**: 2025-11-05
**Analizado por**: Claude Code
**Estado**: Listo para ejecutar limpieza
