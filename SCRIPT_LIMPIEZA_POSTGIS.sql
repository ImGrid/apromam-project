-- =====================================================================
-- Script de Limpieza de PostGIS en APROMAM
-- =====================================================================
-- Base de datos: apromam_db
-- Objetivo: Eliminar dependencias de PostGIS
-- Fecha: 2025-11-05
--
-- IMPORTANTE:
-- - Este script elimina campos GEOMETRY/GEOGRAPHY
-- - Mantiene campos DECIMAL (latitud_*, longitud_*)
-- - Ejecutar SOLO en base de datos local primero (testing)
-- - Hacer BACKUP antes de ejecutar en producción
-- =====================================================================

-- Iniciar transacción (permite rollback si algo falla)
BEGIN;

-- =====================================================================
-- PASO 1: ELIMINAR VISTAS QUE DEPENDEN DE CAMPOS GEOMETRY
-- =====================================================================

-- Vista que usa coordenadas_domicilio (GEOMETRY)
DROP VIEW IF EXISTS v_productores_con_ubicacion CASCADE;

RAISE NOTICE 'Paso 1 completado: Vistas eliminadas';

-- =====================================================================
-- PASO 2: ELIMINAR TRIGGERS
-- =====================================================================

-- Trigger de sincronización de productores
DROP TRIGGER IF EXISTS trg_sync_productor_coordinates ON productores;

-- Trigger de sincronización de parcelas
DROP TRIGGER IF EXISTS trg_actualizar_coordenadas ON parcelas;

RAISE NOTICE 'Paso 2 completado: Triggers eliminados';

-- =====================================================================
-- PASO 3: ELIMINAR FUNCIONES DE TRIGGERS
-- =====================================================================

-- Función de sincronización de productores
DROP FUNCTION IF EXISTS sync_coordinates_productor();

-- Función de sincronización de parcelas
DROP FUNCTION IF EXISTS actualizar_coordenadas_parcela();

RAISE NOTICE 'Paso 3 completado: Funciones eliminadas';

-- =====================================================================
-- PASO 4: ELIMINAR CONSTRAINTS QUE USAN FUNCIONES POSTGIS
-- =====================================================================

-- Constraint que usa ST_Y() y ST_X() en productores
ALTER TABLE productores DROP CONSTRAINT IF EXISTS ck_coordenadas_bolivia;

RAISE NOTICE 'Paso 4 completado: Constraints eliminados';

-- =====================================================================
-- PASO 5: ELIMINAR ÍNDICES POSTGIS
-- =====================================================================

-- Índice GIST espacial de productores
DROP INDEX IF EXISTS idx_productores_coordenadas_gist;

-- Índice que depende de coordenadas_domicilio
DROP INDEX IF EXISTS idx_productores_comunidad_coords;

-- Índice GIST espacial de parcelas
DROP INDEX IF EXISTS idx_parcelas_coordenadas_gist;

RAISE NOTICE 'Paso 5 completado: Índices PostGIS eliminados';

-- =====================================================================
-- PASO 6: ELIMINAR CAMPOS GEOMETRY/GEOGRAPHY
-- =====================================================================

-- Campo GEOMETRY en productores
ALTER TABLE productores DROP COLUMN IF EXISTS coordenadas_domicilio;

-- Campo GEOMETRY en parcelas
ALTER TABLE parcelas DROP COLUMN IF EXISTS coordenadas;

RAISE NOTICE 'Paso 6 completado: Campos GEOMETRY eliminados';

-- =====================================================================
-- PASO 7: RECREAR VISTA SIN POSTGIS (usando DECIMAL)
-- =====================================================================

CREATE OR REPLACE VIEW v_productores_con_ubicacion AS
SELECT
  p.codigo_productor,
  p.nombre_productor,
  p.categoria_actual,
  c.nombre_comunidad,
  m.nombre_municipio,
  pr.nombre_provincia,
  p.latitud_domicilio,         -- Campo DECIMAL
  p.longitud_domicilio,        -- Campo DECIMAL
  p.superficie_total_has,
  p.activo
FROM productores p
  JOIN comunidades c ON p.id_comunidad = c.id_comunidad
  JOIN municipios m ON c.id_municipio = m.id_municipio
  JOIN provincias pr ON m.id_provincia = pr.id_provincia
