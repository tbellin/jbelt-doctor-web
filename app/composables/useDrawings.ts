import type { Model } from '~/types/model'
import { useAuthStore } from '~/stores/auth'

export const useDrawings = () => {
  const drawings = ref<Model[]>([])
  const loading = ref(false)
  const error = ref(null)

  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  const fetchDrawings = async () => {
    loading.value = true
    error.value = null

    try {
      // 🔍 Log del token per debug
      console.log('[useDrawings] Token utilizzato:', authStore.getToken)

      const response = await $fetch(`${config.public.apiBase}/api/models?modelType.equals=DRAWING`, {
        method: 'GET',
        headers: {
          // 🔐 Authorization Header con log attivo
          Authorization: `Bearer ${authStore.getToken}`
        }
      })

      drawings.value = response || []
    } catch (err: any) {
      console.error('Errore durante il recupero dei disegni:', err)
      error.value = err?.response?.data?.message || 'Errore nel recupero dei disegni'
    } finally {
      loading.value = false
    }
  }

  return {
    drawings,
    loading,
    error,
    fetchDrawings
  }
}