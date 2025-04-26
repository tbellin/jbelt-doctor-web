<!-- app/components/Common/AppLogo.vue -->
<template>
    <div class="app-logo d-flex align-items-center">
      <!-- Logo image con fallback -->
      <img 
        :src="logoUrl" 
        alt="Ivy Logo" 
        class="logo-image" 
        @error="handleImageError" 
        :class="{'d-none': !imageLoaded}" 
      />
      <!-- Fallback testo quando l'immagine non carica -->
      <div class="logo-text" v-if="!imageLoaded">Jbelt</div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  // Stato per tenere traccia se l'immagine è caricata
  const imageLoaded = ref(true);
  
  // Percorso al logo
  const logoUrl = ref('public/assets/images/ivy-gear_64x64.png');
  //const logoUrl = ref('../../assets/images/ivy-gear_64x64.png');
  
  // Gestisce errori di caricamento dell'immagine
  const handleImageError = () => {
    console.warn('Logo image could not be loaded from path:', logoUrl.value);
    imageLoaded.value = false;
  };
  </script>
  
  <style scoped>
  .app-logo {
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .logo-image {
    height: 40px;
    width: auto;
    object-fit: contain;
  }
  
  .logo-text {
    font-weight: bold;
    font-size: 1.25rem;
    color: white;
    text-align: center;
  }
  </style>
  
  <!-- Version: 1.1.0 -->