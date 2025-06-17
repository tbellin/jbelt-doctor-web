<template>
  <EntityForm
    :mode="mode"
    entity-name="Archive"
    :initial-data="initialData"
    :validation-rules="validationRules"
    @submit="handleSubmit"
    @cancel="$emit('cancel')"
  >
    <template #default="{ formData, errors, loading, validateField }">
      <!-- Basic Information Section -->
      <div class="row">
        <!-- Code -->
        <div class="col-md-6 mb-2">
          <label for="code" class="form-label">
            {{ t('archives:form.fields.code.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="code"
            v-model="formData.code"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.code, 'is-valid': !errors.code && formData.code }"
            :placeholder="t('archives:form.fields.code.placeholder')"
            required
            @blur="validateField('code')"
          >
          <div v-if="errors.code" class="invalid-feedback">
            {{ errors.code }}
          </div>
        </div>

        <!-- Name -->
        <div class="col-md-6 mb-2">
          <label for="name" class="form-label">
            {{ t('archives:form.fields.name.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.name, 'is-valid': !errors.name && formData.name }"
            :placeholder="t('archives:form.fields.name.placeholder')"
            required
            @blur="validateField('name')"
          >
          <div v-if="errors.name" class="invalid-feedback">
            {{ errors.name }}
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Type -->
        <div class="col-md-6 mb-2">
          <label for="type" class="form-label">
            {{ t('archives:form.fields.type.label') }}
          </label>
          <select
            id="type"
            v-model="formData.type"
            class="form-select"
            :class="{ 'is-invalid': errors.type }"
          >
            <option value="">{{ t('archives:form.fields.type.placeholder') }}</option>
            <option v-for="type in fileTypes" :key="type" :value="type">
              {{ t(`archives:form.fields.type.options.${type}`) }}
            </option>
          </select>
          <div v-if="errors.type" class="invalid-feedback">
            {{ errors.type }}
          </div>
        </div>

        <!-- Category -->
        <div class="col-md-6 mb-2">
          <label for="category" class="form-label">
            {{ t('archives:form.fields.category.label') }}
          </label>
          <select
            id="category"
            v-model="formData.category"
            class="form-select"
            :class="{ 'is-invalid': errors.category }"
          >
            <option value="">{{ t('archives:form.fields.category.placeholder') }}</option>
            <option v-for="category in fileCategories" :key="category" :value="category">
              {{ t(`archives:form.fields.category.options.${category}`) }}
            </option>
          </select>
          <div v-if="errors.category" class="invalid-feedback">
            {{ errors.category }}
          </div>
        </div>
      </div>

      <!-- File Information Section -->
      <div class="row">
        <!-- File Name -->
        <div class="col-md-6 mb-2">
          <label for="fileName" class="form-label">
            {{ t('archives:form.fields.fileName.label') }}
          </label>
          <input
            id="fileName"
            v-model="formData.fileName"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.fileName }"
            :placeholder="t('archives:form.fields.fileName.placeholder')"
            :readonly="!!selectedFile"
          >
          <div v-if="errors.fileName" class="invalid-feedback">
            {{ errors.fileName }}
          </div>
        </div>

        <!-- Extension -->
        <div class="col-md-6 mb-2">
          <label for="extension" class="form-label">
            {{ t('archives:form.fields.extension.label') }}
          </label>
          <input
            id="extension"
            v-model="formData.extension"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.extension }"
            :placeholder="t('archives:form.fields.extension.placeholder')"
            :readonly="!!selectedFile"
          >
          <div v-if="errors.extension" class="invalid-feedback">
            {{ errors.extension }}
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Folder -->
        <div class="col-md-6 mb-2">
          <label for="folder" class="form-label">
            {{ t('archives:form.fields.folder.label') }}
          </label>
          <input
            id="folder"
            v-model="formData.folder"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.folder }"
            :placeholder="t('archives:form.fields.folder.placeholder')"
          >
          <div v-if="errors.folder" class="invalid-feedback">
            {{ errors.folder }}
          </div>
          <div class="form-text">
            {{ t('archives:form.fields.folder.help') }}
          </div>
        </div>

        <!-- Content Type -->
        <div class="col-md-6 mb-2">
          <label for="contentContentType" class="form-label">
            {{ t('archives:form.fields.contentType.label') }}
          </label>
          <input
            id="contentContentType"
            v-model="formData.contentContentType"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.contentContentType }"
            :placeholder="t('archives:form.fields.contentType.placeholder')"
            :readonly="!!selectedFile"
          >
          <div v-if="errors.contentContentType" class="invalid-feedback">
            {{ errors.contentContentType }}
          </div>
          <div class="form-text">
            {{ t('archives:form.fields.contentType.help') }}
          </div>
        </div>
      </div>

      <!-- File Upload Section -->
      <div class="row">
        <div class="col-12 mb-2">
          <label for="fileUpload" class="form-label">
            {{ t('archives:form.fields.file.label') }}
          </label>
          
          <!-- File Input -->
          <input
            id="fileUpload"
            ref="fileInput"
            type="file"
            class="form-control"
            :class="{ 'is-invalid': errors.file }"
            @change="handleFileChange"
            :accept="acceptedFileTypes"
          >
          <div v-if="errors.file" class="invalid-feedback">
            {{ errors.file }}
          </div>
          <div class="form-text">
            {{ t('archives:form.fields.file.help') }}
          </div>

          <!-- File Preview -->
          <div v-if="selectedFile || formData.content" class="mt-3">
            <div class="card bg-light">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <i :class="getFileIcon(formData.contentContentType)" class="fs-2 me-3"></i>
                  <div class="flex-grow-1">
                    <h6 class="mb-1">{{ formData.fileName || selectedFile?.name }}</h6>
                    <small class="text-muted">
                      {{ t('archives:form.fileInfo.type') }}: {{ formData.contentContentType || selectedFile?.type }}<br>
                      {{ t('archives:form.fileInfo.size') }}: {{ formatFileSize(selectedFile?.size || 0) }}
                    </small>
                  </div>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="clearFile"
                  >
                    <i class="bi bi-trash"></i>
                    {{ t('common:remove') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Preview (for text files) -->
      <div v-if="showContentPreview" class="row">
        <div class="col-12 mb-2">
          <label for="content" class="form-label">
            {{ t('archives:form.fields.content.label') }}
          </label>
          <textarea
            id="content"
            v-model="formData.content"
            class="form-control"
            rows="6"
            :placeholder="t('archives:form.fields.content.placeholder')"
            :readonly="!isTextFile"
          ></textarea>
          <div class="form-text">
            {{ t('archives:form.fields.content.help') }}
          </div>
        </div>
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { type IArchive, Archive } from '~/model/archive.model'
import { commonValidationRules } from '../shared/composables/useEntityForm'
import EntityForm from '../shared/EntityForm.vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  mode: 'create' | 'edit'
  initialData?: IArchive
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

// Emits
const emit = defineEmits<{
  submit: [archive: IArchive]
  cancel: []
}>()

// Reactive Data
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)

// Validation Rules
const validationRules = {
  code: commonValidationRules.required('Code'),
  name: commonValidationRules.required('Name')
}

// Constants
const fileTypes = ['CAD', 'IMAGE', 'DOCUMENT', 'ARCHIVE', 'OTHER']
const fileCategories = ['DRAWING', 'MODEL', 'ASSEMBLY', 'PART', 'FORMAT', 'SYMBOL', 'TEMPLATE', 'DOCUMENTATION']

const acceptedFileTypes = computed(() => {
  return '.dwg,.dxf,.step,.stp,.iges,.igs,.pdf,.png,.jpg,.jpeg,.gif,.zip,.rar,.txt,.doc,.docx,.xls,.xlsx'
})

// Computed
const showContentPreview = computed(() => {
  return selectedFile.value || (props.initialData?.content && isTextFile.value)
})

const isTextFile = computed(() => {
  const contentType = selectedFile.value?.type || props.initialData?.contentContentType || ''
  return contentType.startsWith('text/') || 
         contentType === 'application/json' ||
         contentType === 'application/xml'
})

// Methods
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    selectedFile.value = file
    
    // Auto-fill file information
    const formData = (event.target as any).form?.formData || {}
    formData.fileName = file.name
    formData.extension = file.name.split('.').pop() || ''
    formData.contentContentType = file.type
    
    // Read file content for text files
    if (isTextFile.value && file.size < 1024 * 1024) { // Max 1MB for text preview
      const reader = new FileReader()
      reader.onload = (e) => {
        formData.content = e.target?.result as string
      }
      reader.readAsText(file)
    }
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const getFileIcon = (contentType: string): string => {
  if (!contentType) return 'bi bi-file-earmark'
  
  if (contentType.startsWith('image/')) return 'bi bi-file-earmark-image text-primary'
  if (contentType.startsWith('text/')) return 'bi bi-file-earmark-text text-info'
  if (contentType.includes('pdf')) return 'bi bi-file-earmark-pdf text-danger'
  if (contentType.includes('word')) return 'bi bi-file-earmark-word text-primary'
  if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'bi bi-file-earmark-excel text-success'
  if (contentType.includes('zip') || contentType.includes('rar')) return 'bi bi-file-earmark-zip text-warning'
  
  return 'bi bi-file-earmark'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleSubmit = async (formData: any) => {
  try {
    // Convert file to base64 if selected
    if (selectedFile.value) {
      const reader = new FileReader()
      reader.onload = () => {
        formData.content = reader.result as string
        submitArchive(formData)
      }
      reader.readAsDataURL(selectedFile.value)
    } else {
      submitArchive(formData)
    }
  } catch (error) {
    console.error('Error handling file:', error)
  }
}

const submitArchive = (formData: any) => {
  const archive = new Archive(
    formData.id,
    formData.code,
    formData.name,
    formData.type,
    formData.category,
    formData.fileName,
    formData.extension,
    formData.folder,
    formData.contentContentType,
    formData.content
  )
  
  emit('submit', archive)
}
</script>

<style scoped>
.form-label.small {
  font-size: 0.875rem;
}

.file-preview {
  max-height: 200px;
  overflow-y: auto;
}
</style>