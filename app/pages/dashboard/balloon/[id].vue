<!--
  Pagina Editor per Balloon - Creazione e Modifica
  URL: /dashboard/balloon/new (creazione)
  URL: /dashboard/balloon/{id} (modifica)
  @version 1.0.0
-->
<template>
  <div class="balloon-editor">
    <!-- Header della pagina -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <NuxtLink to="/dashboard">{{ t('balloon:editor.breadcrumb.panel') }}</NuxtLink>
                </li>
                <li class="breadcrumb-item">
                  <NuxtLink to="/dashboard/balloons">{{ t('balloon:editor.breadcrumb.balloons') }}</NuxtLink>
                </li>
                <li class="breadcrumb-item active">
                  {{ isEditMode ? t('balloon:editor.breadcrumb.edit') : t('balloon:editor.breadcrumb.new') }} {{ t('balloon:editor.breadcrumb.balloon') }}
                </li>
              </ol>
            </nav>
            <h1 class="h3 mb-0">
              <i class="bi bi-geo-alt me-2"></i>
              {{ isEditMode ? t('balloon:editor.title.edit') : t('balloon:editor.title.new') }}
              <span v-if="isEditMode && balloonFormData.balloon.baloonValue" class="text-muted ms-2">
                #{{ balloonFormData.balloon.baloonValue }}
              </span>
            </h1>
          </div>
          <div class="btn-group">
            <NuxtLink to="/dashboard/balloons" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left me-2"></i>
              {{ t('balloon:editor.buttons.backToList') }}
            </NuxtLink>
            <button 
              v-if="isEditMode && currentBalloon" 
              @click="viewBalloonJson" 
              class="btn btn-outline-info"
            >
              <i class="bi bi-eye me-2"></i>
              {{ t('balloon:editor.buttons.viewJson') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2">{{ loadingMessage || t('balloon:editor.loading.default') }}</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-danger">
      <h5 class="alert-heading">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ t('balloon:editor.errors.title') }}
      </h5>
      <p class="mb-3">{{ error }}</p>
      <div>
        <button class="btn btn-outline-danger me-2" @click="handleRefresh">
          <i class="bi bi-arrow-clockwise me-2"></i>
          {{ t('balloon:editor.buttons.retry') }}
        </button>
        <NuxtLink to="/dashboard/balloons" class="btn btn-secondary">
          {{ t('balloon:editor.buttons.backToList') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Main Editor Form -->
    <form v-else @submit.prevent="handleSave" class="balloon-form">
      <!-- Drawing and Sheet Selection Card -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-diagram-3 me-2"></i>
            {{ t('balloon:editor.sections.drawingSheetAssociation') }}
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <label for="drawingSelect" class="form-label">{{ t('balloon:editor.fields.drawing') }} *</label>
              <select
                id="drawingSelect"
                v-model="selectedDrawingId"
                @change="onDrawingChange"
                class="form-select"
                :class="{ 'is-invalid': formErrors.drawing }"
                required
              >
                <option value="">{{ t('balloon:editor.fields.selectDrawing') }}</option>
                <option v-for="drawing in availableDrawings" :key="drawing.id" :value="drawing.id">
                  {{ drawing.code || drawing.name }} - {{ drawing.name }}
                </option>
              </select>
              <div v-if="formErrors.drawing" class="invalid-feedback">
                {{ formErrors.drawing }}
              </div>
            </div>
            
            <div class="col-md-6">
              <label for="sheetSelect" class="form-label">{{ t('balloon:editor.fields.sheet') }} *</label>
              <select
                id="sheetSelect"
                v-model="selectedSheetId"
                class="form-select"
                :class="{ 'is-invalid': formErrors.sheet }"
                :disabled="!selectedDrawingId"
                required
              >
                <option value="">{{ t('balloon:editor.fields.selectSheet') }}</option>
                <option v-for="sheet in filteredSheets" :key="sheet.id" :value="sheet.id">
                  {{ sheet.creoId || sheet.code || sheet.name }} - {{ sheet.name }}
                </option>
              </select>
              <div v-if="formErrors.sheet" class="invalid-feedback">
                {{ formErrors.sheet }}
              </div>
              <div v-if="!selectedDrawingId" class="form-text">
                {{ t('balloon:editor.fields.selectSheetFirst') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Balloon Data Card -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-geo-alt me-2"></i>
            {{ t('balloon:editor.sections.balloonData') }}
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <label for="balloonCreoId" class="form-label">{{ t('balloon:editor.fields.creoId') }} *</label>
              <input
                id="balloonCreoId"
                v-model="balloonFormData.balloon.creoId"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.balloonCreoId }"
                required
                :placeholder="t('balloon:editor.placeholders.creoId')"
              >
              <div v-if="formErrors.balloonCreoId" class="invalid-feedback">
                {{ formErrors.balloonCreoId }}
              </div>
            </div>
            
            <div class="col-md-4">
              <label for="balloonValue" class="form-label">{{ t('balloon:editor.fields.value') }} *</label>
              <input
                id="balloonValue"
                v-model="balloonFormData.balloon.baloonValue"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.balloonValue }"
                required
                :placeholder="t('balloon:editor.placeholders.value')"
              >
              <div v-if="formErrors.balloonValue" class="invalid-feedback">
                {{ formErrors.balloonValue }}
              </div>
            </div>
            
            <div class="col-md-4">
              <label for="balloonType" class="form-label">{{ t('balloon:editor.fields.type') }}</label>
              <select
                id="balloonType"
                v-model="balloonFormData.balloon.baloonType"
                class="form-select"
                :class="{ 'is-invalid': formErrors.balloonType }"
              >
                <option value="">{{ t('balloon:editor.fields.selectType') }}</option>
                <option value="CIRCLE">{{ t('balloon:editor.types.balloon.circle') }}</option>
                <option value="SQUARE">{{ t('balloon:editor.types.balloon.square') }}</option>
                <option value="TRIANGLE">{{ t('balloon:editor.types.balloon.triangle') }}</option>
                <option value="DIAMOND">{{ t('balloon:editor.types.balloon.diamond') }}</option>
              </select>
              <div v-if="formErrors.balloonType" class="invalid-feedback">
                {{ formErrors.balloonType }}
              </div>
            </div>
          </div>

          <div class="row mt-3">
            <div class="col-md-6">
              <label for="balloonName" class="form-label">{{ t('balloon:editor.fields.name') }}</label>
              <input
                id="balloonName"
                v-model="balloonFormData.balloon.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.balloonName }"
                :placeholder="t('balloon:editor.placeholders.balloonName')"
              >
              <div v-if="formErrors.balloonName" class="invalid-feedback">
                {{ formErrors.balloonName }}
              </div>
            </div>
            
            <div class="col-md-6">
              <label for="balloonCode" class="form-label">{{ t('balloon:editor.fields.code') }}</label>
              <input
                id="balloonCode"
                v-model="balloonFormData.balloon.code"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.balloonCode }"
                :placeholder="t('balloon:editor.placeholders.balloonCode')"
              >
              <div v-if="formErrors.balloonCode" class="invalid-feedback">
                {{ formErrors.balloonCode }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Note Data Card -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-sticky me-2"></i>
            {{ t('balloon:editor.sections.noteData') }}
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <label for="noteCreoId" class="form-label">{{ t('balloon:editor.fields.creoId') }} *</label>
              <input
                id="noteCreoId"
                v-model="balloonFormData.note.creoId"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.noteCreoId }"
                required
                :placeholder="t('balloon:editor.placeholders.noteCreoId')"
              >
              <div v-if="formErrors.noteCreoId" class="invalid-feedback">
                {{ formErrors.noteCreoId }}
              </div>
            </div>
            
            <div class="col-md-4">
              <label for="noteValue" class="form-label">{{ t('balloon:editor.fields.value') }}</label>
              <input
                id="noteValue"
                v-model="balloonFormData.note.noteValue"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.noteValue }"
                :placeholder="t('balloon:editor.placeholders.noteValue')"
              >
              <div v-if="formErrors.noteValue" class="invalid-feedback">
                {{ formErrors.noteValue }}
              </div>
            </div>
            
            <div class="col-md-4">
              <label for="noteType" class="form-label">{{ t('balloon:editor.fields.type') }}</label>
              <select
                id="noteType"
                v-model="balloonFormData.note.noteType"
                class="form-select"
                :class="{ 'is-invalid': formErrors.noteType }"
              >
                <option value="">{{ t('balloon:editor.fields.selectType') }}</option>
                <option value="STANDARD">{{ t('balloon:editor.types.note.standard') }}</option>
                <option value="LEADER">{{ t('balloon:editor.types.note.leader') }}</option>
                <option value="ARROW">{{ t('balloon:editor.types.note.arrow') }}</option>
              </select>
              <div v-if="formErrors.noteType" class="invalid-feedback">
                {{ formErrors.noteType }}
              </div>
            </div>
          </div>

          <div class="row mt-3">
            <div class="col-md-6">
              <label for="noteName" class="form-label">{{ t('balloon:editor.fields.name') }}</label>
              <input
                id="noteName"
                v-model="balloonFormData.note.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.noteName }"
                :placeholder="t('balloon:editor.placeholders.noteName')"
              >
              <div v-if="formErrors.noteName" class="invalid-feedback">
                {{ formErrors.noteName }}
              </div>
            </div>
            
            <div class="col-md-6">
              <label for="noteCode" class="form-label">{{ t('balloon:editor.fields.code') }}</label>
              <input
                id="noteCode"
                v-model="balloonFormData.note.code"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.noteCode }"
                :placeholder="t('balloon:editor.placeholders.noteCode')"
              >
              <div v-if="formErrors.noteCode" class="invalid-feedback">
                {{ formErrors.noteCode }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Attributes Management Card -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-tags me-2"></i>
              {{ t('balloon:editor.attributes.title', { count: attributes.length }) }}
            </h5>
            <button 
              v-if="attributes.length < 4" 
              type="button" 
              @click="addAttribute" 
              class="btn btn-sm btn-outline-primary"
            >
              <i class="bi bi-plus me-1"></i>
              {{ t('balloon:editor.attributes.addAttribute') }}
            </button>
          </div>
        </div>
        <div class="card-body">
          <div v-if="attributes.length === 0" class="text-center py-4 text-muted">
            <i class="bi bi-tags display-4"></i>
            <p class="mt-2">{{ t('balloon:editor.attributes.noAttributes') }}</p>
            <button type="button" @click="addAttribute" class="btn btn-outline-primary">
              <i class="bi bi-plus me-2"></i>
              {{ t('balloon:editor.attributes.addFirstAttribute') }}
            </button>
          </div>
          
          <div v-else>
            <!-- Attributes List -->
            <div class="row">
              <div 
                v-for="(attribute, index) in attributes" 
                :key="`attr-${index}`"
                class="col-12 mb-3"
              >
                <div class="card border-light">
                  <div class="card-header bg-light py-2">
                    <div class="d-flex justify-content-between align-items-center">
                      <h6 class="mb-0">
                        {{ t('balloon:editor.attributes.attribute') }} {{ attribute.order || (index + 1) }}
                      </h6>
                      <div class="btn-group btn-group-sm">
                        <button 
                          v-if="index > 0" 
                          type="button" 
                          @click="moveAttributeUp(index)"
                          class="btn btn-outline-secondary"
                          :title="t('balloon:editor.attributes.moveUp')"
                        >
                          <i class="bi bi-arrow-up"></i>
                        </button>
                        <button 
                          v-if="index < attributes.length - 1" 
                          type="button" 
                          @click="moveAttributeDown(index)"
                          class="btn btn-outline-secondary"
                          :title="t('balloon:editor.attributes.moveDown')"
                        >
                          <i class="bi bi-arrow-down"></i>
                        </button>
                        <button 
                          type="button" 
                          @click="removeAttribute(index)"
                          class="btn btn-outline-danger"
                          :title="t('balloon:editor.attributes.remove')"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="card-body py-3">
                    <div class="row">
                      <div class="col-md-4">
                        <label :for="`attrValue-${index}`" class="form-label">{{ t('balloon:editor.fields.value') }}</label>
                        <input
                          :id="`attrValue-${index}`"
                          v-model="attribute.attributeValue"
                          type="text"
                          class="form-control"
                          :placeholder="t('balloon:editor.placeholders.attributeValue')"
                        >
                      </div>
                      <div class="col-md-4">
                        <label :for="`attrType-${index}`" class="form-label">{{ t('balloon:editor.fields.valueType') }}</label>
                        <select
                          :id="`attrType-${index}`"
                          v-model="attribute.typeValue"
                          class="form-select"
                        >
                          <option value="">{{ t('balloon:editor.fields.selectType') }}</option>
                          <option value="STRING">{{ t('balloon:editor.types.attribute.string') }}</option>
                          <option value="INTEGER">{{ t('balloon:editor.types.attribute.integer') }}</option>
                          <option value="DOUBLE">{{ t('balloon:editor.types.attribute.double') }}</option>
                          <option value="BOOLEAN">{{ t('balloon:editor.types.attribute.boolean') }}</option>
                          <option value="DATE">{{ t('balloon:editor.types.attribute.date') }}</option>
                          <option value="CONTENT">{{ t('balloon:editor.types.attribute.content') }}</option>
                          <option value="URL">{{ t('balloon:editor.types.attribute.url') }}</option>
                        </select>
                      </div>
                      <div class="col-md-4">
                        <label :for="`attrOrder-${index}`" class="form-label">{{ t('balloon:editor.fields.order') }}</label>
                        <input
                          :id="`attrOrder-${index}`"
                          v-model.number="attribute.order"
                          type="number"
                          class="form-control"
                          min="1"
                          max="4"
                          readonly
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <div>
              <NuxtLink to="/dashboard/balloons" class="btn btn-outline-secondary">
                <i class="bi bi-x-lg me-2"></i>
                {{ t('balloon:editor.buttons.cancel') }}
              </NuxtLink>
            </div>
            <div>
              <button 
                v-if="isEditMode"
                type="button" 
                @click="handleDelete" 
                class="btn btn-outline-danger me-2"
                :disabled="saving"
              >
                <i class="bi bi-trash me-2"></i>
                {{ t('balloon:editor.buttons.delete') }}
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="saving"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi me-2" :class="isEditMode ? 'bi-check-lg' : 'bi-plus-lg'"></i>
                {{ saving ? t('balloon:editor.buttons.saving') : (isEditMode ? t('balloon:editor.buttons.update') : t('balloon:editor.buttons.create')) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- JSON View Modal -->
    <div v-if="showJsonModal" class="modal show d-block" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5>{{ t('balloon:editor.json.title', { value: currentBalloon?.baloonValue || 'N/A' }) }}</h5>
            <button class="btn-close" @click="closeJsonModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="loadingJson" class="text-center py-4">
              <div class="spinner-border text-primary"></div>
              <p class="mt-2">{{ t('balloon:editor.loading.json') }}</p>
            </div>
            <div v-else-if="jsonError" class="alert alert-danger">
              <strong>{{ t('balloon:editor.errors.title') }}:</strong> {{ jsonError }}
            </div>
            <div v-else>
              <pre class="json-display"><code>{{ formattedBalloonJson }}</code></pre>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeJsonModal">{{ t('balloon:editor.json.close') }}</button>
            <button class="btn btn-primary" @click="copyJsonToClipboard" :disabled="!currentBalloon">
              <i class="bi bi-clipboard me-2"></i>
              {{ t('balloon:editor.json.copy') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'
import { useI18n } from '~/composables/useI18n'
import type { IBaloon } from '~/model/baloon.model'
import type { INote } from '~/model/note.model'
import type { IAttributeEntity } from '~/model/attribute-entity.model'
import type { IModel } from '~/model/model.model'
import type { ISheet } from '~/model/sheet.model'

// Page setup
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const { balloons: balloonsApi, notes: notesApi, attributeEntities: attributesApi, models: modelsApi, sheets: sheetsApi } = useApi()
const { isAuthenticated } = useAuth()
const { t, loadNamespace, pageNamespace, currentLanguage } = useI18n('balloon')

// Reactive state
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const loadingMessage = ref('Caricamento...')

// Data
const allModels = ref<IModel[]>([])
const allSheets = ref<ISheet[]>([])
const currentBalloon = ref<IBaloon | null>(null)
const currentNote = ref<INote | null>(null)

// Form state
const selectedDrawingId = ref('')
const selectedSheetId = ref('')
const attributes = ref<IAttributeEntity[]>([])

// Form data
const balloonFormData = ref({
  balloon: {
    creoId: '',
    code: '',
    name: '',
    baloonValue: '',
    baloonType: ''
  },
  note: {
    creoId: '',
    code: '',
    name: '',
    noteValue: '',
    noteType: ''
  }
})

const formErrors = ref<Record<string, string>>({})

// JSON Modal state
const showJsonModal = ref(false)
const loadingJson = ref(false)
const jsonError = ref<string | null>(null)

// Computed properties
const isEditMode = computed(() => {
  return route.params.id !== 'new'
})

const balloonId = computed(() => {
  return isEditMode.value ? parseInt(route.params.id as string) : null
})

const availableDrawings = computed(() => {
  return allModels.value.filter(model => model.modelType === 'DRAWING')
})

const filteredSheets = computed(() => {
  console.log('[BalloonEditor] COMPUTING filteredSheets - selectedDrawingId:', selectedDrawingId.value)
  console.log('[BalloonEditor] Available sheets total:', allSheets.value.length)
  
  if (!selectedDrawingId.value) {
    console.log('[BalloonEditor] No drawing selected, returning empty array')
    return []
  }
  
  // Convert both values to string for robust comparison
  const selectedId = selectedDrawingId.value.toString()
  console.log('[BalloonEditor] Looking for sheets with drawing ID:', selectedId)
  
  // Debug all sheets and their drawing associations
  console.log('[BalloonEditor] ALL SHEETS:')
  allSheets.value.forEach((sheet, idx) => {
    console.log(`  Sheet ${idx}: ID=${sheet.id}, name=${sheet.name || sheet.creoId}, drawingId=${sheet.drawing?.id}, drawingName=${sheet.drawing?.name}`)
  })
  
  const filtered = allSheets.value.filter(sheet => {
    const sheetDrawingId = sheet.drawing?.id?.toString()
    const matches = sheetDrawingId === selectedId
    
    console.log(`[BalloonEditor] Sheet ${sheet.id} check: ${sheetDrawingId} === ${selectedId} ? ${matches}`)
    
    return matches
  })
  
  console.log('[BalloonEditor] *** FINAL RESULT: Filtered sheets for drawing ID', selectedId, ':', filtered.length)
  filtered.forEach(sheet => {
    console.log(`  -> Sheet ${sheet.id}: ${sheet.name || sheet.creoId}`)
  })
  
  return filtered
})

const formattedBalloonJson = computed(() => {
  if (!currentBalloon.value) return ''
  try {
    return JSON.stringify(currentBalloon.value, null, 2)
  } catch (err) {
    return 'Error formatting JSON: ' + err
  }
})

// Methods
const loadInitialData = async () => {
  loading.value = true
  loadingMessage.value = t('balloon:editor.loading.baseData')
  error.value = null
  
  try {
    // Load models and sheets
    const [modelsResponse, sheetsResponse] = await Promise.all([
      modelsApi.getAll(),
      sheetsApi.getAll()
    ])
    
    if (modelsResponse.success) {
      allModels.value = modelsResponse.data || []
    }
    
    if (sheetsResponse.success) {
      allSheets.value = sheetsResponse.data || []
    }
    
    console.log('[BalloonEditor] Base data loaded:', {
      models: allModels.value.length,
      sheets: allSheets.value.length,
      drawings: availableDrawings.value.length
    })
    
  } catch (err) {
    console.error('[BalloonEditor] Error loading initial data:', err)
    error.value = t('balloon:editor.errors.baseDataLoad')
  } finally {
    loading.value = false
  }
}

const loadBalloonForEdit = async () => {
  if (!balloonId.value) return
  
  loading.value = true
  loadingMessage.value = t('balloon:editor.loading.balloon')
  error.value = null
  
  try {
    // Load balloon by ID
    const balloonResponse = await balloonsApi.getById(balloonId.value)
    
    if (!balloonResponse.success || !balloonResponse.data) {
      throw new Error(balloonResponse.error || t('balloon:editor.errors.balloonNotFound'))
    }
    
    const balloon = balloonResponse.data
    currentBalloon.value = balloon
    
    console.log('[BalloonEditor] Balloon loaded:', balloon)
    
    // Populate form data
    balloonFormData.value = {
      balloon: {
        creoId: balloon.creoId || '',
        code: balloon.code || '',
        name: balloon.name || '',
        baloonValue: balloon.baloonValue || '',
        baloonType: balloon.baloonType || ''
      },
      note: {
        creoId: '',
        code: '',
        name: '',
        noteValue: '',
        noteType: ''
      }
    }
    
    // Set drawing and sheet selections
    if (balloon.sheet?.id) {
      selectedSheetId.value = balloon.sheet.id.toString()
      
      // Find drawing from sheet
      const fullSheet = allSheets.value.find(sheet => sheet.id === balloon.sheet?.id)
      if (fullSheet?.drawing?.id) {
        selectedDrawingId.value = fullSheet.drawing.id.toString()
        console.log('[BalloonEditor] Set drawing from sheet:', selectedDrawingId.value)
      }
    }
    
    // Load associated note and attributes
    await loadNoteAndAttributes()
    
  } catch (err) {
    console.error('[BalloonEditor] Error loading balloon:', err)
    error.value = err instanceof Error ? err.message : t('balloon:editor.errors.balloonNotFound')
  } finally {
    loading.value = false
  }
}

const loadNoteAndAttributes = async () => {
  if (!currentBalloon.value?.id) return
  
  try {
    // Load notes for this balloon
    const notesResponse = await notesApi.getAll()
    if (notesResponse.success) {
      const balloonNotes = (notesResponse.data || []).filter(
        note => note.baloon?.id === currentBalloon.value?.id
      )
      
      if (balloonNotes.length > 0) {
        currentNote.value = balloonNotes[0]
        
        // Update note form data
        balloonFormData.value.note = {
          creoId: currentNote.value.creoId || '',
          code: currentNote.value.code || '',
          name: currentNote.value.name || '',
          noteValue: currentNote.value.noteValue || '',
          noteType: currentNote.value.noteType || ''
        }
        
        // Load attributes for this note
        const attributesResponse = await attributesApi.getAll()
        if (attributesResponse.success) {
          const noteAttributes = (attributesResponse.data || [])
            .filter(attr => attr.note?.id === currentNote.value?.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
          
          attributes.value = noteAttributes
          console.log('[BalloonEditor] Loaded attributes:', noteAttributes.length)
        }
      }
    }
  } catch (err) {
    console.error('[BalloonEditor] Error loading note and attributes:', err)
  }
}

const onDrawingChange = () => {
  console.log('[BalloonEditor] Drawing selection changed to:', selectedDrawingId.value)
  
  // Reset sheet when drawing changes
  selectedSheetId.value = ''
  console.log('[BalloonEditor] Sheet selection reset')
  
  // Debug: show available data
  console.log('[BalloonEditor] Available data:', {
    drawings: availableDrawings.value.length,
    sheets: allSheets.value.length,
    sheetsWithDrawing: allSheets.value.filter(s => s.drawing?.id).length
  })
  
  // Force reactivity by triggering filteredSheets computation
  setTimeout(() => {
    console.log('[BalloonEditor] Available sheets after drawing change:', filteredSheets.value.length)
  }, 100)
}

const addAttribute = () => {
  if (attributes.value.length >= 4) return
  
  const newOrder = attributes.value.length + 1
  attributes.value.push({
    id: null,
    order: newOrder,
    attributeValue: '',
    typeValue: 'STRING',
    note: null
  })
}

const removeAttribute = (index: number) => {
  if (!confirm(t('balloon:editor.attributes.confirmRemove'))) return
  
  attributes.value.splice(index, 1)
  // Reorder remaining attributes
  reorderAttributes()
}

const moveAttributeUp = (index: number) => {
  if (index <= 0) return
  
  const temp = attributes.value[index]
  attributes.value[index] = attributes.value[index - 1]
  attributes.value[index - 1] = temp
  
  reorderAttributes()
}

const moveAttributeDown = (index: number) => {
  if (index >= attributes.value.length - 1) return
  
  const temp = attributes.value[index]
  attributes.value[index] = attributes.value[index + 1]
  attributes.value[index + 1] = temp
  
  reorderAttributes()
}

const reorderAttributes = () => {
  attributes.value.forEach((attr, index) => {
    attr.order = index + 1
  })
}



const initializeEmptyAttributes = () => {
  console.log('[BalloonEditor] Initializing 4 empty attributes for new balloon')
  
  attributes.value = []
  for (let i = 1; i <= 4; i++) {
    attributes.value.push({
      id: null,
      order: i,
      attributeValue: '',
      typeValue: 'STRING',
      note: null
    })
  }
  
  console.log('[BalloonEditor] Empty attributes initialized:', attributes.value.length)
}

const validateForm = (): boolean => {
  console.log('[BalloonEditor] Validating form with:', {
    selectedDrawingId: selectedDrawingId.value,
    selectedSheetId: selectedSheetId.value,
    balloonCreoId: balloonFormData.value.balloon.creoId,
    balloonValue: balloonFormData.value.balloon.baloonValue,
    noteCreoId: balloonFormData.value.note.creoId
  })
  
  const errors: Record<string, string> = {}
  
  // Validate drawing and sheet
  if (!selectedDrawingId.value) {
    errors.drawing = t('balloon:editor.validation.drawingRequired')
    console.log('[BalloonEditor] Validation error: no drawing selected')
  }
  if (!selectedSheetId.value) {
    errors.sheet = t('balloon:editor.validation.sheetRequired')
    console.log('[BalloonEditor] Validation error: no sheet selected')
  }
  
  // Validate balloon
  if (!balloonFormData.value.balloon.creoId?.trim()) {
    errors.balloonCreoId = t('balloon:editor.validation.required')
  }
  if (!balloonFormData.value.balloon.baloonValue?.trim()) {
    errors.balloonValue = t('balloon:editor.validation.required')
  }
  
  // Validate note
  if (!balloonFormData.value.note.creoId?.trim()) {
    errors.noteCreoId = t('balloon:editor.validation.required')
  }
  
  console.log('[BalloonEditor] Validation errors:', errors)
  
  formErrors.value = errors
  const isValid = Object.keys(errors).length === 0
  console.log('[BalloonEditor] Form is valid:', isValid)
  
  return isValid
}

const handleSave = async () => {
  console.log('[BalloonEditor] Save started')
  
  if (!validateForm()) {
    console.log('[BalloonEditor] Validation failed')
    return
  }
  
  saving.value = true
  error.value = null
  
  try {
    console.log('[BalloonEditor] Looking for selected sheet:', {
      selectedSheetId: selectedSheetId.value,
      selectedSheetIdType: typeof selectedSheetId.value,
      availableSheets: allSheets.value.length
    })
    
    // Debug: show all sheets
    console.log('[BalloonEditor] Available sheets:')
    allSheets.value.forEach(sheet => {
      console.log(`  Sheet ID: ${sheet.id} (${typeof sheet.id}) - ${sheet.name || sheet.creoId}`)
    })
    
    // Get selected sheet with robust comparison
    const selectedSheet = allSheets.value.find(sheet => {
      const sheetIdStr = sheet.id?.toString()
      const selectedIdStr = selectedSheetId.value.toString()
      const matches = sheetIdStr === selectedIdStr
      
      if (matches) {
        console.log('[BalloonEditor] FOUND matching sheet:', {
          id: sheet.id,
          name: sheet.name || sheet.creoId,
          match: `${sheetIdStr} === ${selectedIdStr}`
        })
      }
      
      return matches
    })
    
    console.log('[BalloonEditor] Selected sheet search result:', !!selectedSheet)
    
    if (!selectedSheet) {
      console.error('[BalloonEditor] Sheet not found! Debug info:', {
        searchingFor: selectedSheetId.value,
        availableIds: allSheets.value.map(s => s.id),
        filteredSheets: filteredSheets.value.length
      })
      throw new Error(t('balloon:editor.errors.sheetNotFound', { id: selectedSheetId.value }))
    }
    
    console.log('[BalloonEditor] Using sheet for creation:', {
      id: selectedSheet.id,
      name: selectedSheet.name,
      creoId: selectedSheet.creoId
    })
    
    if (isEditMode.value && currentBalloon.value) {
      // Update existing balloon
      await updateBalloon(selectedSheet)
    } else {
      // Create new balloon
      await createBalloon(selectedSheet)
    }
    
    // Redirect to list
    await router.push('/dashboard/balloons')
    
  } catch (err) {
    console.error('[BalloonEditor] Save error:', err)
    error.value = err instanceof Error ? err.message : t('balloon:editor.errors.save')
  } finally {
    saving.value = false
  }
}

const createBalloon = async (selectedSheet: ISheet) => {
  // Create balloon
  const balloonData = {
    creoId: balloonFormData.value.balloon.creoId,
    code: balloonFormData.value.balloon.code || null,
    name: balloonFormData.value.balloon.name || null,
    baloonValue: balloonFormData.value.balloon.baloonValue,
    baloonType: balloonFormData.value.balloon.baloonType || null,
    sheet: selectedSheet
  }
  
  const balloonResponse = await balloonsApi.create(balloonData)
  if (!balloonResponse.success || !balloonResponse.data) {
    throw new Error(balloonResponse.error || t('balloon:editor.errors.balloonCreation'))
  }
  
  const createdBalloon = balloonResponse.data
  console.log('[BalloonEditor] Balloon created:', createdBalloon)
  
  // Create note
  const noteData = {
    creoId: balloonFormData.value.note.creoId,
    code: balloonFormData.value.note.code || null,
    name: balloonFormData.value.note.name || null,
    noteValue: balloonFormData.value.note.noteValue || null,
    noteType: balloonFormData.value.note.noteType || null,
    baloon: createdBalloon
  }
  
  const noteResponse = await notesApi.create(noteData)
  if (!noteResponse.success || !noteResponse.data) {
    throw new Error(noteResponse.error || t('balloon:editor.errors.noteCreation'))
  }
  
  const createdNote = noteResponse.data
  console.log('[BalloonEditor] Note created:', createdNote)
  
  // Create attributes (4 empty attributes)
  await createAttributes(createdNote)
}

const updateBalloon = async (selectedSheet: ISheet) => {
  if (!currentBalloon.value?.id) throw new Error('ID balloon mancante')
  
  // Update balloon
  const balloonData = {
    id: currentBalloon.value.id,
    creoId: balloonFormData.value.balloon.creoId,
    code: balloonFormData.value.balloon.code || null,
    name: balloonFormData.value.balloon.name || null,
    baloonValue: balloonFormData.value.balloon.baloonValue,
    baloonType: balloonFormData.value.balloon.baloonType || null,
    sheet: selectedSheet,
    position: currentBalloon.value.position,
    symbol: currentBalloon.value.symbol
  }
  
  const balloonResponse = await balloonsApi.update(currentBalloon.value.id, balloonData)
  if (!balloonResponse.success) {
    throw new Error(balloonResponse.error || t('balloon:editor.errors.balloonUpdate'))
  }
  
  console.log('[BalloonEditor] Balloon updated')
  
  // Update or create note
  if (currentNote.value?.id) {
    // Update existing note
    const noteData = {
      id: currentNote.value.id,
      creoId: balloonFormData.value.note.creoId,
      code: balloonFormData.value.note.code || null,
      name: balloonFormData.value.note.name || null,
      noteValue: balloonFormData.value.note.noteValue || null,
      noteType: balloonFormData.value.note.noteType || null,
      baloon: currentBalloon.value
    }
    
    const noteResponse = await notesApi.update(currentNote.value.id, noteData)
    if (!noteResponse.success) {
      console.warn('[BalloonEditor] Note update failed:', noteResponse.error)
    }
    
    // Update attributes
    await updateAttributes()
  } else {
    // Create new note
    const noteData = {
      creoId: balloonFormData.value.note.creoId,
      code: balloonFormData.value.note.code || null,
      name: balloonFormData.value.note.name || null,
      noteValue: balloonFormData.value.note.noteValue || null,
      noteType: balloonFormData.value.note.noteType || null,
      baloon: currentBalloon.value
    }
    
    const noteResponse = await notesApi.create(noteData)
    if (noteResponse.success && noteResponse.data) {
      currentNote.value = noteResponse.data
      await createAttributes(noteResponse.data)
    }
  }
}

const createAttributes = async (note: INote) => {
  console.log('[BalloonEditor] Creating attributes for note:', note.id)
  console.log('[BalloonEditor] Attributes to create:', attributes.value.length)
  
  // Always create 4 attributes, even if empty
  for (const attr of attributes.value) {
    const attributeData = {
      order: attr.order,
      attributeValue: attr.attributeValue || '', // Allow empty values
      typeValue: attr.typeValue || 'STRING',
      note: note
    }
    
    console.log(`[BalloonEditor] Creating attribute ${attr.order}:`, attributeData.attributeValue || '(empty)')
    
    const result = await attributesApi.create(attributeData)
    if (!result.success) {
      console.warn(`[BalloonEditor] Attribute ${attr.order} creation failed:`, result.error)
    } else {
      console.log(`[BalloonEditor] Attribute ${attr.order} created successfully`)
    }
  }
  
  console.log('[BalloonEditor] All attributes created')
}

const updateAttributes = async () => {
  if (!currentNote.value?.id) return
  
  console.log('[BalloonEditor] Updating attributes for note:', currentNote.value.id)
  
  for (const attr of attributes.value) {
    if (attr.id) {
      // Update existing attribute
      const attributeData = {
        id: attr.id,
        order: attr.order,
        attributeValue: attr.attributeValue || '',
        typeValue: attr.typeValue || 'STRING',
        note: currentNote.value
      }
      
      const result = await attributesApi.update(attr.id, attributeData)
      if (!result.success) {
        console.warn('[BalloonEditor] Attribute update failed:', result.error)
      }
    } else {
      // Create new attribute (allow empty values)
      const attributeData = {
        order: attr.order,
        attributeValue: attr.attributeValue || '',
        typeValue: attr.typeValue || 'STRING',
        note: currentNote.value
      }
      
      const result = await attributesApi.create(attributeData)
      if (!result.success) {
        console.warn('[BalloonEditor] Attribute creation failed:', result.error)
      } else {
        console.log(`[BalloonEditor] New attribute ${attr.order} created`)
      }
    }
  }
}

const handleDelete = async () => {
  if (!isEditMode.value || !currentBalloon.value?.id) return
  
  if (!confirm(t('balloon:editor.confirmations.delete'))) {
    return
  }
  
  saving.value = true
  error.value = null
  
  try {
    const result = await balloonsApi.delete(currentBalloon.value.id)
    if (!result.success) {
      throw new Error(result.error || t('balloon:editor.errors.balloonDelete'))
    }
    
    console.log('[BalloonEditor] Balloon deleted')
    await router.push('/dashboard/balloons')
    
  } catch (err) {
    console.error('[BalloonEditor] Delete error:', err)
    error.value = err instanceof Error ? err.message : t('balloon:editor.errors.delete')
  } finally {
    saving.value = false
  }
}

const handleRefresh = async () => {
  if (isEditMode.value) {
    await loadBalloonForEdit()
  } else {
    await loadInitialData()
  }
}

const viewBalloonJson = async () => {
  if (!currentBalloon.value?.id) return
  
  loadingJson.value = true
  jsonError.value = null
  showJsonModal.value = true
  
  try {
    const response = await balloonsApi.getById(currentBalloon.value.id)
    if (!response.success || !response.data) {
      throw new Error(response.error || t('balloon:editor.errors.json'))
    }
    
    currentBalloon.value = response.data
  } catch (err) {
    jsonError.value = err instanceof Error ? err.message : t('balloon:editor.errors.json')
  } finally {
    loadingJson.value = false
  }
}

const closeJsonModal = () => {
  showJsonModal.value = false
  jsonError.value = null
}

const copyJsonToClipboard = async () => {
  if (!currentBalloon.value) return
  
  try {
    const jsonText = JSON.stringify(currentBalloon.value, null, 2)
    await navigator.clipboard.writeText(jsonText)
    console.log('[BalloonEditor] JSON copied to clipboard')
  } catch (err) {
    console.error('[BalloonEditor] Failed to copy JSON:', err)
  }
}

// Initialize
onMounted(async () => {
  // Load translations
  await loadNamespace('balloon')
  
  // Debug: check if translations are loaded
  console.log('[BalloonEditor] Checking translations:', {
    namespace: 'balloon',
    pageNamespace: pageNamespace?.value,
    currentLang: currentLanguage?.value,
    testTranslation: t('balloon:editor.title.edit'),
    testWithPrefix: t('balloon:editor.title.edit'),
    hasNamespace: !!t('balloon:editor.title.edit')
  })
  
  // Test manual translation loading
  try {
    const balloonTranslations = await import('../../../i18n/en/balloon.json')
    console.log('[BalloonEditor] Manual balloon translations loaded:', balloonTranslations.default?.editor?.title?.edit)
  } catch (e) {
    console.error('[BalloonEditor] Failed to manually load balloon translations:', e)
  }
  
  if (!isAuthenticated.value) {
    error.value = t('balloon:editor.errors.authRequired')
    return
  }
  
  await loadInitialData()
  
  if (isEditMode.value) {
    await loadBalloonForEdit()
  } else {
    // Initialize empty attributes for new balloon creation
    initializeEmptyAttributes()
  }
  
  console.log('[BalloonEditor] Component initialized:', {
    isEditMode: isEditMode.value,
    balloonId: balloonId.value,
    attributesCount: attributes.value.length
  })
})
</script>

<style scoped>
.balloon-editor {
  padding: 1rem;
  min-height: 100vh;
}

.balloon-form {
  max-width: 1200px;
  margin: 0 auto;
}

.json-display {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  max-height: 70vh;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
}

.json-display code {
  background: none;
  color: #495057;
  padding: 0;
  font-size: inherit;
}

.card-header h5 {
  color: #495057;
  font-weight: 600;
}

.breadcrumb {
  background: none;
  padding: 0;
  margin-bottom: 0.5rem;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: '›';
  color: #6c757d;
}

.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .balloon-editor {
    padding: 0.5rem;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-group {
    align-self: stretch;
  }
}
</style>