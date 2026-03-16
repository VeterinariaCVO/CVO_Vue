<template>
  <div class="pet-card">
    <div class="pet-photo">
      <img v-if="pet.photo_path"
        :src="`http://127.0.0.1:8000/storage/${pet.photo_path}`"
        :alt="pet.name" />
      <div v-else class="pet-icon">🐾</div>
    </div>
    <div class="pet-info">
      <h3 class="pet-name">{{ pet.name }}</h3>
      <p class="pet-species">{{ pet.species }}{{ pet.breed ? ` · ${pet.breed}` : '' }}</p>
      <div class="pet-tags">
        <span class="tag">{{ pet.sex === 'male' ? 'Macho' : 'Hembra' }}</span>
        <span v-if="pet.age"    class="tag">{{ pet.age }} años</span>
        <span v-if="pet.color"  class="tag">{{ pet.color }}</span>
        <span v-if="pet.weight" class="tag">{{ pet.weight }} kg</span>
      </div>
      <p v-if="pet.special_marks" class="special-marks">{{ pet.special_marks }}</p>
    </div>
    <div class="pet-actions">
      <button @click="$emit('view',   pet)" class="btn-view">Ver Detalle</button>
      <button @click="$emit('edit',   pet)" class="btn-edit">Editar</button>
      <button @click="$emit('delete', pet)" class="btn-delete">Eliminar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Pet } from '@/types/pet'
defineProps<{ pet: Pet }>()
defineEmits<{
  (e: 'view',   pet: Pet): void
  (e: 'edit',   pet: Pet): void
  (e: 'delete', pet: Pet): void
}>()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
* { font-family: 'Poppins', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }

.pet-card {
  background: white; border-radius: 10px;
  border: 1px solid #b8d4f0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  padding: 16px; display: flex; gap: 16px; align-items: flex-start;
  transition: box-shadow 0.15s;
}
.pet-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

.pet-photo {
  width: 64px; height: 64px; border-radius: 10px;
  background: #e6f3ff; overflow: hidden; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.pet-photo img { width: 100%; height: 100%; object-fit: cover; }
.pet-icon { font-size: 28px; }

.pet-info { flex: 1; }
.pet-name { font-size: 15px; font-weight: 700; color: #1f2937; margin-bottom: 2px; }
.pet-species { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
.pet-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; }
.tag {
  background: #e6f3ff; color: #374151;
  font-size: 11px; font-weight: 600;
  padding: 2px 8px; border-radius: 999px;
}
.special-marks { font-size: 11px; color: #9ca3af; }

.pet-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
.btn-view {
  background-color: #007bff; color: white; border: none;
  padding: 5px 14px; border-radius: 6px; font-size: 12px;
  font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-view:hover { opacity: 0.9; }
.btn-edit {
  background-color: #17a2b8; color: white; border: none;
  padding: 5px 14px; border-radius: 6px; font-size: 12px;
  font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-edit:hover { opacity: 0.9; }
.btn-delete {
  background-color: #dc3545; color: white; border: none;
  padding: 5px 14px; border-radius: 6px; font-size: 12px;
  font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;
}
.btn-delete:hover { opacity: 0.9; }
</style>