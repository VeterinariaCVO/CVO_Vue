<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const clientes = ref<any[]>([])
const mascotas = ref<any[]>([])
const servicios = ref<any[]>([])
const clienteSeleccionado = ref<number | null>(null)
const mascotaSeleccionada = ref<number | null>(null)
const servicioSeleccionado = ref<number | null>(null)
const paso = ref(1)
const cargando = ref(false)
const mensajeExito = ref('')
const mensajeError = ref('')

const formulario = ref({
  inicio_enfermedad: '',
  habitat: '',
  dx_presuntivo: '',
  dx_diferencial: '',
  observaciones: '',
  fallecio: false,
  sospecha_muerte: '',
})

const tratamientos = ref([{ nombre_comercial: '', dosis_ml: '', via_admin: '', num_dias: '' }])

onMounted(async () => {
  const { data: dc, execute: ec } = ApiUseFetch('/empleado/clients', { immediate: false })
    .get()
    .json()
  await ec()
  clientes.value = dc.value?.clients ?? []

  const { data: ds, execute: es } = ApiUseFetch('/service', { immediate: false }).get().json()
  await es()
  servicios.value = ds.value?.data ?? []
})

async function cargarMascotas() {
  if (!clienteSeleccionado.value) return
  mascotaSeleccionada.value = null
  const { data, execute } = ApiUseFetch(`/empleado/clients/${clienteSeleccionado.value}`, {
    immediate: false,
  })
    .get()
    .json()
  await execute()
  mascotas.value = data.value?.pets ?? []
}

function irAlFormulario() {
  if (!mascotaSeleccionada.value || !servicioSeleccionado.value) {
    mensajeError.value = 'Selecciona servicio, dueño y mascota'
    return
  }
  mensajeError.value = ''
  paso.value = 2
}

function agregarFila() {
  tratamientos.value.push({ nombre_comercial: '', dosis_ml: '', via_admin: '', num_dias: '' })
}

function quitarFila(i: number) {
  tratamientos.value.splice(i, 1)
}

async function guardar() {
  cargando.value = true
  mensajeExito.value = ''
  mensajeError.value = ''

  const { error, execute } = ApiUseFetch('/empleado/consultas', { immediate: false })
    .post({
      pet_id: mascotaSeleccionada.value,
      service_id: servicioSeleccionado.value,
      ...formulario.value,
      treatments: tratamientos.value,
    })
    .json()

  await execute()
  cargando.value = false

  if (error.value) {
    mensajeError.value = 'Error al guardar'
    return
  }

  mensajeExito.value = 'Consulta guardada correctamente'
  paso.value = 1
  clienteSeleccionado.value = null
  mascotaSeleccionada.value = null
  servicioSeleccionado.value = null
  formulario.value = {
    inicio_enfermedad: '',
    habitat: '',
    dx_presuntivo: '',
    dx_diferencial: '',
    observaciones: '',
    fallecio: false,
    sospecha_muerte: '',
  }
  tratamientos.value = [{ nombre_comercial: '', dosis_ml: '', via_admin: '', num_dias: '' }]
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <p class="sidebar-title">Menú</p>
      <RouterLink to="/empleado/registrar-cliente" class="menu-item">Cliente</RouterLink>
      <RouterLink to="/empleado/mascotas" class="menu-item">Mascota</RouterLink>
      <RouterLink to="/empleado/consultas" class="menu-item active">Servicios</RouterLink>
      <RouterLink to="/empleado/citas" class="menu-item">Citas</RouterLink>
    </aside>

    <main class="content">
      <h2>Registro de Consulta</h2>

      <p v-if="mensajeExito" class="msg-exito">{{ mensajeExito }}</p>
      <p v-if="mensajeError" class="msg-error">{{ mensajeError }}</p>


      <div v-if="paso === 1" class="card">
        <p class="subtitulo">Selecciona el servicio, dueño y mascota</p>

        <div class="campo">
          <label>Tipo de servicio</label>
          <select v-model="servicioSeleccionado">
            <option value="" disabled>Selecciona un servicio</option>
            <option v-for="s in servicios" :key="s.id" :value="s.id">{{ s.description }}</option>
          </select>
        </div>

        <div class="campo">
          <label>Dueño</label>
          <select v-model="clienteSeleccionado" @change="cargarMascotas">
            <option value="" disabled>Selecciona un dueño</option>
            <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div class="campo">
          <label>Mascota</label>
          <select v-model="mascotaSeleccionada" :disabled="!clienteSeleccionado">
            <option value="" disabled>Selecciona una mascota</option>
            <option v-for="m in mascotas" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>

        <button @click="irAlFormulario">Continuar</button>
      </div>


      <div v-if="paso === 2" class="card">
        <button class="btn-gris" @click="paso = 1">← Volver</button>
        <p class="subtitulo">Datos de la consulta</p>

        <div class="grid-2">
          <div class="campo">
            <label>Inicio de enfermedad</label>
            <input
              v-model="formulario.inicio_enfermedad"
              type="text"
              placeholder="Ej. hace 3 días"
            />
          </div>
          <div class="campo">
            <label>Hábitat</label>
            <input v-model="formulario.habitat" type="text" placeholder="Casa, rancho..." />
          </div>
          <div class="campo">
            <label>Dx Presuntivo</label>
            <textarea v-model="formulario.dx_presuntivo" rows="2"></textarea>
          </div>
          <div class="campo">
            <label>Dx Diferencial</label>
            <textarea v-model="formulario.dx_diferencial" rows="2"></textarea>
          </div>
          <div class="campo">
            <label>Observaciones</label>
            <textarea v-model="formulario.observaciones" rows="2"></textarea>
          </div>
        </div>

        <h3>Tratamiento (TX)</h3>
        <table class="tabla-tx">
          <thead>
            <tr>
              <th>Nombre comercial</th>
              <th>Dosis/ML</th>
              <th>Vía admin</th>
              <th>No. días</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tx, i) in tratamientos" :key="i">
              <td><input v-model="tx.nombre_comercial" type="text" /></td>
              <td><input v-model="tx.dosis_ml" type="text" /></td>
              <td><input v-model="tx.via_admin" type="text" /></td>
              <td><input v-model="tx.num_dias" type="text" /></td>
              <td>
                <button class="btn-rojo" @click="quitarFila(i)" v-if="tratamientos.length > 1">
                  x
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <button class="btn-gris" @click="agregarFila">+ Agregar fila</button>

        <div class="campo-check">
          <input v-model="formulario.fallecio" type="checkbox" id="fallecio" />
          <label for="fallecio">El paciente falleció</label>
        </div>
        <div class="campo" v-if="formulario.fallecio">
          <label>Sospecha de causa de muerte</label>
          <input v-model="formulario.sospecha_muerte" type="text" />
        </div>

        <button @click="guardar" :disabled="cargando">
          {{ cargando ? 'Guardando...' : 'Guardar consulta' }}
        </button>
      </div>
    </main>
  </div>
</template>

