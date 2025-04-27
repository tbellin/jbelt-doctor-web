<script setup lang="ts">
import { useI18n } from '~/composables/useI18n';
// Configurazione della pagina
definePageMeta({
  layout: 'maundy',
  middleware: ['auth', 'i18n']
});</script>

<template>
  <div>
    <MaundyAbout />
  </div>
</template>

<style scoped></style>
