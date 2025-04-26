## composables/useI18n.ts

```typescript
// composables/useI18n.ts
import { ref, computed } from 'vue';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Singleton pattern for language state across the application
const currentLanguage = ref(localStorage.getItem('user_language') || 'en');
const translations = ref<Translations>({});

// Load translations
async function loadTranslations() {
  try {
    const enResponse = await fetch('/locales/en.json');
    const itResponse = await fetch('/locales/it.json');
    
    const en = await enResponse.json();
    const it = await itResponse.json();
    
    translations.value = {
      en,
      it
    };
  } catch (error) {
    console.error('Failed to load translations', error);
  }
}

export function useI18n() {
  // Switch language and save preference
  const setLanguage = (lang: string) => {
    currentLanguage.value = lang;
    localStorage.setItem('user_language', lang);
    
    // Update HTML lang attribute for accessibility
    document.documentElement.setAttribute('lang', lang);
  };

  // Translate a key
  const t = (key: string) => {
    const langTranslations = translations.value[currentLanguage.value] || {};
    return langTranslations[key] || key;
  };

  // Available languages
  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'it', name: 'Italiano' }
  ];

  return {
    currentLanguage: computed(() => currentLanguage.value),
    availableLanguages,
    setLanguage,
    t,
    loadTranslations
  };
}
```

This composable provides internationalization functionality.
