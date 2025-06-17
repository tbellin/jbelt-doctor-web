<template>
  <EntityForm
    :mode="mode"
    entity-name="ModelVersion"
    :initial-data="initialData"
    :validation-rules="validationRules"
    @submit="handleSubmit"
    @cancel="$emit('cancel')"
  >
    <template #default="{ formData, errors, loading, validateField }">
      <!-- Basic Information Section -->
      <div class="row">
        <!-- Version Number -->
        <div class="col-md-6 mb-2">
          <label for="versionNumber" class="form-label">
            {{ t('modelVersions:form.fields.versionNumber.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="versionNumber"
            v-model="formData.versionNumber"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.versionNumber, 'is-valid': !errors.versionNumber && formData.versionNumber }"
            :placeholder="t('modelVersions:form.fields.versionNumber.placeholder')"
            required
            pattern="^\d+\.\d+(\.\d+)?$"
            @blur="validateField('versionNumber')"
          >
          <div v-if="errors.versionNumber" class="invalid-feedback">
            {{ errors.versionNumber }}
          </div>
          <div class="form-text">
            {{ t('modelVersions:form.fields.versionNumber.help') }}
          </div>
        </div>

        <!-- Name -->
        <div class="col-md-6 mb-2">
          <label for="name" class="form-label">
            {{ t('modelVersions:form.fields.name.label') }}
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.name }"
            :placeholder="t('modelVersions:form.fields.name.placeholder')"
          >
          <div v-if="errors.name" class="invalid-feedback">
            {{ errors.name }}
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Status -->
        <div class="col-md-6 mb-2">
          <label for="status" class="form-label">
            {{ t('modelVersions:form.fields.status.label') }}
            <span class="text-danger">*</span>
          </label>
          <select
            id="status"
            v-model="formData.status"
            class="form-select"
            :class="{ 'is-invalid': errors.status, 'is-valid': !errors.status && formData.status }"
            required
          >
            <option value="">{{ t('modelVersions:form.fields.status.placeholder') }}</option>
            <option v-for="status in versionStatuses" :key="status" :value="status">
              {{ t(`modelVersions:form.fields.status.options.${status}`) }}
            </option>
          </select>
          <div v-if="errors.status" class="invalid-feedback">
            {{ errors.status }}
          </div>
        </div>

        <!-- Created Date -->
        <div class="col-md-6 mb-2">
          <label for="createdDate" class="form-label">
            {{ t('modelVersions:form.fields.createdDate.label') }}
          </label>
          <input
            id="createdDate"
            v-model="formData.createdDate"
            type="datetime-local"
            class="form-control"
            :class="{ 'is-invalid': errors.createdDate }"
          >
          <div v-if="errors.createdDate" class="invalid-feedback">
            {{ errors.createdDate }}
          </div>
          <div class="form-text">
            {{ t('modelVersions:form.fields.createdDate.help') }}
          </div>
        </div>
      </div>

      <!-- Model Association Section -->
      <div class="card bg-light border-0 mb-3">
        <div class="card-header bg-transparent border-0">
          <h6 class="mb-0">
            <i class="bi bi-box-seam me-2"></i>
            {{ t('modelVersions:form.model.title') }}
          </h6>
        </div>
        <div class="card-body">
          <div class="row">
            <!-- Model Selection -->
            <div class="col-md-12 mb-2">
              <label for="modelId" class="form-label">
                {{ t('modelVersions:form.fields.model.label') }}
                <span class="text-danger">*</span>
              </label>
              <select
                id="modelId"
                v-model="formData.modelId"
                class="form-select"
                :class="{ 'is-invalid': errors.modelId, 'is-valid': !errors.modelId && formData.modelId }"
                required
                :disabled="loading.models"
                @change="handleModelChange"
              >
                <option value="">{{ t('modelVersions:form.fields.model.placeholder') }}</option>
                <option v-for="model in availableModels" :key="model.id" :value="model.id">
                  {{ model.code }} - {{ model.name }}
                  <span v-if="model.type" class="text-muted">({{ model.type }})</span>
                </option>
              </select>
              <div v-if="loading.models" class="form-text">
                <i class="bi bi-spinner-border"></i> {{ t('common:loading') }}
              </div>
              <div v-if="errors.modelId" class="invalid-feedback">
                {{ errors.modelId }}
              </div>
            </div>
          </div>

          <!-- Selected Model Info -->
          <div v-if="selectedModel" class="row">
            <div class="col-12">
              <div class="alert alert-info mb-0">
                <div class="d-flex align-items-center">
                  <i class="bi bi-info-circle me-2"></i>
                  <div>
                    <strong>{{ selectedModel.name }}</strong><br>
                    <small class="text-muted">
                      {{ t('modelVersions:form.model.info') }}:
                      {{ selectedModel.code }} ({{ selectedModel.type }})
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Version Details Section -->
      <div class="row">
        <!-- Comments -->
        <div class="col-md-12 mb-2">
          <label for="comments" class="form-label">
            {{ t('modelVersions:form.fields.comments.label') }}
          </label>
          <textarea
            id="comments"
            v-model="formData.comments"
            class="form-control"
            rows="4"
            :class="{ 'is-invalid': errors.comments }"
            :placeholder="t('modelVersions:form.fields.comments.placeholder')"
          ></textarea>
          <div v-if="errors.comments" class="invalid-feedback">
            {{ errors.comments }}
          </div>
          <div class="form-text">
            {{ t('modelVersions:form.fields.comments.help') }}
          </div>
        </div>
      </div>

      <!-- Version Flags Section -->
      <div class="row">
        <!-- Is Current Version -->
        <div class="col-md-6 mb-2">
          <div class="form-check">
            <input
              id="isCurrentVersion"
              v-model="formData.isCurrentVersion"
              type="checkbox"
              class="form-check-input"
              @change="handleCurrentVersionChange"
            >
            <label for="isCurrentVersion" class="form-check-label">
              {{ t('modelVersions:form.fields.isCurrentVersion.label') }}
            </label>
          </div>
          <div class="form-text">
            {{ t('modelVersions:form.fields.isCurrentVersion.help') }}
          </div>
        </div>

        <!-- Is Approved -->
        <div class="col-md-6 mb-2">
          <div class="form-check">
            <input
              id="isApproved"
              v-model="formData.isApproved"
              type="checkbox"
              class="form-check-input"
            >
            <label for="isApproved" class="form-check-label">
              {{ t('modelVersions:form.fields.isApproved.label') }}
            </label>
          </div>
          <div class="form-text">
            {{ t('modelVersions:form.fields.isApproved.help') }}
          </div>
        </div>
      </div>

      <!-- Version Timeline Visualization -->
      <div v-if="versionHistory.length > 0" class="row">
        <div class="col-12 mb-2">
          <label class="form-label">{{ t('modelVersions:form.timeline.title') }}</label>
          <div class="border rounded p-3 bg-light">
            <div class="version-timeline">
              <div 
                v-for="(version, index) in versionHistory" 
                :key="version.id"
                class="timeline-item"
                :class="{ 'current': version.isCurrentVersion, 'new': version.id === formData.id }"
              >
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <div class="fw-medium">v{{ version.versionNumber }}</div>
                  <small class="text-muted">{{ version.status }}</small>
                  <small v-if="version.name" class="d-block text-muted">{{ version.name }}</small>
                </div>
              </div>
            </div>
            <small class="text-muted d-block mt-2">
              {{ t('modelVersions:form.timeline.description') }}
            </small>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row">
        <div class="col-12 mb-2">
          <label class="form-label">{{ t('modelVersions:form.actions.title') }}</label>
          <div class="btn-group" role="group">
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              @click="generateNextVersion"
            >
              <i class="bi bi-plus-circle me-1"></i>
              {{ t('modelVersions:form.actions.generateNext') }}
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              @click="copyFromPrevious"
            >
              <i class="bi bi-copy me-1"></i>
              {{ t('modelVersions:form.actions.copyPrevious') }}
            </button>
            <button
              type="button"
              class="btn btn-outline-warning btn-sm"
              @click="markAsDraft"
            >
              <i class="bi bi-file-earmark-text me-1"></i>
              {{ t('modelVersions:form.actions.markDraft') }}
            </button>
          </div>
          <div class="form-text">
            {{ t('modelVersions:form.actions.help') }}
          </div>
        </div>
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { type IModelVersion, ModelVersion } from '~/model/model-version.model'
import { type IModel } from '~/model/model.model'
import { VersionStatus } from '~/model/enumerations/version-status.model'
import { commonValidationRules } from '../shared/composables/useEntityForm'
import EntityForm from '../shared/EntityForm.vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  mode: 'create' | 'edit'
  initialData?: IModelVersion
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

// Emits
const emit = defineEmits<{
  submit: [modelVersion: IModelVersion]
  cancel: []
}>()

// Reactive Data
const availableModels = ref<IModel[]>([])
const versionHistory = ref<IModelVersion[]>([])
const loading = ref({
  models: false,
  versions: false
})

// Validation Rules
const validationRules = {
  versionNumber: {
    ...commonValidationRules.required('Version Number'),
    pattern: {
      value: /^\d+\.\d+(\.\d+)?$/,
      message: 'Version number must follow format X.Y or X.Y.Z'
    }
  },
  status: commonValidationRules.required('Status'),
  modelId: commonValidationRules.required('Model')
}

// Constants
const versionStatuses = computed(() => Object.values(VersionStatus))

// Computed
const selectedModel = computed(() => {
  if (!props.initialData?.modelId) return null
  return availableModels.value.find(m => m.id === props.initialData?.modelId)
})

// Methods
const loadAvailableModels = async () => {
  loading.value.models = true
  try {
    // Mock data - replace with actual API call
    availableModels.value = [
      { id: 1, code: 'MDL001', name: 'Base Assembly', type: 'ASSEMBLY' },
      { id: 2, code: 'MDL002', name: 'Motor Part', type: 'PART' },
      { id: 3, code: 'DRW001', name: 'Technical Drawing', type: 'DRAWING' }
    ] as IModel[]
  } catch (error) {
    console.error('Error loading models:', error)
  } finally {
    loading.value.models = false
  }
}

const loadVersionHistory = async (modelId: number) => {
  loading.value.versions = true
  try {
    // Mock data - replace with actual API call
    versionHistory.value = [
      { id: 1, versionNumber: '1.0', status: VersionStatus.APPROVED, isCurrentVersion: false },
      { id: 2, versionNumber: '1.1', status: VersionStatus.APPROVED, isCurrentVersion: false },
      { id: 3, versionNumber: '2.0', status: VersionStatus.APPROVED, isCurrentVersion: true }
    ] as IModelVersion[]
  } catch (error) {
    console.error('Error loading version history:', error)
  } finally {
    loading.value.versions = false
  }
}

const handleModelChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const modelId = parseInt(target.value)
  
  if (modelId) {
    loadVersionHistory(modelId)
  } else {
    versionHistory.value = []
  }
}

const handleCurrentVersionChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.checked && props.initialData) {
    // If setting as current version, auto-approve
    props.initialData.isApproved = true
    props.initialData.status = VersionStatus.APPROVED
  }
}

const generateNextVersion = () => {
  if (!props.initialData) return
  
  const lastVersion = versionHistory.value
    .filter(v => v.id !== props.initialData?.id)
    .sort((a, b) => b.versionNumber.localeCompare(a.versionNumber))[0]
  
  if (lastVersion) {
    const parts = lastVersion.versionNumber.split('.')
    const major = parseInt(parts[0])
    const minor = parseInt(parts[1])
    const patch = parts[2] ? parseInt(parts[2]) : 0
    
    // Increment minor version
    props.initialData.versionNumber = `${major}.${minor + 1}`
    if (parts[2]) {
      props.initialData.versionNumber += '.0'
    }
  } else {
    props.initialData.versionNumber = '1.0'
  }
  
  props.initialData.status = VersionStatus.DRAFT
  props.initialData.isCurrentVersion = false
  props.initialData.isApproved = false
}

const copyFromPrevious = () => {
  if (!props.initialData) return
  
  const lastVersion = versionHistory.value
    .filter(v => v.id !== props.initialData?.id)
    .sort((a, b) => b.versionNumber.localeCompare(a.versionNumber))[0]
  
  if (lastVersion) {
    props.initialData.name = lastVersion.name
    props.initialData.comments = lastVersion.comments
  }
}

