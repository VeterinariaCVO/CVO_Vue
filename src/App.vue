<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRoute } from 'vue-router'

const auth = useAuthStore()
const route = useRoute()
</script>

<template>
  <nav v-if="route.name !== 'login'" class="navbar">
    <div class="nav-left">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink v-if="auth.isEmpleado" to="/empleado/registrar-cliente"
        >Registrar Cliente
      </RouterLink>
      <RouterLink v-if="auth.isCliente" to="/client/citas"> Mis Citas </RouterLink>
      <RouterLink v-if="auth.isCliente" to="/client/create-cita"> Agendar </RouterLink>
    </div>

    <div class="nav-right">
      <span v-if="auth.user"> {{ auth.user.name }} ({{ auth.roleName }}) </span>
      <button v-if="auth.isAuthenticated" @click="auth.logout()">Logout</button>
    </div>
  </nav>
  <main class="main">
    <RouterView />
  </main>
</template>

<style scoped>
.navbar {
  width: 100%;
  padding: 14px 30px;
  background: #1e293b;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #f1f5f9;
  border-bottom: 1px solid #334155;
}

.nav-left, .nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

a {
  color: #cbd5f5;
  text-decoration: none;
  font-size: 14px;
}

a:hover {
  color: #ffffff;
}

.nav-right span {
  font-size: 13px;
  color: #94a3b8;
}

button {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ef4444;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  font-size: 13px;
}

button:hover {
  background: #ef4444;
  color: white;
}

.main {
  min-height: calc(100vh - 60px);
  background: #0f172a;
  padding: 30px;
}

.main > * {
  max-width: 1100px;
  margin: auto;
}

.card {
  background: #1e293b;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #334155;
}

h1, h2, h3 {
  color: #f1f5f9;
  margin-bottom: 15px;
}

input,
select {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #020617;
  color: white;
}

/* TABLAS */
table {
  width: 100%;
  border-collapse: collapse;
  background: #1e293b;
  border-radius: 10px;
  overflow: hidden;
}

th {
  background: #334155;
  padding: 10px;
  color: white;
}

td {
  padding: 10px;
  border-bottom: 1px solid #334155;
  color: #cbd5f5;
  text-align: center;
}

tr:hover {
  background: #273449;
}
</style>
