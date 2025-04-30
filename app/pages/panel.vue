<!-- app/pages/drawings.vue -->
<template>
    <div>
      <div class="row">
        <div class="col-12 mb-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h1 class="mb-3">{{ t('drawings') }}</h1>
              <p class="lead">{{ t('drawings_intro') }}</p>
              
              <!-- Debug Panel - visibile solo con NUXT_DEBUG=true -->
              <div v-if="isDebugMode" class="alert alert-warning mt-3">
                <h5 class="mb-2">🔍 Debug Info</h5>
                <div class="debug-container p-2 bg-light rounded">
                  <p class="mb-1"><strong>Layout:</strong> dashboard</p>
                  <p class="mb-1"><strong>Stato Autenticazione:</strong> {{ isAuthenticated ? 'Autenticato' : 'Non Autenticato' }}</p>
                  <p class="mb-0"><strong>Lingua corrente:</strong> {{ currentLanguage }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Esempio di dashboard per disegni -->
      <div class="row">
        <div class="col-md-6 col-lg-3 mb-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <div class="mb-3">
                <i class="bi bi-file-earmark-plus text-primary" style="font-size: 2.5rem;"></i>
              </div>
              <h5 class="card-title">{{ t('new_drawing') }}</h5>
              <p class="card-text">{{ t('create_new_drawing') }}</p>
              <button class="btn btn-primary">
                <i class="bi bi-plus-circle me-2"></i> {{ t('create') }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Elenco dei disegni di esempio -->
        <div 
          v-for="(drawing, index) in exampleDrawings" 
          :key="index"
          class="col-md-6 col-lg-3 mb-4"
        >
          <div class="card h-100">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
              <span class="fw-bold">{{ drawing.name }}</span>
              <span class="badge rounded-pill" :class="getStatusClass(drawing.status)">
                {{ drawing.status }}
              </span>
            </div>
            <div class="card-body">
              <p class="card-text small">
                {{ drawing.description }}
              </p>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <small class="text-muted">{{ t('last_modified') }}: {{ formatDate(drawing.lastModified) }}</small>
                <div class="btn-group btn-group-sm">
                  <button type="button" class="btn btn-outline-secondary" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button type="button" class="btn btn-outline-primary" title="View">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button type="button" class="btn btn-outline-danger" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="card-footer bg-white text-muted small">
              <i class="bi bi-person me-1"></i> {{ drawing.author }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useAuth } from '~/composables/useAuth';
  import { useI18n } from '~/composables/useI18n';
  
  // Configurazione della pagina
  definePageMeta({
    layout: 'dashboard',
    middleware: ['i18n']
  });
  
  // Composables
  const { isAuthenticated } = useAuth();
  const { t, currentLanguage } = useI18n();
  
  // Controllo modalità debug
  const isDebugMode = ref(process.env.NUXT_DEBUG === 'true');
  
  // Dati di esempio per i disegni
  const exampleDrawings = ref([
    {
      id: 1,
      name: "Main Assembly",
      description: "Complete assembly of the main product with all components.",
      status: "Active",
      lastModified: new Date(2025, 2, 12),
      author: "John Engineer"
    },
    {
      id: 2,
      name: "Component XYZ-123",
      description: "Subcomponent for the power subsystem with interfaces.",
      status: "Draft",
      lastModified: new Date(2025, 2, 10),
      author: "Alice Designer"
    },
    {
      id: 3,
      name: "Electrical Schema",
      description: "Circuit diagram for power distribution board.",
      status: "Review",
      lastModified: new Date(2025, 2, 8),
      author: "Bob Electrical"
    }
  ]);
  
  // Funzioni di utilità
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(document.documentElement.lang || 'it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-success text-white';
      case 'draft':
        return 'bg-warning text-dark';
      case 'review':
        return 'bg-info text-dark';
      default:
        return 'bg-secondary text-white';
    }
  };
  
  // Inizializzazione
  onMounted(() => {
    if (isDebugMode.value) {
      console.log('[DrawingsPage] Page mounted with layout: dashboard');
    }
  });
  </script>
  
  <style scoped>
  .debug-container {
    font-family: monospace;
    font-size: 0.85rem;
  }
  
  .card {
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
  }
  </style>
  
  <!-- Version: 1.0.0 -->