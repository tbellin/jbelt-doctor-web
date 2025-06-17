<template>
  <EntityForm
    :mode="mode"
    entity-name="Item"
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
            {{ t('items:form.fields.code.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="code"
            v-model="formData.code"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.code, 'is-valid': !errors.code && formData.code }"
            :placeholder="t('items:form.fields.code.placeholder')"
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
            {{ t('items:form.fields.name.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.name, 'is-valid': !errors.name && formData.name }"
            :placeholder="t('items:form.fields.name.placeholder')"
            required
            @blur="validateField('name')"
          >
          <div v-if="errors.name" class="invalid-feedback">
            {{ errors.name }}
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Item Type -->
        <div class="col-md-6 mb-2">
          <label for="itemType" class="form-label">
            {{ t('items:form.fields.itemType.label') }}
            <span class="text-danger">*</span>
          </label>
          <select
            id="itemType"
            v-model="formData.itemType"
            class="form-select"
            :class="{ 'is-invalid': errors.itemType, 'is-valid': !errors.itemType && formData.itemType }"
            required
            @change="handleItemTypeChange"
          >
            <option value="">{{ t('items:form.fields.itemType.placeholder') }}</option>
            <option v-for="type in itemTypes" :key="type" :value="type">
              {{ t(`items:form.fields.itemType.options.${type}`) }}
            </option>
          </select>
          <div v-if="errors.itemType" class="invalid-feedback">
            {{ errors.itemType }}
          </div>
          <div class="form-text">
            {{ t('items:form.fields.itemType.help') }}
          </div>
        </div>

        <!-- Category -->
        <div class="col-md-6 mb-2">
          <label for="category" class="form-label">
            {{ t('items:form.fields.category.label') }}
          </label>
          <select
            id="category"
            v-model="formData.category"
            class="form-select"
            :class="{ 'is-invalid': errors.category }"
          >
            <option value="">{{ t('items:form.fields.category.placeholder') }}</option>
            <option v-for="category in availableCategories" :key="category" :value="category">
              {{ t(`items:form.fields.category.options.${category}`) }}
            </option>
          </select>
          <div v-if="errors.category" class="invalid-feedback">
            {{ errors.category }}
          </div>
        </div>
      </div>

      <!-- Properties Section -->
      <div class="card bg-light border-0 mb-3">
        <div class="card-header bg-transparent border-0">
          <h6 class="mb-0">
            <i class="bi bi-list-ul me-2"></i>
            {{ t('items:form.properties.title') }}
          </h6>
        </div>
        <div class="card-body">
          <div class="row">
            <!-- Text Value -->
            <div class="col-md-6 mb-2">
              <label for="textValue" class="form-label">
                {{ t('items:form.fields.textValue.label') }}
              </label>
              <input
                id="textValue"
                v-model="formData.textValue"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.textValue }"
                :placeholder="t('items:form.fields.textValue.placeholder')"
              >
              <div v-if="errors.textValue" class="invalid-feedback">
                {{ errors.textValue }}
              </div>
            </div>

            <!-- Number Value -->
            <div class="col-md-6 mb-2">
              <label for="numberValue" class="form-label">
                {{ t('items:form.fields.numberValue.label') }}
              </label>
              <div class="input-group">
                <input
                  id="numberValue"
                  v-model.number="formData.numberValue"
                  type="number"
                  step="0.001"
                  class="form-control"
                  :class="{ 'is-invalid': errors.numberValue }"
                  :placeholder="t('items:form.fields.numberValue.placeholder')"
                >
                <input
                  v-model="formData.unit"
                  type="text"
                  class="form-control"
                  style="max-width: 80px;"
                  :placeholder="t('items:form.fields.unit.placeholder')"
                  list="commonUnits"
                >
              </div>
              <datalist id="commonUnits">
                <option value="mm"></option>
                <option value="cm"></option>
                <option value="m"></option>
                <option value="kg"></option>
                <option value="g"></option>
                <option value="pcs"></option>
                <option value="°"></option>
              </datalist>
              <div v-if="errors.numberValue" class="invalid-feedback">
                {{ errors.numberValue }}
              </div>
            </div>
          </div>

          <div class="row">
            <!-- Boolean Value -->
            <div class="col-md-6 mb-2">
              <div class="form-check">
                <input
                  id="booleanValue"
                  v-model="formData.booleanValue"
                  type="checkbox"
                  class="form-check-input"
                >
                <label for="booleanValue" class="form-check-label">
                  {{ t('items:form.fields.booleanValue.label') }}
                </label>
              </div>
              <div class="form-text">
                {{ t('items:form.fields.booleanValue.help') }}
              </div>
            </div>

            <!-- Date Value -->
            <div class="col-md-6 mb-2">
              <label for="dateValue" class="form-label">
                {{ t('items:form.fields.dateValue.label') }}
              </label>
              <input
                id="dateValue"
                v-model="formData.dateValue"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': errors.dateValue }"
              >
              <div v-if="errors.dateValue" class="invalid-feedback">
                {{ errors.dateValue }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Relationships Section -->
      <div class="row">
        <!-- Parent Item -->
        <div class="col-md-6 mb-2">
          <label for="parentId" class="form-label">
            {{ t('items:form.fields.parent.label') }}
          </label>
          <select
            id="parentId"
            v-model="formData.parentId"
            class="form-select"
            :class="{ 'is-invalid': errors.parentId }"
            :disabled="loading.items"
          >
            <option value="">{{ t('items:form.fields.parent.placeholder') }}</option>
            <option v-for="item in availableParents" :key="item.id" :value="item.id">
              {{ item.code }} - {{ item.name }}
              <span v-if="item.itemType" class="text-muted">({{ item.itemType }})</span>
            </option>
          </select>
          <div v-if="loading.items" class="form-text">
            <i class="bi bi-spinner-border"></i> {{ t('common:loading') }}
          </div>
          <div v-if="errors.parentId" class="invalid-feedback">
            {{ errors.parentId }}
          </div>
          <div class="form-text">
            {{ t('items:form.fields.parent.help') }}
          </div>
        </div>

        <!-- Child Items Count -->
        <div class="col-md-6 mb-2" v-if="mode === 'edit' && childrenCount > 0">
          <label class="form-label">
            {{ t('items:form.children.label') }}
          </label>
          <div class="alert alert-info mb-0">
            <i class="bi bi-info-circle me-2"></i>
            {{ t('items:form.children.count', { count: childrenCount }) }}
          </div>
        </div>
      </div>

      <!-- Tags and Metadata -->
      <div class="row">
        <!-- Tags -->
        <div class="col-md-12 mb-2">
          <label for="tags" class="form-label">
            {{ t('items:form.fields.tags.label') }}
          </label>
          <div class="tag-input-container">
            <div class="input-group">
              <input
                v-model="newTag"
                type="text"
                class="form-control"
                :placeholder="t('items:form.fields.tags.placeholder')"
                @keypress.enter.prevent="addTag"
                @keypress.comma.prevent="addTag"
              >
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="addTag"
              >
                <i class="bi bi-plus"></i>
              </button>
            </div>
            <div v-if="itemTags.length > 0" class="mt-2">
              <span
                v-for="(tag, index) in itemTags"
                :key="index"
                class="badge bg-secondary me-1 mb-1"
              >
                {{ tag }}
                <button
                  type="button"
                  class="btn-close btn-close-white ms-1"
                  style="font-size: 0.6rem;"
                  @click="removeTag(index)"
                ></button>
              </span>
            </div>
          </div>
          <div class="form-text">
            {{ t('items:form.fields.tags.help') }}
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="row">
        <div class="col-12 mb-2">
          <label for="description" class="form-label">
            {{ t('items:form.fields.description.label') }}
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            class="form-control"
            rows="3"
            :class="{ 'is-invalid': errors.description }"
            :placeholder="t('items:form.fields.description.placeholder')"
          ></textarea>
          <div v-if="errors.description" class="invalid-feedback">
            {{ errors.description }}
          </div>
        </div>
      </div>

      <!-- Item Preview Card -->
      <div v-if="formData.code || formData.name" class="row">
        <div class="col-12 mb-2">
          <label class="form-label">{{ t('items:form.preview.title') }}</label>
          <div class="card">
            <div class="card-body">
              <div class="d-flex align-items-start">
                <div class="item-type-icon me-3">
                  <i :class="getItemTypeIcon(formData.itemType)" class="fs-2"></i>
                </div>
                <div class="flex-grow-1">
                  <h6 class="card-title mb-1">{{ formData.name || t('items:form.preview.noName') }}</h6>
                  <p class="card-text text-muted small mb-2">{{ formData.code || t('items:form.preview.noCode') }}</p>
                  <div class="d-flex gap-2 align-items-center">
                    <span v-if="formData.itemType" class="badge bg-primary">{{ formData.itemType }}</span>
                    <span v-if="formData.category" class="badge bg-secondary">{{ formData.category }}</span>
                    <span v-if="formData.numberValue" class="text-muted small">
                      {{ formData.numberValue }}{{ formData.unit ? ' ' + formData.unit : '' }}
                    </span>
                    <span v-if="formData.booleanValue" class="text-success small">
                      <i class="bi bi-check-circle"></i> {{ t('items:form.preview.enabled') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </EntityForm>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { type IItem, Item } from '~/model/item.model'
import { ItemType } from '~/model/enumerations/item-type.model'
import { commonValidationRules } from '../shared/composables/useEntityForm'
import EntityForm from '../shared/EntityForm.vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  mode: 'create' | 'edit'
  initialData?: IItem
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

// Emits
const emit = defineEmits<{
  submit: [item: IItem]
  cancel: []
}>()

// Reactive Data
const availableParents = ref<IItem[]>([])
const itemTags = ref<string[]>([])
const newTag = ref('')
const childrenCount = ref(0)
const loading = ref({
  items: false
})

// Validation Rules
const validationRules = {
  code: commonValidationRules.required('Code'),
  name: commonValidationRules.required('Name'),
  itemType: commonValidationRules.required('Item Type')
}

// Constants
const itemTypes = computed(() => Object.values(ItemType))

const availableCategories = computed(() => {
  const type = props.initialData?.itemType
  switch (type) {
    case ItemType.COMPONENT:
      return ['MECHANICAL', 'ELECTRICAL', 'SOFTWARE', 'HYDRAULIC', 'PNEUMATIC']
    case ItemType.MATERIAL:
      return ['METAL', 'PLASTIC', 'COMPOSITE', 'RUBBER', 'ELECTRONIC']
    case ItemType.TOOL:
      return ['CUTTING', 'MEASURING', 'ASSEMBLY', 'TESTING', 'MAINTENANCE']
    case ItemType.DOCUMENT:
      return ['SPECIFICATION', 'MANUAL', 'PROCEDURE', 'REPORT', 'DRAWING']
    case ItemType.ASSEMBLY:
      return ['SUBASSEMBLY', 'MAIN_ASSEMBLY', 'MODULE', 'UNIT', 'SYSTEM']
    default:
      return ['GENERAL', 'CUSTOM', 'OTHER']
  }
})

// Methods
const loadAvailableParents = async () => {
  loading.value.items = true
  try {
    // Mock data - replace with actual API call
    availableParents.value = [
      { id: 1, code: 'ASM001', name: 'Main Assembly', itemType: ItemType.ASSEMBLY },
      { id: 2, code: 'CMP001', name: 'Base Component', itemType: ItemType.COMPONENT },
      { id: 3, code: 'MAT001', name: 'Steel Material', itemType: ItemType.MATERIAL }
    ] as IItem[]
  } catch (error) {
    console.error('Error loading items:', error)
  } finally {
    loading.value.items = false
  }
}

const loadChildrenCount = async () => {
  if (props.mode === 'edit' && props.initialData?.id) {
    try {
      // Mock data - replace with actual API call
      childrenCount.value = 3
    } catch (error) {
      console.error('Error loading children count:', error)
    }
  }
}

const handleItemTypeChange = () => {
  // Reset category when item type changes
  if (props.initialData) {
    props.initialData.category = ''
  }
}

const addTag = () => {
  const tag = newTag.value.trim().replace(',', '')
  if (tag && !itemTags.value.includes(tag)) {
    itemTags.value.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  itemTags.value.splice(index, 1)
}

const getItemTypeIcon = (itemType: ItemType): string => {
  switch (itemType) {
    case ItemType.COMPONENT: return 'bi bi-gear text-primary'
    case ItemType.ASSEMBLY: return 'bi bi-boxes text-success'
    case ItemType.MATERIAL: return 'bi bi-layers text-warning'
    case ItemType.TOOL: return 'bi bi-tools text-info'
    case ItemType.DOCUMENT: return 'bi bi-file-earmark-text text-secondary'
    default: return 'bi bi-square text-muted'
  }
}

const handleSubmit = (formData: any) => {
  // Find the selected parent
  const parentItem = formData.parentId ? 
    availableParents.value.find(p => p.id === formData.parentId) : null

  const item = new Item(
    formData.id,
    formData.code,
    formData.name,
    formData.itemType,
    formData.category,
    formData.description,
    formData.textValue,
    formData.numberValue,
    formData.unit,
    formData.booleanValue,
    formData.dateValue,
    parentItem,
    itemTags.value
  )
  
  emit('submit', item)
}

// Watchers
watch(() => props.initialData?.tags, (newTags) => {
  if (newTags) {
    itemTags.value = Array.isArray(newTags) ? [...newTags] : []
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  loadAvailableParents()
  loadChildrenCount()
})
</script>

<style scoped>
.tag-input-container .badge {
  position: relative;
}

.btn-close {
  padding: 0;
  margin: 0;
  border: none;
  background: none;
}

.item-type-icon {
  width: 60px;
  text-align: center;
}

.input-group input[list] {
  border-left: 0;
}

.form-text {
  font-size: 0.8125rem;
}
</style>