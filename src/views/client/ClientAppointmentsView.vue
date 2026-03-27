<script setup lang="ts">
import { ref, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

interface Appointment {
  id: number
  service: string
  status: string
  pet: {
    id: number
    name: string
  }
  client: {
    id: number
    name: string
    phone: string | null
  }
  time_slot: {
    date: string
    start_time: string
    end_time: string
  }
}

interface ApiResponse {
  data: Appointment[]
}

interface TimeSlot {
  id: number
  date: string
  start_time: string
  end_time: string
  status: string
}

const filtroEstado = ref('')

const { data, error, isFetching, execute } = ApiUseFetch(
  () => `/appointments${filtroEstado.value ? `?status=${filtroEstado.value}` : ''}`,
)
  .get()
  .json<ApiResponse>()

const { data: time_slots } = ApiUseFetch('/time-slots').get().json<{ data: TimeSlot[] }>()

const horariosDisponibles = computed(() => {
  return time_slots.value?.data || []
})

const mostrarModal = ref(false)
const citaSeleccionada = ref<Appointment | null>(null)
const nuevoTimeSlotId = ref(0)

const bodyReagendar = ref({
  pet_id: 0,
  time_slot_id: 0,
  service: '',
  notes: '',
})

const { execute: ejecutarReagendar } = ApiUseFetch(
  () => `/appointments/${citaSeleccionada.value?.id}`,
)
  .put(() => bodyReagendar.value)
  .json()

const idCancelar = ref(0)
const { execute: ejecutarCancelar } = ApiUseFetch(() => `/appointments/${idCancelar.value}`)
  .delete()
  .json()

const abrirModal = (cita: Appointment) => {
  citaSeleccionada.value = cita
  nuevoTimeSlotId.value = 0
  mostrarModal.value = true
}

const reAgendar = async () => {
  if (!citaSeleccionada.value || !nuevoTimeSlotId.value) return

  bodyReagendar.value.pet_id = citaSeleccionada.value.pet.id
  bodyReagendar.value.time_slot_id = nuevoTimeSlotId.value
  bodyReagendar.value.service = citaSeleccionada.value.service
  bodyReagendar.value.notes = ''

  await ejecutarReagendar()

  mostrarModal.value = false
  execute()
}

const cancelarCita = async (id: number) => {
  const confirmar = confirm('¿Estás seguro de cancelar la cita?')
  if (!confirmar) return

  idCancelar.value = id
  await ejecutarCancelar()

  execute()
}
</script>

<template>
  <div class="container">
    <h2>Mis citas</h2>
    <div style="margin-bottom: 20px">
      <select v-model="filtroEstado" @change="execute()">
        <option value="">Todas</option>
        <option value="pending">Pendientes</option>
        <option value="completed">Completadas</option>
        <option value="cancelled">Canceladas</option>
      </select>
    </div>
    <p v-if="isFetching">Cargando citas...</p>
    <p v-if="error">Error al cargar las citas</p>
    <table v-if="data?.data?.length">
      <thead>
        <tr>
          <th>Dueño</th>
          <th>Teléfono</th>
          <th>Mascota</th>
          <th>Fecha</th>
          <th>Hora</th>
          <th>Servicio</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="appointment in data.data" :key="appointment.id">
          <td>{{ appointment.client.name }}</td>
          <td>{{ appointment.client.phone ?? 'Sin teléfono' }}</td>
          <td>{{ appointment.pet.name }}</td>
          <td>{{ appointment.time_slot.date }}</td>
          <td>{{ appointment.time_slot.start_time }}</td>
          <td>{{ appointment.service }}</td>
          <td>
            <span class="status">
              {{ appointment.status }}
            </span>
          </td>
          <td>
            <button @click="abrirModal(appointment)">Reagendar</button>
            <button @click="cancelarCita(appointment.id)">Cancelar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="!data?.data?.length && !isFetching">No tienes citas registradas</p>
    <div v-if="mostrarModal" class="modal">
      <div class="modal-content">
        <h3>Reagendar cita</h3>
        <select v-model="nuevoTimeSlotId">
          <option disabled value="0">Selecciona fecha y hora</option>
          <option v-for="slot in horariosDisponibles" :key="slot.id" :value="slot.id">
            {{ slot.date }} - {{ slot.start_time }}
          </option>
        </select>
        <div class="modal-buttons">
          <button @click="reAgendar">Guardar</button>
          <button @click="mostrarModal = false">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1100px;
  margin: auto;
  padding: 50px 30px;
}

h2 {
  margin-bottom: 30px;
  font-size: 34px;
  font-weight: 700;
  color: #e5e7eb;
}

table {
  width: 150%;
  border-collapse: collapse;
  background: #0f172a;
  border-radius: 12px;
  overflow: hidden;
}

thead {
  background: #3767ea;
  padding: 14px;
}

th {
  padding: 14px;
  font-size: 16px;
  text-transform: uppercase;
  color: white;
}

td {
  padding: 14px;
  border-bottom: 1px solid #1f2937;
  color: #d1d5db;
  font-size: 14px;
  text-align: center;
}

tbody tr:hover {
  background: #1e293b;
}

.status {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  background: #374151;
}

td button {
  margin: 2px;
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  cursor: pointer;
}

td button:first-child {
  background: #3b82f6;
  color: white;
}

td button:last-child {
  background: #ef4444;
  color: white;
}

p {
  text-align: center;
  margin-top: 20px;
  color: #9ca3af;
  font-size: 14px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  width: 280px;
  background: #111827;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.modal-content h3 {
  color: #e5e7eb;
  margin-bottom: 15px;
  font-size: 16px;
}

.modal-content select {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #374151;
  background: #020617;
  color: white;
  margin-bottom: 15px;
}

.modal-buttons {
  display: flex;
  gap: 8px;
}

.modal-buttons button {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
}
</style>
