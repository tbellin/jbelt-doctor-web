## app.vue

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

const { checkAuth } = useAuth();

// Check if user is authenticated
onMounted(async () => {
  await checkAuth();
});
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
```

This is the main component of the application. It includes the NuxtLayout and NuxtPage components.
