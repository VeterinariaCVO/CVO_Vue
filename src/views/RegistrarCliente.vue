<script setup lang="ts"></script>

<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <p class="sidebar-title">Menú</p>
      <a class="menu-item active">Cliente</a>
      <a class="menu-item">Mascota</a>
      <a class="menu-item">Servicios</a>
      <a class="menu-item">Citas</a>
      <a class="menu-item">Inventario</a>
      <a class="menu-item">Finanzas</a>
    </aside>

    <!-- Contenido -->
    <main class="content">
      <h2>Registrar Cliente</h2>

      <!-- Mensajes -->
      <p v-if="mensaje" class="msg-exito">✅ {{ mensaje }}</p>
      <p v-if="error" class="msg-error">⚠️ {{ error }}</p>

      <!-- Formulario -->
      <div class="card">
        <p class="subtitulo">Añade los datos del cliente</p>

        <div class="campo">
          <label>Nombre de usuario</label>
          <input v-model="form.name" type="text" placeholder="Ej. Juan Pérez" />
        </div>

        <div class="campo">
          <label>Teléfono</label>
          <input v-model="form.phone" type="tel" placeholder="10 dígitos" />
        </div>

        <div class="campo">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="correo@ejemplo.com" />
        </div>

        <div class="campo">
          <label>Domicilio</label>
          <input v-model="form.address" type="text" placeholder="Calle, número, colonia" />
        </div>

        <div class="campo">
          <label>Contraseña temporal</label>
          <input v-model="form.password" type="password" placeholder="Mínimo 8 caracteres" />
        </div>

        <button @click="registrar" :disabled="cargando">
          {{ cargando ? 'Registrando...' : 'Registrar' }}
        </button>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'RegistrarCliente',

  data() {
    return {
      form: {
        name: '',
        phone: '',
        email: '',
        address: '',
        password: '',
      },
      cargando: false,
      mensaje: '',
      error: '',
    }
  },

  methods: {
    async registrar() {
      this.mensaje = ''
      this.error = ''

      // Validación básica
      if (!this.form.name || !this.form.email || !this.form.password) {
        this.error = 'Nombre, email y contraseña son obligatorios.'
        return
      }

      this.cargando = true

      try {
        const token = localStorage.getItem('auth_token')

        const response = await fetch('http://localhost:8000/api/empleado/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...this.form,
            role_id: 3,
            active: true,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          this.mensaje = data.message
          this.form = { name: '', phone: '', email: '', address: '', password: '' }
        } else {
          this.error = data.message ?? 'Ocurrió un error.'
        }
      } catch (e) {
        this.error = 'No se pudo conectar con el servidor.'
      } finally {
        this.cargando = false
      }
    },
  },
}
</script>

<style scoped>
.layout {
  display: flex;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  background: #f4f4f4;
}
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
.content {
  flex: 1;
  padding: 28px 32px;
}
.content h2 {
  margin-bottom: 16px;
}
.msg-exito {
  color: green;
  margin-bottom: 12px;
}
.msg-error {
  color: red;
  margin-bottom: 12px;
}
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
