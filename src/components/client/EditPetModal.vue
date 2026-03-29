<template>
  <div class="overlay">
    <div class="modal">
      <h2 class="modal-titulo">Editar Mascota</h2>
      <p v-if="cargando" class="cargando">Cargando...</p>
      <template v-else>
        <div class="form">
          <div class="campo">
            <label class="label">Nombre *</label>
            <input v-model="form.name" placeholder="Nombre" class="input" />
          </div>
          <div class="campo">
            <label class="label">Especie *</label>
            <input v-model="form.species" placeholder="Especie" class="input" />
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
            <input v-model="form.breed" placeholder="Raza" class="input" />
          </div>
          <div class="campo">
            <label class="label">Color</label>
            <input v-model="form.color" placeholder="Color" class="input" />
          </div>
          <div class="campo">
            <label class="label">Marcas especiales</label>
            <input v-model="form.special_marks" placeholder="Marcas especiales" class="input" />
          </div>
          <div class="campo">
            <label class="label">Edad (años)</label>
            <input v-model.number="form.age" type="number" min="0" class="input" />
          </div>
          <div class="campo">
            <label class="label">Peso (kg)</label>
            <input v-model.number="form.weight" type="number" min="0" step="0.1" class="input" />
          </div>
          <div class="check-fila">
            <input type="checkbox" v-model="form.active" id="chk-active" class="check" />
            <label for="chk-active" class="check-label">Mascota activa</label>
          </div>
        </div>
        <div class="botones">
          <button @click="$emit('cerrar')" class="btn-cancelar">Cancelar</button>
          <button @click="guardar" class="btn-actualizar">Actualizar</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { Pet } from '@/types/pet'

const props = defineProps<{ id: number }>()

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const cargando = ref<boolean>(true)
const form = ref<Pet>({} as Pet)

async function cargarMascota(): Promise<void> {
  try {
    const { data, execute } = ApiUseFetch(`mis-mascotas/${props.id}`).get().json()
    await execute()
    form.value = data.value.data as Pet
  } catch (err) {
    console.error('Error al cargar mascota:', err)
  } finally {
    cargando.value = false
  }
}

async function guardar(): Promise<void> {
  try {
    const { execute } = ApiUseFetch(`mis-mascotas/${props.id}`).put(form.value).json()
    await execute()
  } catch (err) {
    console.error('Error al editar:', err)
  } finally {
    // Siempre cierra — el padre recargará la lista al cerrar
    emit('cerrar')
  }
}

onMounted(cargarMascota)
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
.cargando {
  text-align: center;
  color: #94a3b8;
  padding: 24px 0;
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
.check-fila {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
}
.check {
  width: 16px;
  height: 16px;
  accent-color: #1d6bbf;
}
.check-label {
  font-size: 0.875rem;
  color: #374151;
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
.btn-actualizar {
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
.btn-actualizar:hover {
  background: #155fa8;
}
</style>
