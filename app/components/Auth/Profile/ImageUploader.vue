<!-- app/components/Auth/Profile/ImageUploader.vue -->
<template>
  <div class="image-uploader">
    <!-- Container immagine profilo -->
    <div class="profile-image-container mb-3">
      <div class="profile-image-wrapper">
        <img 
          :src="currentImageSrc" 
          alt="Profile" 
          class="profile-image img-fluid rounded"
          @error="handleImageError"
        />
        <!--  editable --
        <div v-if="editable" class="profile-image-overlay">
          <label for="imageUpload" class="btn btn-light btn-sm">
            <i class="bi bi-camera"></i> {{ t('change_image') }}
          </label>
        </div>
        -->
      </div>
    </div>
    
    <!-- Input file per caricamento immagine (nascosto) --
    <input 
      type="file" 
      id="imageUpload" 
      class="d-none"
      accept="image/*"
      @change="handleImageUpload"
      :disabled="!editable || loading"
      ref="fileInput"
    />
    -->
    
    <!-- Campo URL immagine --
    <div class="mb-3" v-if="showUrlField">
      <label for="imageUrl" class="form-label">{{ t('image_url') }}</label>
      <div class="input-group">
        <input
          type="text"
          class="form-control"
          id="imageUrl"
          v-model="imageUrl"
          :disabled="!editable || loading"
          placeholder="https://..."
        />
        <button 
          type="button"
          class="btn btn-outline-secondary" 
          @click="refreshImage"
          :disabled="!editable || loading"
        >
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>
      <small class="form-text text-muted">{{ t('image_url_help') }}</small>
    </div>
  -->
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from '~/composables/useI18n';

