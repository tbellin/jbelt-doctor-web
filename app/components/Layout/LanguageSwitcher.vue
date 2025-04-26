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

const changeLanguage = (lang: string) => {
  if (lang === currentLanguage.value) return;
  
  // Imposta la nuova lingua
  setLanguage(lang);
  
  // Forza il ricaricamento della pagina corrente per applicare le nuove traduzioni
  // o aggiunge il parametro alla URL se necessario
  if (process.client) {
    // Aggiorna l'attributo lang dell'HTML
    document.documentElement.setAttribute('lang', lang);
    
    // Ricarica la pagina corrente per applicare le traduzioni
    // Opzionale: se preferisci non ricaricare la pagina, rimuovi questa riga
    window.location.reload();
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