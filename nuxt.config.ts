// nuxt.config.ts
export default defineNuxtConfig({
  // Specifica della directory app come source
  srcDir: 'app/',
  
  // Configurazioni originali preservate
  devtools: { enabled: true },
  compatibilityDate: '2025-03-14',
  ssr: false,

  app: {
    head: {
      title: 'Nuxt 4 Admin Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Nuxt 4 Admin Dashboard' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      htmlAttrs: {
        lang: 'it' // Default language
      }
    },
    // Configurazione per la struttura con directory app
    rootId: 'app',
    buildAssetsDir: '/assets/'
  },

  // Configurazione degli asset statici
  vite: {
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg', '**/*.gif'],
    logLevel: process.env.NUXT_DEBUG === 'true' ? 'info' : 'warn'
  },

  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    '@/assets/css/main.css',  // Percorso aggiornato per la struttura app/
    '@/assets/css/sidebar.css',
    '@/assets/css/dashboard.css' // Stili specifici per il layout dashboard
  ],

  modules: ['@pinia/nuxt', 'nuxt-bootstrap-icons'],

  plugins: [
    // Percorsi aggiornati relativi alla directory app/
    '@/plugins/debug.ts',
    '@/plugins/axios.ts',
    '@/plugins/bootstrap.client.ts',
    '@/plugins/i18n.client.ts' // Aggiunto nuovo plugin per i18n
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://jbelt:8080',
      apiHost: process.env.NUXT_PUBLIC_API_HOST || 'jbelt.org',
      apiPort: process.env.NUXT_PUBLIC_API_PORT || '8080',
      frontendHost: process.env.NUXT_PUBLIC_FRONTEND_HOST || 'localhost',
      frontendPort: process.env.NUXT_PUBLIC_FRONTEND_PORT || '3000',
      debug: process.env.NUXT_DEBUG || 'false'
    }
  },

  // Opzioni di debug avanzate
  debug: process.env.NUXT_DEBUG === 'true',

  build: {
    transpile: ['@popperjs/core'],
  },

  // Log dettagliati in modalità debug
  logLevel: process.env.NUXT_DEBUG === 'true' ? 'verbose' : 'info'
})

// Version: 1.2.0