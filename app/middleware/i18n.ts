// app/middleware/i18n.ts
import { useI18n } from '~/composables/useI18n';

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server-side
  if (process.server) return;
  
  const { currentLanguage, loadNamespace, setLanguage } = useI18n();
  
  // Carica il namespace comune, che è sempre necessario
  await loadNamespace('common');
  
  // Determina il namespace della pagina corrente
  let pageNamespace = 'home';
  
  if (to.path) {
    const segments = to.path.split('/').filter(Boolean);
    if (segments.length > 0) {
      pageNamespace = segments[segments.length - 1] || 'home';
    }
  }
  
  // Carica il namespace specifico della pagina
  if (pageNamespace !== 'common') {
    await loadNamespace(pageNamespace);
  }
  
  // Set HTML lang attribute for accessibility
  if (process.client) {
    document.documentElement.setAttribute('lang', currentLanguage.value);
  }
  
  // Check if the route has a lang parameter and it differs from current
  if (to.query.lang && to.query.lang !== currentLanguage.value) {
    const newLang = to.query.lang as string;
    console.log('[i18n middleware] Language change requested:', newLang);
    
    try {
      await setLanguage(newLang);
      console.log('[i18n middleware] Language changed successfully');
      
      // Only redirect if we're not already on the right path
      // Redirect to the same route without the lang query parameter
      if (Object.keys(to.query).length > 1) {
        const query = { ...to.query };
        delete query.lang;
        return navigateTo({
          path: to.path,
          query
        }, { replace: true }); // Use replace to avoid history issues
      } else {
        return navigateTo(to.path, { replace: true });
      }
    } catch (error) {
      console.error('[i18n middleware] Error changing language:', error);
      // Continue without redirecting on error
    }
  }
});

// Version: 2.1.0