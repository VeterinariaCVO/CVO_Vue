<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const auth = useAuthStore()
const router = useRouter()

const formulario = ref({
  name: '',
  phone: '',
  address: '',
  password: '',
})

const cargando = ref(false)
const mensajeExito = ref('')
const mensajeError = ref('')
const mostrarConfirmar = ref(false)

onMounted(() => {
  formulario.value.name = auth.user?.name || ''
  formulario.value.phone = auth.user?.phone || ''
  formulario.value.address = auth.user?.address || ''
})

async function actualizar() {
  mensajeExito.value = ''
  mensajeError.value = ''
  cargando.value = true

  const datos: any = {
    name: formulario.value.name,
    phone: formulario.value.phone,
    address: formulario.value.address,
  }

  if (formulario.value.password) {
    datos.password = formulario.value.password
  }

  const { data, error, execute } = ApiUseFetch('/cliente/perfil').put(datos).json()
  await execute()

  cargando.value = false

  if (error.value) {
    mensajeError.value = data.value?.message || 'Error al actualizar'
    return
  }

  mensajeExito.value = 'Perfil actualizado correctamente'
  formulario.value.password = ''
  auth.user = data.value.user
}

async function eliminarCuenta() {
  cargando.value = true
  mostrarConfirmar.value = false

  const { error, execute } = ApiUseFetch('/cliente/perfil').delete().json()
  await execute()

  cargando.value = false

  if (error.value) {
    mensajeError.value = 'Error al eliminar la cuenta'
    return
  }

  auth.logout()
}
</script>

<template>
  <div class="contenedor">
    <h2>Mi Perfil</h2>

    <p v-if="mensajeExito" class="exito">{{ mensajeExito }}</p>
    <p v-if="mensajeError" class="error">{{ mensajeError }}</p>

    <div class="campo">
      <label>Nombre</label>
      <input v-model="formulario.name" type="text" placeholder="Tu nombre" />
    </div>

    <div class="campo">
      <label>Teléfono</label>
      <input v-model="formulario.phone" type="tel" placeholder="10 dígitos" />
    </div>

    <div class="campo">
      <label>Domicilio</label>
      <input v-model="formulario.address" type="text" placeholder="Tu domicilio" />
    </div>

    <div class="campo">
      <label>
        Nueva contraseña
        <span class="opcional">(dejar vacío para no cambiar)</span>
      </label>
      <input v-model="formulario.password" type="password" placeholder="Nueva contraseña" />
    </div>

    <button @click="actualizar" :disabled="cargando" class="btn-guardar">
      {{ cargando ? 'Guardando...' : 'Guardar cambios' }}
    </button>

    <hr />

    <button v-if="!mostrarConfirmar" @click="mostrarConfirmar = true" class="btn-eliminar">
      Eliminar mi cuenta
    </button>

    <div v-if="mostrarConfirmar" class="confirmar">
      <p>¿Estás seguro? Esta acción no se puede deshacer.</p>
      <div class="botones-confirmar">
        <button @click="eliminarCuenta" :disabled="cargando" class="btn-eliminar">
          Sí, eliminar
        </button>
        <button @click="mostrarConfirmar = false" class="btn-cancelar">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contenedor {
  max-width: 420px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}

h2 {
  margin-bottom: 20px;
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

.opcional {
  font-size: 11px;
  color: #aaa;
}

.campo input {
  width: 100%;
  padding: 9px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.campo input:focus {
  outline: none;
  border-color: #4fc3d8;
}

.btn-guardar {
  width: 100%;
  padding: 10px;
  background: #4fc3d8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
  margin-top: 6px;
}

.btn-guardar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

hr {
  margin: 24px 0;
  border: none;
  border-top: 1px solid #eee;
}

.btn-eliminar {
  width: 100%;
  padding: 10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
}

.btn-cancelar {
  width: 100%;
  padding: 10px;
  background: #aaa;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
}

.confirmar p {
  color: #e74c3c;
  font-size: 14px;
  margin-bottom: 12px;
}

.botones-confirmar {
  display: flex;
  gap: 10px;
}

.botones-confirmar button {
  flex: 1;
}

.exito {
  color: green;
  font-size: 14px;
  margin-bottom: 12px;
}
.error {
  color: red;
  font-size: 14px;
  margin-bottom: 12px;
}
</style>
