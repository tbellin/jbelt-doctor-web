<!--
  User Form Modal - Optimized Component
  
  Enhanced features:
  - Real-time validation
  - Password strength indicator
  - Role management
  - Enhanced UX with loading states
  - Mobile responsive design
  
  @version 2.0.0
-->
<template>
  <div 
    class="modal fade" 
    :class="{ show: show }" 
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
    @click.self="handleBackdropClick"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <h5 class="modal-title d-flex align-items-center">
            <i class="bi bi-person me-2 text-primary"></i>
            {{ isEditing ? t('admin:users.edit.title') : t('admin:users.create.title') }}
            <span v-if="isEditing && editingUser" class="badge bg-secondary ms-2">
              {{ editingUser.login }}
            </span>
          </h5>
          <button 
            type="button" 
            class="btn-close"
            @click="handleClose"
            :disabled="saving"
          ></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSave" novalidate>
            <!-- Account Information -->
            <div class="form-section mb-4">
              <h6 class="form-section-title">
                <i class="bi bi-person-circle me-2"></i>
                {{ t('admin:users.form.accountInfo') }}
              </h6>
              
              <div class="row g-3">
                <!-- Username -->
                <div class="col-md-6">
                  <label for="userLogin" class="form-label required">
                    {{ t('admin:users.form.username') }}
                  </label>
                  <input
                    id="userLogin"
                    v-model="localFormData.login"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.login }"
                    :placeholder="t('admin:users.form.usernamePlaceholder')"
                    required
                    :disabled="isEditing"
                    @blur="validateField('login')"
                    @input="handleFieldChange('login')"
                  />
                  <div v-if="validationErrors.login" class="invalid-feedback">
                    {{ validationErrors.login }}
                  </div>
                  <div v-if="isEditing" class="form-text">
                    {{ t('admin:users.form.usernameEditHint') }}
                  </div>
                </div>

                <!-- Email -->
                <div class="col-md-6">
                  <label for="userEmail" class="form-label required">
                    {{ t('admin:users.form.email') }}
                  </label>
                  <input
                    id="userEmail"
                    v-model="localFormData.email"
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.email }"
                    :placeholder="t('admin:users.form.emailPlaceholder')"
                    required
                    @blur="validateField('email')"
                    @input="handleFieldChange('email')"
                  />
                  <div v-if="validationErrors.email" class="invalid-feedback">
                    {{ validationErrors.email }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Personal Information -->
            <div class="form-section mb-4">
              <h6 class="form-section-title">
                <i class="bi bi-person-badge me-2"></i>
                {{ t('admin:users.form.personalInfo') }}
              </h6>
              
              <div class="row g-3">
                <!-- First Name -->
                <div class="col-md-6">
                  <label for="userFirstName" class="form-label required">
                    {{ t('admin:users.form.firstName') }}
                  </label>
                  <input
                    id="userFirstName"
                    v-model="localFormData.firstName"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.firstName }"
                    :placeholder="t('admin:users.form.firstNamePlaceholder')"
                    required
                    @blur="validateField('firstName')"
                    @input="handleFieldChange('firstName')"
                  />
                  <div v-if="validationErrors.firstName" class="invalid-feedback">
                    {{ validationErrors.firstName }}
                  </div>
                </div>

                <!-- Last Name -->
                <div class="col-md-6">
                  <label for="userLastName" class="form-label required">
                    {{ t('admin:users.form.lastName') }}
                  </label>
                  <input
                    id="userLastName"
                    v-model="localFormData.lastName"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.lastName }"
                    :placeholder="t('admin:users.form.lastNamePlaceholder')"
                    required
                    @blur="validateField('lastName')"
                    @input="handleFieldChange('lastName')"
                  />
                  <div v-if="validationErrors.lastName" class="invalid-feedback">
                    {{ validationErrors.lastName }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Password (for new users) -->
            <div v-if="!isEditing" class="form-section mb-4">
              <h6 class="form-section-title">
                <i class="bi bi-shield-lock me-2"></i>
                {{ t('admin:users.form.password') }}
              </h6>
              
              <div class="row g-3">
                <!-- Password -->
                <div class="col-md-6">
                  <label for="userPassword" class="form-label required">
                    {{ t('admin:users.form.password') }}
                  </label>
                  <div class="input-group">
                    <input
                      id="userPassword"
                      v-model="localFormData.password"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.password }"
                      :placeholder="t('admin:users.form.passwordPlaceholder')"
                      required
                      @blur="validateField('password')"
                      @input="handlePasswordChange"
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showPassword = !showPassword"
                    >
                      <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                  <div v-if="validationErrors.password" class="invalid-feedback">
                    {{ validationErrors.password }}
                  </div>
                  
                  <!-- Password Strength -->
                  <div v-if="localFormData.password" class="password-strength mt-2">
                    <div class="progress" style="height: 4px;">
                      <div 
                        class="progress-bar"
                        :class="passwordStrengthClass"
                        :style="{ width: passwordStrengthPercentage + '%' }"
                      ></div>
                    </div>
                    <small class="form-text" :class="passwordStrengthTextClass">
                      {{ passwordStrengthText }}
                    </small>
                  </div>
                </div>

                <!-- Confirm Password -->
                <div class="col-md-6">
                  <label for="userPasswordConfirm" class="form-label required">
                    {{ t('admin:users.form.confirmPassword') }}
                  </label>
                  <input
                    id="userPasswordConfirm"
                    v-model="passwordConfirm"
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': passwordMismatch }"
                    :placeholder="t('admin:users.form.confirmPasswordPlaceholder')"
                    required
                    @blur="validatePasswordConfirm"
                  />
                  <div v-if="passwordMismatch" class="invalid-feedback">
                    {{ t('admin:users.form.passwordMismatch') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Account Settings -->
            <div class="form-section mb-4">
              <h6 class="form-section-title">
                <i class="bi bi-gear me-2"></i>
                {{ t('admin:users.form.settings') }}
              </h6>
              
              <div class="row g-3">
                <!-- Language -->
                <div class="col-md-6">
                  <label for="userLangKey" class="form-label">
                    {{ t('admin:users.form.language') }}
                  </label>
                  <select
                    id="userLangKey"
                    v-model="localFormData.langKey"
                    class="form-select"
                  >
                    <option value="en">English</option>
                    <option value="it">Italiano</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <!-- Active Status -->
                <div class="col-md-6">
                  <label class="form-label">
                    {{ t('admin:users.form.status') }}
                  </label>
                  <div class="form-check form-switch">
                    <input
                      id="userActivated"
                      v-model="localFormData.activated"
                      class="form-check-input"
                      type="checkbox"
                    />
                    <label class="form-check-label" for="userActivated">
                      {{ localFormData.activated ? t('common:active') : t('common:inactive') }}
                    </label>
                  </div>
                  <div class="form-text">
                    {{ t('admin:users.form.statusHint') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Roles and Permissions -->
            <div class="form-section mb-4">
              <h6 class="form-section-title">
                <i class="bi bi-shield-check me-2"></i>
                {{ t('admin:users.form.roles') }}
              </h6>
              
              <div class="roles-selection">
                <div class="form-check">
                  <input
                    id="roleUser"
                    v-model="selectedRoles"
                    class="form-check-input"
                    type="checkbox"
                    value="ROLE_USER"
                  />
                  <label class="form-check-label" for="roleUser">
                    <strong>{{ t('admin:users.roles.user') }}</strong>
                    <br>
                    <small class="text-muted">{{ t('admin:users.roles.userDescription') }}</small>
                  </label>
                </div>
                
                <div class="form-check">
                  <input
                    id="roleAdmin"
                    v-model="selectedRoles"
                    class="form-check-input"
                    type="checkbox"
                    value="ROLE_ADMIN"
                  />
                  <label class="form-check-label" for="roleAdmin">
                    <strong>{{ t('admin:users.roles.admin') }}</strong>
                    <br>
                    <small class="text-muted">{{ t('admin:users.roles.adminDescription') }}</small>
                  </label>
                </div>
              </div>
            </div>

            <!-- Form Validation Summary -->
            <div v-if="hasValidationErrors" class="alert alert-danger">
              <h6 class="alert-heading">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ t('admin:users.form.validationErrors') }}
              </h6>
              <ul class="mb-0">
                <li v-for="(error, field) in validationErrors" :key="field">
                  {{ error }}
                </li>
              </ul>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <div class="d-flex justify-content-between align-items-center w-100">
            <!-- Left side - User info -->
            <div class="user-info">
              <small v-if="isEditing && editingUser" class="text-muted">
                <i class="bi bi-clock me-1"></i>
                {{ t('admin:users.form.lastModified') }}
              </small>
            </div>
            
            <!-- Right side - Actions -->
            <div class="modal-actions">
              <button 
                type="button" 
                class="btn btn-secondary me-2"
                @click="handleClose"
                :disabled="saving"
              >
                {{ t('common:cancel') }}
              </button>
              <button 
                type="button" 
                class="btn btn-success"
                @click="handleSave"
                :disabled="saving || hasValidationErrors || (!isEditing && passwordMismatch)"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check-lg me-2"></i>
                {{ isEditing ? t('common:update') : t('common:create') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div 
    v-if="show" 
    class="modal-backdrop fade show"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from '~/composables/useI18n'

interface User {
  id?: number
  login: string
  firstName: string
  lastName: string
  email: string
  activated: boolean
  langKey: string
  authorities: string[]
}

// Props
interface Props {
  show: boolean
  editingUser?: User | null
  formData: {
    login: string
    firstName: string
    lastName: string
    email: string
    activated: boolean
    langKey: string
    authorities: string[]
    password?: string
  }
  validationErrors: Record<string, string>
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editingUser: null,
  saving: false
})

// Emits
const emit = defineEmits<{
  'close': []
  'save': []
  'validate': [field?: string]
}>()

// Composables
const { t } = useI18n()

// Local state
const localFormData = ref({ ...props.formData })
const selectedRoles = ref<string[]>([...props.formData.authorities])
const showPassword = ref(false)
const passwordConfirm = ref('')

// Computed
const isEditing = computed(() => !!props.editingUser)

const hasValidationErrors = computed(() => {
  return Object.keys(props.validationErrors).length > 0
})

const passwordMismatch = computed(() => {
  return !isEditing.value && 
         passwordConfirm.value && 
         localFormData.value.password !== passwordConfirm.value
})

const passwordStrength = computed(() => {
  const password = localFormData.value.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength += 25
  if (/[a-z]/.test(password)) strength += 25
  if (/[A-Z]/.test(password)) strength += 25
  if (/[0-9]/.test(password)) strength += 15
  if (/[^A-Za-z0-9]/.test(password)) strength += 10
  
  return Math.min(100, strength)
})

const passwordStrengthPercentage = computed(() => passwordStrength.value)

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return 'bg-danger'
  if (strength < 60) return 'bg-warning'
  if (strength < 80) return 'bg-info'
  return 'bg-success'
})

const passwordStrengthTextClass = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return 'text-danger'
  if (strength < 60) return 'text-warning'
  if (strength < 80) return 'text-info'
  return 'text-success'
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return t('admin:users.form.passwordWeak')
  if (strength < 60) return t('admin:users.form.passwordFair')
  if (strength < 80) return t('admin:users.form.passwordGood')
  return t('admin:users.form.passwordStrong')
})

