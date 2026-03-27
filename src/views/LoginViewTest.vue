<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true

  try {
    const data = await auth.login(email.value, password.value)

    if (data.user.role_id === 3) {
      router.push('/client/citas')
    } else if (data.user.role_id === 2) {
      router.push('/empleado')
    } else if (data.user.role_id === 1) {
      router.push('/admin')
    } else {
      router.push('/')
    }

  } catch (err: any) {
    errorMsg.value = err?.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Iniciar sesión</h2>

      <form @submit.prevent="handleLogin">
        <input v-model="email" placeholder="Correo" />

        <input v-model="password" type="password" placeholder="Contraseña" />

        <button type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <p v-if="errorMsg" class="error">
        {{ errorMsg }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
}

.login-card {
  width: 320px;
  padding: 25px;
  border-radius: 10px;
  background: #1e293b;
  border: 1px solid #334155;
}

h2 {
  color: white;
  text-align: center;
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #020617;
  color: white;
}

button {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: none;
  background: #3b82f6;
  color: white;
  cursor: pointer;
}

button:disabled {
  background: #64748b;
  cursor: not-allowed;
}

.error {
  margin-top: 10px;
  color: #ef4444;
  font-size: 13px;
  text-align: center;
}
</style>
