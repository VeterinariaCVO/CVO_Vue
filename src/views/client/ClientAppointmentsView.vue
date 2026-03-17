<script setup lang="ts">
import { useFetch } from '@vueuse/core'

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

const { data, error, isFetching } = useFetch('http://localhost:8000/api/appointments')
  .get()
  .json<ApiResponse>()
</script>

<template>
  <div class="container">
    <h2>Mis citas</h2>
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
        </tr>
      </tbody>
    </table>
    <p v-if="!data?.data?.length && !isFetching">No tienes citas registradas</p>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: auto;
  padding: 60px 30px;
}

h2 {
  text-align: center;
  margin-bottom: 40px;
  font-size: 40px;
  font-weight: 700;
  color: #e5e7eb;
}

table {
  width: 120%;
  border-collapse: collapse;
  background: #182133;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.45);
}

thead {
  background: #2b66e4;
}

th {
  padding: 20px;
  text-transform: uppercase;
  font-size: 16px;
  letter-spacing: 1px;
  color: white;
}

td {
  padding: 20px;
  border-bottom: 1px solid #1f2937;
  color: #e5e7eb;
  font-size: 17px;
}

tbody tr {
  transition: background 0.2s ease;
}

tbody tr:hover {
  background: #1f2937;
}

.status {
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
}

p {
  text-align: center;
  margin-top: 25px;
  color: #9ca3af;
  font-size: 18px;
}
</style>