const props = defineProps({
  /** URL dell'immagine corrente */
  imageUrl: {
    type: String,
    default: ''
  },
  /** Se il componente è in modalità modifica */
  editable: {
    type: Boolean,
    default: false
  },
  /** Se il componente è in stato di caricamento */
  loading: {
    type: Boolean,
    default: false
  },
  /** Se mostrare il campo URL */
  showUrlField: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:imageUrl', 'imageChanged']);

const { t } = useI18n();
const fileInput = ref(null);
const selectedFile = ref(null);
const imageObjectUrl = ref(null);
const imageUrl = ref(props.imageUrl || '');
const imageError = ref(false);

// Percorso corretto all'immagine di default
const DEFAULT_AVATAR_PATH = '/default-avatar.png';
// Dimensione massima consentita in byte (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Monitora cambiamenti all'URL dell'immagine e propaga verso l'alto
watch(imageUrl, (newUrl) => {
  emit('update:imageUrl', newUrl);
});

// Aggiorna lo stato interno quando cambia la prop
watch(() => props.imageUrl, (newUrl) => {
  if (newUrl !== imageUrl.value) {
    imageUrl.value = newUrl || '';
    // Reset dello stato di errore quando cambia l'URL
    imageError.value = false;
  }
});

// Gestisce il caricamento di una nuova immagine
const handleImageUpload = (event) => {
  const files = event.target?.files;
  if (!files || files.length === 0) return;
  
  const file = files[0];
  
  // Validazione del file
  if (!file.type.startsWith('image/')) {
    emit('imageChanged', { error: 'file_type_error' });
    return;
  }
  
  if (file.size > MAX_FILE_SIZE) {
    emit('imageChanged', { error: 'file_size_error' });
    return;
  }
  
  // Pulizia risorse precedenti
  cleanupImageResources();
  
  // Salva il file e crea URL per anteprima
  selectedFile.value = file;
  imageObjectUrl.value = URL.createObjectURL(file);
  imageError.value = false;
  
  // Conversione in base64 per invio al server - ottimizzata per evitare errori
  const reader = new FileReader();
  reader.onload = (e) => {
    if (!e.target?.result) return;
    
    try {
      // Utilizziamo una variabile temporanea per evitare problemi reattivi
      const base64String = e.target.result.toString();
      // Verifichiamo che sia un base64 valido prima di assegnarlo
      if (base64String.startsWith('data:image/')) {
        // Impostiamo prima un valore vuoto per evitare cicli reattivi
        imageUrl.value = '';
        // Utilizziamo setTimeout per ritardare l'assegnazione
        setTimeout(() => {
          imageUrl.value = base64String;
          emit('imageChanged', { file, base64: base64String });
        }, 0);
      } else {
        throw new Error('Invalid base64 image format');
      }
    } catch (error) {
      console.error('[ImageUploader] Error processing image:', error);
      emit('imageChanged', { error: 'image_processing_error' });
    }
  };
  
  reader.onerror = () => {
    emit('imageChanged', { error: 'file_read_error' });
  };
  
  // Utilizziamo un try-catch per gestire eventuali errori nella lettura del file
  try {
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('[ImageUploader] Error reading file:', error);
    emit('imageChanged', { error: 'file_read_error' });
  }
};

// Gestisce errori di caricamento immagine
const handleImageError = (e) => {
  // Marchiamo l'immagine come errata
  imageError.value = true;
  
  // Impediamo il loop di errori impostando l'immagine di default
  const target = e.target;
  if (target) {
    // Verifichiamo che non siamo già sull'immagine di default
    if (target.src !== window.location.origin + DEFAULT_AVATAR_PATH) {
      target.src = DEFAULT_AVATAR_PATH;
    }
  }
  
  emit('imageChanged', { error: 'image_load_error' });
};

// Refresh immagine dall'URL corrente
const refreshImage = () => {
  if (!imageUrl.value || imageUrl.value.startsWith('data:')) return;
  
  // Resettiamo lo stato di errore
  imageError.value = false;
  
  // Usiamo una copia temporanea dell'URL originale
  const baseUrl = imageUrl.value.split(/[?#]/)[0];
  
  // Aggiungiamo un timestamp univoco
  const timestamp = new Date().getTime();
  const hasQuery = imageUrl.value.includes('?');
  const separator = hasQuery ? '&' : '?';
  
  // Riassegnamo l'URL aggiornato
  imageUrl.value = '';
  setTimeout(() => {
    imageUrl.value = `${baseUrl}${separator}_=${timestamp}`;
  }, 0);
};

// Pulizia risorse URL
const cleanupImageResources = () => {
  if (imageObjectUrl.value) {
    URL.revokeObjectURL(imageObjectUrl.value);
    imageObjectUrl.value = null;
  }
  selectedFile.value = null;
};

// Reset del componente
const reset = () => {
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  cleanupImageResources();
  imageUrl.value = props.imageUrl || '';
  imageError.value = false;
};

// Determina la sorgente dell'immagine da visualizzare
const currentImageSrc = computed(() => {
  // Se c'è un errore nell'immagine o non abbiamo URL, usiamo l'immagine default
  if (imageError.value || (!imageObjectUrl.value && !imageUrl.value)) {
    return DEFAULT_AVATAR_PATH;
  }
  
  // Priorità: 1) Object URL (per anteprima file) 2) URL esterno/base64
  if (imageObjectUrl.value) {
    return imageObjectUrl.value;
  }
  
  return imageUrl.value;
});

// Debug logger
const logDebug = (message, ...args) => {
  if (process.env.NUXT_DEBUG === 'true') {
    console.log(`[ImageUploader] ${message}`, ...args);
  }
};

// Verifica dell'effettiva esistenza dell'immagine di default al mount
onMounted(() => {
  // Verifichiamo se l'immagine di default è accessibile
  const img = new Image();
  img.onload = () => logDebug('Default avatar loaded successfully');
  img.onerror = () => console.warn(`[ImageUploader] Default avatar not found at: ${DEFAULT_AVATAR_PATH}`);
  img.src = DEFAULT_AVATAR_PATH;
});

// Espone metodi al componente genitore
defineExpose({
  reset
});

// Pulizia risorse alla rimozione del componente
onBeforeUnmount(() => {
  cleanupImageResources();
});
</script>

<style scoped>
.profile-image-container {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto;
}

.profile-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #f8f9fa;
}

.profile-image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 0.5rem;
  text-align: center;
  transition: opacity 0.3s;
}

@media (max-width: 768px) {
  .profile-image-container {
    width: 150px;
    height: 150px;
  }
}
</style>

<!-- Version: 1.0.1 -->