<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
</script>

<template>
  <nav style="padding: 10px; background: #eee; display: flex; gap: 10px;">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/empleado/registrar-cliente">Registrar Cliente</RouterLink>
    <RouterLink v-if="!auth.isAuthenticated" to="/login">Login</RouterLink>
    <button v-if="auth.isAuthenticated" @click="auth.logout()">
      Logout
    </button>
    <span v-if="auth.user">
      | {{ auth.user.name }} ({{ auth.roleName }})
    </span>
  </nav>

  <RouterView />
</template>
