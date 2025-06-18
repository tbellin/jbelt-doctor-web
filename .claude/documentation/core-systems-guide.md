# Guida ai Sistemi Core Ottimizzati

**Data**: 2025-06-18  
**Versione**: 2.0.0  
**Stato**: Implementato e Testato

---

## 📋 Overview

Durante la **Fase 2** dell'ottimizzazione è stato implementato un sistema completo di gestione degli errori, stati di caricamento e caching API per migliorare significativamente l'esperienza utente e le performance dell'applicazione.

## 🎯 Sistemi Implementati

### 1. Error Handling Globale (`useErrorHandler`)

**File**: `app/composables/useErrorHandler.ts`

#### Funzionalità Principali:
- **Gestione errori centralizzata** con tipi standardizzati
- **Toast notifications** automatiche con azioni
- **Error logging** strutturato per debugging
- **Retry automatico** per errori recuperabili
- **Localizzazione** dei messaggi di errore
- **Context-aware** error handling

#### Come Utilizzare:

```typescript
// Importa il composable
import { useErrorHandler } from '~/composables/useErrorHandler'

const { 
  handleError, 
  handleApiError, 
  showSuccessToast,
  showInfoToast 
} = useErrorHandler()

// Gestione errore generico
try {
  await someOperation()
} catch (error) {
  handleError(error, 'operation-context', {
    showToast: true,
    onRetry: async () => {
      await someOperation()
    }
  })
}

// Gestione errore API
try {
  const response = await api.getData()
} catch (error) {
  handleApiError(error, '/api/data', {
    showToast: true,
    onRetry: () => api.getData()
  })
}

// Success feedback
showSuccessToast('Operation completed successfully')
```

### 2. Loading States Globali (`useLoadingState`)

**File**: `app/composables/useLoadingState.ts`

#### Funzionalità Principali:
- **Loading operations tracking** con ID univoci
- **Progress tracking** per operazioni lunghe
- **Cancellazione operazioni** supportata
- **Multiple operations** gestite simultaneamente
- **Performance monitoring** delle operazioni
- **Auto-cleanup** operazioni stagnanti

#### Come Utilizzare:

```typescript
import { useLoadingState } from '~/composables/useLoadingState'

const { 
  withLoading, 
  withApiLoading, 
  withProgressLoading,
  startLoading, 
  stopLoading 
} = useLoadingState()

// Operazione semplice con loading
const result = await withLoading(
  () => someAsyncOperation(),
  {
    label: 'Loading data...',
    context: 'data-fetch',
    showGlobalIndicator: true
  }
)

// API call con loading automatico
const data = await withApiLoading(
  () => api.fetchUsers(),
  {
    endpoint: '/api/users',
    label: 'Loading users...'
  }
)

// Operazione con progress tracking
const result = await withProgressLoading(
  async (updateProgress) => {
    updateProgress(25)
    await step1()
    updateProgress(50)
    await step2()
    updateProgress(75)
    await step3()
    updateProgress(100)
    return finalResult()
  },
  { label: 'Processing data...' }
)
```

### 3. API Client Ottimizzato (`useApiOptimized`)

**File**: `app/composables/useApiOptimized.ts`

#### Funzionalità Principali:
- **Response caching** con TTL configurabile
- **Request deduplication** per GET requests
- **Retry automatico** con exponential backoff
- **Error handling integrato** con toast notifications
- **Loading states automatici** per tutte le operazioni
- **Performance metrics** e monitoring
- **Success feedback** automatico per mutations

#### Come Utilizzare:

```typescript
import { useApiOptimized } from '~/composables/useApiOptimized'

const api = useApiOptimized()

// Operazioni CRUD semplificate
const users = await api.users.getAll() // Con cache automatico
const user = await api.users.create(userData) // Con success toast
const updated = await api.users.update(id, changes) // Con loading

// Configurazione cache custom
const data = await api.get('/api/data', {
  cache: 10 * 60 * 1000, // 10 minuti
  retries: 5,
  showLoading: true
})

// Operazioni con success feedback
const result = await api.withSuccessToast(
  () => api.post('/api/action', data),
  'Action completed successfully!'
)

// Metrics e cache management
console.log(api.metrics.value) // Performance statistics
api.clearCache('/api/users') // Clear specific cache
```

## 🎨 Componenti UI Globali

### 1. Toast Notifications (`ToastNotifications.vue`)

**File**: `app/components/Common/ToastNotifications.vue`

#### Caratteristiche:
- **4 tipi** di notifiche: error, warning, info, success
- **Azioni personalizzabili** su ogni toast
- **Auto-dismiss** configurabile
- **Stacking intelligente** delle notifiche
- **Responsive design** per mobile
- **Debug mode** con dettagli tecnici

