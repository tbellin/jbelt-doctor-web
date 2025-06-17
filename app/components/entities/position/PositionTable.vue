<!-- app/components/entities/position/PositionTable.vue -->
<template>
  <div class="position-table-container">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ t('common:loading') }}</span>
      </div>
    </div>

    <!-- Table -->
    <div v-else-if="positions.length > 0" class="table-responsive">
      <table class="table table-hover">
        <thead class="table-dark">
          <tr>
            <th scope="col">{{ t('positions:table.columns.balloon') }}</th>
            <th scope="col">{{ t('positions:table.columns.coordinates') }}</th>
            <th scope="col">{{ t('positions:table.columns.drawing') }}</th>
            <th scope="col">{{ t('positions:table.columns.sheet') }}</th>
            <th scope="col">{{ t('positions:table.columns.marker') }}</th>
            <th scope="col" class="text-center">{{ t('positions:table.columns.status') }}</th>
            <th scope="col" class="text-center">{{ t('common:actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="position in positions" :key="position.id">
            <!-- Balloon Number -->
            <td>
              <div class="d-flex align-items-center">
                <div class="balloon-preview me-2" v-if="position.balloonNumber">
                  <span class="balloon-number">{{ position.balloonNumber }}</span>
                </div>
                <div>
                  <div class="fw-medium">{{ position.balloonNumber || t('positions:table.noBalloon') }}</div>
                  <div v-if="position.description" class="small text-muted">{{ position.description }}</div>
                </div>
              </div>
            </td>

            <!-- Coordinates -->
            <td>
              <div v-if="position.xCoordinate !== null && position.yCoordinate !== null" class="coordinates">
                <div class="d-flex align-items-center">
                  <i class="bi bi-crosshair me-1 text-primary"></i>
                  <span class="font-monospace small">
                    X: {{ position.xCoordinate }}, Y: {{ position.yCoordinate }}
                  </span>
                </div>
                <div v-if="position.zCoordinate !== null" class="font-monospace small text-muted">
                  Z: {{ position.zCoordinate }}
                </div>
              </div>
              <span v-else class="text-muted">{{ t('positions:table.noCoordinates') }}</span>
            </td>

            <!-- Drawing -->
            <td>
              <div v-if="position.drawing" class="drawing-info">
                <div class="fw-medium">{{ position.drawing.fileName }}</div>
                <div v-if="position.drawingFileName" class="small text-muted">{{ position.drawingFileName }}</div>
              </div>
              <span v-else class="text-muted">{{ t('positions:table.noDrawing') }}</span>
            </td>

            <!-- Sheet -->
            <td>
              <div v-if="position.sheet" class="sheet-info">
                <div class="fw-medium">{{ position.sheet.name }}</div>
                <div v-if="position.sheet.format" class="small text-muted">{{ position.sheet.format.name }}</div>
              </div>
              <span v-else class="text-muted">{{ t('positions:table.noSheet') }}</span>
            </td>

            <!-- Marker -->
            <td>
              <div v-if="position.marker" class="marker-info">
                <button 
                  class="btn btn-sm btn-outline-primary d-flex align-items-center"
                  @click="$emit('view-marker', position.marker)"
                >
                  <div 
                    class="marker-preview me-2"
                    :style="{ 
                      backgroundColor: position.marker.color || '#007bff',
                      width: '16px',
                      height: '16px',
                      borderRadius: position.marker.shape === 'CIRCLE' ? '50%' : '2px'
                    }"
                  ></div>
                  {{ position.marker.name }}
                </button>
              </div>
              <span v-else class="text-muted">{{ t('positions:table.noMarker') }}</span>
            </td>

            <!-- Status -->
            <td class="text-center">
              <span 
                class="badge"
                :class="position.active ? 'bg-success' : 'bg-secondary'"
              >
                {{ position.active ? t('common:active') : t('common:inactive') }}
              </span>
            </td>

            <!-- Actions -->
            <td class="text-center">
              <div class="btn-group btn-group-sm">
                <button
                  class="btn btn-outline-primary"
                  @click="$emit('edit', position)"
                  :title="t('common:edit')"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="btn btn-outline-danger"
                  @click="$emit('delete', position)"
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
      <i class="bi bi-geo-alt display-1 text-muted"></i>
      <h5 class="text-muted mt-3">{{ t('positions:table.noData.title') }}</h5>
      <p class="text-muted">{{ t('positions:table.noData.message') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type IPosition } from '~/model/position.model'
import { type IMarker } from '~/model/marker.model'

// Composables
const { t } = useI18n()

// Props
interface Props {
  positions: IPosition[]
  loading?: boolean
}

defineProps<Props>()

// Emits
defineEmits<{
  edit: [position: IPosition]
  delete: [position: IPosition]
  'view-marker': [marker: IMarker]
}>()
</script>

<style scoped>
.position-table-container {
  position: relative;
}

.balloon-preview {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.balloon-number {
  line-height: 1;
}

.coordinates {
  font-family: 'Courier New', monospace;
}

.marker-preview {
  border: 1px solid #dee2e6;
  display: inline-block;
  flex-shrink: 0;
}

.drawing-info, .sheet-info, .marker-info {
  min-width: 0;
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
  
  .balloon-preview {
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
  }
}
</style>