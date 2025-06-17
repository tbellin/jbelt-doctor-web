<!-- app/pages/admin/entities/positions/index.vue -->
<template>
  <div class="admin-positions-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('positions:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('positions:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
          :disabled="loading"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('positions:page.create') }}
        </button>
        <button
          class="btn btn-outline-secondary"
          @click="refreshData"
          :disabled="loading"
        >
          <i class="bi bi-arrow-clockwise me-2" :class="{ 'fa-spin': loading }"></i>
          {{ t('common:refresh') }}
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card border-0 bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">{{ t('positions:stats.total') }}</h6>
                <h4 class="mb-0">{{ positions.length }}</h4>
              </div>
              <i class="bi bi-geo-alt-fill fs-1 opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">{{ t('positions:stats.active') }}</h6>
                <h4 class="mb-0">{{ activePositions }}</h4>
              </div>
              <i class="bi bi-check-circle-fill fs-1 opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">{{ t('positions:stats.withCoordinates') }}</h6>
                <h4 class="mb-0">{{ positionsWithCoordinates }}</h4>
              </div>
              <i class="bi bi-bullseye fs-1 opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">{{ t('positions:stats.withMarkers') }}</h6>
                <h4 class="mb-0">{{ positionsWithMarkers }}</h4>
              </div>
              <i class="bi bi-bookmark-fill fs-1 opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="card border-0 bg-light mb-4">
      <div class="card-body py-3">
        <div class="row g-3 align-items-center">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                :placeholder="t('positions:search.placeholder')"
              >
            </div>
          </div>
          <div class="col-md-2">
            <select v-model="selectedDrawing" class="form-select">
              <option value="">{{ t('positions:filters.drawing.all') }}</option>
              <option v-for="drawing in drawings" :key="drawing.id" :value="drawing.id">
                {{ drawing.fileName }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="selectedSheet" class="form-select">
              <option value="">{{ t('positions:filters.sheet.all') }}</option>
              <option v-for="sheet in sheets" :key="sheet.id" :value="sheet.id">
                {{ sheet.name }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="showActive" class="form-select">
              <option value="">{{ t('positions:filters.status.all') }}</option>
              <option value="true">{{ t('positions:filters.status.active') }}</option>
              <option value="false">{{ t('positions:filters.status.inactive') }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <button
              class="btn btn-outline-secondary w-100"
              @click="clearFilters"
            >
              <i class="bi bi-x-circle me-2"></i>
              {{ t('common:clear') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Positions Table -->
    <div class="card">
      <div class="card-header bg-transparent">
        <div class="d-flex justify-content-between align-items-center">
          <h6 class="mb-0">
            <i class="bi bi-geo-alt me-2"></i>
            {{ t('positions:table.title') }}
          </h6>
          <small class="text-muted">
            {{ t('common:showing') }} {{ filteredPositions.length }} {{ t('common:of') }} {{ positions.length }}
          </small>
        </div>
      </div>
      <div class="card-body p-0">
        <PositionTable
          :positions="filteredPositions"
          :loading="loading"
          @edit="openEditModal"
          @delete="confirmDelete"
          @view-marker="viewMarker"
        />
      </div>
    </div>

    <!-- Position Form Modal -->
    <PositionModal
      v-if="showModal"
      :mode="modalMode"
      :position="selectedPosition"
      :drawings="drawings"
      :sheets="sheets"
      :markers="markers"
      @save="handleSave"
      @close="closeModal"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      v-if="showDeleteModal"
      :item-name="positionToDelete?.balloonNumber || 'position'"
      :item-type="t('positions:common.position')"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />

    <!-- Marker View Modal -->
    <MarkerViewModal
      v-if="showMarkerModal"
      :marker="selectedMarker"
      @close="showMarkerModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { type IPosition } from '~/model/position.model'
import { type ISheet } from '~/model/sheet.model'
import { type IMarker } from '~/model/marker.model'

// Temporary interface until drawing.model is created
interface IDrawing {
  id?: number
  fileName?: string
}

// Layout and Auth
definePageMeta({
  middleware: 'admin',
  layout: 'dashboard'
})

// Composables
const { t } = useI18n()
const { $api } = useNuxtApp()

// Reactive Data
const positions = ref<IPosition[]>([])
const drawings = ref<IDrawing[]>([])
const sheets = ref<ISheet[]>([])
const markers = ref<IMarker[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedDrawing = ref('')
const selectedSheet = ref('')
const showActive = ref('')

// Modal State
const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedPosition = ref<IPosition | null>(null)
const showDeleteModal = ref(false)
const positionToDelete = ref<IPosition | null>(null)
const showMarkerModal = ref(false)
const selectedMarker = ref<IMarker | null>(null)

// Computed
const filteredPositions = computed(() => {
  let filtered = [...positions.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(position =>
      position.balloonNumber?.toLowerCase().includes(query) ||
      position.description?.toLowerCase().includes(query) ||
      position.drawingFileName?.toLowerCase().includes(query)
    )
  }

  // Drawing filter
  if (selectedDrawing.value) {
    filtered = filtered.filter(position => position.drawing?.id === Number(selectedDrawing.value))
  }

  // Sheet filter
  if (selectedSheet.value) {
    filtered = filtered.filter(position => position.sheet?.id === Number(selectedSheet.value))
  }

  // Status filter
  if (showActive.value) {
    const isActive = showActive.value === 'true'
    filtered = filtered.filter(position => position.active === isActive)
  }

  return filtered
})

const activePositions = computed(() => positions.value.filter(p => p.active).length)
const positionsWithCoordinates = computed(() => 
  positions.value.filter(p => p.xCoordinate !== null && p.yCoordinate !== null).length
)
const positionsWithMarkers = computed(() => 
  positions.value.filter(p => p.marker !== null).length
)

// Methods
const loadPositions = async () => {
  loading.value = true
  try {
    const response = await $api.get('/api/positions')
    positions.value = response.data || []
  } catch (error) {
    console.error('Error loading positions:', error)
    // Handle error notification
  } finally {
    loading.value = false
  }
}

const loadDrawings = async () => {
  try {
    const response = await $api.get('/api/drawings')
    drawings.value = response.data || []
  } catch (error) {
    console.error('Error loading drawings:', error)
  }
}

const loadSheets = async () => {
  try {
    const response = await $api.get('/api/sheets')
    sheets.value = response.data || []
  } catch (error) {
    console.error('Error loading sheets:', error)
  }
}

const loadMarkers = async () => {
  try {
    const response = await $api.get('/api/markers')
    markers.value = response.data || []
  } catch (error) {
    console.error('Error loading markers:', error)
  }
}

const refreshData = async () => {
  await Promise.all([
    loadPositions(),
    loadDrawings(),
    loadSheets(),
    loadMarkers()
  ])
}

const openCreateModal = () => {
  selectedPosition.value = null
  modalMode.value = 'create'
  showModal.value = true
}

const openEditModal = (position: IPosition) => {
  selectedPosition.value = { ...position }
  modalMode.value = 'edit'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedPosition.value = null
}

const handleSave = async (positionData: IPosition) => {
  loading.value = true
  try {
    if (modalMode.value === 'create') {
      await $api.post('/api/positions', positionData)
    } else {
      await $api.put(`/api/positions/${positionData.id}`, positionData)
    }
    await loadPositions()
    closeModal()
  } catch (error) {
    console.error('Error saving position:', error)
    // Handle error notification
  } finally {
    loading.value = false
  }
}

const confirmDelete = (position: IPosition) => {
  positionToDelete.value = position
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!positionToDelete.value) return

  loading.value = true
  try {
    await $api.delete(`/api/positions/${positionToDelete.value.id}`)
    await loadPositions()
    showDeleteModal.value = false
    positionToDelete.value = null
  } catch (error) {
    console.error('Error deleting position:', error)
    // Handle error notification
  } finally {
    loading.value = false
  }
}

const viewMarker = (marker: IMarker) => {
  selectedMarker.value = marker
  showMarkerModal.value = true
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedDrawing.value = ''
  selectedSheet.value = ''
  showActive.value = ''
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.admin-positions-page {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.btn-group .btn {
  border-color: rgba(0, 0, 0, 0.125);
}

.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>