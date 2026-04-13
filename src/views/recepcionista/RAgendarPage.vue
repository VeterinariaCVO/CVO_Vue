<script setup lang="ts">
import { useRouter } from 'vue-router'
import RCreateAppointmentView from './RCreateAppointment.vue'

const router = useRouter()

function volverACitas() {
  router.push('/recepcionista/citas')
}
</script>

<template>
  <RCreateAppointmentView
    @cerrar="volverACitas"
    @guardado="volverACitas"
  />
</template>