const markAsDraft = () => {
  if (!props.initialData) return
  
  props.initialData.status = VersionStatus.DRAFT
  props.initialData.isCurrentVersion = false
  props.initialData.isApproved = false
}

const handleSubmit = (formData: any) => {
  // Find the selected model
  const selectedModelData = formData.modelId ? 
    availableModels.value.find(m => m.id === formData.modelId) : null

  const modelVersion = new ModelVersion(
    formData.id,
    formData.versionNumber,
    formData.name,
    formData.status,
    formData.createdDate,
    formData.comments,
    formData.isCurrentVersion,
    formData.isApproved,
    selectedModelData
  )
  
  emit('submit', modelVersion)
}

// Lifecycle
onMounted(() => {
  loadAvailableModels()
  if (props.initialData?.modelId) {
    loadVersionHistory(props.initialData.modelId)
  }
})
</script>

<style scoped>
.version-timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline-item {
  position: relative;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-left: 2px solid #dee2e6;
}

.timeline-item:last-child {
  border-left-color: transparent;
}

.timeline-marker {
  position: absolute;
  left: -6px;
  top: 0.25rem;
  width: 10px;
  height: 10px;
  background: #6c757d;
  border-radius: 50%;
  border: 2px solid white;
}

.timeline-item.current .timeline-marker {
  background: #28a745;
}

.timeline-item.new .timeline-marker {
  background: #0d6efd;
  animation: pulse 2s infinite;
}

.timeline-content {
  margin-left: 1rem;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
  }
}

.btn-group .btn {
  font-size: 0.8125rem;
}
</style>