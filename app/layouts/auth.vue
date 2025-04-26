<!-- app/layouts/auth.vue -->
<template>
  <div class="auth-layout">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow-lg border-0">
            <div class="card-header bg-primary text-white text-center py-3">
              <NuxtLink to="/" class="text-white text-decoration-none">
                <h2 class="mb-0">{{ t('app_name') }}</h2>
              </NuxtLink>
            </div>
            <div class="card-body p-4">
              <slot />
            </div>
            <div class="card-footer bg-light py-3 text-center">
              <div class="d-flex justify-content-center">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n';
import LanguageSwitcher from '~/components/Layout/LanguageSwitcher.vue';

const { t } = useI18n();
</script>

<style scoped>
.auth-layout {
  background-color: #f8f9fa;
  min-height: 100vh;
}
</style>

<!-- Version: 1.0.1 -->