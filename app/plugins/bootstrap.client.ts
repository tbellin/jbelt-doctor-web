// app/plugins/bootstrap.client.ts
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default defineNuxtPlugin((nuxtApp) => {
  
  // Debug mode check
  const isDebugMode = process.env.NUXT_DEBUG === 'true';
  
  nuxtApp.hook('app:mounted', () => {
    if (isDebugMode) {
      console.log('[Bootstrap Plugin] App mounted, ensuring Bootstrap JS is initialized');
    }
    
    // Rendere Bootstrap disponibile globalmente per l'accesso dai componenti
    if (typeof window !== 'undefined') {
      // @ts-ignore - Bootstrap sarà definito tramite l'import
      window.bootstrap = window.bootstrap || {};
      
      if (isDebugMode) {
        console.log('[Bootstrap Plugin] Bootstrap initialized and available globally');
      }
    }
  });
  
  return {
    provide: {
      bootstrap: {
        isLoaded: true,
        version: '5.3.0' // Versione attuale di Bootstrap
      }
    }
  };
});

// Version: 1.0.1