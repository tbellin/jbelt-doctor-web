<!--
  Componente modal per la creazione/modifica di un balloon con nota associata
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
            {{ editingBalloon ? t('balloons:modal.edit') : t('balloons:modal.create') }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <form @submit.prevent="$emit('save')">
          <div class="modal-body">
            <!-- Disegni e Fogli Selection Row -->
            <div class="row mb-4">
              <div class="col-md-6">
                <label for="drawingSelect" class="form-label">{{ t('balloons:form.drawing') }}</label>
                <select
                  id="drawingSelect"
                  :value="selectedDrawingId"
                  @change="updateDrawingSelection"
                  class="form-select"
                >
                  <option value="">{{ t('balloons:form.selectDrawing') }}</option>
                  <option v-for="drawing in availableDrawings" :key="drawing.id" :value="drawing.id">
                    {{ drawing.code || drawing.name }} - {{ drawing.name }}
                  </option>
                </select>
              </div>
              
              <div class="col-md-6">
                <label for="sheetSelect" class="form-label">{{ t('balloons:form.sheet') }}</label>
                <select
                  id="sheetSelect"
                  :value="selectedSheetId"
                  @change="updateSheetSelection"
                  class="form-select"
                  :disabled="!selectedDrawingId"
                >
                  <option value="">{{ t('balloons:form.selectSheet') }}</option>
                  <option v-for="sheet in filteredSheets" :key="sheet.id" :value="sheet.id">
                    {{ sheet.code || sheet.name }} - {{ sheet.name }}
                  </option>
                </select>
              </div>
            </div>

            <hr class="my-4">

            <!-- Balloon Section -->
            <div class="section-header mb-3">
              <h6 class="mb-0">
                <i class="bi bi-geo-alt me-2"></i>
                {{ t('balloons:form.balloonSection') }}
              </h6>
            </div>
            
            <div class="row">
              <div class="col-md-4">
                <label for="balloonCreoId" class="form-label">{{ t('balloons:form.creoId') }} *</label>
                <input
                  id="balloonCreoId"
                  :value="formData.balloon.creoId"
                  @input="updateBalloonCreoId"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.balloonCreoId }"
                  required
                  placeholder="B001"
                >
                <div v-if="errors.balloonCreoId" class="invalid-feedback">
                  {{ errors.balloonCreoId }}
                </div>
              </div>
              
              <div class="col-md-4">
                <label for="balloonName" class="form-label">{{ t('balloons:form.name') }}</label>
                <input
                  id="balloonName"
                  :value="formData.balloon.name"
                  @input="updateBalloonName"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.balloonName }"
                  placeholder="Balloon name"
                >
                <div v-if="errors.balloonName" class="invalid-feedback">
                  {{ errors.balloonName }}
                </div>
              </div>
              
              <div class="col-md-4">
                <label for="balloonValue" class="form-label">{{ t('balloons:form.value') }} *</label>
                <input
                  id="balloonValue"
                  :value="formData.balloon.baloonValue"
                  @input="updateBalloonValue"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.balloonValue }"
                  required
                  placeholder="1"
                >
                <div v-if="errors.balloonValue" class="invalid-feedback">
                  {{ errors.balloonValue }}
                </div>
              </div>
            </div>

            <div class="row mt-3">
              <div class="col-md-6">
                <label for="balloonType" class="form-label">{{ t('balloons:form.type') }}</label>
                <select
                  id="balloonType"
                  :value="formData.balloon.baloonType"
                  @change="updateBalloonType"
                  class="form-select"
                  :class="{ 'is-invalid': errors.balloonType }"
                >
                  <option value="">{{ t('common:select') }}</option>
                  <option value="CIRCLE">{{ t('balloons:types.circle') }}</option>
                  <option value="SQUARE">{{ t('balloons:types.square') }}</option>
                  <option value="TRIANGLE">{{ t('balloons:types.triangle') }}</option>
                  <option value="DIAMOND">{{ t('balloons:types.diamond') }}</option>
                </select>
                <div v-if="errors.balloonType" class="invalid-feedback">
                  {{ errors.balloonType }}
                </div>
              </div>
              
              <div class="col-md-6">
                <label for="balloonCode" class="form-label">{{ t('balloons:form.code') }}</label>
                <input
                  id="balloonCode"
                  :value="formData.balloon.code"
                  @input="updateBalloonCode"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.balloonCode }"
                  placeholder="BALL_001"
                >
                <div v-if="errors.balloonCode" class="invalid-feedback">
                  {{ errors.balloonCode }}
                </div>
              </div>
            </div>

            <!-- Note Section -->
            <div class="section-header mb-3 mt-4">
              <h6 class="mb-0">
                <i class="bi bi-sticky me-2"></i>
                {{ t('balloons:form.noteSection') }}
              </h6>
            </div>
            
            <div class="row">
              <div class="col-md-4">
                <label for="noteCreoId" class="form-label">{{ t('balloons:form.noteCreoId') }} *</label>
                <input
                  id="noteCreoId"
                  :value="formData.note.creoId"
                  @input="updateNoteCreoId"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.noteCreoId }"
                  required
                  placeholder="N001"
                >
                <div v-if="errors.noteCreoId" class="invalid-feedback">
                  {{ errors.noteCreoId }}
                </div>
              </div>
              
              <div class="col-md-4">
                <label for="noteName" class="form-label">{{ t('balloons:form.noteName') }}</label>
                <input
                  id="noteName"
                  :value="formData.note.name"
                  @input="updateNoteName"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.noteName }"
                  placeholder="Note name"
                >
                <div v-if="errors.noteName" class="invalid-feedback">
                  {{ errors.noteName }}
                </div>
              </div>
              
              <div class="col-md-4">
                <label for="noteValue" class="form-label">{{ t('balloons:form.noteValue') }}</label>
                <input
                  id="noteValue"
                  :value="formData.note.noteValue"
                  @input="updateNoteValue"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.noteValue }"
                  placeholder="Note value"
                >
                <div v-if="errors.noteValue" class="invalid-feedback">
                  {{ errors.noteValue }}
                </div>
              </div>
            </div>

            <div class="row mt-3">
              <div class="col-md-6">
                <label for="noteType" class="form-label">{{ t('balloons:form.noteType') }}</label>
                <select
                  id="noteType"
                  :value="formData.note.noteType"
                  @change="updateNoteType"
                  class="form-select"
                  :class="{ 'is-invalid': errors.noteType }"
                >
                  <option value="">{{ t('common:select') }}</option>
                  <option value="STANDARD">{{ t('balloons:noteTypes.standard') }}</option>
                  <option value="LEADER">{{ t('balloons:noteTypes.leader') }}</option>
                  <option value="ARROW">{{ t('balloons:noteTypes.arrow') }}</option>
                </select>
                <div v-if="errors.noteType" class="invalid-feedback">
                  {{ errors.noteType }}
                </div>
              </div>
              
              <div class="col-md-6">
                <label for="noteCode" class="form-label">{{ t('balloons:form.noteCode') }}</label>
                <input
                  id="noteCode"
                  :value="formData.note.code"
                  @input="updateNoteCode"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.noteCode }"
                  placeholder="NOTE_001"
                >
                <div v-if="errors.noteCode" class="invalid-feedback">
                  {{ errors.noteCode }}
                </div>
              </div>
            </div>

            <!-- Attributes Preview Section -->
            <div class="section-header mb-3 mt-4">
              <h6 class="mb-0">
                <i class="bi bi-tags me-2"></i>
                {{ t('balloons:form.attributesSection') }}
              </h6>
            </div>
            
            <div class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              {{ t('balloons:form.attributesInfo') }}
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              {{ t('common:cancel') }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? t('common:saving') : (editingBalloon ? t('common:update') : t('common:create')) }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  <!-- Backdrop del modal -->
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import type { IBaloon } from '~/model/baloon.model'
import type { INote } from '~/model/note.model'
import type { IModel } from '~/model/model.model'
import type { ISheet } from '~/model/sheet.model'
import { computed, watch } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