#### Integrazione:
```vue
<!-- Automaticamente incluso in app.vue -->
<ToastNotifications />
```

### 2. Loading Overlay (`LoadingOverlay.vue`)

**File**: `app/components/Common/LoadingOverlay.vue`

#### Caratteristiche:
- **Progress bar** per operazioni trackabili
- **Multiple operations** display
- **Cancellation support** per operazioni cancellabili
- **Time estimation** e elapsed time
- **Responsive design** ottimizzato
- **Debug information** in modalità debug

#### Integrazione:
```vue
<!-- Automaticamente incluso in app.vue -->
<LoadingOverlay />
```

## 🔧 Configurazione e Setup

### 1. Integrazione App-wide

Il sistema è già integrato in `app.vue`:

```vue
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    
    <!-- Global Components -->
    <ToastNotifications />
    <LoadingOverlay />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useLoadingState } from '~/composables/useLoadingState'
// ... sistema di cleanup automatico
</script>
```

### 2. Configurazione Traduzioni

Le traduzioni sono state estese in `app/i18n/`:

```json
// EN/IT common.json
{
  "notifications": {
    "error": "Error",
    "warning": "Warning", 
    "info": "Information",
    "success": "Success"
  },
  "errors": {
    "general": "An unexpected error occurred",
    "api": { "general": "Server communication error" },
    "validation": { "general": "Please check your input" }
  }
}
```

## 📊 Migrazione dei Componenti Esistenti

### Passo 1: Sostituire useApi con useApiOptimized

```typescript
// Prima
import { useApi } from '~/composables/useApi'
const { models } = useApi()

// Dopo  
import { useApiOptimized } from '~/composables/useApiOptimized'
const api = useApiOptimized()
const { models } = api
```

### Passo 2: Rimuovere Loading States Manuali

```typescript
// Prima
const loading = ref(false)
loading.value = true
try {
  await api.call()
} finally {
  loading.value = false
}

// Dopo
await api.models.getAll() // Loading automatico
```

### Passo 3: Sostituire Error Handling Manuale

```typescript
// Prima
try {
  await operation()
} catch (error) {
  console.error(error)
  alert('Error occurred')
}

// Dopo
const { handleError } = useErrorHandler()
try {
  await operation()
} catch (error) {
  handleError(error, 'operation-context')
}
```

## 🚀 Benefici dell'Implementazione

### Performance
- **Cache automatico** riduce chiamate API ridondanti
- **Request deduplication** evita chiamate duplicate
- **Retry intelligente** migliora success rate
- **Loading optimization** riduce perceived latency

### User Experience
- **Error feedback** consistente e professionale
- **Loading indicators** informativi e cancellabili
- **Success confirmations** immediate
- **Progress tracking** per operazioni lunghe

### Developer Experience
- **API semplificata** con meno boilerplate
- **Error handling automatico** riduce codice duplicato
- **Debug information** completa in development
- **Type safety** completa con TypeScript

### Maintainability
- **Centralizzazione** di error handling e loading
- **Consistenza** cross-application
- **Configurabilità** per casi specifici
- **Monitoraggio** performance automatico

## 🔍 Debug e Monitoring

### Debug Mode
Attivato con `NUXT_DEBUG=true`:

```bash
# .env
NUXT_DEBUG=true
```

**Fornisce**:
- Console logging dettagliato
- Technical details nei toast
- API call tracking
- Performance metrics
- Cache statistics

### Performance Monitoring

```typescript
const api = useApiOptimized()

// Metrics disponibili
console.log(api.metrics.value)
// {
//   totalRequests: 45,
//   successfulRequests: 42,
//   failedRequests: 3,
//   cacheHits: 12,
//   averageResponseTime: 245
// }

// Cache statistics
console.log(api.cacheManager.stats.value)
// {
//   totalEntries: 8,
//   cacheHits: 12,
//   hitRate: "26.7"
// }
```

## 📈 Prossimi Passi

### Immediate (Fase 2 Completion)
1. **Testing sui componenti esistenti** (Models, Sheets, Admin)
2. **Performance validation** con Lighthouse
3. **Cross-browser testing** delle nuove funzionalità

### Short-term (Fase 3)
1. **Migration guide** per tutti i componenti
2. **Component optimization** con i nuovi sistemi
3. **Mobile experience** refinement

### Long-term (Future)
1. **Real-time updates** integration
2. **Offline support** con service worker
3. **Advanced analytics** e error reporting

---

**Implementato da**: Claude Code - Fase 2 Ottimizzazione  
**Review Status**: Ready for Integration Testing  
**Migration Effort**: Low (backward compatible)