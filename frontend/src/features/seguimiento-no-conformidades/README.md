# Módulo de Seguimiento de No Conformidades

Módulo frontend para gestionar el seguimiento y corrección de no conformidades detectadas durante inspecciones.

## Estructura

```
seguimiento-no-conformidades/
├── types/                     # Tipos TypeScript y schemas Zod
│   ├── noConformidad.types.ts    # Interfaces y tipos
│   ├── noConformidad.schemas.ts  # Validaciones Zod
│   └── index.ts
├── services/                  # Comunicación con backend
│   └── noConformidades.service.ts
├── hooks/                     # React Query hooks
│   ├── useNoConformidadById.ts
│   ├── useNoConformidadesByFicha.ts
│   ├── useUpdateSeguimiento.ts    # HOOK CORE
│   ├── useUpdateDatosNC.ts
│   ├── useEstadisticasNC.ts
│   ├── useArchivosNC.ts
│   ├── useUploadArchivoNC.ts
│   ├── useDeleteArchivoNC.ts
│   └── index.ts
└── index.ts
```

## Funcionalidad Core

### 1. Seguimiento de Estados
Las NC pueden estar en 3 estados:
- `pendiente`: Recién detectada, no se ha iniciado seguimiento
- `seguimiento`: En proceso de corrección
- `corregido`: Ya fue corregida y verificada

### 2. Gestión de Archivos
Tipos de archivos permitidos:
- `evidencia_correccion`: Evidencia de que se corrigió
- `documento_soporte`: Documentos relacionados
- `foto_antes`: Foto previa a corrección
- `foto_despues`: Foto posterior a corrección

### 3. Permisos
- **Técnico**: Crea NC (en fichas), puede hacer seguimiento solo de su comunidad
- **Gerente**: Puede hacer seguimiento de TODAS las NC

## Uso de Hooks

### Obtener una NC
```typescript
import { useNoConformidadById } from '@/features/seguimiento-no-conformidades';

const { data: nc, isLoading } = useNoConformidadById(id);
```

### Actualizar Seguimiento (CORE)
```typescript
import { useUpdateSeguimiento } from '@/features/seguimiento-no-conformidades';

const { mutate: updateSeguimiento } = useUpdateSeguimiento();

updateSeguimiento({
  id: ncId,
  data: {
    estado_seguimiento: 'corregido',
    comentario_seguimiento: 'Se verificó la corrección en campo'
  }
});
```

### Subir Archivo
```typescript
import { useUploadArchivoNC } from '@/features/seguimiento-no-conformidades';

const { mutate: uploadArchivo } = useUploadArchivoNC();

uploadArchivo({
  idNoConformidad: ncId,
  file: selectedFile,
  tipoArchivo: 'evidencia_correccion'
});
```

### Estadísticas
```typescript
import { useEstadisticasNC } from '@/features/seguimiento-no-conformidades';

const { data: stats } = useEstadisticasNC();
// stats.total, stats.por_estado.pendiente, stats.vencidas, etc.
```

## Validaciones

Todas las validaciones están en `types/noConformidad.schemas.ts`:

- Comentario de seguimiento: Máximo 1000 caracteres
- Archivos: Máximo 50MB
- Tipos MIME permitidos: JPG, PNG, WebP, PDF, Word

## Integración con Backend

Los endpoints se definen en `@/shared/services/api/endpoints.ts`:

```typescript
ENDPOINTS.NO_CONFORMIDADES.BY_ID(id)
ENDPOINTS.NO_CONFORMIDADES.UPDATE_SEGUIMIENTO(id)
ENDPOINTS.NO_CONFORMIDADES.ARCHIVOS(id)
// etc.
```

## Próximos Pasos

1. Crear componentes UI (páginas, formularios, cards)
2. Configurar rutas en el router
3. Añadir item al sidebar para técnicos y gerentes
4. Testing e integración

## Notas Importantes

- Las NC se **crean** en el Step11 del formulario de fichas
- El **seguimiento** se hace en este módulo independiente
- Todos los cambios invalidan queries de React Query automáticamente
- Los tipos replican **exactamente** los del backend
