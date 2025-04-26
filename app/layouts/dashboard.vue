<!-- app/layouts/dashboard.vue -->
<template>
    <div class="dashboard-layout">
      <!-- Header -->
      <DashboardHeader 
        :title="appTitle"
        @toggle-sidebar="toggleSidebar"
      />
      
      <!-- Container principale -->
      <div class="dashboard-container">
        <!-- Sidebar -->
        <DashboardSidebar 
          v-model="sidebarOpen"
          @toggle="handleSidebarToggle"
        />
        
        <!-- Area contenuto principale -->
        <div class="content-area" :class="{ 'sidebar-active': sidebarOpen }">
          <main class="app-main">
            <slot />
          </main>
          
          <!-- Footer -->
          <DashboardFooter 
            :serverInfo="serverInfo"
            :frontendInfo="frontendInfo"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, nextTick, onBeforeUnmount, computed } from 'vue';
  import DashboardHeader from '~/components/Dashboard/DashboardHeader.vue';
  import DashboardSidebar from '~/components/Dashboard/DashboardSidebar.vue';
  import DashboardFooter from '~/components/Dashboard/DashboardFooter.vue';
  
  // Proprietà dell'applicazione
  const appTitle = ref('Jbelt Dashboard');
  
  // Stato della sidebar
  const sidebarOpen = ref(true); // Predefinito aperto
  const isDebugMode = ref(process.env.NUXT_DEBUG === 'true');
  const isMobile = ref(false);
  
  // Informazioni per il footer
  const config = useRuntimeConfig();
  const serverInfo = computed(() => ({
    host: config?.public?.apiHost || 'localhost',
    port: config?.public?.apiPort || '8080'
  }));
  
  const frontendInfo = computed(() => ({
    host: window?.location?.hostname || 'localhost',
    port: window?.location?.port || '3000'
  }));
  
  // Funzione per attivare/disattivare la sidebar
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
    
    if (isDebugMode.value) {
      console.log('[DashboardLayout] Sidebar toggle:', sidebarOpen.value);
    }
    
    // Salva stato in localStorage
    if (process.client) {
      localStorage.setItem('dashboard_sidebar_state', sidebarOpen.value ? 'open' : 'closed');
    }
  };
  
  // Gestisce gli aggiornamenti dello stato della sidebar
  const handleSidebarToggle = (isOpen: boolean) => {
    sidebarOpen.value = isOpen;
    
    if (isDebugMode.value) {
      console.log('[DashboardLayout] Sidebar state updated:', isOpen);
    }
    
    // Salva stato in localStorage
    if (process.client) {
      localStorage.setItem('dashboard_sidebar_state', isOpen ? 'open' : 'closed');
    }
  };
  
  // Controllo se siamo su un dispositivo mobile
  const checkIfMobile = () => {
    if (process.client) {
      isMobile.value = window.innerWidth < 768;
      
      // Imposta lo stato iniziale della sidebar (aperta su desktop, chiusa su mobile)
      nextTick(() => {
        if (isMobile.value) {
          sidebarOpen.value = false;
        }
      });
    }
  };
  
  // Carica stato salvato dal localStorage
  const loadSavedState = () => {
    if (process.client) {
      const savedState = localStorage.getItem('dashboard_sidebar_state');
      if (savedState) {
        sidebarOpen.value = savedState === 'open';
      }
    }
  };
  
  // Impostazioni iniziali dopo il montaggio
  onMounted(() => {
    // Carica stato salvato
    loadSavedState();
    
    // Controlla dimensioni iniziali
    checkIfMobile();
    
    // Aggiunge listener per il resize
    if (process.client) {
      window.addEventListener('resize', checkIfMobile);
    }
    
    if (isDebugMode.value) {
      console.log('[DashboardLayout] Layout mounted with sidebar:', {
        isMobile: isMobile.value,
        sidebarOpen: sidebarOpen.value
      });
    }
  });
  
  // Pulizia event listener
  onBeforeUnmount(() => {
    if (process.client) {
      window.removeEventListener('resize', checkIfMobile);
    }
  });
  </script>
  
  <style>
  .dashboard-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
  }
  
  /* Container principale sotto l'header */
  .dashboard-container {
    display: flex;
    flex: 1;
    position: relative;
    min-height: calc(100vh - 60px); /* altezza viewport meno header */
    margin-top: 60px; /* Spazio per l'header fisso */
  }
  
  /* Area del contenuto che si adatta alla sidebar */
  .content-area {
    display: flex;
    flex-direction: column;
    flex: 1;
    transition: margin-left 0.3s;
    overflow-x: hidden;
    margin-left: 0;
    width: 100%;
  }
  
  .content-area.sidebar-active {
    margin-left: 250px; /* larghezza della sidebar */
    width: calc(100% - 250px);
  }
  
  /* Main content area */
  .app-main {
    flex: 1;
    padding: 1.5rem;
    background-color: #f5f7fa;
    min-height: calc(100vh - 120px); /* viewport - header - footer approssimato */
  }
  
  /* Media query per responsività */
  @media (max-width: 767.98px) {
    .content-area {
      margin-left: 0 !important;
      width: 100% !important;
    }
  }
  </style>
  
  <!-- Version: 1.0.0 -->