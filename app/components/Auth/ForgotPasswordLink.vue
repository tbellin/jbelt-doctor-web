<template>
    <div class="forgot-password-link text-center mt-3">
      <NuxtLink to="/account/reset/init">
        {{ t('forgot_password') }}
      </NuxtLink>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useI18n } from '~/composables/useI18n';
  
  const { t } = useI18n();
  </script>
  
  
  <!-- Version: 1.0.0 -->
