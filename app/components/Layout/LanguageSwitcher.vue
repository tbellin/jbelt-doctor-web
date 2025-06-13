<!-- app/components/Layout/LanguageSwitcher.vue -->
<template>
  <div class="language-switcher">
    <div class="dropdown">
      <button 
        class="btn btn-outline-light dropdown-toggle" 
        type="button" 
        id="languageDropdown" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        <i class="bi bi-globe me-1"></i>
        {{ currentLanguageDisplay }}
      </button>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown">
        <li v-for="lang in availableLanguages" :key="lang.code">
          <button 
            class="dropdown-item" 
            @click="changeLanguage(lang.code)" 
            :class="{ active: currentLanguage === lang.code }"
          >
            {{ lang.name }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useI18n } from '~/composables/useI18n';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const { currentLanguage, availableLanguages, setLanguage } = useI18n();

const currentLanguageDisplay = computed(() => {
  const lang = availableLanguages.find(l => l.code === currentLanguage.value);
  return lang ? lang.name : currentLanguage.value.toUpperCase();
});

const changeLanguage = async (lang: string) => {
  if (lang === currentLanguage.value) return;
  
  console.log('[LanguageSwitcher] Changing language to:', lang);
  
  try {
    // Imposta la nuova lingua
    await setLanguage(lang);
    
    if (process.client) {
      // Aggiorna l'attributo lang dell'HTML
      document.documentElement.setAttribute('lang', lang);
      
      console.log('[LanguageSwitcher] Language changed successfully, no reload needed');
    }
  } catch (error) {
    console.error('[LanguageSwitcher] Error changing language:', error);
  }
};

// Osserva i cambiamenti della lingua e aggiorna il documento HTML
watch(currentLanguage, (newLang) => {
  if (process.client) {
    document.documentElement.setAttribute('lang', newLang);
  }
});
</script>

<style scoped>
.language-switcher .dropdown-item.active {
  background-color: var(--bs-primary);
  color: white;
}
</style>

<!-- Version: 1.1.0 -->