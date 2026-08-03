<template>
  <div class="d-flex align-items-center justify-content-center min-vh-100 bg-body-tertiary">
    <div class="card shadow-sm" style="max-width: 400px; width: 100%;">
      <div class="card-body p-4">
        <div class="text-center mb-4">
          <h1 class="h3 fw-bold text-warning">LightBite</h1>
          <p class="text-body-secondary small mb-0">Admin Panel</p>
        </div>
        <form @submit.prevent="login">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input v-model="email" type="email" required class="form-control" placeholder="admin@lightbite.com" />
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input v-model="password" type="password" required class="form-control" placeholder="••••••••" />
          </div>
          <div v-if="error" class="alert alert-danger py-2 small mb-3">{{ error }}</div>
          <button type="submit" :disabled="loading" class="btn btn-warning w-100 fw-medium">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const auth = useAuthStore();
const router = useRouter();

async function login() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push('/admin');
  } catch (e) {
    error.value = e.response?.data?.error?.message || e.message || 'Login failed.';
  } finally {
    loading.value = false;
  }
}
</script>
