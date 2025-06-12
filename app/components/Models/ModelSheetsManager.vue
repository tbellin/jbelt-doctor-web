<template>
  <div class="model-sheets-manager">
    <!-- Header con contatore -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0">
        <i class="bi bi-file-earmark-text me-2"></i>
        {{ t('models:sheets.associatedSheets') }}
        <span class="badge bg-primary ms-2">{{ sheets.length }}</span>
      </h6>
      <button 
        type="button" 
        class="btn btn-sm btn-outline-primary"
        @click="showAddModal = true"
        :disabled="loading"
      >
        <i class="bi bi-plus-circle me-1"></i>
        {{ t('models:sheets.addSheet') }}
      </button>
    </div>

    <!-- Lista fogli associati -->
    <div v-if="sheets.length > 0" class="sheets-list">
      <div 
        v-for="sheet in sheets" 
        :key="sheet.id"
        class="sheet-item d-flex justify-content-between align-items-center p-2 border rounded mb-2"
      >
        <div class="sheet-info">
          <strong class="text-primary">{{ sheet.code }}</strong>
          <span class="text-muted ms-2">{{ sheet.name }}</span>
          <div class="small text-muted">
            <i class="bi bi-rulers me-1"></i>{{ sheet.formatType }}
            <span v-if="sheet.drawing" class="ms-2">
              <i class="bi bi-image me-1"></i>{{ getDrawingInfo(sheet.drawing) }}
            </span>
          </div>
        </div>
        <div class="sheet-actions">
          <button 
            type="button" 
            class="btn btn-sm btn-outline-danger"
            @click="confirmRemoveAssociation(sheet)"
            :title="t('models:sheets.removeAssociation')"
          >
            <i class="bi bi-x-circle"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Messaggio vuoto -->
    <div v-else class="text-center text-muted py-3">
      <i class="bi bi-file-earmark-text fs-1 opacity-25"></i>
      <p class="mb-0">{{ t('models:sheets.noSheetsAssociated') }}</p>
      <small>{{ t('models:sheets.clickAddToAssociate') }}</small>
    </div>

    <!-- Modal per aggiungere fogli -->
    <AddSheetsModal 
      :show="showAddModal"
      :model="model"
      :existing-sheets="sheets"
      :available-sheets="availableSheets"
      :loading="modalLoading"
      @close="showAddModal = false"
      @add="handleAddSheets"
    />
  </div>
</template>

<script setup lang="ts">
import type { Model } from '~/types/model'
import type { SheetWithRelations } from '~/composables/useApi'
import { useI18n } from '~/composables/useI18n'
import AddSheetsModal from './AddSheetsModal.vue'

const { t } = useI18n()
const { sheets: sheetsApi } = useApi()

interface Props {
  model: Model
}

const props = defineProps<Props>()

const sheets = ref<SheetWithRelations[]>([])
const availableSheets = ref<SheetWithRelations[]>([])
const loading = ref(false)
const modalLoading = ref(false)
const showAddModal = ref(false)

const emit = defineEmits<{
  'update': []
}>()

