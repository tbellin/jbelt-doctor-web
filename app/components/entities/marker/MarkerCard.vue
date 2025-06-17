<!-- app/components/entities/marker/MarkerCard.vue -->
<template>
  <div class="marker-card card h-100">
    <div class="card-header bg-transparent d-flex justify-content-between align-items-center py-2">
      <h6 class="mb-0">{{ marker.name || t('markers:card.unnamed') }}</h6>
      <span v-if="marker.markerType" class="badge" :class="getTypeBadgeClass(marker.markerType)">
        {{ t(`markers:types.${marker.markerType}`) }}
      </span>
    </div>
    
    <div class="card-body">
      <!-- Marker Preview -->
      <div class="marker-preview-container mb-3">
        <div class="marker-preview mx-auto" :style="getMarkerStyle()">
          <div v-if="marker.symbol" class="marker-symbol">
            {{ marker.symbol }}
          </div>
          <div v-else class="marker-placeholder">
            <i class="bi bi-bookmark"></i>
          </div>
        </div>
      </div>

      <!-- Marker Info -->
      <div class="marker-info">
        <div v-if="marker.code" class="mb-2">
          <span class="badge bg-light text-dark">{{ marker.code }}</span>
        </div>
        
        <div v-if="marker.description" class="text-muted small mb-2">
          {{ marker.description }}
        </div>

        <!-- Properties -->
        <div class="marker-properties">
          <div v-if="marker.color" class="property-item">
            <i class="bi bi-palette me-1"></i>
            <span class="property-label">{{ t('markers:card.color') }}:</span>
            <div class="color-preview ms-2" :style="{ backgroundColor: marker.color }"></div>
          </div>
          
          <div v-if="marker.size" class="property-item">
            <i class="bi bi-arrows-angle-expand me-1"></i>
            <span class="property-label">{{ t('markers:card.size') }}:</span>
            <span class="property-value">{{ marker.size }}px</span>
          </div>
          
          <div v-if="marker.shape" class="property-item">
            <i class="bi bi-shapes me-1"></i>
            <span class="property-label">{{ t('markers:card.shape') }}:</span>
            <span class="property-value">{{ t(`markers:shapes.${marker.shape}`) }}</span>
          </div>
        </div>

        <!-- Usage Flags -->
        <div class="usage-flags mt-2">
          <div class="d-flex gap-2 flex-wrap">
            <span 
              v-if="marker.useInBalloons" 
              class="badge bg-primary"
              :title="t('markers:card.useInBalloons')"
            >
              <i class="bi bi-chat-dots me-1"></i>
              {{ t('markers:card.balloons') }}
            </span>
            <span 
              v-if="marker.useInAnnotations" 
              class="badge bg-info"
              :title="t('markers:card.useInAnnotations')"
            >
              <i class="bi bi-pencil me-1"></i>
              {{ t('markers:card.annotations') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer bg-transparent">
      <div class="d-flex justify-content-center gap-1">
        <button
          class="btn btn-outline-primary btn-sm"
          @click="$emit('preview', marker)"
          :title="t('common:preview')"
        >
          <i class="bi bi-eye"></i>
        </button>
        <button
          class="btn btn-outline-secondary btn-sm"
          @click="$emit('edit', marker)"
          :title="t('common:edit')"
        >
          <i class="bi bi-pencil"></i>
        </button>
        <button
          class="btn btn-outline-danger btn-sm"
          @click="$emit('delete', marker)"
          :title="t('common:delete')"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
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
  marker: IMarker
}

const props = defineProps<Props>()

// Emits
defineEmits<{
  preview: [marker: IMarker]
  edit: [marker: IMarker]
  delete: [marker: IMarker]
}>()

// Methods
const getMarkerStyle = () => {
  const size = props.marker.size || 32
  const color = props.marker.color || '#007bff'
  const shape = props.marker.shape
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    borderRadius: shape === Shape.CIRCLE ? '50%' : shape === Shape.ROUNDED_SQUARE ? '8px' : '2px',
    border: `2px solid ${color}`,
    color: getContrastColor(color),
    fontSize: `${Math.max(size * 0.4, 10)}px`
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
.marker-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #dee2e6;
}

.marker-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.marker-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60px;
}

.marker-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  font-weight: bold;
  text-align: center;
}

.marker-preview:hover {
  transform: scale(1.1);
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
  font-size: 0.8em;
}

.property-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.property-label {
  font-weight: 500;
  color: #6c757d;
  margin-right: 0.25rem;
}

.property-value {
  color: #495057;
}

.color-preview {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid #dee2e6;
  display: inline-block;
}

.usage-flags .badge {
  font-size: 0.7rem;
}

.btn-sm {
  padding: 0.25rem 0.4rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .marker-preview {
    width: 40px !important;
    height: 40px !important;
    font-size: 12px !important;
  }
  
  .property-item {
    font-size: 0.8rem;
  }
  
  .usage-flags .badge {
    font-size: 0.65rem;
  }
}
</style>