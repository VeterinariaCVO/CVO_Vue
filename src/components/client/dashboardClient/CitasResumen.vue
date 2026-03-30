<template>
  <p v-if="cargando" class="estado">Cargando...</p>
  <p v-else-if="citas.length === 0" class="estado">No tienes citas registradas.</p>
  <div v-else class="lista">
    <div v-for="cita in citas" :key="cita.id" class="item">
      <div class="info">
        <p class="servicio">{{ cita.service?.name ?? 'Servicio' }}</p>
        <p class="hora">{{ cita.time_slot?.start_time ?? '—' }}</p>
      </div>
      <span class="badge" :class="`badge-${cita.status}`">{{ cita.status }}</span>
      <button
        v-if="cita.status === 'pending' || cita.status === 'confirmed'"
        @click="cancelar(cita.id)"
        class="btn-cancelar"
      >
        Cancelar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const emit = defineEmits<{ actualizar: [] }>()

const citas = ref<any[]>([])
const cargando = ref(true)

async function cargar() {
  const { data, execute } = ApiUseFetch('appointments').get().json()
  await execute()
  citas.value = data.value?.data ?? []
  cargando.value = false
}

async function cancelar(id: number) {
  if (!confirm('¿Seguro que quieres cancelar esta cita?')) return
  const { execute } = ApiUseFetch(`appointments/${id}`).delete().json()
  await execute()
  emit('actualizar')
  cargar()
}

onMounted(cargar)
defineExpose({ cargar })
</script>

<style scoped>
.estado {
  color: #94a3b8;
  text-align: center;
  padding: 16px 0;
}
.lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px; /* ← altura máxima */
  overflow-y: auto; /* ← barra de scroll */
  padding-right: 4px;
}
.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}
.info {
  flex: 1;
}
.servicio {
  font-weight: 600;
  color: #1e3a5f;
  font-size: 0.9rem;
  margin: 0;
}
.hora {
  font-size: 0.78rem;
  color: #64748b;
  margin: 2px 0 0;
}
.badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}
.badge-pending {
  background: #fef9c3;
  color: #854d0e;
}
.badge-confirmed {
  background: #d1fae5;
  color: #065f46;
}
.badge-completed {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge-cancelled {
  background: #f1f5f9;
  color: #64748b;
}
.btn-cancelar {
  background: #fee2e2;
  color: #b91c1c;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 5px 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn-cancelar:hover {
  opacity: 0.8;
}
</style>
