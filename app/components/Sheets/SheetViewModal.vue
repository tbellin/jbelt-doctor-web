<!--
  Componente modal per la visualizzazione dei dettagli JSON di uno sheet
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
            {{ t('sheets:modal.view') }} - {{ sheet?.code }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body">
          <div class="row mb-3">
            <div class="col-12">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">{{ t('sheets:view.jsonData') }}</h6>
                <div class="btn-group" role="group">
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary btn-sm"
                    @click="$emit('copy')"
                    :title="t('sheets:view.copyToClipboard')"
                  >
                    <i class="bi bi-clipboard me-1"></i>
                    {{ t('sheets:view.copy') }}
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-primary btn-sm"
                    @click="$emit('download')"
                    :title="t('sheets:view.downloadJson')"
                  >
                    <i class="bi bi-download me-1"></i>
                    {{ t('sheets:view.download') }}
                  </button>
                </div>
              </div>
              
              <textarea 
                id="jsonContent"
                class="form-control font-monospace"
                rows="20"
                readonly
                :value="sheet ? JSON.stringify(sheet, null, 2) : ''"
              ></textarea>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6">
              <h6>{{ t('sheets:view.sheetInfo') }}</h6>
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td><strong>ID:</strong></td>
                    <td><span class="badge bg-light text-dark">{{ sheet?.id }}</span></td>
                  </tr>
                  <tr>
                    <td><strong>{{ t('sheets:table.code') }}:</strong></td>
                    <td><code>{{ sheet?.code }}</code></td>
                  </tr>
                  <tr>
                    <td><strong>{{ t('sheets:table.name') }}:</strong></td>
                    <td>{{ sheet?.name }}</td>
                  </tr>
                  <tr>
                    <td><strong>{{ t('sheets:table.format') }}:</strong></td>
                    <td>
                      <span class="badge bg-info">
                        {{ sheet?.formatType }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>{{ t('sheets:table.creoId') }}:</strong></td>
                    <td>
                      <code v-if="sheet?.creoId" class="text-muted">{{ sheet.creoId }}</code>
                      <span v-else class="text-muted">-</span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>{{ t('sheets:table.drawing') }}:</strong></td>
                    <td>
                      <span v-if="getDrawingInfo(sheet?.drawing)" class="badge bg-success">
                        <i class="bi bi-link-45deg me-1"></i>
                        {{ getDrawingInfo(sheet?.drawing) }}
                      </span>
                      <span v-else class="text-muted">
                        <i class="bi bi-dash-circle me-1"></i>
                        {{ t('sheets:table.noDrawing') }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="col-md-6">
              <h6>{{ t('sheets:view.fileInfo') }}</h6>
              <div class="alert alert-info">
                <p class="mb-2">
                  <strong>{{ t('sheets:view.fileName') }}:</strong><br>
                  <code>sheet-{{ sheet?.code }}-{{ sheet?.id }}.json</code>
                </p>
                <p class="mb-0">
                  <strong>{{ t('sheets:view.fileSize') }}:</strong>
                  {{ sheet ? JSON.stringify(sheet).length : 0 }} bytes
                </p>
              </div>
              
              <div v-if="sheet?.drawing" class="alert alert-success">
                <h6 class="alert-heading">{{ t('sheets:view.drawingInfo') }}</h6>
                <p class="mb-0">
                  {{ t('sheets:view.associatedWith') }} 
                  <strong>{{ getDrawingInfo(sheet.drawing) }}</strong>
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
            {{ t('sheets:view.copy') }}
          </button>
          <button type="button" class="btn btn-primary" @click="$emit('download')">
            <i class="bi bi-download me-2"></i>
            {{ t('sheets:view.download') }}
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Backdrop del modal view -->
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import type { SheetWithRelations } from '~/composables/useApi'
import type { Model } from '~/types/model'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

interface Props {
  show: boolean
  sheet?: SheetWithRelations | null
}

defineProps<Props>()

defineEmits<{
  'close': []
  'copy': []
  'download': []
}>()

const getDrawingInfo = (drawing: Model | number | undefined): string => {
  if (!drawing) return ''
  
  if (typeof drawing === 'number') {
    return `ID: ${drawing}`
  }
  
  if (typeof drawing === 'object') {
    if (drawing.code && drawing.name) {
      return `${drawing.code} - ${drawing.name}`
    }
    if (drawing.code) {
      return drawing.code
    }
    if (drawing.id) {
      return `ID: ${drawing.id}`
    }
    return `Drawing: ${drawing.id || 'Unknown'}`
  }
  
  return ''
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
</style>