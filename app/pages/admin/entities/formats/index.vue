<template>
  <div class="admin-formats-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('formats:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('formats:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('formats:page.create') }}
        </button>
        <button
          class="btn btn-outline-secondary"
          @click="createStandardFormats"
        >
          <i class="bi bi-grid me-2"></i>
          {{ t('formats:page.createStandard') }}
        </button>
      </div>
    </div>

    <!-- Format Statistics Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-grid-3x3 fs-2 me-3"></i>
              <div>
                <div class="fs-4 fw-bold">{{ formatStats.total }}</div>
                <small>{{ t('formats:stats.total') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-check-circle fs-2 me-3"></i>
              <div>
                <div class="fs-4 fw-bold">{{ formatStats.din }}</div>
                <small>{{ t('formats:stats.din') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-file-earmark fs-2 me-3"></i>
              <div>
                <div class="fs-4 fw-bold">{{ formatStats.withFiles }}</div>
                <small>{{ t('formats:stats.withFiles') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-dark">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-grid fs-2 me-3"></i>
              <div>
                <div class="fs-4 fw-bold">{{ formatStats.withGrid }}</div>
                <small>{{ t('formats:stats.withGrid') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Format Preview Gallery -->
    <div class="row g-3 mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-eye me-2"></i>
              {{ t('formats:page.gallery.title') }}
            </h5>
          </div>
          <div class="card-body">
            <div class="format-gallery">
              <div 
                v-for="format in formats.slice(0, 6)" 
                :key="format.id"
                class="format-preview-card"
                @click="handleView(format)"
              >
                <div class="preview-container">
                  <div 
                    class="format-preview"
                    :style="getPreviewStyle(format)"
                  >
                    <div class="format-label">{{ format.formatType }}</div>
                    <div class="format-dimensions">
                      {{ format.dimX }}×{{ format.dimY }}mm
                    </div>
                  </div>
                </div>
                <div class="format-info">
                  <small class="fw-medium">{{ format.code }}</small>
                  <br>
                  <small class="text-muted">{{ format.name }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Formats Table -->
    <div class="card">
      <div class="card-body">
        <FormatTable
          :formats="formats"
          :loading="loading"
          @view="handleView"
          @edit="handleEdit"
          @delete="handleDelete"
          @copy="handleCopy"
          @create="openCreateModal"
          @refresh="loadFormats"
        />
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <EntityModal
      ref="formatModal"
      :title="modalTitle"
      size="lg"
    >
      <FormatForm
        :mode="modalMode"
        :initial-data="selectedFormat"
        @submit="handleSubmit"
        @cancel="closeModal"
      />
    </EntityModal>

    <!-- View Modal -->
    <EntityModal
      ref="viewModal"
      :title="t('formats:modal.view.title')"
      size="lg"
    >
      <div v-if="selectedFormat" class="format-details">
        <div class="row">
          <div class="col-md-6">
            <EntityCard
              :data="selectedFormat"
              :fields="viewFields"
            />
          </div>
          <div class="col-md-6">
            <div class="format-visual-preview">
              <label class="form-label">{{ t('formats:modal.view.preview') }}</label>
              <div class="d-flex justify-content-center">
                <div 
                  class="format-large-preview border border-primary border-2 bg-white position-relative"
                  :style="getLargePreviewStyle(selectedFormat)"
                >
                  <div class="position-absolute top-0 start-0 p-2">
                    <span class="badge bg-primary">{{ selectedFormat.formatType }}</span>
                  </div>
                  <div class="position-absolute bottom-0 end-0 p-2">
                    <small class="text-muted">
                      {{ selectedFormat.dimX }}×{{ selectedFormat.dimY }}mm
                    </small>
                  </div>
                  <!-- Grid overlay if specified -->
                  <svg 
                    v-if="selectedFormat.nColumns || selectedFormat.nRows"
                    class="position-absolute top-0 start-0 w-100 h-100"
                    :viewBox="`0 0 ${previewWidth} ${previewHeight}`"
                  >
                    <!-- Grid lines -->
                    <line
                      v-for="i in (selectedFormat.nColumns || 1)"
                      :key="`v-${i}`"
                      :x1="(i * previewWidth) / (selectedFormat.nColumns || 1)"
                      y1="0"
                      :x2="(i * previewWidth) / (selectedFormat.nColumns || 1)"
                      :y2="previewHeight"
                      stroke="#dee2e6"
                      stroke-width="1"
                    />
                    <line
                      v-for="i in (selectedFormat.nRows || 1)"
                      :key="`h-${i}`"
                      x1="0"
                      :y1="(i * previewHeight) / (selectedFormat.nRows || 1)"
                      :x2="previewWidth"
                      :y2="(i * previewHeight) / (selectedFormat.nRows || 1)"
                      stroke="#dee2e6"
                      stroke-width="1"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EntityModal>

    <!-- Delete Confirmation Modal -->
    <EntityModal
      ref="deleteModal"
      :title="t('formats:modal.delete.title')"
      size="sm"
    >
      <div v-if="selectedFormat" class="text-center">
        <i class="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
        <p>{{ t('formats:modal.delete.message', { name: selectedFormat.name }) }}</p>
        <div class="d-flex gap-2 justify-content-center">
          <button class="btn btn-secondary" @click="closeDeleteModal">
            {{ t('common:cancel') }}
          </button>
          <button class="btn btn-danger" @click="confirmDelete" :disabled="deleting">
            <i v-if="deleting" class="bi bi-spinner-border me-2"></i>
            {{ t('common:delete') }}
          </button>
        </div>
      </div>
    </EntityModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { type IFormat } from '~/model/format.model'
import FormatTable from '~/components/entities/format/FormatTable.vue'
import FormatForm from '~/components/entities/format/FormatForm.vue'
import EntityModal from '~/components/entities/shared/EntityModal.vue'
import EntityCard from '~/components/entities/shared/EntityCard.vue'
import { useEntityAPI } from '~/components/entities/shared/composables/useEntityAPI'

// Page meta
definePageMeta({
  middleware: 'admin',
  layout: 'dashboard'
})

// Composables
const { t } = useI18n()

// API setup
const formatAPI = useEntityAPI<IFormat>({
  baseUrl: '/api',
  entityName: 'formats'
})

// Reactive data
const formats = ref<IFormat[]>([])
const selectedFormat = ref<IFormat | null>(null)
const modalMode = ref<'create' | 'edit'>('create')
const loading = ref(false)
const deleting = ref(false)

// Modal refs
const formatModal = ref()
const viewModal = ref()
const deleteModal = ref()

// Constants
const previewWidth = 400
const previewHeight = 300

// Computed
const modalTitle = computed(() => {
  return modalMode.value === 'create' 
    ? t('formats:modal.create.title')
    : t('formats:modal.edit.title')
})

const formatStats = computed(() => {
  const stats = {
    total: formats.value.length,
    din: 0,
    withFiles: 0,
    withGrid: 0
  }
  
  formats.value.forEach(format => {
    if (format.formatType?.startsWith('A')) stats.din++
    if (format.file) stats.withFiles++
    if ((format.nColumns && format.nColumns > 1) || (format.nRows && format.nRows > 1)) stats.withGrid++
  })
  
  return stats
})

const viewFields = computed(() => [
  { key: 'code', label: t('formats:form.fields.code.label') },
  { key: 'name', label: t('formats:form.fields.name.label') },
  { key: 'creoId', label: t('formats:form.fields.creoId.label') },
  { key: 'formatType', label: t('formats:form.fields.formatType.label') },
  { key: 'nColumns', label: t('formats:form.fields.nColumns.label') },
  { key: 'nRows', label: t('formats:form.fields.nRows.label') },
  { key: 'dimX', label: t('formats:form.fields.dimX.label') },
  { key: 'dimY', label: t('formats:form.fields.dimY.label') }
])

// Methods
const loadFormats = async () => {
  loading.value = true
  try {
    const result = await formatAPI.getAll()
    if (result.success && result.data) {
      formats.value = result.data
    }
  } catch (error) {
    console.error('Error loading formats:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  selectedFormat.value = null
  formatModal.value?.open()
}

const handleView = (format: IFormat) => {
  selectedFormat.value = format
  viewModal.value?.open()
}

const handleEdit = (format: IFormat) => {
  modalMode.value = 'edit'
  selectedFormat.value = format
  formatModal.value?.open()
}

const handleCopy = (format: IFormat) => {
  modalMode.value = 'create'
  selectedFormat.value = {
    ...format,
    id: undefined,
    code: format.code + '_COPY',
    name: format.name + ' (Copy)'
  }
  formatModal.value?.open()
}

const handleDelete = (format: IFormat) => {
  selectedFormat.value = format
  deleteModal.value?.open()
}

const handleSubmit = async (format: IFormat) => {
  try {
    let result
    if (modalMode.value === 'create') {
      result = await formatAPI.create(format)
    } else {
      result = await formatAPI.update(format.id!, format)
    }
    
    if (result.success) {
      closeModal()
      await loadFormats()
    }
  } catch (error) {
    console.error('Error submitting format:', error)
  }
}

const confirmDelete = async () => {
  if (!selectedFormat.value) return
  
  deleting.value = true
  try {
    const result = await formatAPI.remove(selectedFormat.value.id!)
    if (result.success) {
      closeDeleteModal()
      await loadFormats()
    }
  } catch (error) {
    console.error('Error deleting format:', error)
  } finally {
    deleting.value = false
  }
}

const createStandardFormats = async () => {
  const standardFormats = [
    { code: 'A0', name: 'A0 Format', formatType: 'A0', dimX: 841, dimY: 1189 },
    { code: 'A1', name: 'A1 Format', formatType: 'A1', dimX: 594, dimY: 841 },
    { code: 'A2', name: 'A2 Format', formatType: 'A2', dimX: 420, dimY: 594 },
    { code: 'A3V', name: 'A3 Vertical', formatType: 'A3V', dimX: 297, dimY: 420 },
    { code: 'A3O', name: 'A3 Horizontal', formatType: 'A3O', dimX: 420, dimY: 297 },
    { code: 'A4V', name: 'A4 Vertical', formatType: 'A4V', dimX: 210, dimY: 297 },
    { code: 'A4O', name: 'A4 Horizontal', formatType: 'A4O', dimX: 297, dimY: 210 }
  ]
  
  try {
    const result = await formatAPI.createBatch(standardFormats)
    if (result.success) {
      await loadFormats()
    }
  } catch (error) {
    console.error('Error creating standard formats:', error)
  }
}

const getPreviewStyle = (format: IFormat) => {
  const ratio = (format.dimY || 200) / (format.dimX || 200)
  const width = 120
  const height = width * ratio
  
  return {
    width: `${width}px`,
    height: `${Math.min(height, 160)}px`,
    border: '2px solid #0d6efd'
  }
}

const getLargePreviewStyle = (format: IFormat) => {
  const ratio = (format.dimY || 200) / (format.dimX || 200)
  const width = previewWidth
  const height = width * ratio
  
  return {
    width: `${width}px`,
    height: `${Math.min(height, previewHeight)}px`
  }
}

const closeModal = () => {
  formatModal.value?.close()
  selectedFormat.value = null
}

const closeDeleteModal = () => {
  deleteModal.value?.close()
  selectedFormat.value = null
}

// Lifecycle
onMounted(() => {
  loadFormats()
})
</script>

<style scoped>
.admin-formats-page {
  padding: 1rem;
}

.format-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.format-preview-card {
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.format-preview-card:hover {
  transform: translateY(-2px);
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  margin-bottom: 0.5rem;
}

.format-preview {
  background: white;
  border-radius: 0.375rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.format-label {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 0.7rem;
  background: #0d6efd;
  color: white;
  padding: 2px 6px;
  border-radius: 0.25rem;
}

.format-dimensions {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 0.6rem;
  color: #6c757d;
}

.format-large-preview {
  border-radius: 0.5rem;
  min-height: 200px;
}

.format-visual-preview {
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style>