<!--
  Demo component showing how to use the comprehensive ModelForm component
  This demonstrates both create and edit modes with proper data handling
  @version 1.0.0
-->
<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="bi bi-gear me-2"></i>
              {{ t('models:form.demo.title') }}
            </h5>
          </div>
          <div class="card-body">
            <!-- Demo Controls -->
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="btn-group" role="group">
                  <button 
                    type="button" 
                    class="btn btn-outline-primary"
                    :class="{ active: mode === 'create' }"
                    @click="switchMode('create')"
                  >
                    <i class="bi bi-plus me-1"></i>
                    {{ t('models:form.demo.createMode') }}
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary"
                    :class="{ active: mode === 'edit' }"
                    @click="switchMode('edit')"
                  >
                    <i class="bi bi-pencil me-1"></i>
                    {{ t('models:form.demo.editMode') }}
                  </button>
                </div>
              </div>
              <div class="col-md-6 text-end">
                <button 
                  type="button" 
                  class="btn btn-outline-info btn-sm"
                  @click="loadSampleData"
                >
                  <i class="bi bi-download me-1"></i>
                  {{ t('models:form.demo.loadSample') }}
                </button>
              </div>
            </div>

            <!-- Mode Indicator -->
            <div class="alert" :class="mode === 'create' ? 'alert-primary' : 'alert-secondary'" role="alert">
              <i class="bi bi-info-circle me-2"></i>
              <strong>{{ t('models:form.demo.currentMode') }}:</strong>
              {{ mode === 'create' ? t('models:form.demo.createMode') : t('models:form.demo.editMode') }}
              <span v-if="mode === 'edit' && currentModel">
                - {{ t('models:form.demo.editing') }}: {{ currentModel.code }} ({{ currentModel.name }})
              </span>
            </div>

            <!-- The Comprehensive Model Form -->
            <ModelForm
              :model-data="currentModel"
              :loading="saving"
              @submit="handleSubmit"
              @cancel="handleCancel"
            />

            <!-- Result Display -->
            <div v-if="lastResult" class="mt-4">
              <div class="card">
                <div class="card-header">
                  <h6 class="card-title mb-0">
                    <i class="bi bi-code-square me-2"></i>
                    {{ t('models:form.demo.result') }}
                  </h6>
                </div>
                <div class="card-body">
                  <div class="alert" :class="lastResult.success ? 'alert-success' : 'alert-danger'">
                    <i class="bi" :class="lastResult.success ? 'bi-check-circle' : 'bi-exclamation-triangle'"></i>
                    {{ lastResult.message }}
                  </div>
                  <pre class="bg-light p-3 rounded"><code>{{ JSON.stringify(lastResult.data, null, 2) }}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { type IModel } from '~/model/model.model'
import { useI18n } from '~/composables/useI18n'
import { useApi } from '~/composables/useApi'
import ModelForm from './ModelForm.vue'

const { t } = useI18n()
const api = useApi()

// Demo state
const mode = ref<'create' | 'edit'>('create')
const saving = ref(false)
const currentModel = ref<IModel | null>(null)
const lastResult = ref<{
  success: boolean
  message: string
  data: any
} | null>(null)

// Sample data for demo
const sampleModels: IModel[] = [
  {
    id: 1,
    code: 'ENGINE_BLOCK_001',
    name: 'V8 Engine Block',
    modelType: 'PART',
    instanceType: 'NORMAL'
  },
  {
    id: 2,
    code: 'TRANSMISSION_ASSY_001',
    name: 'Automatic Transmission Assembly',
    modelType: 'ASSEMBLY',
    instanceType: 'PARAMETRIC'
  },
  {
    id: 3,
    code: 'DRAWING_ENGINE_001',
    name: 'Engine Block Technical Drawing',
    modelType: 'DRAWING',
    instanceType: 'NORMAL'
  }
]

// Methods
const switchMode = (newMode: 'create' | 'edit') => {
  mode.value = newMode
  if (newMode === 'create') {
    currentModel.value = null
  } else {
    // Load first sample model for edit mode
    currentModel.value = { ...sampleModels[0] }
  }
  lastResult.value = null
}

const loadSampleData = () => {
  if (mode.value === 'create') {
    // Load sample data for create mode (without ID)
    const sample = { ...sampleModels[0] }
    delete sample.id
    sample.code = `SAMPLE_${Date.now()}`
    currentModel.value = sample
  } else {
    // Load sample data for edit mode
    const randomIndex = Math.floor(Math.random() * sampleModels.length)
    currentModel.value = { ...sampleModels[randomIndex] }
  }
  lastResult.value = null
}

const handleSubmit = async (modelData: IModel) => {
  saving.value = true
  lastResult.value = null
  
  try {
    let result
    
    if (mode.value === 'create') {
      console.log('[ModelFormDemo] Creating model:', modelData)
      result = await api.models.create(modelData)
      
      if (result.success) {
        lastResult.value = {
          success: true,
          message: t('models:messages.createSuccess'),
          data: result.data
        }
        // Switch to edit mode with the new model
        currentModel.value = result.data
        mode.value = 'edit'
      } else {
        lastResult.value = {
          success: false,
          message: result.error || t('models:form.demo.createError'),
          data: result
        }
      }
    } else {
      console.log('[ModelFormDemo] Updating model:', modelData)
      result = await api.models.update(modelData.id!, modelData)
      
      if (result.success) {
        lastResult.value = {
          success: true,
          message: t('models:messages.updateSuccess'),
          data: result.data
        }
        // Update current model with the result
        currentModel.value = result.data
      } else {
        lastResult.value = {
          success: false,
          message: result.error || t('models:form.demo.updateError'),
          data: result
        }
      }
    }
  } catch (error) {
    console.error('[ModelFormDemo] Error:', error)
    lastResult.value = {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: error
    }
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  console.log('[ModelFormDemo] Form cancelled')
  lastResult.value = {
    success: true,
    message: t('models:form.demo.cancelled'),
    data: null
  }
}

// Initialize in create mode
switchMode('create')
</script>

<style scoped>
.container-fluid {
  padding: 1rem;
}

.btn-group .btn.active {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: white;
}

pre code {
  font-size: 0.8rem;
  max-height: 300px;
  overflow-y: auto;
  display: block;
}

.alert {
  margin-bottom: 0;
}

.card-title {
  color: var(--bs-primary);
}
</style>