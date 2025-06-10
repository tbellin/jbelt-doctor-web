// app/middleware/translation-loader.ts
// Middleware per pre-caricare le traduzioni prima del rendering della pagina
// Risolve il problema del timing nel caricamento delle traduzioni

import { useI18n } from '~/composables/useI18n';

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip su server-side rendering
  if (process.server) return;
  
  const { loadNamespace, currentLanguage } = useI18n();
  
  // Debug logging
  const isDebugMode = process.env.NUXT_DEBUG === 'true';
  if (isDebugMode) {
    console.log('[TranslationLoader] Pre-loading translations for route:', to.path);
  }
  
  try {
    // Carica sempre il namespace comune
    await loadNamespace('common');
    
    // Determina i namespace necessari basandosi sulla route
    const namespaces = getRequiredNamespaces(to.path);
    
    // Carica tutti i namespace necessari in parallelo
    const loadPromises = namespaces.map(namespace => 
      loadNamespace(namespace).catch(error => {
        console.warn(`[TranslationLoader] Failed to load namespace '${namespace}':`, error);
        return null; // Non bloccare per namespace mancanti
      })
    );
    
    await Promise.all(loadPromises);
    
    if (isDebugMode) {
      console.log('[TranslationLoader] Successfully loaded namespaces:', namespaces);
    }
    
  } catch (error) {
    console.error('[TranslationLoader] Error loading translations:', error);
    // Non bloccare la navigazione anche in caso di errore
  }
});

/**
 * Determina i namespace di traduzione necessari basandosi sul path della route
 * @param path - Il path della route corrente
 * @returns Array di namespace da caricare
 */
function getRequiredNamespaces(path: string): string[] {
  const namespaces = ['common']; // Sempre necessario
  
  // Mappa delle route e i loro namespace specifici
  const routeNamespaceMap: Record<string, string[]> = {
    '/dashboard/models': ['models'],
    '/dashboard/models/': ['models'],
    '/drawings': ['drawings'],
    '/panel': ['panel'],
    '/about': ['about'],
    '/login': ['login'],
    '/auth/register': ['register'],
    '/auth/profile': ['profile'],
    '/admin/users': ['admin', 'users'],
    '/account/change-password': ['profile'],
    '/account/reset': ['profile']
  };
  
  // Cerca una corrispondenza esatta prima
  if (routeNamespaceMap[path]) {
    namespaces.push(...routeNamespaceMap[path]);
    return [...new Set(namespaces)]; // Rimuove duplicati
  }
  
  // Fallback: determina dal path segments
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length > 0) {
    // Per path come /dashboard/models, usa 'models'
    const lastSegment = segments[segments.length - 1];
    
    // Aggiungi il namespace dell'ultimo segmento
    if (lastSegment && lastSegment !== 'index') {
      namespaces.push(lastSegment);
    }
    
    // Per path multi-livello, aggiungi anche namespace intermedi se rilevanti
    if (segments.length > 1) {
      const relevantSegments = segments.filter(segment => 
        !['dashboard', 'admin', 'auth', 'account'].includes(segment)
      );
      
      relevantSegments.forEach(segment => {
        if (!namespaces.includes(segment)) {
          namespaces.push(segment);
        }
      });
    }
  }
  
  return [...new Set(namespaces)]; // Rimuove duplicati
}

// Version: 1.0.0