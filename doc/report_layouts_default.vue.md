## layouts/default.vue

```vue
<!-- layouts/default.vue -->
<template>
  <div class="layout-default">
    <Header />
    <main class="container py-4">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/Layout/Header.vue';
import Footer from '~/components/Layout/Footer.vue';
</script>

<style scoped>
.layout-default {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>
```

This is the default layout for the application.
