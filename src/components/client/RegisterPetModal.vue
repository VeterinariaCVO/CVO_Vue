<template>
  <div class="overlay">
    <div class="modal">
      <h2 class="modal-titulo">Registrar Mascota</h2>
      <div class="form">
        <div class="campo">
          <label class="label">Nombre *</label>
          <input v-model="form.name" placeholder="Nombre de la mascota" class="input" />
        </div>
        <div class="campo">
          <label class="label">Especie *</label>
          <input v-model="form.species" placeholder="Ej: Perro, Gato" class="input" />
        </div>
        <div class="campo">
          <label class="label">Sexo *</label>
          <select v-model="form.sex" class="input">
            <option value="male">♂ Macho</option>
            <option value="female">♀ Hembra</option>
          </select>
        </div>
        <div class="campo">
          <label class="label">Raza</label>
          <input v-model="form.breed" placeholder="Ej: Labrador" class="input" />
        </div>
        <div class="campo">
          <label class="label">Color</label>
          <input v-model="form.color" placeholder="Ej: Café con blanco" class="input" />
        </div>
        <div class="campo">
          <label class="label">Marcas especiales</label>
          <input v-model="form.special_marks" placeholder="Ej: Mancha en la oreja" class="input" />
        </div>
        <div class="campo">
          <label class="label">Edad (años)</label>
          <input v-model.number="form.age" type="number" min="0" placeholder="0" class="input" />
        </div>
        <div class="campo">
          <label class="label">Peso (kg)</label>
          <input
            v-model.number="form.weight"
            type="number"
            min="0"
            step="0.1"
            placeholder="0.0"
            class="input"
          />
        </div>
      </div>
      <div class="botones">
        <button @click="$emit('cerrar')" class="btn-cancelar">Cancelar</button>
        <button @click="registrar" class="btn-guardar">Guardar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { Pet } from '@/types/pet'

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

type PetForm = Omit<Pet, 'id' | 'owner_id' | 'active' | 'photo_path'>

const form = ref<PetForm>({
  name: '',
  species: '',
  sex: 'male',
  breed: null,
  color: null,
  special_marks: null,
  age: null,
  weight: null,
})

async function registrar(): Promise<void> {
  try {
    const { execute } = ApiUseFetch('mis-mascotas').post(form.value).json()
    await execute()
  } catch (err) {
    console.error('Error al registrar:', err)
  } finally {
    // Siempre cierra — el padre recargará la lista al cerrar
    emit('cerrar')
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal {
  background: white;
  border-radius: 20px;
  padding: 28px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
}
.modal-titulo {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 20px;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}
.input {
  width: 100%;
  border: 1px solid #dce6f0;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 0.875rem;
  color: #1e3a5f;
  outline: none;
  background: #f8fafc;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.input:focus {
  border-color: #1d6bbf;
  background: white;
  box-shadow: 0 0 0 3px rgba(29, 107, 191, 0.1);
}
.botones {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.btn-cancelar {
  flex: 1;
  background: #e8f0fa;
  color: #1d6bbf;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancelar:hover {
  background: #dbeafe;
}
.btn-guardar {
  flex: 1;
  background: #1d6bbf;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-guardar:hover {
  background: #155fa8;
}
</style>
