# ModelForm.vue - Comprehensive Model Form Component

## Overview

The `ModelForm.vue` component is a comprehensive form for creating and editing Model entities in the JBelt Doctor system. It handles all 11 Model fields from the domain model with proper validation, associations, and Bootstrap styling.

## Features

### Complete Field Coverage
- **Basic Information**: id, code, name, modelType, instanceType
- **File Information**: file (Archive), version (ModelVersion), item (Item)
- **Model Associations**: generic (Model), parent (Model)
- **Sheet Associations**: sheets (array of Sheet objects)

### Advanced Functionality
- Form validation using Model class validation methods
- Translation support for all labels, placeholders, and error messages
- Bootstrap styling with compact CSS integration
- Create vs Update mode handling
- Loading states and error handling
- Dynamic field visibility based on model type
- Multi-select sheet associations with search functionality

## Usage

### Basic Implementation

```vue
<template>
  <ModelForm
    :model-data="currentModel"
    :loading="saving"
    @submit="handleSubmit"
    @cancel="handleCancel"
  />
</template>

<script setup>
import ModelForm from '~/components/Models/ModelForm.vue'
import { ref } from 'vue'

const currentModel = ref(null) // null for create mode, Model object for edit mode
const saving = ref(false)

const handleSubmit = async (modelData) => {
  saving.value = true
  try {
    if (modelData.id) {
      // Update existing model
      await api.models.update(modelData.id, modelData)
    } else {
      // Create new model
      await api.models.create(modelData)
    }
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  // Handle form cancellation
}
</script>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelData` | `IModel \| null` | `null` | Model data for edit mode, null for create mode |
| `loading` | `boolean` | `false` | Shows loading state on submit button |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `submit` | `IModel` | Emitted when form is submitted with valid data |
| `cancel` | `void` | Emitted when user cancels the form |

## Form Sections

### 1. Basic Information
- **Code**: Required text input with minimum length validation
- **Name**: Required text input with minimum length validation
- **Model Type**: Required dropdown (PART, ASSEMBLY, DRAWING, FORMAT)
- **Instance Type**: Required dropdown (PARAMETRIC, NORMAL, GENERIC, INSTANCE, BULK)

### 2. File and Version Information
- **File**: Optional dropdown of available Archive objects
- **Version**: Optional dropdown of available ModelVersion objects
- **Item**: Optional dropdown of available Item objects

### 3. Model Associations
- **Generic Model**: Optional dropdown of GENERIC type models
- **Parent Model**: Optional dropdown of ASSEMBLY/PART type models

### 4. Sheet Associations
- **Associated Sheets**: Multi-select with search functionality
- Only visible for PART and ASSEMBLY model types
- Includes search box for filtering available sheets
- Shows selected sheets with remove capability

## Validation

The component uses the Model class validation methods:

- **Required Fields**: code, name, modelType, instanceType
- **Minimum Length**: code and name must be at least 2 characters
- **Real-time Validation**: Validates fields on blur
- **Form Validation**: Validates entire form on submit
- **Error Display**: Shows validation errors below each field

## Translation Keys

All translation keys are in the `models` namespace:

### Form Labels and Placeholders
```json
{
  "form": {
    "basicInfo": "Basic Information",
    "code": "Code",
    "codePlaceholder": "Enter model code...",
    "name": "Name",
    "namePlaceholder": "Enter model name...",
    "type": "Model Type",
    "instance": "Instance Type",
    "fileInfo": "File and Version Information",
    "file": "File",
    "version": "Version",
    "item": "Item",
    "associations": "Model Associations",
    "generic": "Generic Model",
    "parent": "Parent Model",
    "sheetAssociations": "Sheet Associations",
    "sheets": "Associated Sheets"
  }
}
```

### Validation Messages
```json
{
  "validation": {
    "codeRequired": "Code is required",
    "nameRequired": "Name is required",
    "typeRequired": "Model type is required",
    "instanceRequired": "Instance type is required",
    "codeMinLength": "Code must be at least 2 characters long",
    "nameMinLength": "Name must be at least 2 characters long"
  }
}
```

## Styling

The component uses Bootstrap 5 classes with compact CSS overrides:
- Card-based layout for organized sections
- Responsive grid system (col-md-6, col-md-12)
- Form validation states (is-invalid, invalid-feedback)
- Consistent spacing with compact margins/padding
- Bootstrap icons for visual indicators

## Integration with Existing Codebase

### 1. Replace Existing Modal Forms
```vue
<!-- Before -->
<ModelFormModal
  :show="showModal"
  :editing-model="editingModel"
  :form-data="formData"
  :errors="errors"
  :saving="saving"
  @close="closeModal"
  @save="saveModel"
/>

<!-- After -->
<div class="modal" :class="{ show: showModal }">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          {{ editingModel ? 'Edit Model' : 'Create Model' }}
        </h5>
        <button type="button" class="btn-close" @click="closeModal"></button>
      </div>
      <div class="modal-body">
        <ModelForm
          :model-data="editingModel"
          :loading="saving"
          @submit="saveModel"
          @cancel="closeModal"
        />
      </div>
    </div>
  </div>
</div>
```

### 2. Standalone Form Pages
```vue
<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <ModelForm
          :model-data="modelData"
          :loading="saving"
          @submit="handleSubmit"
          @cancel="goBack"
        />
      </div>
    </div>
  </div>
</template>
```

## Demo Component

See `ModelFormDemo.vue` for a complete working example that demonstrates:
- Create vs Edit mode switching
- Sample data loading
- Form submission handling
- Result display
- Error handling

## API Dependencies

The component expects these API methods to be available:
- `api.models.getAll()` - For loading available models (generic/parent)
- `api.sheets.getAll()` - For loading available sheets
- `api.models.create(model)` - For creating new models
- `api.models.update(id, model)` - For updating existing models

## Future Enhancements

1. **File Upload**: Add file upload functionality for Archive associations
2. **Version Management**: Add version creation/management interface
3. **Item Search**: Add search/filter for Item dropdown
4. **Advanced Validation**: Add cross-field validation rules
5. **Bulk Operations**: Add support for bulk sheet associations
6. **Preview Mode**: Add read-only preview mode
7. **Change Tracking**: Add dirty state tracking and unsaved changes warning

## Browser Compatibility

- Modern browsers supporting ES6+ features
- Vue 3 composition API
- Bootstrap 5 CSS framework
- Tested with Chrome 90+, Firefox 88+, Safari 14+