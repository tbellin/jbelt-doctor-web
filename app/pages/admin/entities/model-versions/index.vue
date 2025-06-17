<template>
  <div class="admin-model-versions-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('modelVersions:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('modelVersions:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('modelVersions:page.create') }}
        </button>
        <button
          class="btn btn-outline-secondary"
          @click="refreshData"
          :disabled="loading"
        >
          <i class="bi bi-arrow-clockwise me-2"></i>
          {{ t('common:refresh') }}
        </button>
      </div>
    </div>

    <!-- Model Versions Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="bi bi-spinner-border"></i>
          {{ t('common:loading') }}
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{{ t('modelVersions:form.fields.versionNumber.label') }}</th>
                  <th>{{ t('modelVersions:form.fields.name.label') }}</th>
                  <th>{{ t('modelVersions:form.fields.status.label') }}</th>
                  <th>{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="modelVersions.length === 0">
                  <td colspan="5" class="text-center text-muted">
                    {{ t('modelVersions:table.noData') }}
                  </td>
                </tr>
                <tr v-for="version in modelVersions" :key="version.id">
                  <td>{{ version.id }}</td>
                  <td>{{ version.versionNumber }}</td>
                  <td>{{ version.name }}</td>
                  <td>
                    <span class="badge bg-secondary">{{ version.status || 'DRAFT' }}</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="handleEdit(version)"
                        :title="t('common:edit')"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="handleDelete(version)"
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
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" ref="modalRef" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modalTitle }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">{{ t('modelVersions:form.fields.versionNumber.label') }}</label>
                <input
                  v-model="formData.versionNumber"
                  type="text"
                  class="form-control"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">{{ t('modelVersions:form.fields.name.label') }}</label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="form-control"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">{{ t('modelVersions:form.fields.comments.label') }}</label>
                <textarea
                  v-model="formData.comments"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" @click="closeModal">
                  {{ t('common:cancel') }}
                </button>
                <button type="submit" class="btn btn-primary">
                  {{ t('common:save') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { type IModelVersion } from '~/model/model-version.model'

// Page meta
definePageMeta({
  middleware: 'admin',
  layout: 'dashboard'
})

// Composables
const { t } = useI18n()

// Reactive data
const modelVersions = ref<IModelVersion[]>([])
const selectedVersion = ref<IModelVersion | null>(null)
const modalMode = ref<'create' | 'edit'>('create')
const loading = ref(false)
const modalRef = ref()

const formData = ref({
  id: undefined,
  versionNumber: '',
  name: '',
  comments: '',
  status: 'DRAFT'
})

// Computed
const modalTitle = computed(() => {
  return modalMode.value === 'create' 
    ? t('modelVersions:modal.create.title')
    : t('modelVersions:modal.edit.title')
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    // Mock data - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500))
    modelVersions.value = []
  } catch (error) {
    console.error('Error loading model versions:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  selectedVersion.value = null
  formData.value = {
    id: undefined,
    versionNumber: '',
    name: '',
    comments: '',
    status: 'DRAFT'
  }
  
  if (modalRef.value) {
    const modal = new (window as any).bootstrap.Modal(modalRef.value)
    modal.show()
  }
}

const handleEdit = (version: IModelVersion) => {
  modalMode.value = 'edit'
  selectedVersion.value = version
  formData.value = { ...version }
  
  if (modalRef.value) {
    const modal = new (window as any).bootstrap.Modal(modalRef.value)
    modal.show()
  }
}

const handleDelete = async (version: IModelVersion) => {
  if (confirm(t('common:confirm'))) {
    try {
      // Remove from local array
      const index = modelVersions.value.findIndex(v => v.id === version.id)
      if (index > -1) {
        modelVersions.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Error deleting model version:', error)
    }
  }
}

const handleSubmit = async () => {
  try {
    if (modalMode.value === 'create') {
      // Add to local array
      const newVersion = {
        ...formData.value,
        id: Date.now() // Mock ID
      }
      modelVersions.value.push(newVersion)
    } else {
      // Update in local array
      const index = modelVersions.value.findIndex(v => v.id === formData.value.id)
      if (index > -1) {
        modelVersions.value[index] = { ...formData.value }
      }
    }
    closeModal()
  } catch (error) {
    console.error('Error submitting model version:', error)
  }
}

const closeModal = () => {
  if (modalRef.value) {
    const modal = (window as any).bootstrap.Modal.getInstance(modalRef.value)
    if (modal) {
      modal.hide()
    }
  }
  selectedVersion.value = null
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.admin-model-versions-page {
  padding: 1rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}
</style>