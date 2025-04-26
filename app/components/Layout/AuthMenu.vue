<template>
  <div>
    <!-- Utente autenticato con dropdown -->
    <div v-if="isAuthenticated" class="dropdown">
      <button
        class="btn btn-outline-light dropdown-toggle d-flex align-items-center"
        type="button"
        id="userDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <span class="me-2">
          <i class="bi bi-person-circle"></i>
        </span>
        {{ user?.firstName || user?.login || 'Utente' }}
      </button>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
        <li>
          <NuxtLink class="dropdown-item" to="/auth/profile">
            Profilo
          </NuxtLink>
        </li>
        <li>
          <NuxtLink class="dropdown-item" to="/account/change-password">
            Cambia Password
          </NuxtLink>
        </li>
        <li>
          <hr class="dropdown-divider" />
        </li>
        <li>
          <button class="dropdown-item" @click="handleLogout">Logout</button>
        </li>
      </ul>
    </div>

    <!-- Pulsante di login se non autenticato -->
    <div v-else class="dropdown">
    <!-- <i class="border-0 bi bi-box-arrow-in-right"></i> -->
      <button
        class="btn border-0 fs-2 bg-transparent btn-outline-light bi bi-box-arrow-in-right hover:bg-light hover:text-dark"
        type="button"
        id="authDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <!-- Login -->
      </button>
    <!-- -->
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="authDropdown">
        <li>
          <NuxtLink class="dropdown-item" to="/login">Login</NuxtLink>
        </li>
        <li>
          <NuxtLink class="dropdown-item" to="/auth/register">Register</NuxtLink>
        </li>
        <li>
          <NuxtLink class="dropdown-item" to="/account/reset/init">Forget Password</NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";

const { isAuthenticated, user, logout } = useAuth();

// Gestione logout
const handleLogout = () => {
  logout();
};
</script>
