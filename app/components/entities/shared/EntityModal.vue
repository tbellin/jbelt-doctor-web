<template>
  <div 
    class="modal fade" 
    :id="modalId"
    tabindex="-1" 
    :aria-labelledby="`${modalId}Label`"
    aria-hidden="true"
    ref="modalRef"
  >
    <div class="modal-dialog" :class="modalSizeClass">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" :id="`${modalId}Label`">
            <slot name="title">
              {{ title || `${mode === 'create' ? t('common:create') : t('common:edit')} ${entityName}` }}
            </slot>
          </h5>
          <button 
            type="button" 
            class="btn-close" 
            @click="close"
            :aria-label="t('common:close')"
          ></button>
        </div>
        
        <div class="modal-body">
          <slot 
            :close="close"
            :submit="handleSubmit"
            :mode="mode"
            :data="data"
            :loading="loading"
          />
        </div>
        
        <div class="modal-footer" v-if="showFooter">
          <slot 
            name="footer"
            :close="close"
            :submit="handleSubmit"
            :loading="loading"
          >
            <button 
              type="button" 
              class="btn btn-secondary"
              @click="close"
              :disabled="loading"
            >
              {{ t('common:cancel') }}
            </button>
            <button 
              type="button" 
              class="btn btn-primary"
              @click="handleSubmit"
              :disabled="loading || !isValid"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ mode === 'create' ? t('common:create') : t('common:update') }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// Composables
const { t } = useI18n()

// Props
interface Props {
  modalId: string
  entityName: string
  mode: 'create' | 'edit' | 'view'
  data?: any
  size?: 'sm' | 'md' | 'lg' | 'xl'
  title?: string
  showFooter?: boolean
  isValid?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
  showFooter: true,
  isValid: true,
  loading: false
})

// Emits
const emit = defineEmits<{
  submit: [data: any]
  close: []
  show: []
  hide: []
}>()

// Reactive Data
const modalRef = ref<HTMLElement>()
let modalInstance: any = null

// Computed
const modalSizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'modal-sm'
    case 'md': return ''
    case 'lg': return 'modal-lg'
    case 'xl': return 'modal-xl'
    default: return 'modal-lg'
  }
})

// Methods
const show = () => {
  if (modalInstance) {
    modalInstance.show()
  }
}

const close = () => {
  if (modalInstance) {
    modalInstance.hide()
  }
}

const handleSubmit = () => {
  emit('submit', props.data)
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  
  if (modalRef.value) {
    // Import Bootstrap Modal dynamically
    const { Modal } = await import('bootstrap')
    modalInstance = new Modal(modalRef.value)
    
    // Setup event listeners
    modalRef.value.addEventListener('shown.bs.modal', () => {
      emit('show')
    })
    
    modalRef.value.addEventListener('hidden.bs.modal', () => {
      emit('hide')
      emit('close')
    })
  }
})

onUnmounted(() => {
  if (modalInstance) {
    modalInstance.dispose()
  }
})

// Expose methods
defineExpose({
  show,
  close,
  modalInstance
})
</script>

<style scoped>
.modal-title {
  color: var(--bs-primary);
  font-weight: 600;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>