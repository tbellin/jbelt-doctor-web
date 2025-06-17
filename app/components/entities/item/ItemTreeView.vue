<!-- app/components/entities/item/ItemTreeView.vue -->
<template>
  <div class="item-tree-view">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ t('common:loading') }}</span>
      </div>
    </div>

    <!-- Tree Structure -->
    <div v-else class="tree-container">
      <!-- Root Items -->
      <ItemTreeNode
        v-for="item in rootItems"
        :key="item.id"
        :item="item"
        :children="getChildren(item.id)"
        :expanded-nodes="expandedNodes"
        :level="0"
        @toggle="toggleNode"
        @view="$emit('view', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @add-child="$emit('add-child', $event)"
      />

      <!-- No Items Message -->
      <div v-if="rootItems.length === 0" class="text-center py-5 text-muted">
        <i class="bi bi-diagram-3 display-1"></i>
        <h5 class="mt-3">{{ t('items:tree.noItems.title') }}</h5>
        <p>{{ t('items:tree.noItems.message') }}</p>
        <button class="btn btn-primary" @click="$emit('add-child', null)">
          <i class="bi bi-plus-circle me-2"></i>
          {{ t('items:tree.noItems.addFirst') }}
        </button>
      </div>
    </div>

    <!-- Tree Actions -->
    <div class="tree-actions mt-3 border-top pt-3">
      <div class="d-flex justify-content-between align-items-center">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" @click="expandAll">
            <i class="bi bi-arrows-expand me-1"></i>
            {{ t('items:tree.actions.expandAll') }}
          </button>
          <button class="btn btn-outline-secondary" @click="collapseAll">
            <i class="bi bi-arrows-collapse me-1"></i>
            {{ t('items:tree.actions.collapseAll') }}
          </button>
        </div>
        <small class="text-muted">
          {{ t('items:tree.summary', { total: items.length, root: rootItems.length }) }}
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { type IItem } from '~/model/item.model'
import ItemTreeNode from './ItemTreeNode.vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  items: IItem[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  view: [item: IItem]
  edit: [item: IItem]
  delete: [item: IItem]
  'add-child': [parent: IItem | null]
}>()

// Reactive Data
const expandedNodes = ref<Set<number>>(new Set())

// Computed
const rootItems = computed(() => {
  return props.items.filter(item => !item.parent || !item.parent.id)
})

const itemsMap = computed(() => {
  const map = new Map<number, IItem>()
  props.items.forEach(item => {
    if (item.id) map.set(item.id, item)
  })
  return map
})

// Methods
const getChildren = (parentId?: number): IItem[] => {
  if (!parentId) return []
  return props.items.filter(item => item.parent?.id === parentId)
}

const toggleNode = (itemId: number) => {
  if (expandedNodes.value.has(itemId)) {
    expandedNodes.value.delete(itemId)
  } else {
    expandedNodes.value.add(itemId)
  }
}

const expandAll = () => {
  const allIds = new Set<number>()
  props.items.forEach(item => {
    if (item.id && getChildren(item.id).length > 0) {
      allIds.add(item.id)
    }
  })
  expandedNodes.value = allIds
}

const collapseAll = () => {
  expandedNodes.value.clear()
}

// Auto-expand nodes that have expanded children when items change
watch(() => props.items, () => {
  // Keep only valid expanded nodes
  const validIds = new Set<number>()
  expandedNodes.value.forEach(id => {
    if (itemsMap.value.has(id) && getChildren(id).length > 0) {
      validIds.add(id)
    }
  })
  expandedNodes.value = validIds
}, { deep: true })
</script>

<style scoped>
.item-tree-view {
  position: relative;
}

.tree-container {
  min-height: 200px;
}

.tree-actions {
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

.spinner-border {
  width: 2rem;
  height: 2rem;
}

@media (max-width: 768px) {
  .btn-group-sm .btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  
  .tree-actions {
    padding: 0.5rem;
  }
}
</style>