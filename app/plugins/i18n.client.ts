// app/plugins/i18n.client.ts
import { useI18n } from '~/composables/useI18n';

export default defineNuxtPlugin(async (nuxtApp) => {
  // Inizializza il sistema di traduzione all'avvio dell'app
  const { loadNamespace, currentLanguage } = useI18n();
  
  // Carica le traduzioni comuni
   await loadNamespace('common');
  
  // Carica sempre alcuni namespace essenziali oltre a "common"
  // const essentialNamespaces = ['common', 'home', 'profile'];
  // for (const namespace of essentialNamespaces) {
  //   await loadNamespace(namespace);
  // }

  // Determina il namespace iniziale basato sulla rotta corrente
  const initialRoute = nuxtApp.$router.currentRoute.value;
  const path = initialRoute.path;
  const segments = path.split('/').filter(Boolean);
  
  // Handle special documentation routes
  let initialNamespace = segments.length ? segments[segments.length - 1] : 'home';
  if (initialNamespace === 'documentation-workflow') {
    initialNamespace = 'workflow';
  } else if (initialNamespace === 'documentation-api') {
    initialNamespace = 'api';
  }
  
  // Carica il namespace della pagina iniziale
  if (initialNamespace !== 'common') {
    await loadNamespace(initialNamespace);
  }
  
  // Debug logging
  const isDebugMode = process.env.NUXT_DEBUG === 'true';
  if (isDebugMode) {
    console.log(`[i18n Plugin] Initialized with language: ${currentLanguage.value}`);
    console.log(`[i18n Plugin] Initial namespace: ${initialNamespace}`);
  }
  
  // Hook per caricare automaticamente i namespace quando cambia la rotta
  nuxtApp.hook('page:start', async (page) => {
    const path = page?.path || nuxtApp.$router.currentRoute.value.path;
    const segments = path.split('/').filter(Boolean);
    let pageNamespace = segments.length ? segments[segments.length - 1] : 'home';
    
    // Handle special documentation routes
    if (pageNamespace === 'documentation-workflow') {
      pageNamespace = 'workflow';
    } else if (pageNamespace === 'documentation-api') {
      pageNamespace = 'api';
    }
    
    if (isDebugMode) {
      console.log(`[i18n Plugin] Page changed, loading namespace: ${pageNamespace}`);
    }
    
    // Carica il namespace della nuova pagina
    if (pageNamespace !== 'common') {
      await loadNamespace(pageNamespace);
    }
  });
  
  // Esponi il sistema di traduzione globalmente
  nuxtApp.provide('i18n', useI18n());
});

// Version: 2.1.0 - Fixed namespace loading for documentation routes