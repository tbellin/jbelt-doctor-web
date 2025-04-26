## components/Auth/LoginForm.vue

```vue
<!-- components/Auth/LoginForm.vue -->
<template>
  <div class="login-form">
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <form @submit.prevent="handleLogin">
      <div class="mb-3">
        <label for="username" class="form-label">{{ t('username') }}</label>
        <input
          type="text"
          class="form-control"
          id="username"
          v-model="username"
          required
          autocomplete="username"
          :placeholder="t('enter_username')"
        />
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">{{ t('password') }}</label>
        <input
          type="password"
          class="form-control"
          id="password"
          v-model="password"
          required
          autocomplete="current-password"
          :placeholder="t('enter_password')"
        />
      </div>
      <div class="mb-3 form-check">
        <input 
          type="checkbox" 
          class="form-check-input" 
          id="rememberMe" 
          v-model="rememberMe"
        />
        <label class="form-check-label" for="rememberMe">
          {{ t('remember_me') }}
        </label>
      </div>
      <div class="d-grid gap-2">
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ t('login') }}
        </button>
      </div>
      <div class="mt-3 text-center">
        <NuxtLink to="/auth/register">{{ t('register_new_account') }}</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useI18n } from '~/composables/useI18n';

const { login, error: authError, loading } = useAuth();
const { t } = useI18n();

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const error = ref('');

const handleLogin = async () => {
  error.value = '';
  
  if (!username.value || !password.value) {
    error.value = t('please_fill_all_fields');
    return;
  }
  
  const success = await login(username.value, password.value, rememberMe.value);
  
  if (!success) {
    error.value = authError.value || t('login_failed');
  }
};
</script>
```

This component provides the login form for the application.
