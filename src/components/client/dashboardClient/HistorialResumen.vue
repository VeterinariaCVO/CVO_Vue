<template>
  <p v-if="cargando" class="estado">Cargando...</p>
  <p v-else-if="historial.length === 0" class="estado">No hay registros médicos.</p>
  <div v-else class="lista">
    <div v-for="registro in historial" :key="registro.id" class="item">
      <div class="info">
        <p class="mascota">{{ registro.appointment?.pet?.name ?? '—' }}</p>
        <p class="diagnostico">{{ registro.diagnosis ?? 'Sin diagnóstico' }}</p>
      </div>
      <p class="fecha">{{ registro.created_at ?? '—' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const historial = ref<any[]>([])
const cargando = ref(true)

async function cargar() {
  const { data, execute } = ApiUseFetch('medical-records').get().json()
  await execute()
  historial.value = data.value?.data ?? []
  cargando.value = false
}

onMounted(cargar)
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
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}
.info {
  flex: 1;
}
.mascota {
  font-weight: 600;
  color: #1e3a5f;
  font-size: 0.9rem;
  margin: 0;
}
.diagnostico {
  font-size: 0.78rem;
  color: #64748b;
  margin: 2px 0 0;
}
.fecha {
  font-size: 0.75rem;
  color: #94a3b8;
}
</style>
