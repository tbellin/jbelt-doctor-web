<template>
  <div class="admin-items-page">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('items:page.title') }}</h1>
        <p class="text-muted mb-0">{{ t('items:page.description') }}</p>
      </div>
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('items:page.create') }}
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

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">{{ t('items:filters.search') }}</label>
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              :placeholder="t('items:filters.searchPlaceholder')"
            >
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ t('items:filters.type') }}</label>
            <select v-model="selectedTypeFilter" class="form-select">
              <option value="">{{ t('items:filters.allTypes') }}</option>
              <option value="COMPONENT">{{ t('items:types.COMPONENT') }}</option>
              <option value="ASSEMBLY">{{ t('items:types.ASSEMBLY') }}</option>
              <option value="MATERIAL">{{ t('items:types.MATERIAL') }}</option>
              <option value="TOOL">{{ t('items:types.TOOL') }}</option>
              <option value="DOCUMENT">{{ t('items:types.DOCUMENT') }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ t('items:filters.category') }}</label>
            <input
              v-model="selectedCategoryFilter"
              type="text"
              class="form-control"
              :placeholder="t('items:filters.categoryPlaceholder')"
            >
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button
              class="btn btn-outline-secondary w-100"
              @click="clearFilters"
            >
              <i class="bi bi-funnel me-2"></i>
              {{ t('common:clearFilters') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="bi bi-hourglass-split me-2"></i>
          {{ t('common:loading') }}
        </div>
        
        <div v-else-if="filteredItems.length === 0" class="text-center py-4">
          <i class="bi bi-collection fs-1 text-muted"></i>
          <h5 class="mt-3">{{ t('items:table.noData') }}</h5>
          <p class="text-muted">{{ t('items:table.noDataDescription') }}</p>
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-plus-circle me-2"></i>
            {{ t('items:page.create') }}
          </button>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>{{ t('items:table.code') }}</th>
                  <th>{{ t('items:table.name') }}</th>
                  <th>{{ t('items:table.type') }}</th>
                  <th>{{ t('items:table.category') }}</th>
                  <th>{{ t('items:table.values') }}</th>
                  <th>{{ t('common:actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredItems" :key="item.id">
                  <td>
                    <div class="fw-medium font-monospace">{{ item.code || '-' }}</div>
                  </td>
                  <td>
                    <div class="fw-medium">{{ item.name || '-' }}</div>
                    <small v-if="item.description" class="text-muted">
                      {{ item.description }}
                    </small>
                  </td>
                  <td>
                    <span v-if="item.itemType" class="badge bg-primary">
                      {{ getTypeLabel(item.itemType) }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <span v-if="item.category" class="badge bg-info">
                      {{ item.category }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="item-values">
                      <small v-if="item.textValue" class="d-block">
                        <i class="bi bi-text-left me-1"></i>{{ item.textValue }}
                      </small>
                      <small v-if="item.numberValue !== null && item.numberValue !== undefined" class="d-block">
                        <i class="bi bi-123 me-1"></i>{{ item.numberValue }} {{ item.unit || '' }}
                      </small>
                      <small v-if="item.booleanValue !== null && item.booleanValue !== undefined" class="d-block">
                        <i class="bi bi-check-circle me-1"></i>{{ item.booleanValue ? t('common:yes') : t('common:no') }}
                      </small>
                      <small v-if="item.dateValue" class="d-block">
                        <i class="bi bi-calendar me-1"></i>{{ formatDate(item.dateValue) }}
                      </small>
                      <span v-if="!hasValues(item)" class="text-muted">-</span>
                    </div>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        @click="handleEdit(item)"
                        :title="t('common:edit')"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        @click="handleDelete(item)"
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
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('items:form.code') }} *</label>
                    <input
                      v-model="formData.code"
                      type="text"
                      class="form-control"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('items:form.name') }} *</label>
                    <input
                      v-model="formData.name"
                      type="text"
                      class="form-control"
                      required
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('items:form.itemType') }}</label>
                    <select v-model="formData.itemType" class="form-select">
                      <option value="">{{ t('items:form.selectType') }}</option>
                      <option value="COMPONENT">{{ t('items:types.COMPONENT') }}</option>
                      <option value="ASSEMBLY">{{ t('items:types.ASSEMBLY') }}</option>
                      <option value="MATERIAL">{{ t('items:types.MATERIAL') }}</option>
                      <option value="TOOL">{{ t('items:types.TOOL') }}</option>
                      <option value="DOCUMENT">{{ t('items:types.DOCUMENT') }}</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('items:form.category') }}</label>
                    <input
                      v-model="formData.category"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label">{{ t('items:form.description') }}</label>
                    <textarea
                      v-model="formData.description"
                      class="form-control"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('items:form.textValue') }}</label>
                    <input
                      v-model="formData.textValue"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">{{ t('items:form.numberValue') }}</label>
                    <input
                      v-model.number="formData.numberValue"
                      type="number"
                      step="0.01"
                      class="form-control"
                    >
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">{{ t('items:form.unit') }}</label>
                    <input
                      v-model="formData.unit"
                      type="text"
                      class="form-control"
                    >
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="form-check mb-3">
                    <input
                      v-model="formData.booleanValue"
                      class="form-check-input"
                      type="checkbox"
                      id="booleanValue"
                    >
                    <label class="form-check-label" for="booleanValue">
                      {{ t('items:form.booleanValue') }}
                    </label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">{{ t('items:form.dateValue') }}</label>
                    <input
                      v-model="formData.dateValue"
                      type="date"
                      class="form-control"
                    >
                  </div>
                </div>
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
import { Modal } from 'bootstrap'