// Methods
const handleFieldChange = (field: string): void => {
  if (props.validationErrors[field]) {
    emit('validate', field)
  }
}

const handlePasswordChange = (): void => {
  handleFieldChange('password')
  if (passwordConfirm.value) {
    validatePasswordConfirm()
  }
}

const validatePasswordConfirm = (): void => {
  // Password confirmation validation is handled locally
}

const validateField = (field: string): void => {
  emit('validate', field)
}

const handleSave = (): void => {
  // Update authorities from selected roles
  localFormData.value.authorities = [...selectedRoles.value]
  
  // Update parent form data
  Object.assign(props.formData, localFormData.value)
  emit('save')
}

const handleClose = (): void => {
  emit('close')
}

const handleBackdropClick = (): void => {
  if (!props.saving) {
    handleClose()
  }
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent): void => {
  if (event.ctrlKey || event.metaKey) {
    if (event.key === 's') {
      event.preventDefault()
      if (!hasValidationErrors.value && !props.saving) {
        handleSave()
      }
    } else if (event.key === 'Escape') {
      event.preventDefault()
      handleClose()
    }
  }
}

// Watchers
watch(() => props.formData, (newData) => {
  Object.assign(localFormData.value, newData)
  selectedRoles.value = [...newData.authorities]
}, { immediate: true, deep: true })

