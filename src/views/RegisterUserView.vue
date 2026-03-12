<template>
  <div class="page">

    <nav class="navbar">
      <div class="navbar-left">
        <div class="logo">VO</div>
        <span class="brand">Panel Admin</span>
      </div>
      <div class="navbar-right">
        <button v-for="item in ['Inicio', 'Usuarios', 'Reportes', 'Perfil']" :key="item"
          @click="item === 'Usuarios' && $router.push({ name: 'admin-users' })"
          class="nav-btn">{{ item }}</button>
        <button class="btn-green">Editar Calendario</button>
        <button class="btn-red" @click="$router.push({ name: 'home' })">Cerrar sesion</button>
      </div>
    </nav>

    <div class="content">

      <div class="breadcrumb">
        <button @click="$router.push({ name: 'admin-users' })" class="breadcrumb-link">
          Gestion de Usuarios
        </button>
        <span> / </span>
        <span class="breadcrumb-current">{{ isEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</span>
      </div>

      <div class="card">

        <div class="card-header">
          <h2 class="card-title">{{ isEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h2>
          <p class="card-subtitle">CDU-002 · Registro de cliente/usuario</p>
        </div>

        <div class="card-body">

          <div class="field">
            <label class="label">Nombre completo</label>
            <input v-model="form.name" placeholder="Ej. Juan Perez"
              :class="['input', errors.name ? 'input-error' : '']" />
            <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
          </div>

          <div class="field">
            <label class="label">Correo electronico</label>
            <input v-model="form.email" type="email" placeholder="correo@ejemplo.com"
              :class="['input', errors.email ? 'input-error' : '']" />
            <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
          </div>

          <div class="field-row">
            <div class="field">
              <label class="label">Telefono</label>
              <input v-model="form.phone" placeholder="+52 000 000 0000" class="input" />
            </div>
            <div class="field">
              <label class="label">Rol</label>
              <select v-model="form.role_id" class="input">
                <option :value="2">Trabajador</option>
                <option :value="3">Cliente</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label class="label">Direccion</label>
            <input v-model="form.address" placeholder="Calle, Ciudad" class="input" />
          </div>

          <div v-if="!isEdit" class="field">
            <label class="label">Contrasena</label>
            <input v-model="form.password" type="password" placeholder="Minimo 8 caracteres"
              :class="['input', errors.password ? 'input-error' : '']" />
            <p v-if="errors.password" class="error-msg">{{ errors.password }}</p>
          </div>

          <p v-if="errors.general" class="error-msg">{{ errors.general }}</p>

        </div>

        <div class="card-footer">
          <button @click="$router.push({ name: 'admin-users' })" class="btn-cancel">Cancelar</button>
          <button @click="handleSubmit" :disabled="saving" class="btn-save">
            <span v-if="saving" class="spinner" />
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const API    = 'http://127.0.0.1:8000/api'
const isEdit = computed(() => !!route.query.id)

const form = ref({
  name:     '',
  email:    '',
  role_id:  3,
  phone:    '',
  address:  '',
  password: '',
  active:   true,
})

const errors = ref<Record<string, string>>({})
const saving = ref(false)

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authStore.token}`,
    'Accept': 'application/json',
  }
}

onMounted(async () => {
  if (!isEdit.value) return
  try {
    const res  = await fetch(`${API}/admin/users/${route.query.id}`, { headers: getHeaders() })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { throw new Error(`Error del servidor (${res.status})`) }
    if (!res.ok) throw new Error(data.message ?? 'Error al cargar usuario')
    const u = data.user
    form.value = {
      name:     u.name,
      email:    u.email,
      role_id:  u.role_id,
      phone:    u.phone    ?? '',
      address:  u.address  ?? '',
      password: '',
      active:   u.active,
    }
  } catch (e: any) {
    errors.value.general = e.message
  }
})

function validate() {
  const e: Record<string, string> = {}
  if (!form.value.name.trim())  e.name  = 'El nombre es obligatorio.'
  if (!form.value.email.trim()) e.email = 'El correo es obligatorio.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) e.email = 'Correo invalido.'
  if (!isEdit.value && form.value.password.length < 8) e.password = 'Minimo 8 caracteres.'
  errors.value = e
  return !Object.keys(e).length
}

async function handleSubmit() {
  if (!validate()) return
  saving.value = true
  errors.value = {}

  try {
    const method = isEdit.value ? 'PUT' : 'POST'
    const url    = isEdit.value
      ? `${API}/admin/users/${route.query.id}`
      : `${API}/admin/users`

    const body: any = {
      name:    form.value.name,
      email:   form.value.email,
      role_id: form.value.role_id,
      phone:   form.value.phone   || null,
      address: form.value.address || null,
      active:  form.value.active,
    }

    if (!isEdit.value) {
      body.password = form.value.password
    } else if (form.value.password) {
      body.password = form.value.password
    }

    const res  = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(body) })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { throw new Error(`Error del servidor (${res.status})`) }

    if (!res.ok) {
      if (res.status === 422 && data.errors) {
        const laravelErrors: Record<string, string> = {}
        for (const key in data.errors) {
          laravelErrors[key] = data.errors[key][0]
        }
        errors.value = laravelErrors
        return
      }
      throw new Error(data.message ?? 'Error al guardar')
    }

    const msg = isEdit.value ? 'Usuario actualizado exitosamente.' : 'Usuario registrado exitosamente.'
    sessionStorage.setItem('toast', msg)
    router.push({ name: 'admin-users' })

  } catch (e: any) {
    errors.value.general = e.message
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

* { font-family: 'Poppins', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }

.page { min-height: 100vh; width: 100%; background-color: #eaf4fb; }

.navbar {
  background-color: #3f98ff;
  padding: 10px 32px;
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;
}
.navbar-left { display: flex; align-items: center; gap: 12px; }
.logo {
  width: 40px; height: 40px; background: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #3f98ff; font-size: 13px;
}
.brand { color: white; font-weight: 700; font-size: 17px; }
.navbar-right { display: flex; align-items: center; gap: 4px; }
.nav-btn {
  color: white; background: transparent; border: none;
  padding: 6px 12px; border-radius: 6px; cursor: pointer;
  font-size: 13px; font-family: 'Poppins', sans-serif;
}
.nav-btn:hover { background: rgba(255,255,255,0.2); }
.btn-green {
  background-color: #28a745; color: white; border: none;
  padding: 6px 14px; border-radius: 6px; font-weight: 600;
  font-size: 13px; cursor: pointer; margin-left: 8px;
  font-family: 'Poppins', sans-serif;
}
.btn-red {
  background-color: #dc3545; color: white; border: none;
  padding: 6px 14px; border-radius: 6px; font-weight: 600;
  font-size: 13px; cursor: pointer; margin-left: 4px;
  font-family: 'Poppins', sans-serif;
}

.content { padding: 32px; }

.breadcrumb {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: #9ca3af; margin-bottom: 24px;
}
.breadcrumb-link {
  background: none; border: none; color: #9ca3af;
  cursor: pointer; font-size: 13px; font-family: 'Poppins', sans-serif;
}
.breadcrumb-link:hover { color: #3b82f6; }
.breadcrumb-current { color: #374151; font-weight: 600; }

.card {
  background: white; border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  width: 100%; overflow: hidden;
}
.card-header { padding: 20px 24px; border-bottom: 1px solid #f3f4f6; }
.card-title { font-size: 20px; font-weight: 700; color: #1f2937; }
.card-subtitle { font-size: 11px; color: #9ca3af; margin-top: 2px; }

.card-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.label { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }

.input {
  width: 100%; border: 1px solid #d1d5db; border-radius: 6px;
  padding: 8px 12px; font-size: 13px; font-family: 'Poppins', sans-serif;
  outline: none; transition: border-color 0.2s; background: white;
}
.input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
.input-error { border-color: #f87171; background-color: #fef2f2; }
.error-msg { font-size: 11px; color: #ef4444; }

.card-footer {
  display: flex; justify-content: flex-end; align-items: center;
  gap: 12px; padding: 16px 24px;
  border-top: 1px solid #f3f4f6; background: #f9fafb;
}
.btn-cancel {
  padding: 8px 20px; border-radius: 6px; border: 1px solid #d1d5db;
  background: white; color: #6b7280; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-cancel:hover { background: #f3f4f6; }
.btn-save {
  padding: 8px 24px; border-radius: 6px; border: none;
  background-color: #007bff; color: white; font-size: 13px;
  font-weight: 600; cursor: pointer; display: flex; align-items: center;
  gap: 8px; font-family: 'Poppins', sans-serif;
}
.btn-save:hover { opacity: 0.9; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 12px; height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>