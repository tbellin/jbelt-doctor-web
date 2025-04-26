## nuxt.config.ts

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
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
      ]
    }
  },
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    '@/assets/css/main.css'
  ],
  modules: [
    '@pinia/nuxt',
  ],
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8080/api'
    }
  },
  build: {
    transpile: ['@popperjs/core'],
  },
  routes: {
    middleware: ['i18n']
  }
})
```

This file configures the Nuxt.js application.
