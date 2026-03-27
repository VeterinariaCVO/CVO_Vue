<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
</script>

<template>
  <nav style="padding: 10px; background: #eee; display: flex; gap: 10px">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/empleado/registrar-cliente" v-if="auth.isEmpleado">
      Registrar Cliente
    </RouterLink>

    <RouterLink to="/client/citas" v-if="auth.isCliente">Mis Citas</RouterLink>
    <RouterLink to="/cliente/perfil" v-if="auth.isCliente">Mi Perfil</RouterLink>
    <RouterLink to="/empleado/consultas" v-if="auth.isEmpleado">Servicios</RouterLink>

    <RouterLink v-if="!auth.isAuthenticated" to="/login">Login</RouterLink>
    <button v-if="auth.isAuthenticated" @click="auth.logout()">Logout</button>
    <span v-if="auth.user">| {{ auth.user.name }} ({{ auth.roleName }})</span>
  </nav>

  <RouterView />
</template>