interface BalloonFormData {
  creoId: string
  code: string
  name: string
  baloonValue: string
  baloonType: string
}

interface NoteFormData {
  creoId: string
  code: string
  name: string
  noteValue: string
  noteType: string
}

interface FormData {
  balloon: BalloonFormData
  note: NoteFormData
}

interface Props {
  show: boolean
  editingBalloon?: IBaloon | null
  formData: FormData
  errors: Record<string, string>
  saving?: boolean
  availableDrawings: any[]
  availableSheets: any[]
  selectedDrawingId: string
  selectedSheetId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'save': []
  'update:formData': [value: FormData]
  'update:selectedDrawingId': [value: string]
  'update:selectedSheetId': [value: string]
}>()

// Balloon update functions
const updateBalloonCreoId = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:formData', { 
    ...props.formData, 
    balloon: { ...props.formData.balloon, creoId: target.value }
  })
}

const updateBalloonName = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:formData', { 
    ...props.formData, 
    balloon: { ...props.formData.balloon, name: target.value }
  })
}

const updateBalloonValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:formData', { 
    ...props.formData, 
    balloon: { ...props.formData.balloon, baloonValue: target.value }
  })
}

const updateBalloonType = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:formData', { 
    ...props.formData, 
    balloon: { ...props.formData.balloon, baloonType: target.value }
  })
}

const updateBalloonCode = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:formData', { 
    ...props.formData, 
    balloon: { ...props.formData.balloon, code: target.value }
  })
}

// Note update functions
const updateNoteCreoId = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:formData', { 
    ...props.formData, 
    note: { ...props.formData.note, creoId: target.value }
  })
}

const updateNoteName = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:formData', { 
    ...props.formData, 
    note: { ...props.formData.note, name: target.value }
  })
}

const updateNoteValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:formData', { 
    ...props.formData, 
    note: { ...props.formData.note, noteValue: target.value }
  })
}

const updateNoteType = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:formData', { 
    ...props.formData, 
    note: { ...props.formData.note, noteType: target.value }
  })
}

const updateNoteCode = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:formData', { 
    ...props.formData, 
    note: { ...props.formData.note, code: target.value }
  })
}

// Drawing and Sheet selection state - use props values
const selectedDrawingId = computed({
  get: () => props.selectedDrawingId,
  set: (value) => emit('update:selectedDrawingId', value)
})

const selectedSheetId = computed({
  get: () => props.selectedSheetId,
  set: (value) => emit('update:selectedSheetId', value)
})

// Update functions for Drawing and Sheet dropdowns
const updateDrawingSelection = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newDrawingId = target.value
  
  console.log('[BalloonFormModal] Drawing selection changed:', {
    newDrawingId: newDrawingId,
    availableSheets: props.availableSheets.length,
    sheetsWithDrawing: props.availableSheets.filter(s => s.drawing?.id).length
  })
  
  // Debug: show first few sheets and their drawing associations
  console.log('[BalloonFormModal] First 3 available sheets:')
  props.availableSheets.slice(0, 3).forEach((sheet, idx) => {
    console.log(`Sheet ${idx + 1}:`, {
      id: sheet.id,
      name: sheet.name || sheet.creoId,
      hasDrawing: !!sheet.drawing,
      drawingId: sheet.drawing?.id,
      drawingName: sheet.drawing?.name
    })
  })
  
  selectedDrawingId.value = newDrawingId
  // Reset sheet when drawing changes
  selectedSheetId.value = ''
  // Emit changes to parent
  emit('update:selectedDrawingId', newDrawingId)
  emit('update:selectedSheetId', '')
  
  // Debug: show available sheets for this drawing after a short delay
  setTimeout(() => {
    console.log('[BalloonFormModal] Available sheets after drawing change:', filteredSheets.value.length)
  }, 100)
}

const updateSheetSelection = (event: Event) => {
  const target = event.target as HTMLSelectElement
  selectedSheetId.value = target.value
  // Emit changes to parent
  emit('update:selectedSheetId', target.value)
}

// Computed property to filter sheets based on selected drawing
const filteredSheets = computed(() => {
  console.log('[BalloonFormModal] COMPUTING filteredSheets - selectedDrawingId:', selectedDrawingId.value)
  console.log('[BalloonFormModal] Available sheets total:', props.availableSheets.length)
  
  if (!selectedDrawingId.value) {
    console.log('[BalloonFormModal] No drawing selected, returning empty array')
    return []
  }
  
  // Convert both values to string for robust comparison
  const selectedId = selectedDrawingId.value.toString()
  console.log('[BalloonFormModal] Looking for sheets with drawing ID:', selectedId)
  
  // Debug all sheets and their drawing associations
  console.log('[BalloonFormModal] ALL SHEETS:')
  props.availableSheets.forEach((sheet, idx) => {
    console.log(`  Sheet ${idx}: ID=${sheet.id}, name=${sheet.name || sheet.creoId}, drawingId=${sheet.drawing?.id}, drawingName=${sheet.drawing?.name}`)
  })
  
  const filtered = props.availableSheets.filter(sheet => {
    const sheetDrawingId = sheet.drawing?.id?.toString()
    const matches = sheetDrawingId === selectedId
    
    console.log(`[BalloonFormModal] Sheet ${sheet.id} check: ${sheetDrawingId} === ${selectedId} ? ${matches}`)
    
    return matches
  })
  
  console.log('[BalloonFormModal] *** FINAL RESULT: Filtered sheets for drawing ID', selectedId, ':', filtered.length)
  filtered.forEach(sheet => {
    console.log(`  -> Sheet ${sheet.id}: ${sheet.name || sheet.creoId}`)
  })
  
  return filtered
})

// Watch for modal opening to log data
watch(() => props.show, (newValue) => {
  if (newValue) {
    console.log('[BalloonFormModal] Modal opened with props:', {
      availableDrawings: props.availableDrawings.length,
      availableSheets: props.availableSheets.length,
      selectedDrawingId: props.selectedDrawingId,
      selectedSheetId: props.selectedSheetId,
      editingBalloon: !!props.editingBalloon
    })
    
    // Show sheet-drawing associations
    console.log('[BalloonFormModal] Sheet-Drawing associations:')
    props.availableSheets.forEach((sheet, idx) => {
      if (idx < 5) { // Show first 5
        console.log(`  Sheet ${sheet.id}: ${sheet.name || sheet.creoId} -> Drawing ${sheet.drawing?.id} (${sheet.drawing?.name})`)
      }
    })
  }
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

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.section-header {
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.section-header h6 {
  color: #495057;
  font-weight: 600;
}

.section-header i {
  color: #0d6efd;
}
</style>