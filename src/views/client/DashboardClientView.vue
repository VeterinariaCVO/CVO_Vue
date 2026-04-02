<template>
  <div class="min-h-screen bg-[#f4f9ff] flex flex-col">
    <!-- Hero Banner -->
    <div
      class="w-full h-52 flex items-center justify-center text-white text-center"
      style="
        background:
          linear-gradient(rgba(0, 123, 255, 0.75), rgba(0, 123, 255, 0.75)),
          url('/banner-mascotas.jpg') center/cover;
        border-radius: 0 0 50% 50% / 0 0 10% 10%;
      "
    >
      <div>
        <h1 class="text-4xl font-bold m-0" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)">
          ¡Hola, {{ nombreUsuario }}!
        </h1>
        <p class="text-lg mt-2 font-light m-0">
          Bienvenido a tu panel. Cuidemos juntos de tus mascotas.
        </p>
      </div>
    </div>

    <!-- Contenido principal -->
    <main class="flex-1 px-8 py-10 max-w-6xl mx-auto w-full">
      <!-- Cards de resumen -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <ResumenCard titulo="Mis Mascotas" :valor="totalMascotas" color="azul" />
        <ResumenCard titulo="Citas Pendientes" :valor="totalPendientes" color="amarillo" />
        <ResumenCard titulo="Próxima Cita" :valor="proximaCita" color="verde" />
      </div>

      <!-- Mis Mascotas -->
      <section class="bg-[#e6f3ff] rounded-2xl p-7 shadow-md mb-7">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-xl font-bold text-blue-700 m-0">🐾 Mis Mascotas</h2>
            <p class="text-sm text-blue-500 mt-1 m-0">{{ totalMascotas }} mascotas registradas</p>
          </div>
          <button
            @click="irAMascotas"
            class="bg-white hover:bg-blue-50 text-blue-600 font-semibold text-sm px-5 py-2 rounded-xl border border-blue-200 cursor-pointer transition-colors"
          >
            Ver todas →
          </button>
        </div>
        <MascotasResumen />
      </section>

      <!-- Citas -->
      <section class="bg-white rounded-2xl p-7 shadow-md mb-7 border border-slate-100">
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <!-- Info izquierda -->
          <div class="flex-1">
            <h3 class="text-xl font-bold text-cyan-600 mb-3 m-0">📅 Agendar y Consultar Citas</h3>
            <p class="text-base text-slate-500 mt-2">
              ¿Necesitas una consulta, baño o guardería? Programa tu próxima visita o revisa el
              estado de tus citas.
            </p>
            <!-- Alerta próxima cita -->
            <div
              v-if="proximaCita !== '—'"
              class="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2"
            >
              ⚠️ Tienes una cita pendiente a las <strong>{{ proximaCita }}</strong>
            </div>
            <div
              v-else
              class="mt-4 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl px-4 py-3 text-sm"
            >
              No tienes citas próximas agendadas.
            </div>
          </div>
          <!-- Botones derecha -->
          <div class="w-full md:w-72 flex flex-col gap-3">
            <button
              @click="router.push('/client/agendar')"
              class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl border-none cursor-pointer transition-colors text-base flex items-center justify-center gap-2"
            >
              📆 Programar Nueva Cita
            </button>
            <button
              @click="router.push('/client/citas')"
              class="w-full bg-white hover:bg-blue-50 text-blue-600 font-semibold py-3.5 rounded-xl border-2 border-blue-400 cursor-pointer transition-colors text-base flex items-center justify-center gap-2"
            >
              🗂 Ver Historial de Citas
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-[#018ABE] text-white mt-auto">
      <div class="max-w-6xl mx-auto px-8 py-10">
        <div class="grid grid-cols-3 gap-8 mb-8">
          <!-- Columna 1 -->
          <div>
            <h5 class="font-bold text-lg mb-4">🐾 Veterinaria del Oriente</h5>
            <p class="text-sm text-blue-100">
              Somos un equipo de profesionales comprometidos con el bienestar y la salud de tus
              mascotas.
            </p>
          </div>

          <!-- Columna 2 -->
          <div>
            <h5 class="font-bold text-lg mb-4">Navegación</h5>
            <ul class="list-none p-0 m-0 flex flex-col gap-2">
              <li>
                <button
                  @click="router.push('/client/dashboard')"
                  class="text-blue-100 hover:text-white bg-transparent border-none cursor-pointer text-sm p-0"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  @click="irAMascotas"
                  class="text-blue-100 hover:text-white bg-transparent border-none cursor-pointer text-sm p-0"
                >
                  Mis Mascotas
                </button>
              </li>
              <li>
                <button
                  @click="router.push('/client/citas')"
                  class="text-blue-100 hover:text-white bg-transparent border-none cursor-pointer text-sm p-0"
                >
                  Mis Citas
                </button>
              </li>
              <li>
                <button
                  @click="router.push('/client/agendar')"
                  class="text-blue-100 hover:text-white bg-transparent border-none cursor-pointer text-sm p-0"
                >
                  Agendar Cita
                </button>
              </li>
            </ul>
          </div>

          <!-- Columna 3 -->
          <div>
            <h5 class="font-bold text-lg mb-4">Contacto</h5>
            <p class="text-sm text-blue-100 mb-1">📍 Periférico 9344, Torreón</p>
            <p class="text-sm text-blue-100 mb-1">📞 (123) 456-7890</p>
            <p class="text-sm text-blue-100">🕐 Lun - Sáb: 9:00am - 7:00pm</p>
          </div>
        </div>

        <!-- Línea divisoria -->
        <div class="border-t border-blue-400 pt-6 flex items-center justify-between">
          <p class="text-sm text-blue-200 m-0">
            © 2026 Veterinaria del Oriente. Todos los derechos reservados.
          </p>
          <p class="text-sm text-blue-200 m-0">Hecho con ❤️ para tus mascotas</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

import ResumenCard from '@/components/client/dashboardClient/ResumenCard.vue'
import MascotasResumen from '@/components/client/dashboardClient/MascotasResumen.vue'

const router = useRouter()
const authStore = useAuthStore()

// ── Nombre del usuario logueado ──────────────────────────────────────────────
const nombreUsuario = authStore.user?.name ?? 'Cliente'

// ── Totales para las cards ───────────────────────────────────────────────────
const totalMascotas = ref(0)
const totalPendientes = ref(0)
const proximaCita = ref('—')

// ── Redirige a la vista de mascotas ──────────────────────────────────────────
function irAMascotas() {
  router.push('/client/mascotas')
}

// ── Carga los datos del resumen ──────────────────────────────────────────────
async function cargarDatos() {
  // Total de mascotas
  const { data: datosMascotas, execute: cargarMascotas } = ApiUseFetch('mis-mascotas').get().json()
  await cargarMascotas()
  totalMascotas.value = datosMascotas.value?.data?.length ?? 0

  // Citas pendientes y próxima cita
  const { data: datosCitas, execute: cargarCitas } = ApiUseFetch('appointments').get().json()
  await cargarCitas()
  const todasLasCitas = datosCitas.value?.data ?? []
  const citasPendientes = todasLasCitas.filter(
    (c: any) => c.status === 'pending' || c.status === 'confirmed',
  )
  totalPendientes.value = citasPendientes.length
  proximaCita.value = citasPendientes[0]?.time_slot?.start_time ?? '—'
}

onMounted(cargarDatos)
</script>
