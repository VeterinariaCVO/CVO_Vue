<template>
  <p v-if="cargando" class="estado">Cargando...</p>
  <p v-else-if="servicios.length === 0" class="estado">No hay servicios disponibles.</p>
  <div v-else class="lista">
    <div v-for="servicio in servicios" :key="servicio.id" class="item">
      <p class="nombre">{{ servicio.name }}</p>
      <p class="descripcion">{{ servicio.description ?? '—' }}</p>
      <span class="precio">${{ servicio.price }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const servicios = ref<any[]>([])
const cargando = ref(true)

async function cargar() {
  const { data, execute } = ApiUseFetch('services').get().json()
  await execute()
  servicios.value = data.value?.data ?? []
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.item {
  background: #f8fafc;
  border-radius: 10px;
  padding: 14px;
  border: 1px solid #dce6f0;
}
.nombre {
  font-weight: 600;
  color: #1e3a5f;
  font-size: 0.9rem;
  margin: 0 0 4px;
}
.descripcion {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0 0 8px;
}
.precio {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1d6bbf;
}
</style>
