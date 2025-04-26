// app/composables/useI18n.ts
import { ref, computed, onMounted, watch, getCurrentInstance } from 'vue';
import { useRoute } from 'vue-router';

interface TranslationDictionary {
  [key: string]: string;
}

interface Translations {
  [lang: string]: {
    [namespace: string]: TranslationDictionary;
  };
}

// Singleton pattern per gestire lo stato globale delle traduzioni
const currentLanguage = ref(
  process.client 
    ? localStorage.getItem('user_language') || navigator.language.split('-')[0] || 'it'
    : 'it'
);
const translations = ref<Translations>({});
const loadedNamespaces = ref<Set<string>>(new Set(['common'])); // Common è sempre caricato
const translationsLoaded = ref(false);

// Lingue disponibili
const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'it', name: 'Italiano' }
];

// Fallback a 'it' se la lingua rilevata non è supportata
if (!availableLanguages.some(lang => lang.code === currentLanguage.value)) {
  currentLanguage.value = 'it';
}

/**
 * Carica i file di traduzione per una specifica lingua e namespace
 * @param lang Codice della lingua
 * @param namespace Nome del namespace (nome della pagina/componente)
 */
async function loadNamespaceTranslations(lang: string, namespace: string) {
  if (!translations.value[lang]) {
    translations.value[lang] = {};
  }
  
  // Se il namespace è già caricato, non fare nulla
  if (translations.value[lang][namespace]) {
    return;
  }
  
  try {
    // Utilizza dynamic import per caricare il file di traduzione corretto
    const isDebugMode = process.env.NUXT_DEBUG === 'true';
    if (isDebugMode) {
      console.log(`[useI18n] Loading namespace "${namespace}" for language "${lang}"`);
    }
    
    // Carica il file di traduzione
    try {
      // Assicuriamoci che il percorso sia corretto per l'import
      const module = await import(`../i18n/${lang}/${namespace}.json`).catch(() => {
        console.warn(`[useI18n] Translation file for "${lang}/${namespace}" not found, using empty object`);
        return { default: {} };
      });
      
      translations.value[lang][namespace] = module.default;
      loadedNamespaces.value.add(namespace);
      
      if (isDebugMode) {
        console.log(`[useI18n] Loaded namespace "${namespace}" for "${lang}"`);
      }
    } catch (err) {
      console.error(`Failed to load translations for "${lang}/${namespace}":`, err);
      
      // Se il file non esiste, crea un oggetto vuoto per evitare errori
      translations.value[lang][namespace] = {};
    }
  } catch (error) {
    console.error(`Error loading translations for "${lang}/${namespace}":`, error);
    translations.value[lang][namespace] = {};
  }
}

/**
 * Carica le traduzioni comuni per tutte le lingue disponibili
 */
async function loadCommonTranslations() {
  for (const lang of availableLanguages) {
    await loadNamespaceTranslations(lang.code, 'common');
  }
  translationsLoaded.value = true;
}

export function useI18n(namespace: string = 'common') {
  // Gestiamo il route in modo sicuro, potrebbe non essere disponibile immediatamente
  // soprattutto durante la fase SSR o prima del mount completo dell'applicazione
  let route: any = null;
  try {
    route = useRoute();
  } catch (e) {
    // Se useRoute fallisce, useremo il namespace di default
    console.warn('[useI18n] useRoute failed, using default namespace');
  }

  // Determina il namespace basato sul percorso della pagina corrente se non specificato
  const pageNamespace = computed(() => {
    if (namespace !== 'common') return namespace;
    
    // Se la route non è disponibile, ritorna 'home' come fallback
    if (!route) return 'home';
    
    try {
      // Estrai il nome della pagina dal percorso
      const path = route.path;
      if (!path) return 'home';
      
      const segments = path.split('/').filter(Boolean);
      
      if (segments.length === 0) return 'home';
      
      // Prendi l'ultimo segmento del percorso come namespace
      return segments[segments.length - 1] || 'home';
    } catch (e) {
      console.error('[useI18n] Error determining namespace:', e);
      return 'home';
    }
  });
  
  // Carica le traduzioni quando si monta il componente
  if (process.client) {
    onMounted(async () => {
      // Carica sempre le traduzioni comuni
      await loadCommonTranslations();
      
      // Carica le traduzioni specifiche della pagina
      if (pageNamespace.value !== 'common') {
        await loadNamespaceTranslations(currentLanguage.value, pageNamespace.value);
      }
    });
    
    // Osserva i cambiamenti del namespace e carica le traduzioni necessarie
    watch(pageNamespace, async (newNamespace) => {
      if (newNamespace !== 'common' && !loadedNamespaces.value.has(newNamespace)) {
        await loadNamespaceTranslations(currentLanguage.value, newNamespace);
      }
    });
  }

  // Cambia lingua e salva la preferenza
  const setLanguage = async (lang: string) => {
    if (!availableLanguages.some(l => l.code === lang)) {
      console.warn(`Language ${lang} is not supported, using Italian`);
      lang = 'it';
    }
    
    currentLanguage.value = lang;
    
    if (process.client) {
      localStorage.setItem('user_language', lang);
      
      // Aggiorna l'attributo lang dell'HTML
      document.documentElement.setAttribute('lang', lang);
      
      // Carica le traduzioni per il namespace corrente nella nuova lingua
      await loadNamespaceTranslations(lang, pageNamespace.value);
    }
  };

  // Osserva i cambiamenti della lingua
  if (process.client) {
    watch(currentLanguage, async (newLang) => {
      document.documentElement.setAttribute('lang', newLang);
      
      // Carica le traduzioni per il namespace corrente nella nuova lingua
      await loadNamespaceTranslations(newLang, pageNamespace.value);
    });
  }

  // Funzione di traduzione con supporto per namespace
  const t = (key: string, params?: Record<string, any>) => {
    if (!translationsLoaded.value) {
      return key; // Se le traduzioni non sono ancora caricate, ritorna la chiave
    }
    
    // Determina il namespace della chiave
    let ns = 'common';
    let actualKey = key;
    
    if (key.includes(':')) {
      const parts = key.split(':');
      ns = parts[0];
      actualKey = parts[1];
    } else {
      // Se non è specificato un namespace, usa quello della pagina
      ns = pageNamespace.value;
      
      // Se le traduzioni per il namespace della pagina non sono state ancora caricate
      // o se la chiave non esiste nel namespace della pagina, usa common
      if (!translations.value[currentLanguage.value]?.[ns]?.[actualKey]) {
        ns = 'common';
      }
    }
    
    // Recupera la traduzione
    const langTranslations = translations.value[currentLanguage.value] || {};
    const nsTranslations = langTranslations[ns] || {};
    let text = nsTranslations[actualKey] || actualKey;
    
    // Se la traduzione non è trovata nel namespace specifico, cerca in common
    if (text === actualKey && ns !== 'common' && langTranslations['common']) {
      text = langTranslations['common'][actualKey] || actualKey;
    }
    
    // Sostituisci i parametri se forniti
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), value);
      });
    }
    
    return text;
  };

  // Carica un namespace specifico on-demand
  const loadNamespace = async (ns: string) => {
    await loadNamespaceTranslations(currentLanguage.value, ns);
  };

  return {
    currentLanguage: computed(() => currentLanguage.value),
    availableLanguages,
    setLanguage,
    t,
    loadNamespace,
    pageNamespace,
    isLoaded: computed(() => translationsLoaded.value && loadedNamespaces.value.has(pageNamespace.value))
  };
}

// Version: 2.1.0