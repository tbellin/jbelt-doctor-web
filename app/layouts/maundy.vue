// layouts/maundy.vue
<template>
  <div>
    <!--<MaundyHeader />-->
    <!--<NuxtPage />-->
    <slot />
    <MaundyFooter />
  </div>
</template>

<script setup>
import MaundyHeader from '~/components/Maundy/Header.vue'
//import MaundyFooter from '~/components/Maundy/Footer.vue'
import { useHead } from '@vueuse/head';

// Configurazione dei link e script per il <head>
useHead({
  title: 'Ivytech Web Site',
  link: [
    { rel: 'stylesheet', href: '/Maundy/assets/css/main.css' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
    { rel: 'stylesheet', href: '/Maundy/assets/vendor/bootstrap-icons/bootstrap-icons.css' },
  ],
  script: [
    { src: '/Maundy/assets/vendor/bootstrap/js/bootstrap.bundle.min.js', defer: true }
  ]
});
</script>