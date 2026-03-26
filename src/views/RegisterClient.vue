<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const formulario = ref({
  name: '',
  phone: '',
  email: '',
  address: '',
  password: '',
})

const cliente = computed(() => ({
  name: formulario.value.name,
  phone: formulario.value.phone,
  email: formulario.value.email,
  address: formulario.value.address,
  password: formulario.value.password,
}))

// ✅ Corregido: /empleado/clientes → /register (usa el endpoint real del backend)
const { data, error, isFetching, execute } = ApiUseFetch('/register', {
  immediate: false,
})
  .post(cliente)
  .json()

async function registrar() {
  await execute()
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <p class="sidebar-title">Menú</p>

      <!-- ✅ RouterLink en lugar de <a> -->
      <RouterLink to="/empleado/registrar-cliente" class="menu-item" active-class="active">
        Cliente
      </RouterLink>
      <RouterLink to="/empleado/mascotas" class="menu-item" active-class="active">
        Mascota
      </RouterLink>
      <RouterLink to="/empleado/servicios" class="menu-item" active-class="active">
        Servicios
      </RouterLink>
      <RouterLink to="/empleado/citas" class="menu-item" active-class="active"> Citas </RouterLink>
    </aside>

    <main class="content">
      <h2>Registrar Cliente</h2>

      <p v-if="data" class="msg-exito">{{ data.message }}</p>
      <p v-if="error" class="msg-error">{{ error }}</p>

      <div class="card">
        <p class="subtitulo">Añade los datos del cliente</p>

        <div class="campo">
          <label>Nombre de usuario</label>
          <input v-model="formulario.name" type="text" placeholder="Ej. Juan Pérez" />
        </div>
        <div class="campo">
          <label>Teléfono</label>
          <input v-model="formulario.phone" type="tel" placeholder="10 dígitos" />
        </div>
        <div class="campo">
          <label>Email</label>
          <input v-model="formulario.email" type="email" placeholder="correo@ejemplo.com" />
        </div>
        <div class="campo">
          <label>Domicilio</label>
          <input v-model="formulario.address" type="text" placeholder="Calle, número, colonia" />
        </div>
        <div class="campo">
          <label>Contraseña temporal</label>
          <input v-model="formulario.password" type="password" placeholder="Mínimo 8 caracteres" />
        </div>

        <button @click="registrar" :disabled="isFetching">
          {{ isFetching ? 'Registrando...' : 'Registrar' }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  background: #f4f4f4;
}

/* Sidebar */
.sidebar {
  width: 140px;
  background: #fff;
  border-right: 1px solid #ddd;
  padding: 16px 0;
}
.sidebar-title {
  font-size: 12px;
  color: #888;
  padding: 0 14px 8px;
  margin: 0;
}
.menu-item {
  display: block;
  padding: 10px 14px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  text-decoration: none;
}
.menu-item.active {
  background: #4fc3d8;
  color: #fff;
  font-weight: bold;
}

/* Contenido */
.content {
  flex: 1;
  padding: 28px 32px;
}
.content h2 {
  margin-bottom: 16px;
}

/* Mensajes */
.msg-exito {
  color: green;
  margin-bottom: 12px;
}
.msg-error {
  color: red;
  margin-bottom: 12px;
}

/* Card */
.card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 24px;
  max-width: 480px;
}
.subtitulo {
  margin: 0 0 18px;
  font-weight: 500;
}

/* Campos */
.campo {
  margin-bottom: 14px;
}
.campo label {
  display: block;
  font-size: 13px;
  margin-bottom: 5px;
  color: #555;
}
.campo input {
  width: 100%;
  padding: 9px 11px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  background: #f9f9f9;
}
.campo input:focus {
  outline: none;
  border-color: #4fc3d8;
}

/* Botón */
button {
  width: 100%;
  padding: 11px;
  background: #4fc3d8;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 6px;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
