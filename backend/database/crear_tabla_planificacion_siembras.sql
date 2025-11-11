-- =====================================================
-- Script de creación: Tabla planificacion_siembras
-- Compatible con PostgreSQL 10
-- =====================================================
-- Descripción:
-- Tabla para almacenar la planificación de cultivos futura (Step 12)
-- Los datos son capturados en la ficha ACTUAL para proyectar
-- qué cultivos se planea sembrar en cada parcela el próximo año
-- =====================================================

-- Crear tabla planificacion_siembras
CREATE TABLE planificacion_siembras (
  -- Identificador único
  id_planificacion UUID NOT NULL,

  -- Referencias
  id_ficha UUID NOT NULL,
  id_parcela UUID NOT NULL,

  -- Superficie planificada (puede diferir de la superficie actual)
  area_parcela_planificada_ha NUMERIC(10,4) NOT NULL,

  -- Superficies por tipo de cultivo (columnas fijas)
  mani_ha NUMERIC(10,4) DEFAULT 0,
  maiz_ha NUMERIC(10,4) DEFAULT 0,
  papa_ha NUMERIC(10,4) DEFAULT 0,
  aji_ha NUMERIC(10,4) DEFAULT 0,
  leguminosas_ha NUMERIC(10,4) DEFAULT 0,
  otros_cultivos_ha NUMERIC(10,4) DEFAULT 0,
  otros_cultivos_detalle TEXT,
  descanso_ha NUMERIC(10,4) DEFAULT 0,

  -- Metadatos
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraint: Primary Key
  CONSTRAINT planificacion_siembras_pkey
    PRIMARY KEY (id_planificacion),

  -- Constraint: Foreign Key a ficha_inspeccion
  CONSTRAINT fk_planificacion_ficha
    FOREIGN KEY (id_ficha)
    REFERENCES ficha_inspeccion(id_ficha)
    ON DELETE CASCADE,

  -- Constraint: Foreign Key a parcelas
  CONSTRAINT fk_planificacion_parcela
    FOREIGN KEY (id_parcela)
    REFERENCES parcelas(id_parcela)
    ON DELETE CASCADE,

  -- Constraint: Una sola planificación por parcela por ficha
  CONSTRAINT uk_planificacion_ficha_parcela
    UNIQUE (id_ficha, id_parcela),

  -- Constraint: Superficies deben ser no negativas
  CONSTRAINT ck_superficies_positivas
    CHECK (
      area_parcela_planificada_ha >= 0 AND
      mani_ha >= 0 AND
      maiz_ha >= 0 AND
      papa_ha >= 0 AND
      aji_ha >= 0 AND
      leguminosas_ha >= 0 AND
      otros_cultivos_ha >= 0 AND
      descanso_ha >= 0
    ),

  -- Constraint: Área parcela planificada no debe exceder límite razonable
  CONSTRAINT ck_area_planificada_maxima
    CHECK (area_parcela_planificada_ha <= 10000)
);

-- Crear índice en id_ficha para búsquedas rápidas por ficha
CREATE INDEX idx_planificacion_ficha
  ON planificacion_siembras(id_ficha);

-- Crear índice en id_parcela para búsquedas rápidas por parcela
CREATE INDEX idx_planificacion_parcela
  ON planificacion_siembras(id_parcela);

-- Comentarios en la tabla y columnas (opcional, PostgreSQL 10 lo soporta)
COMMENT ON TABLE planificacion_siembras IS 'Planificacion de siembras futuras por parcela (Step 12). Datos capturados en la ficha actual para proyectar cultivos del proximo anio. NO influye en parcelas ni fichas futuras, solo para reporte Excel.';

COMMENT ON COLUMN planificacion_siembras.id_planificacion IS 'Identificador unico de la planificacion (UUID generado en backend)';

COMMENT ON COLUMN planificacion_siembras.id_ficha IS 'Referencia a la ficha de inspeccion actual';

COMMENT ON COLUMN planificacion_siembras.id_parcela IS 'Referencia a la parcela real (matchea con parcelas actuales)';

COMMENT ON COLUMN planificacion_siembras.area_parcela_planificada_ha IS 'Superficie planificada de la parcela (puede diferir de superficie_ha actual)';

COMMENT ON COLUMN planificacion_siembras.otros_cultivos_detalle IS 'Descripcion textual de otros cultivos planificados (ej: Cedron y Quinua)';

COMMENT ON COLUMN planificacion_siembras.descanso_ha IS 'Superficie planificada en descanso (puede ser calculado o ingresado manualmente)';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
