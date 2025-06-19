// nuxt.config.ts

// Helper functions per configurazione dinamica Mac/Ubuntu
function getApiBase(): string {
  if (process.env.NUXT_PUBLIC_API_BASE) {
    return process.env.NUXT_PUBLIC_API_BASE
  }
  
  // Determina ambiente basato su hostname o variabili
  const frontendHost = process.env.NUXT_PUBLIC_FRONTEND_HOST || 'localhost'
  
  if (frontendHost.includes('atlante.local')) {
    // Mac development: API tramite proxy nginx
    return 'http://atlante.local'
  } else if (frontendHost.includes('jbelt.org')) {
    // Ubuntu production: API tramite reverse proxy
    return 'https://jbelt.org'
  } else {
    // Default development
    return 'http://localhost:8080'
  }
}

function getDefaultApiHost(): string {
  const frontendHost = process.env.NUXT_PUBLIC_FRONTEND_HOST || 'localhost'
  
  if (frontendHost.includes('jbelt.org')) {
    return 'jbelt.org'
  } else if (frontendHost.includes('atlante.local')) {
    return 'atlante.local'
  }
  return 'localhost'
}

function getDefaultApiPort(): string {
  const frontendHost = process.env.NUXT_PUBLIC_FRONTEND_HOST || 'localhost'
  
  if (frontendHost.includes('jbelt.org')) {
    return '443'  // HTTPS
  } else if (frontendHost.includes('atlante.local')) {
    return '80'   // API tramite proxy nginx
  }
  return '8080'
}

function getDefaultFrontendHost(): string {
  if (process.env.NODE_ENV === 'production') {
    return 'jbelt.org'
  }
  return 'atlante.local'
}

function getDefaultFrontendPort(): string {
  return '80'
}

export default defineNuxtConfig({
  // Specifica della directory app come source
  srcDir: 'app/',
  
  // Configurazioni originali preservate
  devtools: { enabled: true },
  compatibilityDate: '2025-03-14',
  ssr: false, // SPA mode - originale

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
    preset: process.env.NODE_ENV === 'production' ? 'static' : undefined,
    prerender: process.env.NODE_ENV === 'production' ? {
      routes: ['/']
    } : undefined,
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
    '@/assets/css/dashboard.css',
    '@/assets/css/compact.css'
  ],

  modules: ['@pinia/nuxt', 'nuxt-bootstrap-icons'],

  plugins: [
    '@/plugins/debug.ts',
    '@/plugins/axios.ts',
    '@/plugins/bootstrap.client.ts',
    '@/plugins/i18n.client.ts'
  ],

  // Configurazione runtime dinamica per Mac/Ubuntu
  runtimeConfig: {
    public: {
      // API Base URL configuration
      apiBase: getApiBase(),
      apiHost: process.env.NUXT_PUBLIC_API_HOST || getDefaultApiHost(),
      apiPort: process.env.NUXT_PUBLIC_API_PORT || getDefaultApiPort(),
      
      // Frontend configuration
      frontendHost: process.env.NUXT_PUBLIC_FRONTEND_HOST || getDefaultFrontendHost(),
      frontendPort: process.env.NUXT_PUBLIC_FRONTEND_PORT || getDefaultFrontendPort(),
      
      // Debug and assets
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