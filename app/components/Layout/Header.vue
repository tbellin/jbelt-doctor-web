<!-- app/components/Layout/Header.vue -->
<template>
  <header>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <NuxtLink class="navbar-brand" to="/">Nuxt 4 Dashboard</NuxtLink>
        
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <NuxtLink 
                class="nav-link" 
                active-class="active" 
                to="/"
                exact
              >
                Home
              </NuxtLink>
            </li>
            
            <li class="nav-item">
              <NuxtLink 
                class="nav-link" 
                active-class="active" 
                to="/about"
              >
                Chi Siamo
              </NuxtLink>
            </li>
            
            <li class="nav-item">
              <NuxtLink 
                class="nav-link" 
                active-class="active" 
                to="/drawings"
              >
                Drawings
              </NuxtLink>
            </li>
            
            <li v-if="isAdmin" class="nav-item">
              <NuxtLink 
                class="nav-link" 
                active-class="active" 
                to="/admin/users/listUsers"
              >
                Gestione Utenti
              </NuxtLink>
            </li>
          </ul>
          
          <div class="d-flex align-items-center">
            <!-- Language Switcher -->
            <LanguageSwitcher class="me-3" />
            
            <!-- Debug Badge - visibile solo in modalità debug -->
            <span v-if="isDebugMode" class="badge bg-warning text-dark me-2">DEBUG</span>
            
            <AuthMenu />
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import LanguageSwitcher from '~/components/Layout/LanguageSwitcher.vue';
import AuthMenu from '~/components/Layout/AuthMenu.vue';
import { useAuth } from '~/composables/useAuth';

// Controllo modalità debug
const isDebugMode = ref(process.env.NUXT_DEBUG === 'true');
const { isAuthenticated, isAdmin, user } = useAuth();

// Verifica autenticazione quando il componente viene montato
onMounted(() => {
  if (isDebugMode.value) {
    console.log('[Header] Component mounted with auth state:', {
      isAuthenticated: isAuthenticated.value,
      user: user.value?.login
    });
  }
  
  // Assicuriamoci che i dropdown di Bootstrap vengano inizializzati correttamente
  setTimeout(() => {
    if (typeof window !== 'undefined' && window.bootstrap) {
      const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
      dropdownElementList.forEach(dropdownToggleEl => {
        new window.bootstrap.Dropdown(dropdownToggleEl);
      });
      
      if (isDebugMode.value) {
        console.log('[Header] Bootstrap dropdowns initialized');
      }
    } else {
      console.warn('[Header] Bootstrap not available');
    }
  }, 100);
});
</script>

<style scoped>
.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

/* Assicuriamoci che i dropdown funzionino correttamente anche con Vue */
.dropdown-menu {
  margin-top: 0.125rem;
}

.dropdown-toggle::after {
  margin-left: 0.5em;
}
</style>

<!-- Version: 1.0.2 -->
