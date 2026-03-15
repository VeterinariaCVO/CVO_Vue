<template>
  <div class="tabs">
    <button
      v-for="tab in tabs" :key="tab.value"
      @click="$emit('change', tab.value)"
      :class="['tab', modelValue === tab.value ? 'tab-active' : '']">
      {{ tab.label }}
      <span class="tab-count">{{ counts[tab.value] ?? 0 }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  counts: Record<string, number>
}>()

defineEmits<{
  (e: 'change', value: string): void
}>()

const tabs = [
  { label: 'Todos',        value: 'todos'      },
  { label: 'Trabajadores', value: 'Trabajador' },
  { label: 'Clientes',     value: 'Cliente'    },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
* { font-family: 'Poppins', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }

.tabs {
  display: flex; gap: 4px;
  padding: 16px 20px 0 20px;
  border-bottom: 2px solid #f3f4f6;
}
.tab {
  padding: 8px 16px; border: none; background: transparent;
  font-size: 13px; font-weight: 500; color: #6b7280;
  cursor: pointer; border-bottom: 2px solid transparent;
  margin-bottom: -2px; display: flex; align-items: center; gap: 6px;
  font-family: 'Poppins', sans-serif; transition: all 0.15s;
}
.tab:hover { color: #007bff; }
.tab-active { color: #007bff; border-bottom-color: #007bff; font-weight: 600; }
.tab-count {
  background: #f3f4f6; color: #6b7280;
  font-size: 11px; font-weight: 700;
  padding: 1px 7px; border-radius: 999px;
}
.tab-active .tab-count { background: #dbeafe; color: #007bff; }
</style>