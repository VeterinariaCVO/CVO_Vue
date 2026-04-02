<template>
  <div
    class="rounded-2xl p-5 flex flex-col gap-2 min-h-30"
    :class="{
      'bg-blue-100 text-blue-700': color === 'azul',
      'bg-yellow-100 text-yellow-800': color === 'amarillo',
      'bg-emerald-100 text-emerald-800': color === 'verde',
    }"
  >
    <p class="text-xs font-semibold m-0 opacity-80">{{ titulo }}</p>
    <p class="text-[1.8rem] font-bold m-0">{{ valor }}</p>
    <button
      v-if="boton"
      @click="$emit('accion')"
      class="mt-auto bg-white/50 hover:bg-white/80 border-none rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
    >
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
