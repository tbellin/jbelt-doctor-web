<!--
  Componente modal per la visualizzazione dei dettagli JSON di un modello
  @version 1.0.0
-->
<template>
  <div 
    class="modal fade" 
    :class="{ show: show }" 
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-eye me-2"></i>
            {{ t('models:modal.view') }} - {{ model?.code }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body">
          <div class="row mb-3">
            <div class="col-12">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                  <h6 class="mb-0">{{ t('models:view.jsonData') }}</h6>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-outline-secondary ms-2"
                    @click="toggleJsonCollapse"
                    :title="isJsonCollapsed ? 'Espandi dati JSON' : 'Comprimi dati JSON'"
                  >
                    <i class="bi" :class="isJsonCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
                  </button>
                </div>
                <div class="btn-group" role="group">
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary btn-sm"
                    @click="$emit('copy')"
                    :title="t('models:view.copyToClipboard')"
                  >
                    <i class="bi bi-clipboard me-1"></i>
                    {{ t('models:view.copy') }}
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-primary btn-sm"
                    @click="$emit('download')"
                    :title="t('models:view.downloadJson')"
                  >
                    <i class="bi bi-download me-1"></i>
                    {{ t('models:view.download') }}
                  </button>
                </div>
              </div>
              
              <textarea 
                v-show="!isJsonCollapsed"
                id="jsonContent"
                class="form-control font-monospace collapse-content"
                rows="20"
                readonly
                :value="model ? JSON.stringify(model, null, 2) : ''"
              ></textarea>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">{{ t('models:view.modelInfo') }}</h6>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-secondary"
                  @click="toggleModelInfoCollapse"
                  :title="isModelInfoCollapsed ? 'Espandi info modello' : 'Comprimi info modello'"
                >
                  <i class="bi" :class="isModelInfoCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
                </button>
              </div>
              <table v-show="!isModelInfoCollapsed" class="table table-sm collapse-content">
                <tbody>
                  <tr>
                    <td><strong>ID:</strong></td>
                    <td><span class="badge bg-light text-dark">{{ model?.id }}</span></td>
                  </tr>
                  <tr>
                    <td><strong>{{ t('models:table.code') }}:</strong></td>
                    <td><code>{{ model?.code }}</code></td>
                  </tr>
                  <tr>
                    <td><strong>{{ t('models:table.name') }}:</strong></td>
                    <td>{{ model?.name }}</td>
                  </tr>
                  <tr>
                    <td><strong>{{ t('models:table.type') }}:</strong></td>
                    <td>
                      <span class="badge" :class="getTypeClass(model?.modelType || '')">
                        <i :class="getTypeIcon(model?.modelType || '')" class="me-1"></i>
                        {{ model?.modelType }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>{{ t('models:table.instance') }}:</strong></td>
                    <td>
                      <span class="badge bg-secondary">
                        {{ model?.instanceType }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="col-md-6">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">{{ t('models:view.fileInfo') }}</h6>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-secondary"
                  @click="toggleFileInfoCollapse"
                  :title="isFileInfoCollapsed ? 'Espandi info file' : 'Comprimi info file'"
                >
                  <i class="bi" :class="isFileInfoCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
                </button>
              </div>
              <div v-show="!isFileInfoCollapsed" class="alert alert-info collapse-content">
                <p class="mb-2">
                  <strong>{{ t('models:view.fileName') }}:</strong><br>
                  <code>model-{{ model?.code }}-{{ model?.id }}.json</code>
                </p>
                <p class="mb-0">
                  <strong>{{ t('models:view.fileSize') }}:</strong>
                  {{ model ? JSON.stringify(model).length : 0 }} bytes
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            {{ t('common:cancel') }}
          </button>
          <button type="button" class="btn btn-outline-secondary" @click="$emit('copy')">
            <i class="bi bi-clipboard me-2"></i>
            {{ t('models:view.copy') }}
          </button>
          <button type="button" class="btn btn-primary" @click="$emit('download')">
            <i class="bi bi-download me-2"></i>
            {{ t('models:view.download') }}
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Backdrop del modal view -->
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import type { Model } from '~/types/model'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

interface Props {
  show: boolean
  model?: Model | null
}

defineProps<Props>()

defineEmits<{
  'close': []
  'copy': []
  'download': []
}>()

// Collapse states
const isJsonCollapsed = ref(false)
const isModelInfoCollapsed = ref(false)
const isFileInfoCollapsed = ref(false)

// Toggle functions
const toggleJsonCollapse = () => {
  isJsonCollapsed.value = !isJsonCollapsed.value
}

const toggleModelInfoCollapse = () => {
  isModelInfoCollapsed.value = !isModelInfoCollapsed.value
}

const toggleFileInfoCollapse = () => {
  isFileInfoCollapsed.value = !isFileInfoCollapsed.value
}

const getTypeClass = (type: string): string => {
  const classes: Record<string, string> = {
    'PART': 'bg-success',
    'ASSEMBLY': 'bg-info',
    'DRAWING': 'bg-warning'
  }
  return classes[type] || 'bg-secondary'
}

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'PART': 'bi-gear',
    'ASSEMBLY': 'bi-diagram-3',
    'DRAWING': 'bi-file-earmark-text'
  }
  return icons[type] || 'bi-box-seam'
}
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

/* Animazione per il collapse */
.collapse-content {
  transition: all 0.3s ease-in-out;
}

/* Stile per i pulsanti di collapse */
.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn i {
  transition: transform 0.2s ease;
}
</style>