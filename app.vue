<!-- app.vue -->
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
import { useAccessibility } from '~/composables/useAccessibility'
import { usePerformanceValidator } from '~/composables/usePerformanceValidator'
import { onMounted, onUnmounted } from 'vue'
import ToastNotifications from '~/components/Common/ToastNotifications.vue'
import LoadingOverlay from '~/components/Common/LoadingOverlay.vue'

// Composables
const { checkAuth } = useAuth()
const { cleanupStaleOperations } = useLoadingState()
const { announce } = useAccessibility({
  enableFocusManagement: true,
  enableKeyboardNavigation: true,
  enableScreenReaderSupport: true,
  announcePageChanges: true,
  respectMotionPreference: true
})
const { startMonitoring, stopMonitoring } = usePerformanceValidator()

// Cleanup interval for stale operations
let cleanupInterval: NodeJS.Timeout | null = null

// Controllo autenticazione e setup globali all'avvio dell'applicazione
onMounted(async () => {
  console.log('[App] Application mounted, initializing...')
  
  try {
    await checkAuth()
    console.log('[App] Authentication check completed')
    
    // Announce app ready for accessibility
    announce('Application loaded successfully', { priority: 'polite' })
  } catch (error) {
    console.error('[App] Authentication check failed:', error)
    announce('Application failed to load', { priority: 'assertive' })
  }

  // Setup cleanup interval for stale loading operations
  cleanupInterval = setInterval(() => {
    const cleaned = cleanupStaleOperations(30000) // Clean operations older than 30s
    if (cleaned > 0) {
      console.log(`[App] Cleaned up ${cleaned} stale loading operations`)
    }
  }, 60000) // Check every minute

  // Start performance monitoring in development/debug mode
  const debugMode = process.env.NODE_ENV === 'development'
  if (debugMode) {
    startMonitoring()
    console.log('[App] Performance monitoring started')
  }

  console.log('[App] Global systems initialized')
})

// Cleanup on unmount
onUnmounted(() => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }
  
  // Stop performance monitoring
  stopMonitoring()
  
  console.log('[App] Application cleanup completed')
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Accessibility enhancements */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 9999;
  border-radius: 0 0 4px 4px;
}

.skip-link:focus {
  top: 0;
}

/* Keyboard navigation */
.keyboard-navigation *:focus {
  outline: 2px solid #0d6efd !important;
  outline-offset: 2px !important;
}

/* Reduced motion */
.reduced-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* High contrast mode */
.high-contrast {
  filter: contrast(2);
}

.high-contrast .btn {
  border-width: 2px !important;
}

.high-contrast .card {
  border-width: 2px !important;
}

/* Focus indicators */
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

/* Improved color contrast for accessibility */
.text-muted {
  color: #495057 !important; /* Darker than Bootstrap default for better contrast */
}
</style>

<!-- Version: 1.0.1 -->