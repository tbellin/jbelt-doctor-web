<!-- app/components/Layout/Footer.vue -->
<template>
  <footer class="bg-primary text-light py-4 mt-auto">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <p class="mb-0">{{ t('app_name') }} &copy; {{ currentYear }}</p>
        </div>
        <div class="col-md-6 text-md-end">
          <p class="mb-0">{{ t('copyright') }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '~/composables/useI18n';

const { t } = useI18n();
const currentYear = computed(() => new Date().getFullYear());
</script>

<!-- Version: 1.0.1 -->