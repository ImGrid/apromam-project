-- =====================================================
-- MIGRACIÓN 003: Agregar ENUMs para Sección 7
-- =====================================================
-- Fecha: 2025-01-15
-- Descripción:
--   - Agrega 'ninguna' a categoria_semilla ENUM
--   - Crea nuevos ENUMs para campos de Sección 7
--   - Agrega campos _otro para opciones personalizadas
--   - Convierte campos VARCHAR a ENUM
-- =====================================================

BEGIN;

-- =====================================================
-- 1. AGREGAR 'ninguna' A categoria_semilla
-- =====================================================
ALTER TYPE categoria_semilla ADD VALUE IF NOT EXISTS 'ninguna';

-- =====================================================
-- 2. CREAR NUEVOS TIPOS ENUM
-- =====================================================

-- Tratamiento de semillas
CREATE TYPE tratamiento_semillas_enum AS ENUM (
    'sin_tratamiento',
    'agroquimico',
    'insumos_organicos',
    'otro'
);

-- Tipo de abonamiento
CREATE TYPE tipo_abonamiento_enum AS ENUM (
    'rastrojo',
    'guano',
    'otro'
);

-- Método de aporque
CREATE TYPE metodo_aporque_enum AS ENUM (
    'con_yunta',
    'manual',
    'otro'
);

-- Control de hierbas
CREATE TYPE control_hierbas_enum AS ENUM (
    'con_bueyes',
    'carpida_manual',
    'otro'
);

-- Método de cosecha
CREATE TYPE metodo_cosecha_enum AS ENUM (
    'con_yunta',
    'manual',
    'otro'
);

-- =====================================================
-- 3. AGREGAR NUEVAS COLUMNAS PARA "OTRO"
-- =====================================================
ALTER TABLE detalle_cultivo_parcela
    ADD COLUMN IF NOT EXISTS tratamiento_semillas_otro VARCHAR(200),
    ADD COLUMN IF NOT EXISTS tipo_abonamiento_otro VARCHAR(200),
    ADD COLUMN IF NOT EXISTS metodo_aporque_otro VARCHAR(200),
    ADD COLUMN IF NOT EXISTS control_hierbas_otro VARCHAR(200),
    ADD COLUMN IF NOT EXISTS metodo_cosecha_otro VARCHAR(200);

-- =====================================================
-- 4. MIGRAR DATOS EXISTENTES (si hay)
-- =====================================================
-- Nota: Como actualmente son VARCHAR, necesitamos mapear valores existentes
-- Si no hay datos, estos UPDATE no harán nada

-- Para tratamiento_semillas: mapear valores comunes o dejar NULL
UPDATE detalle_cultivo_parcela
SET tratamiento_semillas = NULL
WHERE tratamiento_semillas IS NOT NULL
  AND LOWER(tratamiento_semillas) NOT IN ('sin tratamiento', 'sin_tratamiento', 'agroquimico', 'insumos organicos', 'insumos_organicos');

-- Para tipo_abonamiento
UPDATE detalle_cultivo_parcela
SET tipo_abonamiento = NULL
WHERE tipo_abonamiento IS NOT NULL
  AND LOWER(tipo_abonamiento) NOT IN ('rastrojo', 'guano');

-- Para metodo_aporque
UPDATE detalle_cultivo_parcela
SET metodo_aporque = NULL
WHERE metodo_aporque IS NOT NULL
  AND LOWER(metodo_aporque) NOT IN ('con yunta', 'con_yunta', 'manual');

-- Para control_hierbas
UPDATE detalle_cultivo_parcela
SET control_hierbas = NULL
WHERE control_hierbas IS NOT NULL
  AND LOWER(control_hierbas) NOT IN ('con bueyes', 'con_bueyes', 'carpida manual', 'carpida_manual');

-- Para metodo_cosecha
UPDATE detalle_cultivo_parcela
SET metodo_cosecha = NULL
WHERE metodo_cosecha IS NOT NULL
  AND LOWER(metodo_cosecha) NOT IN ('con yunta', 'con_yunta', 'manual');

-- =====================================================
-- 5. CONVERTIR COLUMNAS VARCHAR A ENUM
-- =====================================================
-- Primero eliminamos las columnas existentes y las recreamos con el tipo correcto

ALTER TABLE detalle_cultivo_parcela
    DROP COLUMN IF EXISTS tratamiento_semillas CASCADE,
    DROP COLUMN IF EXISTS tipo_abonamiento CASCADE,
    DROP COLUMN IF EXISTS metodo_aporque CASCADE,
    DROP COLUMN IF EXISTS control_hierbas CASCADE,
    DROP COLUMN IF EXISTS metodo_cosecha CASCADE;

ALTER TABLE detalle_cultivo_parcela
    ADD COLUMN tratamiento_semillas tratamiento_semillas_enum,
    ADD COLUMN tipo_abonamiento tipo_abonamiento_enum,
    ADD COLUMN metodo_aporque metodo_aporque_enum,
    ADD COLUMN control_hierbas control_hierbas_enum,
    ADD COLUMN metodo_cosecha metodo_cosecha_enum;

-- =====================================================
-- 6. COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================
COMMENT ON COLUMN detalle_cultivo_parcela.tratamiento_semillas IS
'Tipo de tratamiento aplicado a las semillas (Sección 7)';

COMMENT ON COLUMN detalle_cultivo_parcela.tratamiento_semillas_otro IS
'Descripción cuando tratamiento_semillas = otro';

COMMENT ON COLUMN detalle_cultivo_parcela.tipo_abonamiento IS
'Tipo de abonamiento utilizado (Sección 7)';

COMMENT ON COLUMN detalle_cultivo_parcela.tipo_abonamiento_otro IS
'Descripción cuando tipo_abonamiento = otro';

COMMENT ON COLUMN detalle_cultivo_parcela.metodo_aporque IS
'Método de aporque utilizado (Sección 7)';

COMMENT ON COLUMN detalle_cultivo_parcela.metodo_aporque_otro IS
'Descripción cuando metodo_aporque = otro';

COMMENT ON COLUMN detalle_cultivo_parcela.control_hierbas IS
'Método de control de hierbas (Sección 7)';

COMMENT ON COLUMN detalle_cultivo_parcela.control_hierbas_otro IS
'Descripción cuando control_hierbas = otro';

COMMENT ON COLUMN detalle_cultivo_parcela.metodo_cosecha IS
'Método de cosecha utilizado (Sección 7)';

COMMENT ON COLUMN detalle_cultivo_parcela.metodo_cosecha_otro IS
'Descripción cuando metodo_cosecha = otro';

-- =====================================================
-- 7. VERIFICACIÓN
-- =====================================================
-- Verificar que los tipos ENUM se crearon correctamente
DO $$
BEGIN
    RAISE NOTICE 'Migración 003 completada exitosamente';
    RAISE NOTICE 'ENUMs creados: tratamiento_semillas_enum, tipo_abonamiento_enum, metodo_aporque_enum, control_hierbas_enum, metodo_cosecha_enum';
    RAISE NOTICE 'Columnas agregadas: 5 campos _otro para opciones personalizadas';
    RAISE NOTICE 'categoria_semilla ahora incluye: organica, transicion, convencional, ninguna';
END $$;

COMMIT;