watch(() => props.show, (newShow) => {
  if (newShow) {
    document.addEventListener('keydown', handleKeydown)
    document.body.classList.add('modal-open')
    
    // Reset password fields for new users
    if (!isEditing.value) {
      localFormData.value.password = ''
      passwordConfirm.value = ''
    }
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.classList.remove('modal-open')
  }
})

// Lifecycle
onMounted(() => {
  if (props.show) {
    document.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.form-section {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.form-section-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.form-label.required::after {
  content: ' *';
  color: #dc3545;
}

.roles-selection .form-check {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background-color: white;
}

.roles-selection .form-check:hover {
  background-color: #f8f9fa;
}

.password-strength .progress {
  border-radius: 2px;
}

.user-info {
  min-width: 150px;
}

.modal-actions {
  display: flex;
  align-items: center;
}

/* Enhanced validation styles */
.is-invalid {
  border-color: #dc3545;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath d='m5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .form-section {
    padding: 0.75rem;
  }
  
  .modal-footer .d-flex {
    flex-direction: column;
    gap: 1rem;
  }
  
  .modal-actions {
    width: 100%;
    justify-content: center;
  }
  
  .user-info {
    text-align: center;
    min-width: auto;
  }
  
  .roles-selection .form-check {
    padding: 0.5rem;
  }
}
</style>