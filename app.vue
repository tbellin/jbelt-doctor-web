<!-- app.vue -->
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { onMounted } from 'vue';

// Accesso al composable di autenticazione
const { checkAuth } = useAuth();

// Controllo autenticazione all'avvio dell'applicazione
onMounted(async () => {
  console.log('App mounted, checking authentication...');
  try {
    await checkAuth();
    console.log('Authentication check completed');
  } catch (error) {
    console.error('Authentication check failed:', error);
  }
});
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>

<!-- Version: 1.0.1 -->