<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
</script>

<template>
  <nav style="padding: 10px; background: #eee; display: flex; gap: 10px">
    <RouterLink to="/">Home</RouterLink>

    <!-- Empleado/Recepcionista -->
    <RouterLink to="/empleado/registrar-cliente" v-if="auth.isRecepcionista">
      Registrar Cliente
    </RouterLink>
    <RouterLink to="/empleado/consultas" v-if="auth.isRecepcionista"> Servicios </RouterLink>

    <!-- Cliente -->
    <RouterLink to="/client/citas" v-if="auth.isCliente">Mis Citas</RouterLink>
    <RouterLink to="/cliente/perfil" v-if="auth.isCliente">Mi Perfil</RouterLink>

    <!-- Veterinario -->
    <RouterLink to="/veterinario/citas" v-if="auth.isVeterinario">Mi Agenda</RouterLink>
    <RouterLink to="/veterinario/mascotas" v-if="auth.isVeterinario">Mascotas</RouterLink>
    <router-link to="/veterinario/agenda" v-if="auth.isVeterinario">Agenda</router-link>


    <!-- Admin -->
    <RouterLink to="/admin/servicios" v-if="auth.isAdmin">Servicios</RouterLink>

    <!-- Común -->
    <RouterLink v-if="!auth.isAuthenticated" to="/login">Login</RouterLink>
    <button v-if="auth.isAuthenticated" @click="auth.logout()">Logout</button>
    <span v-if="auth.user">| {{ auth.user.name }} ({{ auth.roleName }})</span>
  </nav>

  <RouterView />
</template>
