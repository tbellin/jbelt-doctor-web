<!-- app/pages/admin/entities/markers/index.vue -->
<template>
  <div class="admin-markers-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('markers:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('markers:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
          :disabled="loading"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('markers:page.create') }}
        </button>
        <button
          class="btn btn-outline-secondary"
          @click="refreshData"
          :disabled="loading"
        >
          <i class="bi bi-arrow-clockwise me-2" :class="{ 'fa-spin': loading }"></i>
          {{ t('common:refresh') }}
        </button>
        <button
          class="btn btn-outline-info"
          @click="openSymbolLibrary"
        >
          <i class="bi bi-collection me-2"></i>
          {{ t('markers:page.symbolLibrary') }}
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
                <h6 class="card-title mb-0">{{ t('markers:stats.total') }}</h6>
                <h4 class="mb-0">{{ markers.length }}</h4>
              </div>
              <i class="bi bi-bookmark-fill fs-1 opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">{{ t('markers:stats.balloonEnabled') }}</h6>
                <h4 class="mb-0">{{ balloonsEnabledCount }}</h4>
              </div>
              <i class="bi bi-chat-dots-fill fs-1 opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">{{ t('markers:stats.annotationEnabled') }}</h6>
                <h4 class="mb-0">{{ annotationsEnabledCount }}</h4>
              </div>
              <i class="bi bi-pencil-fill fs-1 opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">{{ t('markers:stats.byType') }}</h6>
                <h4 class="mb-0">{{ uniqueTypesCount }}</h4>
              </div>
              <i class="bi bi-tags-fill fs-1 opacity-75"></i>
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
                :placeholder="t('markers:search.placeholder')"
              >
            </div>
          </div>
          <div class="col-md-2">
            <select v-model="selectedType" class="form-select">
              <option value="">{{ t('markers:filters.type.all') }}</option>
              <option v-for="type in markerTypes" :key="type" :value="type">
                {{ t(`markers:types.${type}`) }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="selectedShape" class="form-select">
              <option value="">{{ t('markers:filters.shape.all') }}</option>
              <option v-for="shape in markerShapes" :key="shape" :value="shape">
                {{ t(`markers:shapes.${shape}`) }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="usageFilter" class="form-select">
              <option value="">{{ t('markers:filters.usage.all') }}</option>
              <option value="balloons">{{ t('markers:filters.usage.balloons') }}</option>
              <option value="annotations">{{ t('markers:filters.usage.annotations') }}</option>
              <option value="both">{{ t('markers:filters.usage.both') }}</option>
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

    <!-- View Toggle -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="btn-group btn-group-sm">
        <button
          class="btn"
          :class="viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'"
          @click="viewMode = 'grid'"
        >
          <i class="bi bi-grid-3x3-gap me-1"></i>
          {{ t('common:grid') }}
        </button>
        <button
          class="btn"
          :class="viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'"
          @click="viewMode = 'table'"
        >
          <i class="bi bi-list me-1"></i>
          {{ t('common:table') }}
        </button>
      </div>
      <small class="text-muted">
        {{ t('common:showing') }} {{ filteredMarkers.length }} {{ t('common:of') }} {{ markers.length }}
      </small>
    </div>

    <!-- Markers Display -->
    <div class="card">
      <div class="card-body p-0">
        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="p-3">
          <div class="row g-3">
            <div v-for="marker in paginatedMarkers" :key="marker.id" class="col-lg-3 col-md-4 col-sm-6">
              <MarkerCard
                :marker="marker"
                @edit="openEditModal"
                @delete="confirmDelete"
                @preview="previewMarker"
              />
            </div>
          </div>
        </div>

        <!-- Table View -->
        <MarkerTable
          v-else
          :markers="paginatedMarkers"
          :loading="loading"
          @edit="openEditModal"
          @delete="confirmDelete"
          @preview="previewMarker"
        />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="card-footer bg-transparent">
        <nav aria-label="Markers pagination">
          <ul class="pagination justify-content-center mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                <i class="bi bi-chevron-double-left"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
              <button class="page-link" @click="currentPage = page">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
                <i class="bi bi-chevron-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="filteredMarkers.length === 0 && !loading" class="text-center py-5">
      <i class="bi bi-bookmark display-1 text-muted"></i>
      <h4 class="text-muted mt-3">{{ t('markers:noResults.title') }}</h4>
      <p class="text-muted">{{ t('markers:noResults.message') }}</p>
      <button class="btn btn-outline-primary" @click="clearFilters">
        <i class="bi bi-arrow-clockwise me-2"></i>
        {{ t('common:clearFilters') }}
      </button>
    </div>

    <!-- Marker Form Modal -->
    <MarkerModal
      v-if="showModal"
      :mode="modalMode"
      :marker="selectedMarker"
      :archives="archives"
      @save="handleSave"
      @close="closeModal"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      v-if="showDeleteModal"
      :item-name="markerToDelete?.name || 'marker'"
      :item-type="t('markers:common.marker')"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />

    <!-- Symbol Library Modal -->
    <SymbolLibraryModal
      v-if="showSymbolLibrary"
      @select="handleSymbolSelect"
      @close="showSymbolLibrary = false"
    />

    <!-- Marker Preview Modal -->
    <MarkerPreviewModal
      v-if="showPreviewModal"
      :marker="selectedPreviewMarker"
      @close="showPreviewModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { type IMarker } from '~/model/marker.model'
import { type IArchive } from '~/model/archive.model'
import { MarkerType } from '~/model/enumerations/marker-type.model'
import { Shape } from '~/model/enumerations/shape.model'

// Layout and Auth
definePageMeta({
  middleware: 'admin',
  layout: 'dashboard'
})

// Composables
const { t } = useI18n()
const { $api } = useNuxtApp()

// Reactive Data
const markers = ref<IMarker[]>([])
const archives = ref<IArchive[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedType = ref('')
const selectedShape = ref('')
const usageFilter = ref('')
const viewMode = ref<'grid' | 'table'>('grid')
const currentPage = ref(1)
const itemsPerPage = ref(12)

// Modal State
const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedMarker = ref<IMarker | null>(null)
const showDeleteModal = ref(false)
const markerToDelete = ref<IMarker | null>(null)
const showSymbolLibrary = ref(false)
const showPreviewModal = ref(false)
const selectedPreviewMarker = ref<IMarker | null>(null)

// Constants
const markerTypes = computed(() => Object.values(MarkerType))
const markerShapes = computed(() => Object.values(Shape))

// Computed
const filteredMarkers = computed(() => {
  let filtered = [...markers.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(marker =>
      marker.name?.toLowerCase().includes(query) ||
      marker.code?.toLowerCase().includes(query) ||
      marker.description?.toLowerCase().includes(query) ||
      marker.symbol?.toLowerCase().includes(query)
    )
  }

  // Type filter
  if (selectedType.value) {
    filtered = filtered.filter(marker => marker.markerType === selectedType.value)
  }

  // Shape filter
  if (selectedShape.value) {
    filtered = filtered.filter(marker => marker.shape === selectedShape.value)
  }

  // Usage filter
  if (usageFilter.value) {
    switch (usageFilter.value) {
      case 'balloons':
        filtered = filtered.filter(marker => marker.useInBalloons)
        break
      case 'annotations':
        filtered = filtered.filter(marker => marker.useInAnnotations)
        break
      case 'both':
        filtered = filtered.filter(marker => marker.useInBalloons && marker.useInAnnotations)
        break
    }
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredMarkers.value.length / itemsPerPage.value))

const paginatedMarkers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredMarkers.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const balloonsEnabledCount = computed(() => 
  markers.value.filter(m => m.useInBalloons).length
)

const annotationsEnabledCount = computed(() => 
  markers.value.filter(m => m.useInAnnotations).length
)

const uniqueTypesCount = computed(() => 
  new Set(markers.value.map(m => m.markerType).filter(Boolean)).size
)

// Methods
const loadMarkers = async () => {
  loading.value = true
  try {
    const response = await $api.get('/api/markers')
    markers.value = response.data || []
  } catch (error) {
    console.error('Error loading markers:', error)
    // Handle error notification
  } finally {
    loading.value = false
  }
}

const loadArchives = async () => {
  try {
    const response = await $api.get('/api/archives')
    archives.value = response.data || []
  } catch (error) {
    console.error('Error loading archives:', error)
  }
}

const refreshData = async () => {
  await Promise.all([
    loadMarkers(),
    loadArchives()
  ])
}

const openCreateModal = () => {
  selectedMarker.value = null
  modalMode.value = 'create'
  showModal.value = true
}

const openEditModal = (marker: IMarker) => {
  selectedMarker.value = { ...marker }
  modalMode.value = 'edit'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedMarker.value = null
}

const handleSave = async (markerData: IMarker) => {
  loading.value = true
  try {
    if (modalMode.value === 'create') {
      await $api.post('/api/markers', markerData)
    } else {
      await $api.put(`/api/markers/${markerData.id}`, markerData)
    }
    await loadMarkers()
    closeModal()
  } catch (error) {
    console.error('Error saving marker:', error)
    // Handle error notification
  } finally {
    loading.value = false
  }
}

const confirmDelete = (marker: IMarker) => {
  markerToDelete.value = marker
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!markerToDelete.value) return

  loading.value = true
  try {
    await $api.delete(`/api/markers/${markerToDelete.value.id}`)
    await loadMarkers()
    showDeleteModal.value = false
    markerToDelete.value = null
  } catch (error) {
    console.error('Error deleting marker:', error)
    // Handle error notification
  } finally {
    loading.value = false
  }
}

const previewMarker = (marker: IMarker) => {
  selectedPreviewMarker.value = marker
  showPreviewModal.value = true
}

const openSymbolLibrary = () => {
  showSymbolLibrary.value = true
}

const handleSymbolSelect = (symbol: string) => {
  // Handle symbol selection from library
  showSymbolLibrary.value = false
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedType.value = ''
  selectedShape.value = ''
  usageFilter.value = ''
  currentPage.value = 1
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.admin-markers-page {
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

.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.pagination .page-link {
  border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}
</style>