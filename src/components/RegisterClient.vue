<template>
  <div>
    <h2>Registrar Usuario</h2>

    <p v-if="mensaje">{{ mensaje }}</p>

    <form @submit.prevent="registrarUsuario">
      <input v-model="form.name"     type="text"     placeholder="Nombre" /><br>
      <input v-model="form.email"    type="email"    placeholder="Correo" /><br>
      <input v-model="form.password" type="password" placeholder="Contraseña" /><br>

      <select v-model="form.role_id">
        <option value="">-- Rol --</option>
        <option value="1">Administrador</option>
        <option value="2">Usuario</option>
      </select><br>

      <input v-model="form.phone"   type="text" placeholder="Teléfono" /><br>
      <input v-model="form.address" type="text" placeholder="Dirección" /><br>

      <label>
        <input v-model="form.active" type="checkbox" /> Activo
      </label><br>

      <button type="submit">Registrar</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const mensaje = ref('')

    const form = ref({
      name: '',
      email: '',
      password: '',
      role_id: '',
      phone: '',
      address: '',
      active: true,
    })

    async function registrarUsuario() {
      const respuesta = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(form.value),
      })

      const datos = await respuesta.json()
      mensaje.value = datos.message
    }

    return { form, mensaje, registrarUsuario }
  }
}
</script>