// Carica i fogli associati al modello
const loadModelSheets = async () => {
  if (!props.model.id) return
  
  loading.value = true
  try {
    console.log(`[ModelSheets] Loading sheets for model ${props.model.id} (${props.model.code})`)
    
    // Prima: usa i dati già disponibili nel modello se esistono
    if (props.model.sheets && Array.isArray(props.model.sheets) && props.model.sheets.length > 0) {
      console.log(`[ModelSheets] Found ${props.model.sheets.length} sheets in model object:`, props.model.sheets)
      
      // I fogli nel modello potrebbero avere dati parziali, arricchiscili con i dati completi
      const enrichedSheets = []
      for (const partialSheet of props.model.sheets) {
        if (partialSheet.id) {
          // Se il foglio ha solo l'ID, recupera i dati completi
          if (!partialSheet.code || !partialSheet.name) {
            console.log(`[ModelSheets] Sheet ${partialSheet.id} has partial data, fetching complete info...`)
            try {
              const fullSheet = availableSheets.value.find(s => s.id === partialSheet.id)
              if (fullSheet) {
                enrichedSheets.push(fullSheet)
                console.log(`[ModelSheets] Enriched sheet ${partialSheet.id} with full data:`, fullSheet.code, fullSheet.name)
              } else {
                console.log(`[ModelSheets] Could not find full data for sheet ${partialSheet.id}, using partial data`)
                enrichedSheets.push(partialSheet)
              }
            } catch (err) {
              console.log(`[ModelSheets] Error enriching sheet ${partialSheet.id}, using partial data`)
              enrichedSheets.push(partialSheet)
            }
          } else {
            // Il foglio ha già dati completi
            enrichedSheets.push(partialSheet)
          }
        }
      }
      
      sheets.value = enrichedSheets
      console.log(`[ModelSheets] Final sheets array:`, enrichedSheets.map(s => ({ id: s.id, code: s.code, name: s.name })))
    } else {
      // Fallback: cerca tra tutti i fogli quelli che referenziano questo modello
      console.log('[ModelSheets] No sheets in model object, searching in all sheets...')
      const allSheetsResponse = await sheetsApi.getAll()
      if (allSheetsResponse.success) {
        const modelSheets = allSheetsResponse.data?.filter(sheet => {
          if (sheet.models && Array.isArray(sheet.models)) {
            return sheet.models.some((model: any) => {
              const modelId = typeof model === 'object' ? model.id : model
              return modelId === props.model.id
            })
          }
          return false
        }) || []
        
        sheets.value = modelSheets
        console.log(`[ModelSheets] Found ${modelSheets.length} sheets referencing model ${props.model.id}`)
      } else {
        console.error('[ModelSheets] Failed to load sheets via API fallback:', allSheetsResponse.error)
        sheets.value = []
      }
    }
  } catch (error) {
    console.error('[ModelSheets] Error loading model sheets:', error)
    sheets.value = []
  } finally {
    loading.value = false
  }
}

// Carica tutti i fogli disponibili per l'associazione
const loadAvailableSheets = async () => {
  try {
    const response = await sheetsApi.getAll()
    if (response.success) {
      availableSheets.value = response.data || []
      console.log(`[ModelSheets] Loaded ${availableSheets.value.length} available sheets`)
    }
  } catch (error) {
    console.error('[ModelSheets] Error loading available sheets:', error)
  }
}

// Gestisce l'aggiunta di nuovi fogli
const handleAddSheets = async (selectedSheetIds: number[]) => {
  if (!props.model.id || selectedSheetIds.length === 0) return

  modalLoading.value = true
  try {
    // Per ogni foglio selezionato, aggiorna la sua lista di modelli
    for (const sheetId of selectedSheetIds) {
      const sheet = availableSheets.value.find(s => s.id === sheetId)
      if (!sheet) continue

      // Prepara gli oggetti Model esistenti + il nuovo modello
      const currentModels = sheet.models || []
      const currentModelIds = currentModels.map(m => typeof m === 'object' ? m.id : m).filter(Boolean)
      
      // Evita duplicati - controlla se il modello è già associato
      if (currentModelIds.includes(props.model.id)) {
        console.log(`[ModelSheets] Model ${props.model.id} already associated to sheet ${sheetId}`)
        continue
      }

      // Crea l'oggetto modello completo da aggiungere (SENZA sheets per evitare referenze circolari)
      const modelToAdd = {
        id: props.model.id,
        code: props.model.code,
        name: props.model.name,
        modelType: props.model.modelType,
        instanceType: props.model.instanceType,
        file: props.model.file,
        designer: props.model.designer,
        item: props.model.item,
        parent: props.model.parent,
        instance: props.model.instance
        // NON includere sheets per evitare referenze circolari
      }

      // Combina modelli esistenti + nuovo modello
      const updatedModels = [...currentModels, modelToAdd]

      console.log(`[ModelSheets] Adding model ${props.model.id} to sheet ${sheetId}`)
      console.log(`[ModelSheets] Current models:`, currentModelIds)
      console.log(`[ModelSheets] Updated models (full objects):`, updatedModels.map(m => ({ id: m.id, name: m.name })))

      // Test: prova diversi formati per la serializzazione Set<ModelDTO> PRESERVANDO tutti i campi
      console.log('[ModelSheets] Trying different serialization formats for backend Set<ModelDTO>...')
      
      const targetSheet = availableSheets.value.find(s => s.id === sheetId)
      if (!targetSheet) {
        console.error('[ModelSheets] Cannot find sheet in availableSheets, skipping association')
        continue
      }
      
      // Prova 1: Foglio completo con models array (PRESERVANDO tutti i campi)
      console.log('[ModelSheets] 1️⃣ Trying with complete sheet + models array...')
      let updateResponse = await sheetsApi.update(sheetId, {
        id: sheetId,
        code: targetSheet.code,
        name: targetSheet.name,
        formatType: targetSheet.formatType,  // ⭐ PRESERVA il formato
        format: targetSheet.format,
        creoId: targetSheet.creoId,
        balloon: targetSheet.balloon,
        drawing: targetSheet.drawing,        // ⭐ PRESERVA l'associazione disegno esistente
        models: updatedModels
      })
      
      // La Prova 1 dovrebbe già funzionare inviando il foglio completo!
      console.log('[ModelSheets] ✅ Sent complete sheet preserving formatType and drawing association')

      if (!updateResponse.success) {
        console.error(`[ModelSheets] Failed to update sheet ${sheetId}:`, updateResponse.error)
        // Continua con gli altri fogli anche se uno fallisce
      }
    }

    showAddModal.value = false
    await loadModelSheets() // Ricarica i fogli associati
    emit('update') // Notifica il parent component
    
    console.log(`[ModelSheets] Successfully associated ${selectedSheetIds.length} sheets to model ${props.model.id}`)
  } catch (error) {
    console.error('[ModelSheets] Error adding sheets:', error)
  } finally {
    modalLoading.value = false
  }
}

