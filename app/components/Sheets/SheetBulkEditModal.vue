<!--
  Componente modal per la modifica in blocco di fogli
  @version 1.0.0
-->
<template>
  <div 
    class="modal fade" 
    :class="{ show: show }" 
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-pencil-square me-2"></i>
            {{ t('sheets:bulkEdit.title') }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body">
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            {{ t('sheets:bulkEdit.info') }}
          </div>
          
          <div class="mb-3">
            <h6>{{ t('sheets:bulkEdit.selectedSheets') }}</h6>
            <div class="list-group">
              <div v-for="sheet in selectedSheets" :key="sheet.id" class="list-group-item">
                <code>{{ sheet.code }}</code>
              </div>
            </div>
          </div>
          
          <div class="mb-3">
            <label for="bulkFormat" class="form-label">{{ t('sheets:bulkEdit.format') }}</label>
            <select 
              id="bulkFormat" 
              :value="bulkFormat" 
              @change="handleFormatChange"
              class="form-select"
            >
              <option value="">{{ t('common:noChange') }}</option>
              <option v-for="format in availableFormats" :key="format.id" :value="format.id">
                {{ format.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            {{ t('common:cancel') }}
          </button>
          <button 
            type="button" 
            class="btn btn-primary"
            @click="$emit('save')"
            :disabled="!hasChanges"
          >
            <i class="bi bi-check2 me-2"></i>
            {{ t('common:save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Backdrop del modal -->
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import type { Sheet } from '~/types/sheet'

const { t } = useI18n()

interface Props {
  show: boolean
  selectedSheets: Sheet[]
  availableFormats: any[]
  bulkFormat: string
}

defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'save': []
  'update:bulkFormat': [value: string]
}>()

const handleFormatChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:bulkFormat', target.value)
}

const hasChanges = computed(() => {
  return bulkFormat.value !== ''
})

const bulkFormat = computed(() => {
  return props.bulkFormat
})
</script>

<style scoped>
.modal.show {
  background: rgba(0, 0, 0, 0.5);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.list-group-item {
  padding: 0.5rem 0.75rem;
}
</style>