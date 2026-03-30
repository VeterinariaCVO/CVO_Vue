<template>
  <div class="overlay">
    <div class="modal">
      <h2 class="modal-titulo">📅 Agendar Cita</h2>

      <div class="form">

        <!-- Mascota -->
        <div class="campo">
          <label class="label">Mascota *</label>
          <select v-model="form.pet_id" class="input">
            <option value="" disabled>Selecciona una mascota</option>
            <option v-for="mascota in mascotas" :key="mascota.id" :value="mascota.id">
              {{ mascota.name }}
            </option>
          </select>
        </div>

        <!-- Servicio -->
        <div class="campo">
          <label class="label">Servicio *</label>
          <select v-model="form.service_id" class="input">
            <option value="" disabled>Selecciona un servicio</option>
            <option v-for="servicio in servicios" :key="servicio.id" :value="servicio.id">
              {{ servicio.name }}
            </option>
          </select>
        </div>

        <!-- Horario -->
        <div class="campo">
          <label class="label">Horario *</label>
          <select v-model="form.time_slot_id" class="input">
            <option value="" disabled>Selecciona un horario</option>
            <option v-for="slot in timeSlots" :key="slot.id" :value="slot.id">
              {{ slot.start_time }} - {{ slot.end_time }}
            </option>
          </select>
        </div>

        <!-- Notas -->
        <div class="campo">
          <label class="label">Notas (opcional)</label>
          <textarea v-model="form.notes" placeholder="Describe el motivo de la consulta..." class="input textarea"></textarea>
        </div>

      </div>

      <div class="botones">
        <button @click="$emit('cerrar')" class="btn-cancelar">Cancelar</button>
        <button @click="agendar" class="btn-guardar">Agendar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

// ── Datos del formulario ──────────────────────────────────────────────────────
const form = ref({
  pet_id:      '',
  service_id:  '',
  time_slot_id: '',
  notes:       '',
})

// ── Listas para los selects ───────────────────────────────────────────────────
const mascotas  = ref<any[]>([])
const servicios = ref<any[]>([])
const timeSlots = ref<any[]>([])

// ── Carga las mascotas del cliente ────────────────────────────────────────────
async function cargarMascotas() {
  const { data, execute } = ApiUseFetch('mis-mascotas').get().json()
  await execute()
  mascotas.value = data.value?.data ?? []
}

// ── Carga los servicios disponibles ──────────────────────────────────────────
async function cargarServicios() {
  const { data, execute } = ApiUseFetch('services').get().json()
  await execute()
  servicios.value = data.value?.data ?? []
}

// ── Carga los horarios disponibles ───────────────────────────────────────────
async function cargarTimeSlots() {
  const { data, execute } = ApiUseFetch('time-slots').get().json()
  await execute()
  timeSlots.value = data.value?.data ?? []
}

// ── Agrega la cita ────────────────────────────────────────────────────────────
async function agendar() {
  const { execute } = ApiUseFetch('appointments').post(form.value).json()
  await execute()
  emit('guardado')
  emit('cerrar')
}

// ── Carga todo al abrir el modal ─────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([cargarMascotas(), cargarServicios(), cargarTimeSlots()])
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal {
  background: white;
  border-radius: 20px;
  padding: 28px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
}
.modal-titulo {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 20px;
}
.form   { display: flex; flex-direction: column; gap: 12px; }
.campo  { display: flex; flex-direction: column; gap: 4px; }
.label  { font-size: 0.75rem; font-weight: 600; color: #64748b; }
.input {
  width: 100%;
  border: 1px solid #dce6f0;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 0.875rem;
  color: #1e3a5f;
  outline: none;
  background: #f8fafc;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.input:focus {
  border-color: #1d6bbf;
  background: white;
  box-shadow: 0 0 0 3px rgba(29,107,191,0.1);
}
.textarea { resize: none; height: 80px; }
.botones    { display: flex; gap: 10px; margin-top: 20px; }
.btn-cancelar {
  flex: 1;
  background: #e8f0fa;
  color: #1d6bbf;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
.btn-cancelar:hover { background: #dbeafe; }
.btn-guardar {
  flex: 1;
  background: #1d6bbf;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
.btn-guardar:hover { background: #155fa8; }
</style>