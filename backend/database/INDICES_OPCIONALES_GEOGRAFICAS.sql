-- ==============================================================================
-- ÍNDICES OPCIONALES PARA MÓDULO GEOGRÁFICAS
-- ==============================================================================
-- Este script contiene índices opcionales para mejorar el performance de las
-- consultas del módulo geográficas (departamentos, provincias, municipios, comunidades)
--
-- CUÁNDO EJECUTAR: Después de verificar que los cambios de código funcionen correctamente
--
-- COMPATIBLE CON: PostgreSQL 10+
--
-- INSTRUCCIONES:
-- 1. Ejecutar este script en la base de datos de producción
-- 2. Verificar que se crearon los índices: \di
-- 3. Monitorear performance con EXPLAIN ANALYZE
--
-- NOTA: Estos índices ocupan espacio en disco pero mejoran significativamente
--       el performance de consultas con WHERE, JOIN y ORDER BY
-- ==============================================================================

-- ==============================================================================
-- 1. ÍNDICES PARCIALES PARA FILTRO WHERE activo = true
-- ==============================================================================
-- Estos índices parciales solo indexan registros activos, ahorrando espacio
-- y mejorando la velocidad de queries que filtran por activo = true

-- Departamentos activos
CREATE INDEX IF NOT EXISTS idx_departamentos_activo
ON departamentos(activo)
WHERE activo = true;

COMMENT ON INDEX idx_departamentos_activo IS 'Índice parcial para departamentos activos - mejora queries WHERE activo = true';

-- Provincias activas
CREATE INDEX IF NOT EXISTS idx_provincias_activo
ON provincias(activo)
WHERE activo = true;

COMMENT ON INDEX idx_provincias_activo IS 'Índice parcial para provincias activas - mejora queries WHERE activo = true';

-- Municipios activos
CREATE INDEX IF NOT EXISTS idx_municipios_activo
ON municipios(activo)
WHERE activo = true;

COMMENT ON INDEX idx_municipios_activo IS 'Índice parcial para municipios activos - mejora queries WHERE activo = true';

-- Comunidades activas
CREATE INDEX IF NOT EXISTS idx_comunidades_activo
ON comunidades(activo)
WHERE activo = true;

COMMENT ON INDEX idx_comunidades_activo IS 'Índice parcial para comunidades activas - mejora queries WHERE activo = true';

-- Productores activos
CREATE INDEX IF NOT EXISTS idx_productores_activo
ON productores(activo)
WHERE activo = true;

COMMENT ON INDEX idx_productores_activo IS 'Índice parcial para productores activos - mejora queries WHERE activo = true';

-- ==============================================================================
-- 2. ÍNDICES PARA FOREIGN KEYS (Mejoran JOINs)
-- ==============================================================================
-- PostgreSQL NO crea índices automáticos para foreign keys
-- Estos índices mejoran significativamente el performance de JOINs

-- Provincias -> Departamentos
CREATE INDEX IF NOT EXISTS idx_provincias_id_departamento
ON provincias(id_departamento);

COMMENT ON INDEX idx_provincias_id_departamento IS 'Mejora JOIN provincias con departamentos';

-- Municipios -> Provincias
CREATE INDEX IF NOT EXISTS idx_municipios_id_provincia
ON municipios(id_provincia);

COMMENT ON INDEX idx_municipios_id_provincia IS 'Mejora JOIN municipios con provincias';

-- Comunidades -> Municipios
CREATE INDEX IF NOT EXISTS idx_comunidades_id_municipio
ON comunidades(id_municipio);

COMMENT ON INDEX idx_comunidades_id_municipio IS 'Mejora JOIN comunidades con municipios';

-- Productores -> Comunidades
CREATE INDEX IF NOT EXISTS idx_productores_id_comunidad
ON productores(id_comunidad);

COMMENT ON INDEX idx_productores_id_comunidad IS 'Mejora JOIN productores con comunidades';

-- Usuarios -> Comunidades (para conteo de técnicos)
CREATE INDEX IF NOT EXISTS idx_usuarios_id_comunidad
ON usuarios(id_comunidad)
WHERE id_comunidad IS NOT NULL;

COMMENT ON INDEX idx_usuarios_id_comunidad IS 'Mejora queries que cuentan técnicos por comunidad';

-- ==============================================================================
-- 3. ÍNDICES COMPUESTOS PARA CONSULTAS ESPECÍFICAS
-- ==============================================================================
-- Estos índices combinan múltiples columnas para optimizar queries frecuentes

-- Usuarios técnicos activos por comunidad (usado en ComunidadRepository)
CREATE INDEX IF NOT EXISTS idx_usuarios_comunidad_rol_activo
ON usuarios(id_comunidad, id_rol, activo)
WHERE activo = true AND id_comunidad IS NOT NULL;

COMMENT ON INDEX idx_usuarios_comunidad_rol_activo IS 'Optimiza conteo de técnicos por comunidad';

-- Productores activos por comunidad (usado en múltiples repositories)
CREATE INDEX IF NOT EXISTS idx_productores_comunidad_activo
ON productores(id_comunidad, activo)
WHERE activo = true;

COMMENT ON INDEX idx_productores_comunidad_activo IS 'Optimiza conteo de productores por comunidad';

-- ==============================================================================
-- 4. VERIFICACIÓN DE ÍNDICES CREADOS
-- ==============================================================================
-- Ejecutar esta query para verificar que todos los índices se crearon correctamente

SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('departamentos', 'provincias', 'municipios', 'comunidades', 'productores', 'usuarios')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ==============================================================================
-- 5. ANÁLISIS DE PERFORMANCE (OPCIONAL)
-- ==============================================================================
-- Después de crear los índices, ejecutar ANALYZE para actualizar estadísticas

ANALYZE departamentos;
ANALYZE provincias;
ANALYZE municipios;
ANALYZE comunidades;
ANALYZE productores;
ANALYZE usuarios;

-- ==============================================================================
-- 6. ELIMINAR ÍNDICES (SI ES NECESARIO)
-- ==============================================================================
-- Si necesitas eliminar los índices, ejecuta estos comandos:

/*
DROP INDEX IF EXISTS idx_departamentos_activo;
DROP INDEX IF EXISTS idx_provincias_activo;
DROP INDEX IF EXISTS idx_provincias_id_departamento;
DROP INDEX IF EXISTS idx_municipios_activo;
DROP INDEX IF EXISTS idx_municipios_id_provincia;
DROP INDEX IF EXISTS idx_comunidades_activo;
DROP INDEX IF EXISTS idx_comunidades_id_municipio;
DROP INDEX IF EXISTS idx_productores_activo;
DROP INDEX IF EXISTS idx_productores_id_comunidad;
DROP INDEX IF EXISTS idx_usuarios_id_comunidad;
DROP INDEX IF EXISTS idx_usuarios_comunidad_rol_activo;
DROP INDEX IF EXISTS idx_productores_comunidad_activo;
*/

-- ==============================================================================
-- FIN DEL SCRIPT
-- ==============================================================================
-- Los índices están creados. Para verificar el impacto:
-- 1. Ejecutar EXPLAIN ANALYZE en queries antes y después de crear índices
-- 2. Monitorear uso de índices con: SELECT * FROM pg_stat_user_indexes;
-- 3. Verificar tamaño de índices con: SELECT pg_size_pretty(pg_total_relation_size('nombre_tabla'));
-- ==============================================================================
