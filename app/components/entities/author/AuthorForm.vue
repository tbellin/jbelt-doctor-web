<template>
  <EntityForm
    :mode="mode"
    entity-name="Author"
    :initial-data="initialData"
    :validation-rules="validationRules"
    @submit="handleSubmit"
    @cancel="$emit('cancel')"
  >
    <template #default="{ formData, errors, loading, validateField }">
      <!-- Personal Information Section -->
      <div class="row">
        <!-- First Name -->
        <div class="col-md-6 mb-2">
          <label for="firstName" class="form-label">
            {{ t('authors:form.fields.firstName.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="firstName"
            v-model="formData.firstName"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.firstName, 'is-valid': !errors.firstName && formData.firstName }"
            :placeholder="t('authors:form.fields.firstName.placeholder')"
            required
            @blur="validateField('firstName')"
          >
          <div v-if="errors.firstName" class="invalid-feedback">
            {{ errors.firstName }}
          </div>
        </div>

        <!-- Last Name -->
        <div class="col-md-6 mb-2">
          <label for="lastName" class="form-label">
            {{ t('authors:form.fields.lastName.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="lastName"
            v-model="formData.lastName"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.lastName, 'is-valid': !errors.lastName && formData.lastName }"
            :placeholder="t('authors:form.fields.lastName.placeholder')"
            required
            @blur="validateField('lastName')"
          >
          <div v-if="errors.lastName" class="invalid-feedback">
            {{ errors.lastName }}
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Email -->
        <div class="col-md-6 mb-2">
          <label for="email" class="form-label">
            {{ t('authors:form.fields.email.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': errors.email, 'is-valid': !errors.email && formData.email }"
            :placeholder="t('authors:form.fields.email.placeholder')"
            required
            @blur="validateField('email')"
          >
          <div v-if="errors.email" class="invalid-feedback">
            {{ errors.email }}
          </div>
        </div>

        <!-- Login -->
        <div class="col-md-6 mb-2">
          <label for="login" class="form-label">
            {{ t('authors:form.fields.login.label') }}
          </label>
          <input
            id="login"
            v-model="formData.login"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.login }"
            :placeholder="t('authors:form.fields.login.placeholder')"
            @blur="validateField('login')"
          >
          <div v-if="errors.login" class="invalid-feedback">
            {{ errors.login }}
          </div>
          <div class="form-text">
            {{ t('authors:form.fields.login.help') }}
          </div>
        </div>
      </div>

      <!-- Professional Information Section -->
      <div class="card bg-light border-0 mb-3">
        <div class="card-header bg-transparent border-0">
          <h6 class="mb-0">
            <i class="bi bi-briefcase me-2"></i>
            {{ t('authors:form.professional.title') }}
          </h6>
        </div>
        <div class="card-body">
          <div class="row">
            <!-- Department -->
            <div class="col-md-6 mb-2">
              <label for="department" class="form-label">
                {{ t('authors:form.fields.department.label') }}
              </label>
              <select
                id="department"
                v-model="formData.department"
                class="form-select"
                :class="{ 'is-invalid': errors.department }"
              >
                <option value="">{{ t('authors:form.fields.department.placeholder') }}</option>
                <option v-for="dept in departments" :key="dept" :value="dept">
                  {{ t(`authors:form.fields.department.options.${dept}`) }}
                </option>
              </select>
              <div v-if="errors.department" class="invalid-feedback">
                {{ errors.department }}
              </div>
            </div>

            <!-- Role -->
            <div class="col-md-6 mb-2">
              <label for="role" class="form-label">
                {{ t('authors:form.fields.role.label') }}
              </label>
              <input
                id="role"
                v-model="formData.role"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.role }"
                :placeholder="t('authors:form.fields.role.placeholder')"
                list="commonRoles"
              >
              <datalist id="commonRoles">
                <option value="Design Engineer"></option>
                <option value="Project Manager"></option>
                <option value="Technical Writer"></option>
                <option value="Quality Assurance"></option>
                <option value="CAD Operator"></option>
                <option value="Team Lead"></option>
                <option value="Consultant"></option>
              </datalist>
              <div v-if="errors.role" class="invalid-feedback">
                {{ errors.role }}
              </div>
            </div>
          </div>

          <div class="row">
            <!-- Phone -->
            <div class="col-md-6 mb-2">
              <label for="phone" class="form-label">
                {{ t('authors:form.fields.phone.label') }}
              </label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                class="form-control"
                :class="{ 'is-invalid': errors.phone }"
                :placeholder="t('authors:form.fields.phone.placeholder')"
              >
              <div v-if="errors.phone" class="invalid-feedback">
                {{ errors.phone }}
              </div>
            </div>

            <!-- Location -->
            <div class="col-md-6 mb-2">
              <label for="location" class="form-label">
                {{ t('authors:form.fields.location.label') }}
              </label>
              <input
                id="location"
                v-model="formData.location"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.location }"
                :placeholder="t('authors:form.fields.location.placeholder')"
              >
              <div v-if="errors.location" class="invalid-feedback">
                {{ errors.location }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Permissions and Access Section -->
      <div class="row">
        <!-- Permissions -->
        <div class="col-md-12 mb-2">
          <label class="form-label">
            {{ t('authors:form.permissions.title') }}
          </label>
          <div class="permission-grid">
            <div class="row">
              <div class="col-md-6">
                <div class="form-check">
                  <input
                    id="canCreateModels"
                    v-model="authorPermissions.canCreateModels"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label for="canCreateModels" class="form-check-label">
                    {{ t('authors:form.permissions.canCreateModels') }}
                  </label>
                </div>
                <div class="form-check">
                  <input
                    id="canEditModels"
                    v-model="authorPermissions.canEditModels"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label for="canEditModels" class="form-check-label">
                    {{ t('authors:form.permissions.canEditModels') }}
                  </label>
                </div>
                <div class="form-check">
                  <input
                    id="canDeleteModels"
                    v-model="authorPermissions.canDeleteModels"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label for="canDeleteModels" class="form-check-label">
                    {{ t('authors:form.permissions.canDeleteModels') }}
                  </label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-check">
                  <input
                    id="canManageVersions"
                    v-model="authorPermissions.canManageVersions"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label for="canManageVersions" class="form-check-label">
                    {{ t('authors:form.permissions.canManageVersions') }}
                  </label>
                </div>
                <div class="form-check">
                  <input
                    id="canApproveChanges"
                    v-model="authorPermissions.canApproveChanges"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label for="canApproveChanges" class="form-check-label">
                    {{ t('authors:form.permissions.canApproveChanges') }}
                  </label>
                </div>
                <div class="form-check">
                  <input
                    id="canViewReports"
                    v-model="authorPermissions.canViewReports"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label for="canViewReports" class="form-check-label">
                    {{ t('authors:form.permissions.canViewReports') }}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="form-text">
            {{ t('authors:form.permissions.help') }}
          </div>
        </div>
      </div>

      <!-- Team Memberships Section -->
      <div class="row">
        <div class="col-md-12 mb-2">
          <label for="teams" class="form-label">
            {{ t('authors:form.fields.teams.label') }}
          </label>
          <div class="team-selection">
            <div class="input-group mb-2">
              <select
                v-model="selectedTeamId"
                class="form-select"
                :disabled="loading.teams"
              >
                <option value="">{{ t('authors:form.fields.teams.placeholder') }}</option>
                <option v-for="team in availableTeams" :key="team.id" :value="team.id">
                  {{ team.name }} ({{ team.department }})
                </option>
              </select>
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="addTeamMembership"
                :disabled="!selectedTeamId"
              >
                <i class="bi bi-plus"></i>
              </button>
            </div>
            <div v-if="loading.teams" class="form-text">
              <i class="bi bi-spinner-border"></i> {{ t('common:loading') }}
            </div>
            
            <!-- Current team memberships -->
            <div v-if="authorTeams.length > 0" class="team-memberships">
              <div
                v-for="(team, index) in authorTeams"
                :key="team.id"
                class="d-flex align-items-center justify-content-between border rounded p-2 mb-1"
              >
                <div>
                  <strong>{{ team.name }}</strong>
                  <small class="text-muted d-block">{{ team.department }}</small>
                </div>
                <button
                  type="button"
                  class="btn btn-outline-danger btn-sm"
                  @click="removeTeamMembership(index)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="form-text">
            {{ t('authors:form.fields.teams.help') }}
          </div>
        </div>
      </div>

      <!-- Activity Status -->
      <div class="row">
        <div class="col-md-6 mb-2">
          <div class="form-check">
            <input
              id="isActive"
              v-model="formData.isActive"
              type="checkbox"
              class="form-check-input"
            >
            <label for="isActive" class="form-check-label">
              {{ t('authors:form.fields.isActive.label') }}
            </label>
          </div>
          <div class="form-text">
            {{ t('authors:form.fields.isActive.help') }}
          </div>
        </div>

        <div class="col-md-6 mb-2">
          <div class="form-check">
            <input
              id="canReceiveNotifications"
              v-model="formData.canReceiveNotifications"
              type="checkbox"
              class="form-check-input"
            >
            <label for="canReceiveNotifications" class="form-check-label">
              {{ t('authors:form.fields.notifications.label') }}
            </label>
          </div>
          <div class="form-text">
            {{ t('authors:form.fields.notifications.help') }}
          </div>
        </div>
      </div>

      <!-- Author Preview Card -->
      <div v-if="formData.firstName || formData.lastName" class="row">
        <div class="col-12 mb-2">
          <label class="form-label">{{ t('authors:form.preview.title') }}</label>
          <div class="card">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="author-avatar me-3">
                  <div class="avatar-circle">
                    {{ getInitials(formData.firstName, formData.lastName) }}
                  </div>
                </div>
                <div class="flex-grow-1">
                  <h6 class="card-title mb-1">
                    {{ getFullName(formData.firstName, formData.lastName) }}
                  </h6>
                  <p class="card-text text-muted small mb-2">
                    {{ formData.role || t('authors:form.preview.noRole') }}
                    <span v-if="formData.department"> • {{ formData.department }}</span>
                  </p>
                  <div class="d-flex gap-2 align-items-center">
                    <small v-if="formData.email" class="text-muted">
                      <i class="bi bi-envelope me-1"></i>{{ formData.email }}
                    </small>
                    <span v-if="formData.isActive" class="badge bg-success">{{ t('authors:form.preview.active') }}</span>
                    <span v-else class="badge bg-secondary">{{ t('authors:form.preview.inactive') }}</span>
                    <span v-if="authorTeams.length > 0" class="badge bg-info">
                      {{ t('authors:form.preview.teams', { count: authorTeams.length }) }}
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
import { ref, computed, onMounted } from 'vue'
import { type IAuthor, Author } from '~/model/author.model'
import { type ITeam } from '~/model/team.model'
import { commonValidationRules } from '../shared/composables/useEntityForm'
import EntityForm from '../shared/EntityForm.vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  mode: 'create' | 'edit'
  initialData?: IAuthor
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

// Emits
const emit = defineEmits<{
  submit: [author: IAuthor]
  cancel: []
}>()

// Reactive Data
const availableTeams = ref<ITeam[]>([])
const authorTeams = ref<ITeam[]>([])
const selectedTeamId = ref<number | null>(null)
const authorPermissions = ref({
  canCreateModels: false,
  canEditModels: false,
  canDeleteModels: false,
  canManageVersions: false,
  canApproveChanges: false,
  canViewReports: false
})
const loading = ref({
  teams: false
})

// Validation Rules
const validationRules = {
  firstName: commonValidationRules.required('First Name'),
  lastName: commonValidationRules.required('Last Name'),
  email: {
    ...commonValidationRules.required('Email'),
    ...commonValidationRules.email('Email')
  }
}

// Constants
const departments = [
  'ENGINEERING',
  'DESIGN',
  'QUALITY',
  'MANUFACTURING',
  'RESEARCH',
  'MANAGEMENT',
  'CONSULTING',
  'EXTERNAL'
]

// Methods
const loadAvailableTeams = async () => {
  loading.value.teams = true
  try {
    // Mock data - replace with actual API call
    availableTeams.value = [
      { id: 1, name: 'Design Team Alpha', department: 'ENGINEERING' },
      { id: 2, name: 'Quality Assurance', department: 'QUALITY' },
      { id: 3, name: 'Project Management', department: 'MANAGEMENT' }
    ] as ITeam[]
  } catch (error) {
    console.error('Error loading teams:', error)
  } finally {
    loading.value.teams = false
  }
}

const addTeamMembership = () => {
  if (selectedTeamId.value) {
    const team = availableTeams.value.find(t => t.id === selectedTeamId.value)
    if (team && !authorTeams.value.find(t => t.id === team.id)) {
      authorTeams.value.push(team)
      selectedTeamId.value = null
    }
  }
}

const removeTeamMembership = (index: number) => {
  authorTeams.value.splice(index, 1)
}

const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0).toUpperCase() || ''
  const last = lastName?.charAt(0).toUpperCase() || ''
  return first + last || '?'
}

const getFullName = (firstName?: string, lastName?: string): string => {
  return [firstName, lastName].filter(Boolean).join(' ') || t('authors:form.preview.noName')
}

const handleSubmit = (formData: any) => {
  const author = new Author(
    formData.id,
    formData.firstName,
    formData.lastName,
    formData.email,
    formData.login,
    formData.department,
    formData.role,
    formData.phone,
    formData.location,
    formData.isActive,
    formData.canReceiveNotifications,
    authorTeams.value,
    authorPermissions.value
  )
  
  emit('submit', author)
}

// Lifecycle
onMounted(() => {
  loadAvailableTeams()
  
  // Initialize teams and permissions from initial data
  if (props.initialData?.teams) {
    authorTeams.value = [...props.initialData.teams]
  }
  if (props.initialData?.permissions) {
    authorPermissions.value = { ...props.initialData.permissions }
  }
})
</script>

<style scoped>
.author-avatar {
  width: 60px;
  text-align: center;
}

.avatar-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.permission-grid .form-check {
  margin-bottom: 0.5rem;
}

.team-memberships {
  max-height: 200px;
  overflow-y: auto;
}

.form-check-label {
  font-size: 0.9rem;
}
</style>