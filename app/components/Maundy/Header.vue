// components/Header.vue
<template>
  <header id="header" class="header d-flex align-items-center px-3 fixed-top"> <!-- fixed-top -->
    <div class="container-fluid d-flex align-items-center justify-content-between">
      <!--<NuxtLink to="/" class="logo d-flex align-items-center text-decoration-none">-->
        <h1 class="sitename">Maundy</h1>
      <!--</NuxtLink>-->
      <nav id="navmenu" class="navmenu">
        <ul>
          <li><NuxtLink to="#hero" class="active text-decoration-none">{{ $t('nav.home') }}</NuxtLink></li>
          <li><NuxtLink to="#about" class="text-decoration-none">{{ $t('nav.about') }}</NuxtLink></li>
          <li><NuxtLink to="#contact" class="text-decoration-none">{{ $t('nav.contact') }}</NuxtLink></li>
          <li><NuxtLink to="/" class="text-decoration-none">{{ $t('nav.dashboard') }}</NuxtLink></li>
          <LanguageSelector />
        </ul>
        <i class="mobile-nav-toggle d-xl-none bi bi-list"></i>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '~/composables/useI18n'
const { t } = useI18n()
//const localePath = useLocalePath()

// Optional: Add navigation active state handling
const route = useRoute()
const isActive = (path: string) => route.path === path
</script>

<style scoped>
.navmenu ul li a {
  text-decoration: none;
}
</style>
