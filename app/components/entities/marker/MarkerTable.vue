<!-- app/components/entities/marker/MarkerTable.vue -->
<template>
  <div class="marker-table-container">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ t('common:loading') }}</span>
      </div>
    </div>

    <!-- Table -->
    <div v-else-if="markers.length > 0" class="table-responsive">
      <table class="table table-hover">
        <thead class="table-dark">
          <tr>
            <th scope="col">{{ t('markers:table.columns.preview') }}</th>
            <th scope="col">{{ t('markers:table.columns.name') }}</th>
            <th scope="col">{{ t('markers:table.columns.type') }}</th>
            <th scope="col">{{ t('markers:table.columns.properties') }}</th>
            <th scope="col">{{ t('markers:table.columns.usage') }}</th>
            <th scope="col" class="text-center">{{ t('common:actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="marker in markers" :key="marker.id">
            <!-- Preview -->
            <td>
              <div class="marker-preview" :style="getMarkerPreviewStyle(marker)">
                <div v-if="marker.symbol" class="marker-symbol">
                  {{ marker.symbol }}
                </div>
                <div v-else class="marker-placeholder">
                  <i class="bi bi-bookmark"></i>
                </div>
              </div>
            </td>

            <!-- Name and Code -->
            <td>
              <div>
                <div class="fw-medium">{{ marker.name || t('markers:table.unnamed') }}</div>
                <div v-if="marker.code" class="small text-muted">{{ marker.code }}</div>
                <div v-if="marker.description" class="small text-muted mt-1">{{ marker.description }}</div>
              </div>
            </td>

            <!-- Type -->
            <td>
              <span v-if="marker.markerType" class="badge" :class="getTypeBadgeClass(marker.markerType)">
                {{ t(`markers:types.${marker.markerType}`) }}
              </span>
              <span v-else class="text-muted">{{ t('markers:table.noType') }}</span>
            </td>

            <!-- Properties -->
            <td>
              <div class="marker-properties">
                <div v-if="marker.color" class="property-row">
                  <i class="bi bi-palette me-1"></i>
                  <div class="color-preview me-2" :style="{ backgroundColor: marker.color }"></div>
                  <span class="small">{{ marker.color }}</span>
                </div>
                <div v-if="marker.size" class="property-row">
                  <i class="bi bi-arrows-angle-expand me-1"></i>
                  <span class="small">{{ marker.size }}px</span>
                </div>
                <div v-if="marker.shape" class="property-row">
                  <i class="bi bi-shapes me-1"></i>
                  <span class="small">{{ t(`markers:shapes.${marker.shape}`) }}</span>
                </div>
              </div>
            </td>

            <!-- Usage -->
            <td>
              <div class="usage-badges">
                <span 
                  v-if="marker.useInBalloons" 
                  class="badge bg-primary me-1"
                  :title="t('markers:table.useInBalloons')"
                >
                  <i class="bi bi-chat-dots me-1"></i>
                  {{ t('markers:table.balloons') }}
                </span>
                <span 
                  v-if="marker.useInAnnotations" 
                  class="badge bg-info"
                  :title="t('markers:table.useInAnnotations')"
                >
                  <i class="bi bi-pencil me-1"></i>
                  {{ t('markers:table.annotations') }}
                </span>
                <span v-if="!marker.useInBalloons && !marker.useInAnnotations" class="text-muted small">
                  {{ t('markers:table.noUsage') }}
                </span>
              </div>
            </td>

            <!-- Actions -->
            <td class="text-center">
              <div class="btn-group btn-group-sm">
                <button
                  class="btn btn-outline-info"
                  @click="$emit('preview', marker)"
                  :title="t('common:preview')"
                >
                  <i class="bi bi-eye"></i>
                </button>
                <button
                  class="btn btn-outline-primary"
                  @click="$emit('edit', marker)"
                  :title="t('common:edit')"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="btn btn-outline-danger"
                  @click="$emit('delete', marker)"
                  :title="t('common:delete')"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- No Data -->
    <div v-else class="text-center py-5">
      <i class="bi bi-bookmark display-1 text-muted"></i>
      <h5 class="text-muted mt-3">{{ t('markers:table.noData.title') }}</h5>
      <p class="text-muted">{{ t('markers:table.noData.message') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type IMarker } from '~/model/marker.model'
import { MarkerType } from '~/model/enumerations/marker-type.model'
import { Shape } from '~/model/enumerations/shape.model'

// Composables
const { t } = useI18n()

// Props
interface Props {
  markers: IMarker[]
  loading?: boolean
}

defineProps<Props>()

// Emits
defineEmits<{
  preview: [marker: IMarker]
  edit: [marker: IMarker]
  delete: [marker: IMarker]
}>()

// Methods
const getMarkerPreviewStyle = (marker: IMarker) => {
  const size = Math.min(marker.size || 24, 32) // Limit table preview size
  const color = marker.color || '#007bff'
  const shape = marker.shape
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    borderRadius: shape === Shape.CIRCLE ? '50%' : shape === Shape.ROUNDED_SQUARE ? '4px' : '2px',
    border: `1px solid ${color}`,
    color: getContrastColor(color),
    fontSize: `${Math.max(size * 0.4, 8)}px`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    minHeight: '24px'
  }
}

const getContrastColor = (hexColor: string): string => {
  if (!hexColor) return '#000'
  
  // Remove # if present
  const hex = hexColor.replace('#', '')
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  return brightness > 128 ? '#000' : '#fff'
}

const getTypeBadgeClass = (type: MarkerType): string => {
  switch (type) {
    case MarkerType.BALLOON:
      return 'bg-primary'
    case MarkerType.ANNOTATION:
      return 'bg-info'
    case MarkerType.SYMBOL:
      return 'bg-success'
    case MarkerType.DIMENSION:
      return 'bg-warning'
    case MarkerType.REFERENCE:
      return 'bg-secondary'
    default:
      return 'bg-light text-dark'
  }
}
</script>

<style scoped>
.marker-table-container {
  position: relative;
}

.marker-preview {
  font-weight: bold;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.marker-symbol {
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.marker-placeholder {
  opacity: 0.6;
}

.marker-properties .property-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.color-preview {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid #dee2e6;
  display: inline-block;
}

.usage-badges .badge {
  font-size: 0.7rem;
  margin-bottom: 0.25rem;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.4rem;
}

.table th {
  border-top: none;
  font-weight: 600;
}

.table td {
  vertical-align: middle;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group-sm .btn {
    padding: 0.125rem 0.25rem;
  }
  
  .marker-preview {
    width: 20px !important;
    height: 20px !important;
    font-size: 10px !important;
  }
  
  .property-row {
    font-size: 0.8rem !important;
  }
  
  .usage-badges .badge {
    font-size: 0.65rem;
  }
}
</style>