<!-- app/components/Dashboard/DashboardSidebar.vue -->
<template>
  <aside 
    class="dashboard-sidebar" 
    :class="{ 'active': modelValue }"
  >
  <!--
    <div class="sidebar-header">
      <div class="d-flex justify-content-between align-items-center p-3">
        <button 
          class="btn btn-sm btn-link text-secondary p-0 d-md-none" 
          @click="toggleSidebar"
          aria-label="Close sidebar"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  -->

    <div class="sidebar-content">
      <!-- Main Navigation -->
      <div class="sidebar-section">
        <div class="accordion" id="sidebarAccordion">
          <!-- Main Section (Always Open) -->
          <div class="accordion-item sidebar-accordion">
            <h2 class="accordion-header" id="headingMain">
              <div class="section-header">
                <i class="bi bi-buildings me-2"></i> {{ t('main') }}
              </div>
            </h2>
            <div class="section-content">
              <ul class="nav flex-column">
                <li class="nav-item">
                  <NuxtLink to="/" class="nav-link">
                    <i class="bi bi-building me-2"></i> {{ t('home') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/about" class="nav-link">
                    <i class="bi bi-info-circle me-2"></i> {{ t('about') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/auth/register" class="nav-link">
                    <i class="bi bi-person-plus me-2"></i> {{ t('register') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/account/reset/init" class="nav-link">
                    <i class="bi bi-key me-2"></i> {{ t('lost_password') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/documentation-workflow" class="nav-link">
                    <i class="bi bi-diagram-3 me-2"></i> {{ t('documentation_workflow') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/documentation-api" class="nav-link">
                    <i class="bi bi-code-slash me-2"></i> {{ t('documentation_api') }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>

          <!-- Application Section (For Authenticated Users Only)  -->
          <div class="accordion-item sidebar-accordion">
            <h2 class="accordion-header" id="headingApp">
              <div class="section-header">
                <i class="bi bi-grid me-2"></i> {{ t('application') }}
              </div>
            </h2>
            <div class="section-content">
              <ul class="nav flex-column">
                <li class="nav-item" v-if="isAuthenticated">
                  <NuxtLink to="/panel" class="nav-link">
                    <i class="bi bi-speedometer me-2"></i> {{ t('panel') }}
                  </NuxtLink>
                </li>               
                <li class="nav-item" v-if="isAuthenticated">
                  <NuxtLink to="/drawings" class="nav-link">
                    <i class="bi bi-pencil-square me-2"></i> {{ t('drawings') }}
                  </NuxtLink>
                </li>
                <li class="nav-item" v-if="isAuthenticated">
                  <NuxtLink to="/dashboard/models" class="nav-link">
                    <i class="bi bi-box-seam me-2"></i> {{ t('navigation.models') }}
                  </NuxtLink>
                </li>
                <li class="nav-item" v-if="isAuthenticated">
                  <NuxtLink to="/dashboard/sheets" class="nav-link">
                    <i class="bi bi-file-earmark-text me-2"></i> {{ t('navigation.sheets') }}
                  </NuxtLink>
                </li>
                <li class="nav-item" v-if="isAuthenticated">
                  <NuxtLink to="/dashboard/balloons" class="nav-link">
                    <i class="bi bi-geo-alt me-2"></i> {{ t('navigation.balloons') }}
                  </NuxtLink>
                </li>
                
              </ul>
            </div>
          </div>

          <!-- Entity Management Section (Admin Only) -->
          <div class="accordion-item sidebar-accordion" v-if="isAuthenticated && isAdmin">
            <h2 class="accordion-header" id="headingEntities">
              <div class="section-header">
                <i class="bi bi-collection me-2"></i> {{ t('navigation.entities.title') }}
              </div>
            </h2>
            <div class="section-content">
              <ul class="nav flex-column">
                <li class="nav-item">
                  <NuxtLink to="/admin/entities" class="nav-link">
                    <i class="bi bi-grid-3x3-gap me-2"></i> {{ t('navigation.entities.overview') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/admin/entities/archives" class="nav-link">
                    <i class="bi bi-archive me-2"></i> {{ t('navigation.entities.archives') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/admin/entities/formats" class="nav-link">
                    <i class="bi bi-grid-3x3 me-2"></i> {{ t('navigation.entities.formats') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/admin/entities/positions" class="nav-link">
                    <i class="bi bi-geo-alt me-2"></i> {{ t('navigation.entities.positions') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/admin/entities/markers" class="nav-link">
                    <i class="bi bi-bookmark me-2"></i> {{ t('navigation.entities.markers') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/admin/entities/model-versions" class="nav-link">
                    <i class="bi bi-clock-history me-2"></i> {{ t('navigation.entities.modelVersions') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/admin/entities/items" class="nav-link">
                    <i class="bi bi-collection me-2"></i> {{ t('navigation.entities.items') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/admin/entities/authors" class="nav-link">
                    <i class="bi bi-people me-2"></i> {{ t('navigation.entities.authors') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/admin/entities/teams" class="nav-link">
                    <i class="bi bi-diagram-3 me-2"></i> {{ t('navigation.entities.teams') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/admin/entities/models" class="nav-link">
                    <i class="bi bi-box-seam me-2"></i> {{ t('navigation.entities.models') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/admin/entities/sheets" class="nav-link">
                    <i class="bi bi-file-earmark-text me-2"></i> {{ t('navigation.entities.sheets') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/admin/entities/balloons" class="nav-link">
                    <i class="bi bi-geo-alt me-2"></i> {{ t('navigation.entities.balloons') }}
                  </NuxtLink>
                </li>
                <li class="nav-item">
                  <NuxtLink to="/admin/entities/trackers" class="nav-link">
                    <i class="bi bi-activity me-2"></i> {{ t('navigation.entities.trackers') }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>

          <!-- User Section (Always Open) -->
          <div class="accordion-item sidebar-accordion">
            <h2 class="accordion-header" id="headingUser">
              <div class="section-header">
                <i class="bi bi-person me-2"></i> {{ t('user') }}
              </div>
            </h2>
            <div class="section-content">
              <ul class="nav flex-column">
                <li class="nav-item" v-if="!isAuthenticated">
                  <NuxtLink to="/login" class="nav-link">
                    <i class="bi bi-box-arrow-in-right me-2"></i> {{ t('login') }}
                  </NuxtLink>
                </li>
                <li class="nav-item" v-if="isAuthenticated">
                  <NuxtLink to="/auth/profile" class="nav-link">
                    <i class="bi bi-person-circle me-2"></i> {{ t('profile') }}
                  </NuxtLink>
                </li>
                <li class="nav-item" v-if="isAuthenticated">
                  <NuxtLink to="/account/change-password" class="nav-link">
                    <i class="bi bi-shield-lock me-2"></i> {{ t('change_password') }}
                  </NuxtLink>
                </li>
                <li class="nav-item" v-if="isAuthenticated">
                  <a href="#" class="nav-link" @click.prevent="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i> {{ t('logout') }}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Admin Section (Always Open, visible only for admins) -->
          <div class="accordion-item sidebar-accordion" v-if="isAdmin">
            <h2 class="accordion-header" id="headingAdmin">
              <div class="section-header">
                <i class="bi bi-gear me-2"></i> {{ t('admin') }}
              </div>
            </h2>
            <div class="section-content">
              <ul class="nav flex-column">
                <li class="nav-item">
                  <NuxtLink to="/admin/users/listUsers" class="nav-link">
                    <i class="bi bi-people me-2"></i> {{ t('manage_users') }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n';
import { useAuth } from '~/composables/useAuth';

const { t } = useI18n();
const { isAuthenticated, isAdmin, logout } = useAuth();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'toggle']);

// Toggle sidebar visibility
const toggleSidebar = () => {
  emit('update:modelValue', !props.modelValue);
  emit('toggle', !props.modelValue);
};

// Logout handler
const handleLogout = () => {
  logout();
  // Close sidebar on mobile after logout
  if (window.innerWidth < 768) {
    emit('update:modelValue', false);
    emit('toggle', false);
  }
};

// Lifecycle (no special setup needed now)
</script>

<style scoped>
.dashboard-sidebar {
  position: fixed;
  top: 60px; /* Below header */
  left: 0;
  bottom: 0;
  width: 250px;
  background-color: var(--bs-primary);
  color: #fff;
  z-index: 999;
  transition: transform 0.3s ease;
  overflow-y: auto;
  transform: translateX(-100%);
}

.dashboard-sidebar.active {
  transform: translateX(0);
}

.sidebar-header {
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-content {
  padding: 0;
}

.sidebar-accordion {
  background-color: transparent;
  border: none;
  border-radius: 0;
  margin-bottom: 0;
}

.section-header {
  padding: 0.75rem 1.5rem;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.2);
  font-weight: 500;
  display: flex;
  align-items: center;
}

.section-content {
  background-color: transparent;
  padding: 0;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85);
  padding: 0.5rem 1.5rem;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.nav-link:hover, 
.nav-link.active {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link i {
  width: 20px;
  text-align: center;
}


@media (min-width: 768px) {
  .dashboard-sidebar {
    transform: translateX(0);
  }
  
  .dashboard-sidebar:not(.active) {
    transform: translateX(-100%);
  }
}
</style>

<!-- Version: 1.3.0 -->