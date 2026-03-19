<template>
  <div class="tabs">
    <button v-for="tab in tabs" :key="tab.value"
      @click="$emit('change', tab.value)"
      :class="['tab', modelValue === tab.value ? 'tab-active' : '']">
      {{ tab.label }}
      <span :class="['tab-count', modelValue === tab.value ? 'tab-count-active' : '']">
        {{ counts[tab.value] ?? 0 }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string; counts: Record<string, number> }>()
defineEmits<{ (e: 'change', value: string): void }>()
const tabs = [
  { label: 'Todos',        value: 'todos'      },
  { label: 'Trabajadores', value: 'Trabajador' },
  { label: 'Clientes',     value: 'Cliente'    },
]
</script>

<style scoped>

.tabs      { @apply flex gap-1 px-5 pt-4 border-b-2 border-gray-100; }
.tab       { @apply px-4 py-2 border-none bg-transparent text-sm font-medium text-gray-500 cursor-pointer border-b-2 border-transparent -mb-0.5 flex items-center gap-1.5 transition-colors hover:text-blue-500; }
.tab-active { @apply text-blue-600 border-b-2 border-blue-600 font-semibold; }
.tab-count  { @apply bg-gray-100 text-gray-500 text-xs font-bold px-1.5 py-0.5 rounded-full; }
.tab-count-active { @apply bg-blue-100 text-blue-600; }
</style>