nuxt-app/
├── app.config.ts
├── app.vue
├── assets/
│   └── css/
│       └── main.css
├── components/
│   ├── Auth/
│   │   └── LoginForm.vue
│   └── Layout/
│       ├── Footer.vue
│       ├── Header.vue
│       └── LanguageSwitcher.vue
├── composables/
│   ├── useAuth.ts
│   ├── useI18n.ts
│   └── useUsers.ts
├── layouts/
│   ├── auth.vue
│   └── default.vue
├── middleware/
│   ├── admin.ts
│   ├── auth.ts
│   └── i18n.ts
├── pages/
│   ├── about.vue
│   ├── auth/
│   │   └── login.vue
│   └── index.vue
├── plugins/
│   ├── axios.ts
│   └── bootstrap.client.ts
├── public/
│   └── locales/
│       ├── en.json
│       └── it.json
├── stores/
│   ├── auth.ts
│   └── users.ts
├── nuxt.config.ts
└── package.json