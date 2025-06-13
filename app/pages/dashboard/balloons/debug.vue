<!--
  Debug page for balloons - minimal version to test
-->
<template>
  <div class="balloons-debug">
    <h1>Balloons Debug Page</h1>
    <p>Loading: {{ loading }}</p>
    <p>Error: {{ error }}</p>
    <p>Balloons count: {{ balloons.length }}</p>
    <p>Notes count: {{ notes.length }}</p>
    <p>Models count: {{ allModels.length }}</p>
    <p>Sheets count: {{ allSheets.length }}</p>
    
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <h3>Data loaded successfully!</h3>
      <p>Grouped data length: {{ groupedBalloonData.length }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import type { IBaloon } from '~/model/baloon.model'
import type { INote } from '~/model/note.model'
import type { IAttributeEntity } from '~/model/attribute-entity.model'
import type { IModel } from '~/model/model.model'
import type { ISheet } from '~/model/sheet.model'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { balloons: balloonsApi, notes: notesApi, attributeEntities: attributesApi, models: modelsApi, sheets: sheetsApi } = useApi()
const { isAuthenticated } = useAuth()

// Reactive state
const balloons = ref<IBaloon[]>([])
const notes = ref<INote[]>([])
const attributeEntities = ref<IAttributeEntity[]>([])
const allModels = ref<IModel[]>([])
const allSheets = ref<ISheet[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Simple computed - no complex logic
const groupedBalloonData = computed(() => {
  console.log('[Debug] Computing grouped data...')
  try {
    // Very simple test - just return empty array for now
    return []
  } catch (err) {
    console.error('[Debug] Error in computed:', err)
    return []
  }
})

// Data loading
const loadData = async () => {
  console.log('[Debug] Starting loadData...')
  loading.value = true
  error.value = null
  
  try {
    console.log('[Debug] Making API calls...')
    const [balloonsResponse, notesResponse, attributesResponse, modelsResponse, sheetsResponse] = await Promise.all([
      balloonsApi.getAll(),
      notesApi.getAll(), 
      attributesApi.getAll(),
      modelsApi.getAll(),
      sheetsApi.getAll()
    ])
    
    console.log('[Debug] API responses received')
    
    if (balloonsResponse.success) {
      balloons.value = balloonsResponse.data || []
      console.log('[Debug] Balloons loaded:', balloons.value.length)
    }
    
    if (notesResponse.success) {
      notes.value = notesResponse.data || []
      console.log('[Debug] Notes loaded:', notes.value.length)
    }
    
    if (attributesResponse.success) {
      attributeEntities.value = attributesResponse.data || []
      console.log('[Debug] Attributes loaded:', attributeEntities.value.length)
    }
    
    if (modelsResponse.success) {
      allModels.value = modelsResponse.data || []
      console.log('[Debug] Models loaded:', allModels.value.length)
    }
    
    if (sheetsResponse.success) {
      allSheets.value = sheetsResponse.data || []
      console.log('[Debug] Sheets loaded:', allSheets.value.length)
    }
    
    console.log('[Debug] All data loaded successfully')
    
  } catch (err) {
    error.value = 'Failed to load data'
    console.error('[Debug] Error loading data:', err)
  } finally {
    loading.value = false
    console.log('[Debug] loadData completed')
  }
}

// Initialize
onMounted(async () => {
  console.log('[Debug] Component mounted, authenticated:', isAuthenticated.value)
  if (isAuthenticated.value) {
    await loadData()
  } else {
    error.value = 'Authentication required'
  }
})
</script>

<style scoped>
.balloons-debug {
  padding: 2rem;
}
</style>