// Conferma rimozione associazione
const confirmRemoveAssociation = async (sheet: SheetWithRelations) => {
  const confirmed = confirm(t('models:sheets.confirmRemoveAssociation', { 
    sheetName: sheet.name, 
    modelName: props.model.name 
  }))
  
  if (!confirmed) return

  try {
    // Rimuovi questo modello dalla lista dei modelli del foglio (mantieni oggetti completi)
    const currentModels = sheet.models || []
    const updatedModels = currentModels.filter(model => {
      const modelId = typeof model === 'object' ? model.id : model
      return modelId !== props.model.id
    })

    const currentModelIds = currentModels.map(m => typeof m === 'object' ? m.id : m).filter(Boolean)
    const updatedModelIds = updatedModels.map(m => typeof m === 'object' ? m.id : m).filter(Boolean)

    console.log(`[ModelSheets] Removing model ${props.model.id} from sheet ${sheet.id}`)
    console.log(`[ModelSheets] Current models:`, currentModelIds)
    console.log(`[ModelSheets] Updated models:`, updatedModelIds)

    // Prova la rimozione preservando TUTTI i campi del foglio
    console.log('[ModelSheets] Trying removal preserving ALL sheet fields...')
    
    const completeSheetData = {
      id: sheet.id,
      code: sheet.code,
      name: sheet.name,
      formatType: sheet.formatType,  // ⭐ PRESERVA il formato
      format: sheet.format,
      creoId: sheet.creoId,
      balloon: sheet.balloon,
      drawing: sheet.drawing,        // ⭐ PRESERVA l'associazione disegno
      models: updatedModels          // Solo models aggiornato (rimosso il modello)
    }
    
    let response = await sheetsApi.update(sheet.id!, completeSheetData)
    console.log('[ModelSheets] ✅ Sent complete sheet for removal preserving formatType and drawing association')

    if (response.success) {
      await loadModelSheets() // Ricarica i fogli associati
      emit('update') // Notifica il parent component
      console.log(`[ModelSheets] Successfully removed association`)
    } else {
      console.error('[ModelSheets] Failed to remove association:', response.error)
    }
  } catch (error) {
    console.error('[ModelSheets] Error removing association:', error)
  }
}

// Helper per mostrare info del disegno
const getDrawingInfo = (drawing: any): string => {
  if (typeof drawing === 'object' && drawing.name) {
    return drawing.name
  }
  return `Drawing ID: ${drawing}`
}

// Lifecycle
onMounted(async () => {
  // Prima carica tutti i fogli disponibili
  await loadAvailableSheets()
  // Poi carica i fogli del modello (che potrebbero aver bisogno di arricchimento)
  await loadModelSheets()
})

// Watch per ricaricare quando cambia il modello
watch(() => props.model.id, async () => {
  if (props.model.id) {
    // Assicurati che availableSheets sia caricato prima di loadModelSheets
    if (availableSheets.value.length === 0) {
      await loadAvailableSheets()
    }
    await loadModelSheets()
  }
})
</script>

<style scoped>
.model-sheets-manager {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
}

.sheet-item {
  background: white;
  transition: box-shadow 0.2s ease;
}

.sheet-item:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.sheets-list {
  max-height: 300px;
  overflow-y: auto;
}
</style>