<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

interface CreateAppointment {
  pet_id: number
  time_slot_id: number
  service: string
  notes?: string
}

interface Pet {
  id: number
  name: string
}

interface TimeSlot {
  id: number
  date: string
  start_time: string
  end_time: string
  status: string
}

const router = useRouter()

const form = ref<CreateAppointment>({
  pet_id: 0,
  time_slot_id: 0,
  service: '',
  notes: '',
})

const services = ['medical', 'daycare', 'surgery', 'vaccination']
const { data: petsResponse } = ApiUseFetch('/mis-mascotas').get().json<{ pets: Pet[] }>()
const pets = computed(() => petsResponse.value?.pets || [])
const { data: time_slots } = ApiUseFetch('/time-slots').get().json<{ data: TimeSlot[] }>()

const availableSlots = computed(() => {
  return time_slots.value?.data?.filter((slot) => slot.status === 'available') || []
})

const { data, error, isFetching, execute } = ApiUseFetch('/appointments',
  { immediate: false, }).post(() => form.value).json()

const createAppointment = async () => {
  if (!form.value.pet_id || !form.value.time_slot_id || !form.value.service) {
    alert('Completa todos los campos')
    return
  }

  await execute()

  form.value = {
    pet_id: 0,
    time_slot_id: 0,
    service: '',
    notes: '',
  }

  router.push('/client/citas')
}
</script>

<template>
  <div class="page">
    <div class="card">
      <h1 class="title">Agendar cita</h1>
      <form @submit.prevent="createAppointment">
        <div class="section">
          <h3>Mascota</h3>
          <select v-model="form.pet_id">
            <option disabled value="0">Selecciona una mascota</option>
            <option v-for="pet in pets" :key="pet.id" :value="pet.id">
              {{ pet.name }}
            </option>
          </select>
        </div>
        <div class="section">
          <h3>Horarios</h3>
          <select v-model="form.time_slot_id">
            <option disabled value="0">Selecciona un horario</option>
            <option v-for="slot in availableSlots" :key="slot.id" :value="slot.id">
              {{ slot.start_time }} - {{ slot.end_time }}
            </option>
          </select>
        </div>
        <div class="section">
          <h3>Servicio</h3>
          <select v-model="form.service">
            <option disabled value="">Selecciona un servicio</option>
            <option v-for="service in services" :key="service" :value="service">
              {{ service }}
            </option>
          </select>
        </div>
        <div class="section">
          <h3>Notas</h3>
          <input type="text" v-model="form.notes" />
        </div>
        <button type="submit" :disabled="isFetching">Agendar cita</button>
      </form>
      <p v-if="isFetching">Creando cita...</p>
      <p v-if="error">Error al crear la cita</p>
      <p v-if="data">Cita agendada correctamente</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.card {
  width: 100%;
  max-width: 600px;
  background: rgba(17, 24, 39, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.title {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  color: #f9fafb;
  margin-bottom: 30px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section h3 {
  color: #e5e7eb;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

input,
select {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: #020617;
  color: white;
  font-size: 14px;
  transition: 0.2s ease;
}

input:focus,
select:focus {
  border: 1px solid #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

button {
  margin-top: 10px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  transition: 0.25s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
}

button:disabled {
  background: #475569;
  cursor: not-allowed;
  box-shadow: none;
}

p {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}

p:nth-of-type(2) {
  color: #ef4444;
}

p:nth-of-type(3) {
  color: #22c55e;
}
</style>
