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
        lang: 'it'
      }
    },
    rootId: 'app',
    buildAssetsDir: '/assets/'
  },

  // Configurazione degli asset statici
  vite: {
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg', '**/*.gif', '**/*.xlsx', '**/*.properties'],
    logLevel: process.env.NUXT_DEBUG === 'true' ? 'info' : 'warn'
  },

  // Configurazione per servire file statici
  nitro: {
    publicAssets: [
      {
        baseURL: '/',
        dir: 'public',
        maxAge: 60 * 60 * 24 * 7
      }
    ],
    storage: {
      'assets:server': {
        driver: 'fs',
        readOnly: true,
        base: './public'
      }
    }
  },

  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    '@/assets/css/main.css',
    '@/assets/css/sidebar.css',
    '@/assets/css/dashboard.css'
  ],

  modules: ['@pinia/nuxt', 'nuxt-bootstrap-icons'],

  plugins: [
    '@/plugins/debug.ts',
    '@/plugins/axios.ts',
    '@/plugins/bootstrap.client.ts',
    '@/plugins/i18n.client.ts'
  ],

  // MANTIENE LA PORTA 8080 PER I SERVIZI BACKEND ESISTENTI
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080',
      apiHost: process.env.NUXT_PUBLIC_API_HOST || 'localhost',
      apiPort: process.env.NUXT_PUBLIC_API_PORT || '8080',
      frontendHost: process.env.NUXT_PUBLIC_FRONTEND_HOST || 'localhost',
      frontendPort: process.env.NUXT_PUBLIC_FRONTEND_PORT || '3000',
      debug: process.env.NUXT_DEBUG || 'false',
      templatePath: '/templates/template-01.xlsx',
      htmlPath: '/Maundy/index.html'
    }
  },

  debug: process.env.NUXT_DEBUG === 'true',

  build: {
    transpile: ['@popperjs/core'],
  },

  logLevel: process.env.NUXT_DEBUG === 'true' ? 'verbose' : 'info'
})

// Version: 1.4.0