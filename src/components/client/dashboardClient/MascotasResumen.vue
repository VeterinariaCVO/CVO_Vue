<template>
  <p v-if="cargando" class="estado">Cargando...</p>
  <p v-else-if="mascotas.length === 0" class="estado">No tienes mascotas registradas.</p>
  <div v-else class="lista">
    <div v-for="mascota in mascotas" :key="mascota.id" class="item">
      <div class="foto-placeholder">🐾</div>
      <div>
        <p class="nombre">{{ mascota.name }}</p>
        <p class="especie">{{ mascota.species }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const mascotas = ref<any[]>([])
const cargando = ref(true)

async function cargar() {
  const { data, execute } = ApiUseFetch('mis-mascotas').get().json()
  await execute()
  mascotas.value = data.value?.data ?? []
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
  max-height: 300px; /* ← altura máxima */
  overflow-y: auto; /* ← barra de scroll */
  padding-right: 4px;
}
.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 10px;
}
.foto-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e8f0fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.nombre {
  font-weight: 600;
  color: #1e3a5f;
  font-size: 0.9rem;
  margin: 0;
}
.especie {
  font-size: 0.78rem;
  color: #64748b;
  margin: 2px 0 0;
}
</style>
