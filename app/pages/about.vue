<!-- app/pages/about.vue -->
<template>
  <div>
    <div class="card">
      <div class="card-body">
        <h1 class="mb-4">{{ t('title') }}</h1>
        
        <p>
          {{ t('home:title') }}
        </p>
        
        <h3 class="mt-4 mb-3">{{ t('features') }}</h3>
        <div class="row">
          <div class="col-md-6 mb-3">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">{{ t('feature_auth') }}</h5>
                <p class="card-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
                </p>
              </div>
            </div>
          </div>
          
          <div class="col-md-6 mb-3">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">{{ t('feature_i18n') }}</h5>
                <p class="card-text">
                  Vestibulum commodo. Ut rhoncus gravida arcu.
                </p>
              </div>
            </div>
          </div>
          
          <div class="col-md-6 mb-3">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">{{ t('feature_admin') }}</h5>
                <p class="card-text">
                  Nunc dignissim risus id metus. Cras ornare tristique elit.
                </p>
              </div>
            </div>
          </div>
          
          <div class="col-md-6 mb-3">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">{{ t('feature_bootstrap') }}</h5>
                <p class="card-text">
                  Praesent dapibus, neque id cursus faucibus, tortor neque.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <NuxtLink to="/" class="btn btn-primary">
            {{ t('home') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from '~/composables/useI18n';

const { t, loadNamespace } = useI18n();
// Carica il namespace "home" all'avvio del componente
onMounted(async () => {
  await loadNamespace('home');
});

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'i18n']
});

</script>

<!-- Version: 1.0.1 -->