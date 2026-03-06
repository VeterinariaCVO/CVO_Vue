<script setup lang="ts">
import { reactive } from 'vue'
import { createAppointment } from '../services/appointmentService'

const appointment = reactive({
  pet_id: '',
  service_id: '',
  time_slot_id: '',
  notes: '',
})

function submitForm() {
  if (!appointment.pet_id || !appointment.service_id || !appointment.time_slot_id) {
    alert('Debes llenar todos los campos')
    return
  }

  createAppointment(appointment)
    .then(function (response) {
      alert('Cita creada correctamente')
    })
    .catch(function (error) {
      alert('Error al crear cita')
    })
}
</script>

<template>
  <div class="cuadrog">
    <div class="recuadro">
      <h2>Agendar Cita 🐶</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>Mascota</label>
          <input
            v-model="appointment.pet_id"
            type="number"
            placeholder="ID de la mascota"
            required
          />
        </div>
        <div class="form-group">
          <label>Servicio</label>
          <input
            v-model="appointment.service_id"
            type="number"
            placeholder="ID del servicio"
            required
          />
        </div>
        <div class="form-group">
          <label>Horario</label>
          <input
            v-model="appointment.time_slot_id"
            type="number"
            placeholder="ID del horario"
            required
          />
        </div>
        <div class="form-group">
          <label>Notas</label>
          <textarea v-model="appointment.notes" placeholder="Observaciones de la cita"></textarea>
        </div>
        <button type="submit">Agendar Cita</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.cuadrog {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #17a5ef;
}

.recuadro {
  background: white;
  padding: 40px;
  width: 700px;
  max-width: 90%;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: #555;
}

input,
textarea {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 14px;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #17a5ef;
  box-shadow: 0 0 0 2px rgba(23, 165, 239, 0.15);
}

button {
  width: 100%;
  padding: 12px;
  background: #17a5ef;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 15px;
  margin-top: 10px;
  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  background: #0f8ed1;
  transform: translateY(-1px);
}
</style>
