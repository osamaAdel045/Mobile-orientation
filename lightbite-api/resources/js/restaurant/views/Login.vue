<template>
  <div class="login">
    <div class="login__card">
      <div class="login__header">
        <span class="login__icon">🍔</span>
        <h1>LightBite</h1>
        <p>Restaurant Partner</p>
      </div>

      <form @submit.prevent="handleLogin" class="login__form">
        <label class="login__field">
          <span>Email</span>
          <input v-model="email" type="email" required autocomplete="email" placeholder="owner@restaurant.com" />
        </label>

        <label class="login__field">
          <span>Password</span>
          <input v-model="password" type="password" required autocomplete="current-password" placeholder="••••••••" />
        </label>

        <div v-if="error" class="login__error">{{ error }}</div>

        <button type="submit" :disabled="loading" class="login__btn">
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRestaurantAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useRestaurantAuthStore();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = '';
  try {
    await auth.login(email.value, password.value);
    router.push('/restaurant/');
  } catch (e) {
    error.value = e.response?.data?.error?.message || e.message || 'Login failed.';
  } finally {
    loading.value = false;
  }
}
</script>

<style>
.login {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: #F8F6F2; padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.login__card {
  width: 100%; max-width: 400px; background: #FFF; border-radius: 20px;
  padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,.06), 0 1px 4px rgba(0,0,0,.04);
}
.login__header { text-align: center; margin-bottom: 32px; }
.login__icon { font-size: 44px; display: block; margin-bottom: 12px; }
.login__header h1 { font-size: 24px; font-weight: 800; color: #1A1A1A; letter-spacing: -.3px; }
.login__header p { color: #9E9E9E; font-size: 15px; margin-top: 4px; }
.login__form { display: flex; flex-direction: column; gap: 18px; }
.login__field { display: flex; flex-direction: column; gap: 6px; }
.login__field span { font-size: 13px; font-weight: 600; color: #6B6B6B; }
.login__field input {
  width: 100%; padding: 12px 16px; border: 1px solid #EBE6DE; border-radius: 12px;
  font-size: 15px; color: #1A1A1A; background: #FAFAFA; transition: all .15s; outline: none;
}
.login__field input:focus { border-color: #F26522; box-shadow: 0 0 0 3px rgba(242,101,34,.1); background: #FFF; }
.login__field input::placeholder { color: #CECECE; }
.login__error { background: #FEF2F2; color: #991B1B; font-size: 13px; font-weight: 500; padding: 12px 16px; border-radius: 12px; border: 1px solid #FECACA; }
.login__btn {
  width: 100%; padding: 14px; background: #F26522; color: #FFF; border: none; border-radius: 12px;
  font-size: 16px; font-weight: 700; cursor: pointer; transition: background .15s; margin-top: 4px;
}
.login__btn:hover:not(:disabled) { background: #E05510; }
.login__btn:disabled { opacity: .6; cursor: not-allowed; }
</style>
