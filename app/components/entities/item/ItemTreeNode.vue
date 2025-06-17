<!-- app/components/entities/item/ItemTreeNode.vue -->
<template>
  <div class="tree-node" :class="{ 'has-children': hasChildren }">
    <!-- Node Content -->
    <div 
      class="node-content" 
      :class="{ 'expanded': isExpanded }"
      :style="{ paddingLeft: `${level * 1.5}rem` }"
    >
      <!-- Expand/Collapse Button -->
      <button
        v-if="hasChildren"
        class="expand-button btn btn-sm"
        @click="handleToggle"
      >
        <i :class="isExpanded ? 'bi bi-chevron-down' : 'bi bi-chevron-right'"></i>
      </button>
      <div v-else class="expand-spacer"></div>

      <!-- Item Type Icon -->
      <div class="item-icon me-2">
        <i :class="getItemTypeIcon(item.itemType)" class="fs-5"></i>
      </div>

      <!-- Item Info -->
      <div class="item-info flex-grow-1">
        <div class="d-flex align-items-center">
          <h6 class="mb-0 me-2">{{ item.name || t('items:tree.node.unnamed') }}</h6>
          <span v-if="item.code" class="badge bg-light text-dark me-2">{{ item.code }}</span>
          <span v-if="item.itemType" class="badge" :class="getItemTypeBadgeClass(item.itemType)">
            {{ t(`items:types.${item.itemType}`) }}
          </span>
        </div>
        <div v-if="item.description" class="text-muted small mt-1">
          {{ item.description }}
        </div>
        <div v-if="item.category" class="text-muted small">
          <i class="bi bi-tag me-1"></i>
          {{ item.category }}
        </div>
      </div>

      <!-- Item Values -->
      <div class="item-values me-3">
        <div v-if="item.textValue" class="small text-info">
          <i class="bi bi-quote me-1"></i>
          {{ item.textValue }}
        </div>
        <div v-if="item.numberValue" class="small text-success">
          <i class="bi bi-123 me-1"></i>
          {{ item.numberValue }}{{ item.unit ? ` ${item.unit}` : '' }}
        </div>
        <div v-if="item.booleanValue" class="small text-primary">
          <i class="bi bi-check-circle me-1"></i>
          {{ t('common:yes') }}
        </div>
        <div v-if="item.dateValue" class="small text-warning">
          <i class="bi bi-calendar me-1"></i>
          {{ formatDate(item.dateValue) }}
        </div>
      </div>

      <!-- Node Actions -->
      <div class="node-actions btn-group btn-group-sm">
        <button
          class="btn btn-outline-primary"
          @click="$emit('view', item)"
          :title="t('common:view')"
        >
          <i class="bi bi-eye"></i>
        </button>
        <button
          class="btn btn-outline-secondary"
          @click="$emit('edit', item)"
          :title="t('common:edit')"
        >
          <i class="bi bi-pencil"></i>
        </button>
        <button
          class="btn btn-outline-success"
          @click="$emit('add-child', item)"
          :title="t('items:tree.node.addChild')"
        >
          <i class="bi bi-plus"></i>
        </button>
        <button
          class="btn btn-outline-danger"
          @click="$emit('delete', item)"
          :title="t('common:delete')"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>

    <!-- Children -->
    <div v-if="hasChildren && isExpanded" class="node-children">
      <ItemTreeNode
        v-for="child in children"
        :key="child.id"
        :item="child"
        :children="getGrandChildren(child.id)"
        :expanded-nodes="expandedNodes"
        :level="level + 1"
        @toggle="$emit('toggle', $event)"
        @view="$emit('view', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @add-child="$emit('add-child', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type IItem } from '~/model/item.model'
import { ItemType } from '~/model/enumerations/item-type.model'

// Composables
const { t } = useI18n()

// Props
interface Props {
  item: IItem
  children: IItem[]
  expandedNodes: Set<number>
  level: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  toggle: [itemId: number]
  view: [item: IItem]
  edit: [item: IItem]
  delete: [item: IItem]
  'add-child': [parent: IItem]
}>()

// Computed
const hasChildren = computed(() => props.children.length > 0)

const isExpanded = computed(() => {
  return props.item.id ? props.expandedNodes.has(props.item.id) : false
})

// Methods
const handleToggle = () => {
  if (props.item.id) {
    emit('toggle', props.item.id)
  }
}

const getGrandChildren = (parentId?: number): IItem[] => {
  // This would need to be passed down or computed at a higher level
  // For now, return empty array as children are already provided
  return []
}

const getItemTypeIcon = (itemType?: ItemType): string => {
  switch (itemType) {
    case ItemType.COMPONENT:
      return 'bi bi-gear text-primary'
    case ItemType.ASSEMBLY:
      return 'bi bi-boxes text-success'
    case ItemType.MATERIAL:
      return 'bi bi-layers text-warning'
    case ItemType.TOOL:
      return 'bi bi-tools text-info'
    case ItemType.DOCUMENT:
      return 'bi bi-file-earmark-text text-secondary'
    default:
      return 'bi bi-square text-muted'
  }
}

const getItemTypeBadgeClass = (itemType?: ItemType): string => {
  switch (itemType) {
    case ItemType.COMPONENT:
      return 'bg-primary'
    case ItemType.ASSEMBLY:
      return 'bg-success'
    case ItemType.MATERIAL:
      return 'bg-warning'
    case ItemType.TOOL:
      return 'bg-info'
    case ItemType.DOCUMENT:
      return 'bg-secondary'
    default:
      return 'bg-light text-dark'
  }
}

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString()
  } catch {
    return dateStr
  }
}
</script>

<style scoped>
.tree-node {
  position: relative;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
  min-height: 2.5rem;
}

.node-content:hover {
  background-color: #f8f9fa;
}

.expand-button {
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  background: none;
  color: #6c757d;
  margin-right: 0.5rem;
}

.expand-button:hover {
  background-color: #e9ecef;
  color: #495057;
}

.expand-spacer {
  width: 2rem;
  margin-right: 0.5rem;
}

.item-icon {
  width: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.item-info {
  min-width: 0; /* Allow text truncation */
}

.item-values {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 8rem;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.node-content:hover .node-actions {
  opacity: 1;
}

.node-children {
  position: relative;
}

.node-children::before {
  content: '';
  position: absolute;
  left: calc(var(--level) * 1.5rem + 0.75rem);
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #dee2e6;
}

.has-children > .node-content {
  font-weight: 500;
}

.badge {
  font-size: 0.7rem;
}

@media (max-width: 768px) {
  .node-content {
    flex-wrap: wrap;
    min-height: auto;
  }
  
  .item-values {
    width: 100%;
    align-items: flex-start;
    margin-top: 0.25rem;
  }
  
  .node-actions {
    opacity: 1;
    margin-top: 0.25rem;
  }
}
</style>