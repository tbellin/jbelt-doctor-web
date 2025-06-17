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
          @click="handleImport"
        >
          <i class="bi bi-upload me-2"></i>
          {{ t('items:page.import') }}
        </button>
        <div class="btn-group">
          <button
            class="btn"
            :class="viewMode === 'table' ? 'btn-info' : 'btn-outline-info'"
            @click="setViewMode('table')"
          >
            <i class="bi bi-table me-1"></i>
            {{ t('items:page.viewModes.table') }}
          </button>
          <button
            class="btn"
            :class="viewMode === 'tree' ? 'btn-info' : 'btn-outline-info'"
            @click="setViewMode('tree')"
          >
            <i class="bi bi-diagram-3 me-1"></i>
            {{ t('items:page.viewModes.tree') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Item Statistics Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-2">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-collection fs-2 me-2"></i>
              <div>
                <div class="fs-4 fw-bold">{{ itemStats.total }}</div>
                <small>{{ t('items:stats.total') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-gear fs-2 me-2"></i>
              <div>
                <div class="fs-4 fw-bold">{{ itemStats.components }}</div>
                <small>{{ t('items:stats.components') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-boxes fs-2 me-2"></i>
              <div>
                <div class="fs-4 fw-bold">{{ itemStats.assemblies }}</div>
                <small>{{ t('items:stats.assemblies') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card bg-warning text-dark">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-layers fs-2 me-2"></i>
              <div>
                <div class="fs-4 fw-bold">{{ itemStats.materials }}</div>
                <small>{{ t('items:stats.materials') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card bg-secondary text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-tools fs-2 me-2"></i>
              <div>
                <div class="fs-4 fw-bold">{{ itemStats.tools }}</div>
                <small>{{ t('items:stats.tools') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card bg-dark text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-file-earmark-text fs-2 me-2"></i>
              <div>
                <div class="fs-4 fw-bold">{{ itemStats.documents }}</div>
                <small>{{ t('items:stats.documents') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Items Content -->
    <div class="card">
      <div class="card-body">
        <div v-if="viewMode === 'table'">
          <ItemTable
            :items="items"
            :loading="loading"
            :view-mode="viewMode"
            @view="handleView"
            @edit="handleEdit"
            @delete="handleDelete"
            @copy="handleCopy"
            @view-children="handleViewChildren"
            @create="openCreateModal"
            @import="handleImport"
            @refresh="loadItems"
            @set-view-mode="setViewMode"
          />
        </div>
        <div v-else class="tree-view">
          <ItemTreeView
            :items="treeItems"
            :loading="loading"
            @view="handleView"
            @edit="handleEdit"
            @delete="handleDelete"
            @add-child="handleAddChild"
          />
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <EntityModal
      ref="itemModal"
      :title="modalTitle"
      size="lg"
    >
      <ItemForm
        :mode="modalMode"
        :initial-data="selectedItem"
        @submit="handleSubmit"
        @cancel="closeModal"
      />
    </EntityModal>

    <!-- View Modal -->
    <EntityModal
      ref="viewModal"
      :title="t('items:modal.view.title')"
      size="lg"
    >
      <div v-if="selectedItem" class="item-details">
        <div class="row">
          <div class="col-md-6">
            <EntityCard
              :data="selectedItem"
              :fields="viewFields"
            />
          </div>
          <div class="col-md-6">
            <div class="item-relationships">
              <h6>{{ t('items:modal.view.relationships') }}</h6>
              
              <!-- Parent Item -->
              <div v-if="selectedItem.parent" class="mb-3">
                <label class="form-label small">{{ t('items:modal.view.parent') }}</label>
                <div class="border rounded p-2">
                  <div class="d-flex align-items-center">
                    <i :class="getItemTypeIcon(selectedItem.parent.itemType)" class="me-2"></i>
                    <div>
                      <div class="fw-medium">{{ selectedItem.parent.name }}</div>
                      <small class="text-muted">{{ selectedItem.parent.code }}</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Child Items -->
              <div v-if="selectedItem.children && selectedItem.children.length > 0" class="mb-3">
                <label class="form-label small">{{ t('items:modal.view.children') }} ({{ selectedItem.children.length }})</label>
                <div class="children-list">
                  <div 
                    v-for="child in selectedItem.children.slice(0, 5)"
                    :key="child.id"
                    class="border rounded p-2 mb-1"
                  >
                    <div class="d-flex align-items-center">
                      <i :class="getItemTypeIcon(child.itemType)" class="me-2"></i>
                      <div>
                        <div class="fw-medium">{{ child.name }}</div>
                        <small class="text-muted">{{ child.code }}</small>
                      </div>
                    </div>
                  </div>
                  <div v-if="selectedItem.children.length > 5" class="text-muted small">
                    {{ t('items:modal.view.moreChildren', { count: selectedItem.children.length - 5 }) }}
                  </div>
                </div>
              </div>
              
              <!-- Tags -->
              <div v-if="selectedItem.tags && selectedItem.tags.length > 0" class="mb-3">
                <label class="form-label small">{{ t('items:modal.view.tags') }}</label>
                <div>
                  <span
                    v-for="tag in selectedItem.tags"
                    :key="tag"
                    class="badge bg-secondary me-1 mb-1"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EntityModal>

    <!-- Children View Modal -->
    <EntityModal
      ref="childrenModal"
      :title="t('items:modal.children.title')"
      size="xl"
    >
      <div v-if="selectedItem" class="children-view">
        <div class="d-flex align-items-center mb-3">
          <i :class="getItemTypeIcon(selectedItem.itemType)" class="fs-4 me-3"></i>
          <div>
            <h5 class="mb-0">{{ selectedItem.name }}</h5>
            <small class="text-muted">{{ selectedItem.code }}</small>
          </div>
        </div>
        
        <ItemTable
          :items="selectedItem.children || []"
          :loading="false"
          view-mode="table"
          @view="handleView"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </EntityModal>

    <!-- Delete Confirmation Modal -->
    <EntityModal
      ref="deleteModal"
      :title="t('items:modal.delete.title')"
      size="sm"
    >
      <div v-if="selectedItem" class="text-center">
        <i class="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
        <p>{{ t('items:modal.delete.message', { name: selectedItem.name }) }}</p>
        <div v-if="selectedItem.children && selectedItem.children.length > 0" class="alert alert-warning">
          <i class="bi bi-info-circle me-2"></i>
          {{ t('items:modal.delete.hasChildren', { count: selectedItem.children.length }) }}
        </div>
        <div class="d-flex gap-2 justify-content-center">
          <button class="btn btn-secondary" @click="closeDeleteModal">
            {{ t('common:cancel') }}
          </button>
          <button 
            class="btn btn-danger" 
            @click="confirmDelete" 
            :disabled="deleting || (selectedItem.children && selectedItem.children.length > 0)"
          >
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
import { type IItem } from '~/model/item.model'
import { ItemType } from '~/model/enumerations/item-type.model'
import ItemTable from '~/components/entities/item/ItemTable.vue'
import ItemForm from '~/components/entities/item/ItemForm.vue'
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
const itemAPI = useEntityAPI<IItem>({
  baseUrl: '/api',
  entityName: 'items'
})

// Reactive data
const items = ref<IItem[]>([])
const selectedItem = ref<IItem | null>(null)
const modalMode = ref<'create' | 'edit'>('create')
const loading = ref(false)
const deleting = ref(false)
const viewMode = ref<'table' | 'tree'>('table')

// Modal refs
const itemModal = ref()
const viewModal = ref()
const childrenModal = ref()
const deleteModal = ref()

// Computed
const modalTitle = computed(() => {
  return modalMode.value === 'create' 
    ? t('items:modal.create.title')
    : t('items:modal.edit.title')
})

const itemStats = computed(() => {
  const stats = {
    total: items.value.length,
    components: 0,
    assemblies: 0,
    materials: 0,
    tools: 0,
    documents: 0
  }
  
  items.value.forEach(item => {
    switch (item.itemType) {
      case ItemType.COMPONENT: stats.components++; break
      case ItemType.ASSEMBLY: stats.assemblies++; break
      case ItemType.MATERIAL: stats.materials++; break
      case ItemType.TOOL: stats.tools++; break
      case ItemType.DOCUMENT: stats.documents++; break
    }
  })
  
  return stats
})

const treeItems = computed(() => {
  // Build tree structure from flat items
  const tree = items.value.filter(item => !item.parent)
  
  function buildTree(parentItems: IItem[]): IItem[] {
    return parentItems.map(parent => {
      const children = items.value.filter(item => item.parent?.id === parent.id)
      return {
        ...parent,
        children: children.length > 0 ? buildTree(children) : []
      }
    })
  }
  
  return buildTree(tree)
})

const viewFields = computed(() => [
  { key: 'code', label: t('items:form.fields.code.label') },
  { key: 'name', label: t('items:form.fields.name.label') },
  { key: 'itemType', label: t('items:form.fields.itemType.label') },
  { key: 'category', label: t('items:form.fields.category.label') },
  { key: 'textValue', label: t('items:form.fields.textValue.label') },
  { key: 'numberValue', label: t('items:form.fields.numberValue.label') },
  { key: 'unit', label: t('items:form.fields.unit.label') },
  { key: 'booleanValue', label: t('items:form.fields.booleanValue.label') },
  { key: 'dateValue', label: t('items:form.fields.dateValue.label') },
  { key: 'description', label: t('items:form.fields.description.label') }
])

// Methods
const loadItems = async () => {
  loading.value = true
  try {
    const result = await itemAPI.getAll()
    if (result.success && result.data) {
      items.value = result.data
    }
  } catch (error) {
    console.error('Error loading items:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  selectedItem.value = null
  itemModal.value?.open()
}

const handleView = (item: IItem) => {
  selectedItem.value = item
  viewModal.value?.open()
}

const handleEdit = (item: IItem) => {
  modalMode.value = 'edit'
  selectedItem.value = item
  itemModal.value?.open()
}

const handleCopy = (item: IItem) => {
  modalMode.value = 'create'
  selectedItem.value = {
    ...item,
    id: undefined,
    code: item.code + '_COPY',
    name: item.name + ' (Copy)',
    parent: item.parent // Keep parent relationship
  }
  itemModal.value?.open()
}

const handleAddChild = (parentItem: IItem) => {
  modalMode.value = 'create'
  selectedItem.value = {
    parent: parentItem
  } as IItem
  itemModal.value?.open()
}

const handleViewChildren = (item: IItem) => {
  selectedItem.value = item
  childrenModal.value?.open()
}

const handleDelete = (item: IItem) => {
  selectedItem.value = item
  deleteModal.value?.open()
}

const handleSubmit = async (item: IItem) => {
  try {
    let result
    if (modalMode.value === 'create') {
      result = await itemAPI.create(item)
    } else {
      result = await itemAPI.update(item.id!, item)
    }
    
    if (result.success) {
      closeModal()
      await loadItems()
    }
  } catch (error) {
    console.error('Error submitting item:', error)
  }
}

const confirmDelete = async () => {
  if (!selectedItem.value) return
  
  deleting.value = true
  try {
    const result = await itemAPI.remove(selectedItem.value.id!)
    if (result.success) {
      closeDeleteModal()
      await loadItems()
    }
  } catch (error) {
    console.error('Error deleting item:', error)
  } finally {
    deleting.value = false
  }
}

const handleImport = () => {
  // Create file input element
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json,.csv,.xlsx'
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    try {
      loading.value = true
      
      // Handle different file types
      if (file.name.endsWith('.json')) {
        const text = await file.text()
        const data = JSON.parse(text)
        await importItems(data)
      } else if (file.name.endsWith('.csv')) {
        // TODO: Implement CSV parsing
        console.warn('CSV import not yet implemented')
      } else if (file.name.endsWith('.xlsx')) {
        // TODO: Implement Excel parsing
        console.warn('Excel import not yet implemented')
      }
    } catch (error) {
      console.error('Error importing items:', error)
    } finally {
      loading.value = false
    }
  }
  input.click()
}

const importItems = async (data: any[]) => {
  try {
    const result = await itemAPI.createBatch(data)
    if (result.success) {
      await loadItems()
      // Show success notification
    }
  } catch (error) {
    console.error('Error importing items:', error)
  }
}

const setViewMode = (mode: 'table' | 'tree') => {
  viewMode.value = mode
}

const getItemTypeIcon = (itemType?: ItemType): string => {
  switch (itemType) {
    case ItemType.COMPONENT: return 'bi bi-gear text-primary'
    case ItemType.ASSEMBLY: return 'bi bi-boxes text-success'
    case ItemType.MATERIAL: return 'bi bi-layers text-warning'
    case ItemType.TOOL: return 'bi bi-tools text-info'
    case ItemType.DOCUMENT: return 'bi bi-file-earmark-text text-secondary'
    default: return 'bi bi-square text-muted'
  }
}

const closeModal = () => {
  itemModal.value?.close()
  selectedItem.value = null
}

const closeDeleteModal = () => {
  deleteModal.value?.close()
  selectedItem.value = null
}

// Lifecycle
onMounted(() => {
  loadItems()
})
</script>

<style scoped>
.admin-items-page {
  padding: 1rem;
}

.children-list {
  max-height: 300px;
  overflow-y: auto;
}

.tree-view {
  min-height: 400px;
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

.item-relationships .border {
  background-color: #f8f9fa;
}
</style>