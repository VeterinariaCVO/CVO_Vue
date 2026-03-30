<template>
  <div class="card" :class="`card-${color}`">
    <p class="card-titulo">{{ titulo }}</p>
    <p class="card-valor">{{ valor }}</p>
    <button v-if="boton" @click="$emit('accion')" class="btn-accion">
      {{ boton }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  titulo: string
  valor: string | number
  color: 'azul' | 'amarillo' | 'verde'
  boton?: string
}>()

defineEmits<{ accion: [] }>()
</script>

<style scoped>
.card {
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 120px;
}
.card-titulo {
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0;
  opacity: 0.8;
}
.card-valor {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}
.card-azul {
  background: #dbeafe;
  color: #1d4ed8;
}
.card-amarillo {
  background: #fef9c3;
  color: #854d0e;
}
.card-verde {
  background: #d1fae5;
  color: #065f46;
}
</style>