WHERE p.latitud_domicilio IS NOT NULL      -- Usa DECIMAL
  AND p.longitud_domicilio IS NOT NULL     -- Usa DECIMAL
  AND p.activo = true;

RAISE NOTICE 'Paso 7 completado: Vista recreada sin PostGIS';

-- =====================================================================
-- PASO 8 (OPCIONAL): AGREGAR CONSTRAINT DE VALIDACIÓN EN DECIMAL
-- =====================================================================

-- Validación de coordenadas bolivianas en campos DECIMAL
ALTER TABLE productores ADD CONSTRAINT ck_coordenadas_bolivia_decimal
CHECK (
  (latitud_domicilio IS NULL OR
   (latitud_domicilio >= -22.896 AND latitud_domicilio <= -9.680)) AND
  (longitud_domicilio IS NULL OR
   (longitud_domicilio >= -69.651 AND longitud_domicilio <= -57.453))
);

-- Validación de coordenadas bolivianas en parcelas
ALTER TABLE parcelas ADD CONSTRAINT ck_coordenadas_bolivia_parcelas
CHECK (
  (latitud_sud IS NULL OR
   (latitud_sud >= -22.896 AND latitud_sud <= -9.680)) AND
  (longitud_oeste IS NULL OR
   (longitud_oeste >= -69.651 AND longitud_oeste <= -57.453))
);

RAISE NOTICE 'Paso 8 completado: Constraints de validación DECIMAL agregados';

-- =====================================================================
-- PASO 9 (OPCIONAL): ELIMINAR EXTENSIÓN POSTGIS
-- =====================================================================

-- ADVERTENCIA: Esto eliminará TODAS las funciones PostGIS
-- Solo ejecutar si estás 100% seguro

-- DROP EXTENSION IF EXISTS postgis CASCADE;

-- RAISE NOTICE 'Paso 9 completado: Extensión PostGIS eliminada';

-- Comentar las líneas anteriores si NO quieres eliminar PostGIS completamente

-- =====================================================================
-- VERIFICACIÓN: CONFIRMAR QUE TODO SE ELIMINÓ CORRECTAMENTE
-- =====================================================================

-- Verificar que no quedan campos GEOMETRY
DO $$
DECLARE
  geom_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO geom_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND (udt_name = 'geometry' OR udt_name = 'geography');

  IF geom_count > 0 THEN
    RAISE WARNING 'Aún quedan % campos GEOMETRY/GEOGRAPHY en la BD', geom_count;
  ELSE
    RAISE NOTICE 'Verificación OK: No quedan campos GEOMETRY/GEOGRAPHY';
  END IF;
END $$;

-- Verificar que campos DECIMAL están intactos
DO $$
DECLARE
  decimal_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO decimal_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name IN ('productores', 'parcelas')
    AND column_name IN ('latitud_domicilio', 'longitud_domicilio', 'latitud_sud', 'longitud_oeste')
    AND data_type = 'numeric';

  IF decimal_count = 4 THEN
    RAISE NOTICE 'Verificación OK: Los 4 campos DECIMAL están intactos';
  ELSE
    RAISE WARNING 'ERROR: Solo se encontraron % campos DECIMAL (esperados: 4)', decimal_count;
  END IF;
END $$;

-- =====================================================================
-- COMMIT O ROLLBACK
-- =====================================================================

-- Si todo salió bien, hacer COMMIT
-- Si algo falló, hacer ROLLBACK

-- DESCOMENTAR UNA DE LAS SIGUIENTES LÍNEAS:

-- COMMIT;    -- Confirmar cambios
-- ROLLBACK;  -- Deshacer cambios

-- =====================================================================
-- RECOMENDACIONES POST-EJECUCIÓN
-- =====================================================================

-- 1. Verificar que el backend arranca sin errores de PostGIS
-- 2. Probar crear productor con coordenadas
-- 3. Probar crear parcela con coordenadas
-- 4. Probar crear ficha de inspección
-- 5. Verificar que los mapas en el frontend siguen funcionando

-- Si algo falla, ejecutar ROLLBACK y revisar el error

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================
