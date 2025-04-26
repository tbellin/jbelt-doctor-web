// plugins/debug.ts
export default defineNuxtPlugin((nuxtApp) => {
    const isDebugMode = process.env.NUXT_DEBUG === 'true';
    const runtimeConfig = useRuntimeConfig();
    
    if (isDebugMode) {
      console.log('🔍 DEBUG MODE ENABLED');
      console.log('📌 Runtime Config:', {
        public: runtimeConfig.public,
        env: {
          NUXT_DEBUG: process.env.NUXT_DEBUG,
          NODE_ENV: process.env.NODE_ENV
        }
      });
      
      // Aggiungi un oggetto globale di debug (solo in modalità sviluppo)
      if (process.env.NODE_ENV === 'development') {
        console.log('🛠️ Development tools available');
        
        // Traccia gli eventi di navigazione
        nuxtApp.hook('page:start', () => {
          console.log('🧭 Navigation started');
        });
        
        nuxtApp.hook('page:finish', () => {
          console.log('✅ Navigation completed');
        });
        
        // Traccia errori
        nuxtApp.hook('vue:error', (error) => {
          console.error('❌ Vue Error:', error);
        });
        
        // Traccia lo stato di Pinia
        const stores = nuxtApp.$pinia?._s;
        if (stores) {
          console.log('📊 Registered stores:', Array.from(stores.keys()));
        }
      }
    }
    
    // Fornisci funzioni di debug ai componenti
    return {
      provide: {
        debug: {
          isEnabled: isDebugMode,
          log: (...args: any[]) => {
            if (isDebugMode) {
              console.log('🔍', ...args);
            }
          },
          time: (label: string) => {
            if (isDebugMode) {
              console.time(`⏱️ ${label}`);
            }
          },
          timeEnd: (label: string) => {
            if (isDebugMode) {
              console.timeEnd(`⏱️ ${label}`);
            }
          }
        }
      }
    };
  });