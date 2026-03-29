<template>
  <div class="pagina">
    <div class="header">
      <div>
        <h1 class="titulo">Mis Mascotas</h1>
        <p class="subtitulo">Gestiona las mascotas registradas</p>
      </div>
      <button @click="mostrarRegistro = true" class="btn-primary">+ Registrar Mascota</button>
    </div>

    <p v-if="cargando" class="estado-texto">Cargando mascotas...</p>
    <p v-else-if="mascotas.length === 0" class="estado-texto">No hay mascotas registradas.</p>

    <div v-else class="grid">
      <div v-for="mascota in mascotas" :key="mascota.id" class="tarjeta">
        <div class="tarjeta-header">
          <img v-if="mascota.photo_path" :src="mascota.photo_path" class="foto" />
          <div v-else class="foto-placeholder">🐾</div>
          <div>
            <p class="mascota-nombre">{{ mascota.name }}</p>
            <p class="mascota-especie">{{ mascota.species }}</p>
          </div>
          <span class="badge" :class="mascota.active ? 'badge-verde' : 'badge-gris'">
            {{ mascota.active ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
        <div class="tarjeta-acciones">
          <button @click="verPerfil(mascota)" class="btn-accion btn-ver">👁 Ver</button>
          <button @click="abrirEdicion(mascota)" class="btn-accion btn-editar">✏️ Editar</button>
          <button @click="eliminarMascota(mascota.id)" class="btn-accion btn-eliminar">
            🗑 Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL: VER PERFIL -->
  <div v-if="mostrarPerfil" class="overlay">
    <div class="modal">
      <div class="modal-perfil-header">
        <img
          v-if="mascotaSeleccionada.photo_path"
          :src="mascotaSeleccionada.photo_path"
          class="foto-perfil"
        />
        <div v-else class="foto-perfil-placeholder">🐾</div>
        <h2 class="modal-nombre">{{ mascotaSeleccionada.name }}</h2>
        <span
          class="badge"
          :class="mascotaSeleccionada.sex === 'male' ? 'badge-azul' : 'badge-rosa'"
        >
          {{ mascotaSeleccionada.sex === 'male' ? '♂ Macho' : '♀ Hembra' }}
        </span>
      </div>
      <div class="modal-datos">
        <div class="dato-fila">
          <span class="dato-label">Especie</span
          ><span class="dato-valor">{{ mascotaSeleccionada.species }}</span>
        </div>
        <div class="dato-fila">
          <span class="dato-label">Raza</span
          ><span class="dato-valor">{{ mascotaSeleccionada.breed ?? '—' }}</span>
        </div>
        <div class="dato-fila">
          <span class="dato-label">Color</span
          ><span class="dato-valor">{{ mascotaSeleccionada.color ?? '—' }}</span>
        </div>
        <div class="dato-fila">
          <span class="dato-label">Marcas especiales</span
          ><span class="dato-valor">{{ mascotaSeleccionada.special_marks ?? '—' }}</span>
        </div>
        <div class="dato-fila">
          <span class="dato-label">Edad</span
          ><span class="dato-valor">{{
            mascotaSeleccionada.age != null ? `${mascotaSeleccionada.age} años` : '—'
          }}</span>
        </div>
        <div class="dato-fila">
          <span class="dato-label">Peso</span
          ><span class="dato-valor">{{
            mascotaSeleccionada.weight != null ? `${mascotaSeleccionada.weight} kg` : '—'
          }}</span>
        </div>
        <div class="dato-fila">
          <span class="dato-label">Estado</span>
          <span class="badge" :class="mascotaSeleccionada.active ? 'badge-verde' : 'badge-gris'">
            {{ mascotaSeleccionada.active ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
      </div>
      <button @click="mostrarPerfil = false" class="btn-cerrar">Cerrar</button>
    </div>
  </div>

  <!-- MODAL: REGISTRAR -->
  <RegisterPetModal v-if="mostrarRegistro" @cerrar="cerrarRegistro" @guardado="obtenerMascotas" />

  <!-- MODAL: EDITAR -->
  <EditPetModal
    v-if="mostrarEdicion && mascotaEditarId"
    :id="mascotaEditarId!"
    @cerrar="cerrarEdicion"
    @guardado="obtenerMascotas"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import type { Pet } from '@/types/pet'
import RegisterPetModal from '@/components/client/RegisterPetModal.vue'
import EditPetModal from '@/components/client/EditPetModal.vue'

const mascotas = ref<Pet[]>([])
const cargando = ref<boolean>(true)

const mostrarPerfil = ref<boolean>(false)
const mostrarRegistro = ref<boolean>(false)
const mostrarEdicion = ref<boolean>(false)

const mascotaSeleccionada = ref<Pet>({} as Pet)
const mascotaEditarId = ref<number | null>(null)

async function obtenerMascotas(): Promise<void> {
  cargando.value = true
  try {
    const { data, error, execute } = ApiUseFetch('mis-mascotas').get().json()
    await execute()
    if (error.value) {
      console.error('Error al cargar mascotas:', error.value)
      return
    }
    mascotas.value = data.value.data as Pet[]
  } finally {
    cargando.value = false
  }
}

function verPerfil(mascota: Pet): void {
  mascotaSeleccionada.value = mascota
  mostrarPerfil.value = true
}

function abrirEdicion(mascota: Pet): void {
  mascotaSeleccionada.value = mascota
  mascotaEditarId.value = mascota.id
  mostrarEdicion.value = true
}

// Cierra el modal de registro y siempre recarga la lista
function cerrarRegistro(): void {
  mostrarRegistro.value = false
  obtenerMascotas()
}

// Cierra el modal de edición y siempre recarga la lista
function cerrarEdicion(): void {
  mostrarEdicion.value = false
  obtenerMascotas()
}

async function eliminarMascota(id: number): Promise<void> {
  if (!confirm('¿Seguro que quieres eliminar esta mascota?')) return
  try {
    const { error, execute } = ApiUseFetch(`mis-mascotas/${id}`).delete().json()
    await execute()
    if (error.value) {
      console.error('Error al eliminar:', error.value)
      return
    }
    await obtenerMascotas()
  } catch (err) {
    console.error('Error al eliminar:', err)
  }
}

onMounted(obtenerMascotas)
</script>

<style scoped>
.pagina {
  min-height: 100vh;
  background: #f0f4f8;
  padding: 32px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}
.titulo {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0;
}
.subtitulo {
  font-size: 0.875rem;
  color: #64748b;
  margin: 4px 0 0;
}
.estado-texto {
  text-align: center;
  color: #94a3b8;
  padding: 40px 0;
}
.btn-primary {
  background: #1d6bbf;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #155fa8;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}
.tarjeta {
  background: white;
  border-radius: 16px;
  border: 1px solid #dce6f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: box-shadow 0.2s;
}
.tarjeta:hover {
  box-shadow: 0 4px 16px rgba(29, 107, 191, 0.12);
}
.tarjeta-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.foto {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dce6f0;
  flex-shrink: 0;
}
.foto-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e8f0fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 2px solid #dce6f0;
  flex-shrink: 0;
}
.mascota-nombre {
  font-weight: 700;
  font-size: 1rem;
  color: #1e3a5f;
  margin: 0;
}
.mascota-especie {
  font-size: 0.8rem;
  color: #64748b;
  margin: 2px 0 0;
}
.tarjeta-header .badge {
  margin-left: auto;
}
.tarjeta-acciones {
  display: flex;
  gap: 8px;
  border-top: 1px solid #f0f4f8;
  padding-top: 12px;
}
.btn-accion {
  flex: 1;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 7px 0;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-accion:hover {
  opacity: 0.8;
}
.btn-ver {
  background: #dbeafe;
  color: #1d4ed8;
}
.btn-editar {
  background: #fef9c3;
  color: #854d0e;
}
.btn-eliminar {
  background: #fee2e2;
  color: #b91c1c;
}
.badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}
.badge-azul {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge-rosa {
  background: #fce7f3;
  color: #be185d;
}
.badge-verde {
  background: #d1fae5;
  color: #065f46;
}
.badge-gris {
  background: #f1f5f9;
  color: #64748b;
}
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
.modal-perfil-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}
.foto-perfil {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #dbeafe;
}
.foto-perfil-placeholder {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: #e8f0fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  border: 3px solid #dbeafe;
}
.modal-nombre {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0;
}
.modal-datos {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
.dato-fila {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f4f8;
}
.dato-fila:last-child {
  border-bottom: none;
}
.dato-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}
.dato-valor {
  font-size: 0.875rem;
  color: #1e3a5f;
  font-weight: 500;
}
.btn-cerrar {
  width: 100%;
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
.btn-cerrar:hover {
  background: #dbeafe;
}
</style>