// Page setup
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin', 'i18n']
})

const { t } = useI18n()
const { $axios } = useNuxtApp()

// Reactive data
const loading = ref(false)
const items = ref([])
const searchTerm = ref('')
const selectedTypeFilter = ref('')
const selectedCategoryFilter = ref('')

// Modal
const modalRef = ref<HTMLElement>()
const modalInstance = ref<Modal>()
const isEditing = ref(false)
const formData = ref({
  id: null,
  code: '',
  name: '',
  itemType: '',
  category: '',
  description: '',
  textValue: '',
  numberValue: null,
  unit: '',
  booleanValue: false,
  dateValue: ''
})

// Computed
const filteredItems = computed(() => {
  let filtered = items.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.code?.toLowerCase().includes(search) ||
      item.name?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.category?.toLowerCase().includes(search)
    )
  }

  if (selectedTypeFilter.value) {
    filtered = filtered.filter(item => item.itemType === selectedTypeFilter.value)
  }

  if (selectedCategoryFilter.value) {
    const categorySearch = selectedCategoryFilter.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.category?.toLowerCase().includes(categorySearch)
    )
  }

  return filtered
})

const modalTitle = computed(() => {
  return isEditing.value ? t('items:form.editTitle') : t('items:form.createTitle')
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    const response = await $axios.get('/api/items')
    items.value = response.data || []
  } catch (error) {
    console.error('Error loading items:', error)
    items.value = []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedTypeFilter.value = ''
  selectedCategoryFilter.value = ''
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    id: null,
    code: '',
    name: '',
    itemType: '',
    category: '',
    description: '',
    textValue: '',
    numberValue: null,
    unit: '',
    booleanValue: false,
    dateValue: ''
  }
  modalInstance.value?.show()
}

const handleEdit = (item) => {
  isEditing.value = true
  formData.value = {
    id: item.id,
    code: item.code || '',
    name: item.name || '',
    itemType: item.itemType || '',
    category: item.category || '',
    description: item.description || '',
    textValue: item.textValue || '',
    numberValue: item.numberValue || null,
    unit: item.unit || '',
    booleanValue: item.booleanValue || false,
    dateValue: item.dateValue || ''
  }
  modalInstance.value?.show()
}

const handleDelete = async (item) => {
  if (!confirm(t('items:confirmDelete', { name: item.name || item.code }))) {
    return
  }

  try {
    await $axios.delete(`/api/items/${item.id}`)
    await refreshData()
  } catch (error) {
    console.error('Error deleting item:', error)
  }
}

const closeModal = () => {
  modalInstance.value?.hide()
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await $axios.put(`/api/items/${formData.value.id}`, formData.value)
    } else {
      await $axios.post('/api/items', formData.value)
    }
    closeModal()
    await refreshData()
  } catch (error) {
    console.error('Error saving item:', error)
  }
}

const getTypeLabel = (type) => {
  return t(`items:types.${type}`) || type
}

const hasValues = (item) => {
  return item.textValue || 
         (item.numberValue !== null && item.numberValue !== undefined) || 
         (item.booleanValue !== null && item.booleanValue !== undefined) || 
         item.dateValue
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(async () => {
  await refreshData()
  
  if (modalRef.value) {
    modalInstance.value = new Modal(modalRef.value)
  }
})
</script>

<style scoped>
.admin-items-page {
  padding: 1rem;
}

.item-values {
  max-width: 200px;
}

.item-values small {
  font-size: 0.75rem;
  line-height: 1.2;
}
</style>