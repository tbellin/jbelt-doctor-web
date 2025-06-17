<template>
  <EntityForm
    :mode="mode"
    entity-name="Team"
    :initial-data="initialData"
    :validation-rules="validationRules"
    @submit="handleSubmit"
    @cancel="$emit('cancel')"
  >
    <template #default="{ formData, errors, loading, validateField }">
      <!-- Basic Information Section -->
      <div class="row">
        <!-- Name -->
        <div class="col-md-8 mb-2">
          <label for="name" class="form-label">
            {{ t('teams:form.fields.name.label') }}
            <span class="text-danger">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.name, 'is-valid': !errors.name && formData.name }"
            :placeholder="t('teams:form.fields.name.placeholder')"
            required
            @blur="validateField('name')"
          >
          <div v-if="errors.name" class="invalid-feedback">
            {{ errors.name }}
          </div>
        </div>

        <!-- Department -->
        <div class="col-md-4 mb-2">
          <label for="department" class="form-label">
            {{ t('teams:form.fields.department.label') }}
            <span class="text-danger">*</span>
          </label>
          <select
            id="department"
            v-model="formData.department"
            class="form-select"
            :class="{ 'is-invalid': errors.department, 'is-valid': !errors.department && formData.department }"
            required
          >
            <option value="">{{ t('teams:form.fields.department.placeholder') }}</option>
            <option v-for="dept in departments" :key="dept" :value="dept">
              {{ t(`teams:form.fields.department.options.${dept}`) }}
            </option>
          </select>
          <div v-if="errors.department" class="invalid-feedback">
            {{ errors.department }}
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="row">
        <div class="col-12 mb-2">
          <label for="description" class="form-label">
            {{ t('teams:form.fields.description.label') }}
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            class="form-control"
            rows="3"
            :class="{ 'is-invalid': errors.description }"
            :placeholder="t('teams:form.fields.description.placeholder')"
          ></textarea>
          <div v-if="errors.description" class="invalid-feedback">
            {{ errors.description }}
          </div>
        </div>
      </div>

      <!-- Team Leadership Section -->
      <div class="card bg-light border-0 mb-3">
        <div class="card-header bg-transparent border-0">
          <h6 class="mb-0">
            <i class="bi bi-person-badge me-2"></i>
            {{ t('teams:form.leadership.title') }}
          </h6>
        </div>
        <div class="card-body">
          <div class="row">
            <!-- Team Lead -->
            <div class="col-md-6 mb-2">
              <label for="teamLeadId" class="form-label">
                {{ t('teams:form.fields.teamLead.label') }}
              </label>
              <select
                id="teamLeadId"
                v-model="formData.teamLeadId"
                class="form-select"
                :class="{ 'is-invalid': errors.teamLeadId }"
                :disabled="loading.authors"
              >
                <option value="">{{ t('teams:form.fields.teamLead.placeholder') }}</option>
                <option v-for="author in availableLeads" :key="author.id" :value="author.id">
                  {{ getFullName(author.firstName, author.lastName) }}
                  <span v-if="author.role" class="text-muted">({{ author.role }})</span>
                </option>
              </select>
              <div v-if="loading.authors" class="form-text">
                <i class="bi bi-spinner-border"></i> {{ t('common:loading') }}
              </div>
              <div v-if="errors.teamLeadId" class="invalid-feedback">
                {{ errors.teamLeadId }}
              </div>
            </div>

            <!-- Contact Email -->
            <div class="col-md-6 mb-2">
              <label for="contactEmail" class="form-label">
                {{ t('teams:form.fields.contactEmail.label') }}
              </label>
              <input
                id="contactEmail"
                v-model="formData.contactEmail"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': errors.contactEmail }"
                :placeholder="t('teams:form.fields.contactEmail.placeholder')"
              >
              <div v-if="errors.contactEmail" class="invalid-feedback">
                {{ errors.contactEmail }}
              </div>
              <div class="form-text">
                {{ t('teams:form.fields.contactEmail.help') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Members Section -->
      <div class="row">
        <div class="col-12 mb-2">
          <label class="form-label">
            {{ t('teams:form.members.title') }}
            <span v-if="teamMembers.length > 0" class="badge bg-info ms-2">{{ teamMembers.length }}</span>
          </label>
          
          <!-- Add Member Interface -->
          <div class="member-selection mb-3">
            <div class="input-group">
              <select
                v-model="selectedMemberId"
                class="form-select"
                :disabled="loading.authors"
              >
                <option value="">{{ t('teams:form.members.addPlaceholder') }}</option>
                <option v-for="author in availableMembers" :key="author.id" :value="author.id">
                  {{ getFullName(author.firstName, author.lastName) }}
                  <span v-if="author.role" class="text-muted">({{ author.role }})</span>
                  <span v-if="author.department" class="text-muted"> - {{ author.department }}</span>
                </option>
              </select>
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="addTeamMember"
                :disabled="!selectedMemberId"
              >
                <i class="bi bi-person-plus"></i>
                {{ t('teams:form.members.add') }}
              </button>
            </div>
          </div>

          <!-- Current Team Members -->
          <div v-if="teamMembers.length > 0" class="team-members-list">
            <div class="row">
              <div
                v-for="(member, index) in teamMembers"
                :key="member.id"
                class="col-md-6 mb-2"
              >
                <div class="card border">
                  <div class="card-body p-2">
                    <div class="d-flex align-items-center justify-content-between">
                      <div class="d-flex align-items-center">
                        <div class="member-avatar me-2">
                          <div class="avatar-circle-sm">
                            {{ getInitials(member.firstName, member.lastName) }}
                          </div>
                        </div>
                        <div>
                          <div class="fw-medium">{{ getFullName(member.firstName, member.lastName) }}</div>
                          <small class="text-muted">{{ member.role || t('teams:form.members.noRole') }}</small>
                          <span v-if="member.id === formData.teamLeadId" class="badge bg-warning ms-1">
                            {{ t('teams:form.members.leader') }}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        @click="removeTeamMember(index)"
                        :disabled="member.id === formData.teamLeadId"
                        :title="member.id === formData.teamLeadId ? t('teams:form.members.cannotRemoveLeader') : t('common:remove')"
                      >
                        <i class="bi bi-person-dash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            {{ t('teams:form.members.empty') }}
          </div>
        </div>
      </div>

      <!-- Team Capabilities Section -->
      <div class="row">
        <div class="col-12 mb-2">
          <label class="form-label">
            {{ t('teams:form.capabilities.title') }}
          </label>
          <div class="capability-selection">
            <div class="row">
              <div class="col-md-6">
                <div class="form-check">
                  <input
                    id="canDesign"
                    v-model="teamCapabilities.canDesign"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label for="canDesign" class="form-check-label">
                    {{ t('teams:form.capabilities.canDesign') }}
                  </label>
                </div>
                <div class="form-check">
                  <input
                    id="canAnalyze"
                    v-model="teamCapabilities.canAnalyze"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label for="canAnalyze" class="form-check-label">
                    {{ t('teams:form.capabilities.canAnalyze') }}
                  </label>
                </div>
                <div class="form-check">
                  <input
                    id="canManufacture"
                    v-model="teamCapabilities.canManufacture"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label for="canManufacture" class="form-check-label">
                    {{ t('teams:form.capabilities.canManufacture') }}
                  </label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-check">
                  <input
                    id="canTest"
                    v-model="teamCapabilities.canTest"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label for="canTest" class="form-check-label">
                    {{ t('teams:form.capabilities.canTest') }}
                  </label>
                </div>
                <div class="form-check">
                  <input
                    id="canDocument"
                    v-model="teamCapabilities.canDocument"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label for="canDocument" class="form-check-label">
                    {{ t('teams:form.capabilities.canDocument') }}
                  </label>
                </div>
                <div class="form-check">
                  <input
                    id="canManageProjects"
                    v-model="teamCapabilities.canManageProjects"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label for="canManageProjects" class="form-check-label">
                    {{ t('teams:form.capabilities.canManageProjects') }}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="form-text">
            {{ t('teams:form.capabilities.help') }}
          </div>
        </div>
      </div>

      <!-- Team Status -->
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
              {{ t('teams:form.fields.isActive.label') }}
            </label>
          </div>
          <div class="form-text">
            {{ t('teams:form.fields.isActive.help') }}
          </div>
        </div>
      </div>

      <!-- Team Preview Card -->
      <div v-if="formData.name" class="row">
        <div class="col-12 mb-2">
          <label class="form-label">{{ t('teams:form.preview.title') }}</label>
          <div class="card">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <div class="team-icon me-3">
                    <i :class="getDepartmentIcon(formData.department)" class="fs-2"></i>
                  </div>
                  <div>
                    <h6 class="card-title mb-1">{{ formData.name }}</h6>
                    <p class="card-text text-muted small mb-2">
                      {{ formData.department ? t(`teams:form.fields.department.options.${formData.department}`) : t('teams:form.preview.noDepartment') }}
                    </p>
                    <div class="d-flex gap-2 align-items-center">
                      <span v-if="teamMembers.length > 0" class="badge bg-info">
                        {{ t('teams:form.preview.members', { count: teamMembers.length }) }}
                      </span>
                      <span v-if="formData.isActive" class="badge bg-success">{{ t('teams:form.preview.active') }}</span>
                      <span v-else class="badge bg-secondary">{{ t('teams:form.preview.inactive') }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="selectedTeamLead" class="text-end">
                  <small class="text-muted d-block">{{ t('teams:form.preview.leader') }}</small>
                  <strong>{{ getFullName(selectedTeamLead.firstName, selectedTeamLead.lastName) }}</strong>
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
import { type ITeam, Team } from '~/model/team.model'
import { type IAuthor } from '~/model/author.model'
import { commonValidationRules } from '../shared/composables/useEntityForm'
import EntityForm from '../shared/EntityForm.vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  mode: 'create' | 'edit'
  initialData?: ITeam
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

// Emits
const emit = defineEmits<{
  submit: [team: ITeam]
  cancel: []
}>()

// Reactive Data
const availableAuthors = ref<IAuthor[]>([])
const teamMembers = ref<IAuthor[]>([])
const selectedMemberId = ref<number | null>(null)
const teamCapabilities = ref({
  canDesign: false,
  canAnalyze: false,
  canManufacture: false,
  canTest: false,
  canDocument: false,
  canManageProjects: false
})
const loading = ref({
  authors: false
})

// Validation Rules
const validationRules = {
  name: commonValidationRules.required('Team Name'),
  department: commonValidationRules.required('Department')
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

// Computed
const availableLeads = computed(() => {
  return availableAuthors.value.filter(author => 
    author.isActive && 
    (!formData.department || author.department === formData.department)
  )
})

const availableMembers = computed(() => {
  return availableAuthors.value.filter(author => 
    author.isActive && 
    !teamMembers.value.find(member => member.id === author.id)
  )
})

const selectedTeamLead = computed(() => {
  return props.initialData?.teamLeadId ? 
    availableAuthors.value.find(a => a.id === props.initialData?.teamLeadId) : null
})

// Methods
const loadAvailableAuthors = async () => {
  loading.value.authors = true
  try {
    // Mock data - replace with actual API call
    availableAuthors.value = [
      { 
        id: 1, 
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john.doe@company.com',
        role: 'Senior Engineer',
        department: 'ENGINEERING',
        isActive: true
      },
      { 
        id: 2, 
        firstName: 'Jane', 
        lastName: 'Smith', 
        email: 'jane.smith@company.com',
        role: 'Design Lead',
        department: 'DESIGN',
        isActive: true
      },
      { 
        id: 3, 
        firstName: 'Bob', 
        lastName: 'Johnson', 
        email: 'bob.johnson@company.com',
        role: 'Quality Manager',
        department: 'QUALITY',
        isActive: true
      }
    ] as IAuthor[]
  } catch (error) {
    console.error('Error loading authors:', error)
  } finally {
    loading.value.authors = false
  }
}

const addTeamMember = () => {
  if (selectedMemberId.value) {
    const author = availableAuthors.value.find(a => a.id === selectedMemberId.value)
    if (author && !teamMembers.value.find(m => m.id === author.id)) {
      teamMembers.value.push(author)
      selectedMemberId.value = null
    }
  }
}

const removeTeamMember = (index: number) => {
  const member = teamMembers.value[index]
  if (member.id === props.initialData?.teamLeadId) {
    // Cannot remove team leader
    return
  }
  teamMembers.value.splice(index, 1)
}

const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0).toUpperCase() || ''
  const last = lastName?.charAt(0).toUpperCase() || ''
  return first + last || '?'
}

const getFullName = (firstName?: string, lastName?: string): string => {
  return [firstName, lastName].filter(Boolean).join(' ') || t('teams:form.preview.noName')
}

const getDepartmentIcon = (department?: string): string => {
  switch (department) {
    case 'ENGINEERING': return 'bi bi-gear text-primary'
    case 'DESIGN': return 'bi bi-palette text-success'
    case 'QUALITY': return 'bi bi-check-circle text-warning'
    case 'MANUFACTURING': return 'bi bi-tools text-info'
    case 'RESEARCH': return 'bi bi-lightbulb text-secondary'
    case 'MANAGEMENT': return 'bi bi-briefcase text-dark'
    default: return 'bi bi-people text-muted'
  }
}

const handleSubmit = (formData: any) => {
  // Find the selected team lead
  const teamLead = formData.teamLeadId ? 
    availableAuthors.value.find(a => a.id === formData.teamLeadId) : null

  const team = new Team(
    formData.id,
    formData.name,
    formData.department,
    formData.description,
    formData.contactEmail,
    formData.isActive,
    teamLead,
    teamMembers.value,
    teamCapabilities.value
  )
  
  emit('submit', team)
}

// Watchers
watch(() => props.initialData?.members, (newMembers) => {
  if (newMembers) {
    teamMembers.value = Array.isArray(newMembers) ? [...newMembers] : []
  }
}, { immediate: true })

watch(() => props.initialData?.capabilities, (newCapabilities) => {
  if (newCapabilities) {
    teamCapabilities.value = { ...teamCapabilities.value, ...newCapabilities }
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  loadAvailableAuthors()
})
</script>

<style scoped>
.member-avatar {
  width: 35px;
  text-align: center;
}

.avatar-circle-sm {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
}

.team-members-list {
  max-height: 400px;
  overflow-y: auto;
}

.team-icon {
  width: 60px;
  text-align: center;
}

.capability-selection .form-check {
  margin-bottom: 0.5rem;
}

.form-check-label {
  font-size: 0.9rem;
}
</style>