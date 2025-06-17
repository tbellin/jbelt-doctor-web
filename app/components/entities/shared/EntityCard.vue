<template>
  <div class="entity-card">
    <div class="card h-100" :class="{ 'border-primary': selected }">
      <div class="card-header" v-if="showHeader">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <slot name="icon" :item="item">
              <i :class="iconClass" class="me-2"></i>
            </slot>
            <h6 class="card-title mb-0">
              <slot name="title" :item="item">
                {{ getDisplayValue(item, titleField) }}
              </slot>
            </h6>
          </div>
          
          <div class="d-flex gap-1" v-if="showActions">
            <slot name="header-actions" :item="item">
              <button
                class="btn btn-outline-primary btn-sm"
                @click="$emit('view', item)"
                :title="t('common:view')"
              >
                <i class="bi bi-eye"></i>
              </button>
              <button
                class="btn btn-outline-secondary btn-sm"
                @click="$emit('edit', item)"
                :title="t('common:edit')"
              >
                <i class="bi bi-pencil"></i>
              </button>
            </slot>
          </div>
        </div>
      </div>

      <div class="card-body">
        <slot :item="item" :fields="displayFields">
          <!-- Default content -->
          <div v-if="subtitle" class="text-muted mb-2">
            <small>{{ getDisplayValue(item, subtitleField) }}</small>
          </div>
          
          <div class="row g-2">
            <div 
              v-for="field in displayFields" 
              :key="field.key"
              :class="field.colClass || 'col-12'"
            >
              <slot :name="`field-${field.key}`" :item="item" :field="field" :value="getDisplayValue(item, field.key)">
                <div class="d-flex justify-content-between">
                  <small class="text-muted">{{ field.label }}:</small>
                  <small class="fw-medium">
                    {{ formatFieldValue(getDisplayValue(item, field.key), field) }}
                  </small>
                </div>
              </slot>
            </div>
          </div>
          
          <!-- Status/Badge Section -->
          <div v-if="statusField" class="mt-2">
            <slot name="status" :item="item" :status="getDisplayValue(item, statusField)">
              <span 
                class="badge"
                :class="getStatusBadgeClass(getDisplayValue(item, statusField))"
              >
                {{ getDisplayValue(item, statusField) }}
              </span>
            </slot>
          </div>
        </slot>
      </div>

      <div class="card-footer bg-transparent" v-if="showFooter">
        <slot name="footer" :item="item">
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
              {{ lastUpdated ? formatDate(getDisplayValue(item, lastUpdatedField)) : '' }}
            </small>
            
            <div class="btn-group btn-group-sm" v-if="showActions && !showHeader">
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
                class="btn btn-outline-danger"
                @click="$emit('delete', item)"
                :title="t('common:delete')"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Composables
const { t } = useI18n()

// Types
interface DisplayField {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'boolean' | 'badge'
  format?: (value: any) => string
  colClass?: string
}

// Props
interface Props {
  item: any
  titleField: string
  subtitleField?: string
  displayFields: DisplayField[]
  iconClass?: string
  statusField?: string
  lastUpdatedField?: string
  showHeader?: boolean
  showFooter?: boolean
  showActions?: boolean
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  iconClass: 'bi bi-folder',
  showHeader: true,
  showFooter: true,
  showActions: true,
  selected: false
})

// Emits
const emit = defineEmits<{
  view: [item: any]
  edit: [item: any]
  delete: [item: any]
  select: [item: any]
}>()

// Computed
const subtitle = computed(() => props.subtitleField && getDisplayValue(props.item, props.subtitleField))
const lastUpdated = computed(() => props.lastUpdatedField && getDisplayValue(props.item, props.lastUpdatedField))

// Methods
const getDisplayValue = (obj: any, path: string): any => {
  if (!path) return ''
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const formatFieldValue = (value: any, field: DisplayField): string => {
  if (value === null || value === undefined) return '-'
  
  if (field.format) {
    return field.format(value)
  }
  
  switch (field.type) {
    case 'date':
      return formatDate(value)
    case 'boolean':
      return value ? t('common:yes') : t('common:no')
    case 'number':
      return Number(value).toLocaleString()
    default:
      return String(value)
  }
}

const formatDate = (value: any): string => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return String(value)
  }
}

const getStatusBadgeClass = (status: any): string => {
  const statusStr = String(status).toLowerCase()
  
  switch (statusStr) {
    case 'active':
    case 'enabled':
    case 'published':
    case 'approved':
      return 'bg-success'
    case 'inactive':
    case 'disabled':
    case 'draft':
    case 'pending':
      return 'bg-warning'
    case 'deleted':
    case 'rejected':
    case 'error':
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
}
</script>

<style scoped>
.entity-card .card {
  transition: all 0.2s ease-in-out;
}

.entity-card .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.entity-card .card.border-primary {
  border-width: 2px;
}

.card-title {
  color: var(--bs-primary);
  font-weight: 600;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.4rem;
  font-size: 0.75rem;
}
</style>