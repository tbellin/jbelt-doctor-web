<template>
  <div class="admin-archives-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('archives:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('archives:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('archives:page.create') }}
        </button>
        <button
          class="btn btn-outline-secondary"
          @click="handleImport"
        >
          <i class="bi bi-upload me-2"></i>
          {{ t('archives:page.import') }}
        </button>
        <button
          class="btn btn-outline-secondary"
          @click="handleExport"
        >
          <i class="bi bi-download me-2"></i>
          {{ t('archives:page.export') }}
        </button>
      </div>
    </div>

    <!-- Archive Statistics Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-archive fs-2 me-3"></i>
              <div>
                <div class="fs-4 fw-bold">{{ archiveStats.total }}</div>
                <small>{{ t('archives:stats.total') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-file-earmark-code fs-2 me-3"></i>
              <div>
                <div class="fs-4 fw-bold">{{ archiveStats.cad }}</div>
                <small>{{ t('archives:stats.cad') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-file-earmark-image fs-2 me-3"></i>
              <div>
                <div class="fs-4 fw-bold">{{ archiveStats.images }}</div>
                <small>{{ t('archives:stats.images') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-dark">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-hdd fs-2 me-3"></i>
              <div>
                <div class="fs-4 fw-bold">{{ formatFileSize(archiveStats.totalSize) }}</div>
                <small>{{ t('archives:stats.size') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Archives Table -->
    <div class="card">
      <div class="card-body">
        <ArchiveTable
          :archives="archives"
          :loading="loading"
          @view="handleView"
          @edit="handleEdit"
          @delete="handleDelete"
          @download="handleDownload"
          @create="openCreateModal"
          @refresh="loadArchives"
        />
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <EntityModal
      ref="archiveModal"
      :title="modalTitle"
      size="lg"
    >
      <ArchiveForm
        :mode="modalMode"
        :initial-data="selectedArchive"
        @submit="handleSubmit"
        @cancel="closeModal"
      />
    </EntityModal>

    <!-- View Modal -->
    <EntityModal
      ref="viewModal"
      :title="t('archives:modal.view.title')"
      size="lg"
    >
      <div v-if="selectedArchive" class="archive-details">
        <EntityCard
          :data="selectedArchive"
          :fields="viewFields"
        />
        <div v-if="selectedArchive.content" class="mt-3">
          <label class="form-label">{{ t('archives:modal.view.preview') }}</label>
          <div class="file-preview border rounded p-3">
            <div v-if="isTextFile(selectedArchive)" class="text-preview">
              <pre class="mb-0">{{ getFileContent(selectedArchive) }}</pre>
            </div>
            <div v-else-if="isImageFile(selectedArchive)" class="image-preview text-center">
              <img 
                :src="selectedArchive.content" 
                :alt="selectedArchive.fileName"
                class="img-fluid"
                style="max-height: 400px;"
              >
            </div>
            <div v-else class="file-info text-center text-muted">
              <i class="bi bi-file-earmark fs-1"></i>
              <p class="mt-2">{{ t('archives:modal.view.binaryFile') }}</p>
            </div>
          </div>
        </div>
      </div>
    </EntityModal>

    <!-- Delete Confirmation Modal -->
    <EntityModal
      ref="deleteModal"
      :title="t('archives:modal.delete.title')"
      size="sm"
    >
      <div v-if="selectedArchive" class="text-center">
        <i class="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
        <p>{{ t('archives:modal.delete.message', { name: selectedArchive.name }) }}</p>
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
import { type IArchive } from '~/model/archive.model'
import ArchiveTable from '~/components/entities/archive/ArchiveTable.vue'
import ArchiveForm from '~/components/entities/archive/ArchiveForm.vue'
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
const { $api } = useNuxtApp()

// API setup
const archiveAPI = useEntityAPI<IArchive>({
  baseUrl: '/api',
  entityName: 'archives'
})

// Reactive data
const archives = ref<IArchive[]>([])
const selectedArchive = ref<IArchive | null>(null)
const modalMode = ref<'create' | 'edit'>('create')
const loading = ref(false)
const deleting = ref(false)

// Modal refs
const archiveModal = ref()
const viewModal = ref()
const deleteModal = ref()

// Computed
const modalTitle = computed(() => {
  return modalMode.value === 'create' 
    ? t('archives:modal.create.title')
    : t('archives:modal.edit.title')
})

const archiveStats = computed(() => {
  const stats = {
    total: archives.value.length,
    cad: 0,
    images: 0,
    totalSize: 0
  }
  
  archives.value.forEach(archive => {
    if (archive.type === 'CAD') stats.cad++
    if (archive.type === 'IMAGE') stats.images++
    if (archive.fileSize) stats.totalSize += archive.fileSize
  })
  
  return stats
})

const viewFields = computed(() => [
  { key: 'code', label: t('archives:form.fields.code.label') },
  { key: 'name', label: t('archives:form.fields.name.label') },
  { key: 'type', label: t('archives:form.fields.type.label') },
  { key: 'category', label: t('archives:form.fields.category.label') },
  { key: 'fileName', label: t('archives:form.fields.fileName.label') },
  { key: 'extension', label: t('archives:form.fields.extension.label') },
  { key: 'folder', label: t('archives:form.fields.folder.label') },
  { key: 'contentContentType', label: t('archives:form.fields.contentType.label') }
])

// Methods
const loadArchives = async () => {
  loading.value = true
  try {
    const result = await archiveAPI.getAll()
    if (result.success && result.data) {
      archives.value = result.data
    }
  } catch (error) {
    console.error('Error loading archives:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  selectedArchive.value = null
  archiveModal.value?.open()
}

const handleView = (archive: IArchive) => {
  selectedArchive.value = archive
  viewModal.value?.open()
}

const handleEdit = (archive: IArchive) => {
  modalMode.value = 'edit'
  selectedArchive.value = archive
  archiveModal.value?.open()
}

const handleDelete = (archive: IArchive) => {
  selectedArchive.value = archive
  deleteModal.value?.open()
}

const handleSubmit = async (archive: IArchive) => {
  try {
    let result
    if (modalMode.value === 'create') {
      result = await archiveAPI.create(archive)
    } else {
      result = await archiveAPI.update(archive.id!, archive)
    }
    
    if (result.success) {
      closeModal()
      await loadArchives()
      // Show success message
    }
  } catch (error) {
    console.error('Error submitting archive:', error)
  }
}

const confirmDelete = async () => {
  if (!selectedArchive.value) return
  
  deleting.value = true
  try {
    const result = await archiveAPI.remove(selectedArchive.value.id!)
    if (result.success) {
      closeDeleteModal()
      await loadArchives()
      // Show success message
    }
  } catch (error) {
    console.error('Error deleting archive:', error)
  } finally {
    deleting.value = false
  }
}

const handleDownload = async (archive: IArchive) => {
  try {
    const blob = await archiveAPI.downloadFile(archive.id!)
    if (blob) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = archive.fileName || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Error downloading file:', error)
  }
}

const handleImport = () => {
  // TODO: Implement bulk import
  console.log('Import archives')
}

const handleExport = () => {
  // TODO: Implement export
  console.log('Export archives')
}

const closeModal = () => {
  archiveModal.value?.close()
  selectedArchive.value = null
}

const closeDeleteModal = () => {
  deleteModal.value?.close()
  selectedArchive.value = null
}

const isTextFile = (archive: IArchive): boolean => {
  return archive.contentContentType?.startsWith('text/') || false
}

const isImageFile = (archive: IArchive): boolean => {
  return archive.contentContentType?.startsWith('image/') || false
}

const getFileContent = (archive: IArchive): string => {
  if (archive.content && archive.content.startsWith('data:')) {
    try {
      return atob(archive.content.split(',')[1])
    } catch {
      return archive.content
    }
  }
  return archive.content || ''
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Lifecycle
onMounted(() => {
  loadArchives()
})
</script>

<style scoped>
.admin-archives-page {
  padding: 1rem;
}

.file-preview {
  max-height: 400px;
  overflow: auto;
}

.text-preview pre {
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.btn-group .btn {
  border-radius: 0.375rem;
}

.btn-group .btn:not(:first-child) {
  margin-left: 0.5rem;
}
</style>