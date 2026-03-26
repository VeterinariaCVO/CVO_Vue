<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMsg = ref('')

async function handleLogin() {
  try {
    await auth.login(email.value, password.value)

    const roleId = auth.user?.role_id
    if (roleId === 1) router.push('/admin/usuarios')
    else if (roleId === 2) router.push('/empleado/registrar-cliente')
    else if (roleId === 3) router.push('/client/citas')
    else router.push('/')
  } catch (err: any) {
    errorMsg.value = err?.message || 'Error al iniciar sesión'
  }
}

function handleLogout() {
  auth.logout()
}
</script>

<template>
  <div style="padding: 20px; max-width: 300px">
    <h2>Login</h2>

    <input v-model="email" placeholder="Email" />
    <br /><br />

    <input v-model="password" type="password" placeholder="Password" />
    <br /><br />

    <button @click="handleLogin">Entrar</button>

    <button v-if="auth.isAuthenticated" @click="handleLogout">Logout</button>

    <p v-if="errorMsg" style="color: red">
      {{ errorMsg }}
    </p>
  </div>
</template>
