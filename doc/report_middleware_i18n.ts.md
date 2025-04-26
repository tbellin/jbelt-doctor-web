## middleware/i18n.ts

```typescript
// middleware/i18n.ts
import { useI18n } from '~/composables/useI18n';

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server-side
  if (process.server) return;
  
  const { currentLanguage, loadTranslations } = useI18n();
  
  // Load translations if needed
  await loadTranslations();
  
  // Set HTML lang attribute
  document.documentElement.setAttribute('lang', currentLanguage.value);
});
```

This middleware handles internationalization for the application.
