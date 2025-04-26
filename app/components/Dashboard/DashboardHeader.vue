<!-- app/components/Dashboard/DashboardHeader.vue -->
<template>
  <header class="dashboard-header">
    <div class="container-fluid">
      <div class="row align-items-center">
        <!-- Left side: Logo, Title, Sidebar Toggle, Main Menu -->
        <div class="col d-flex align-items-center">
          <!-- Sidebar Toggle -->
          <button class="btn btn-sm btn-outline-light sidebar-toggle me-3" @click="$emit('toggle-sidebar')"
            title="Toggle Sidebar">
            <i class="bi bi-list fs-5"></i>
          </button>

          <!-- Logo -->
          <div class="logo-container me-2">
              <!-- Logo image -->
              <NuxtLink to="/" class="text-decoration-none">
                <img :src="logoPath" alt="Jbelt Logo" class="resize" />
                <!--<AppLogo />-->
              </NuxtLink>
          </div>

          <!-- Title -->
          <h1 class="header-title me-2">{{ title }}</h1>

          <!-- Main Menu - Desktop (hide on mobile) -->
          <nav class="main-nav d-none d-md-flex">
            <ul class="nav">
              <li class="nav-item">
                <NuxtLink to="/" class="nav-link">
                  <BootstrapIcon name="house" class="me-1" />
                  {{ t('home') }}</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/about" class="nav-link">
                  <BootstrapIcon name="person-badge" class="me-1" />{{ t('about') }}</NuxtLink>
              </li>
              <li class="nav-item">
                <NuxtLink to="/drawings" class="nav-link">
                  <BootstrapIcon name="building-gear" class="me-1" />{{ t('drawings') }}</NuxtLink>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Right side: Language Selector, Auth Menu -->
        <div class="col-auto d-flex align-items-center">
          <LanguageSwitcher class="me-3" />
          <AuthMenu />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n';
import LanguageSwitcher from '~/components/Layout/LanguageSwitcher.vue';
import AuthMenu from '~/components/Layout/AuthMenu.vue';
import { computed } from 'vue';

const { t } = useI18n();

const props = defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  }
});

// Calcola il percorso corretto del logo
const logoPath = computed(() => {
  // Se siamo in ambiente client, usa il percorso completo
  if (process.client) {
    return '/assets/images/ivy-gear_64x64.png';
  }
  // In ambiente SSR (anche se questa app è SPA, per sicurezza)
  return '/assets/images/ivy-gear_64x64.png';
});

defineEmits(['toggle-sidebar']);
</script>

<style scoped>

.resize {
  max-width: 50%; /* Non supera la larghezza del contenitore */
  height: auto; /* Mantieni le proporzioni */
}

.logo-img {
  height: 50%;
  width: 50%;
  background-size: contain;
  filter: drop-shadow(0 0 0.05rem white);
  margin: 0 5px;
}

.dashboard-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--bs-primary);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 0 1rem;
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-logo {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  height: 40px;
  width: auto;
}

.main-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.main-nav .nav-link {
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.main-nav .nav-link:hover,
.main-nav .nav-link.active {
  color: #ffffff;
}

/* Mobile adjustments */
@media (max-width: 767.98px) {
  .header-title {
    font-size: 1rem;
    max-width: 120px;
  }
}
</style>

<!-- Version: 1.0.0 -->