<template>
  <div class="pagina">
    <!-- Encabezado -->
    <div class="header">
      <h1 class="titulo">Bienvenido, {{ nombreUsuario }} 👋</h1>
      <p class="subtitulo">Aquí puedes ver toda la información de tu cuenta</p>
    </div>

    <!-- Cards de resumen -->
    <div class="cards-grid">
      <ResumenCard titulo="Mis Mascotas" :valor="totalMascotas" color="azul" />
      <ResumenCard titulo="Citas Pendientes" :valor="totalPendientes" color="amarillo" />
      <ResumenCard titulo="Próxima Cita" :valor="proximaCita" color="verde" />
    </div>

    <!-- Mascotas y Citas lado a lado -->
    <div class="secciones-grid">
      <!-- Mis Mascotas -->
      <div class="seccion">
        <div class="seccion-header">
          <h2 class="seccion-titulo">🐾 Mis Mascotas</h2>
          <button @click="irAMascotas" class="btn-ver-todo">Ver todas</button>
        </div>
        <MascotasResumen />
      </div>

      <!-- Mis Citas -->
      <div class="seccion">
        <div class="seccion-header">
          <h2 class="seccion-titulo">📅 Mis Citas</h2>
          <button @click="mostrarAgendar = true" class="btn-ver-todo">+ Agendar Cita</button>
        </div>
        <CitasResumen ref="citasRef" @actualizar="cargarDatos" />
      </div>
    </div>

    <!-- Servicios e Historial -->
    <div class="secciones">
      <!-- Catálogo de Servicios -->
      <div class="seccion">
        <div class="seccion-header">
          <h2 class="seccion-titulo">🏥 Servicios Disponibles</h2>
        </div>
        <ServiciosResumen />
      </div>
    </div>

    <!-- Modal Agendar Cita -->
    <AgendarCitaModal
      v-if="mostrarAgendar"
      @cerrar="mostrarAgendar = false"
      @guardado="cargarDatos"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

import ResumenCard from '@/components/client/dashboardClient/ResumenCard.vue'
import CitasResumen from '@/components/client/dashboardClient/CitasResumen.vue'
import AgendarCitaModal from '@/components/client/dashboardClient/AgendarCitaView.vue'
import MascotasResumen from '@/components/client/dashboardClient/MascotasResumen.vue'
import ServiciosResumen from '@/components/client/dashboardClient/ServiciosResumen.vue'

const router = useRouter()
const authStore = useAuthStore()

// ── Nombre del usuario logueado ──────────────────────────────────────────────
const nombreUsuario = authStore.user?.name ?? 'Cliente'

// ── Datos de resumen ─────────────────────────────────────────────────────────
const totalMascotas = ref(0)
const totalPendientes = ref(0)
const proximaCita = ref('—')
const mostrarAgendar = ref(false)

// ── Referencia al componente de citas para recargarlo ────────────────────────
const citasRef = ref()

// ── Redirige a la vista de mascotas ──────────────────────────────────────────
function irAMascotas() {
  router.push('/client/mascotas')
}

// ── Carga los datos del resumen y recarga los componentes hijos ──────────────
async function cargarDatos() {
  // Mascotas
  const { data: dataMascotas, execute: execMascotas } = ApiUseFetch('mis-mascotas').get().json()
  await execMascotas()
  totalMascotas.value = dataMascotas.value?.data?.length ?? 0

  // Citas
  const { data: dataCitas, execute: execCitas } = ApiUseFetch('appointments').get().json()
  await execCitas()
  const citas = dataCitas.value?.data ?? []
  const pendientes = citas.filter((c: any) => c.status === 'pending' || c.status === 'confirmed')
  totalPendientes.value = pendientes.length
  proximaCita.value = pendientes[0]?.time_slot?.start_time ?? '—'

  // Recarga la lista de citas del componente hijo
  citasRef.value?.cargar()
}

onMounted(cargarDatos)
</script>

<style scoped>
.pagina {
  min-height: 100vh;
  background: #f0f4f8;
  padding: 32px;
}
.header {
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

/* ── Cards de resumen ───────────────────────────────────────────────────────── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* ← siempre 3 columnas iguales */
  gap: 16px;
  margin-bottom: 32px;
}

/* ── Secciones ──────────────────────────────────────────────────────────────── */
.secciones-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 28px;
}
.seccion {
  background: white;
  border-radius: 16px;
  border: 1px solid #dce6f0;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
}
.seccion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.seccion-titulo {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0;
}
.btn-ver-todo {
  background: #e8f0fa;
  color: #1d6bbf;
  font-weight: 600;
  font-size: 0.8rem;
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-ver-todo:hover {
  background: #dbeafe;
}
.agendar-wrap {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 32px;
  margin-top: 12px;
}
.btn-agendar {
  background: #1d6bbf;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-agendar:hover {
  background: #155fa8;
}
</style>
