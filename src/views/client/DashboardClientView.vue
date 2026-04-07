<template>
  <div class="min-h-screen bg-[#f0f4ff] flex flex-col font-sans antialiased">
    <main class="w-full max-w-[1600px] mx-auto px-10 py-10 space-y-10 flex-1">
      <!-- 1. Hero -->
      <section
        class="relative rounded-3xl overflow-hidden p-10"
        style="
          background:
            linear-gradient(
              135deg,
              rgba(0, 86, 194, 0.85) 0%,
              rgba(59, 130, 246, 0.75) 50%,
              rgba(6, 182, 212, 0.85) 100%
            ),
            url('/banner-mascotas.jpg') center/cover;
        "
      >
        <div
          class="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4"
        ></div>
        <div
          class="absolute bottom-0 left-1/4 w-56 h-56 bg-white/10 rounded-full translate-y-1/2"
        ></div>
        <div class="relative z-10 flex items-center justify-between gap-8">
          <div class="space-y-4">
            <p class="text-blue-200 text-xs font-bold uppercase tracking-[0.2em] m-0">
              Panel del Cliente
            </p>
            <h1 class="text-white font-bold text-4xl md:text-5xl tracking-tight m-0">
              ¡Hola, {{ nombreUsuario }}! 👋
            </h1>
            <p class="text-blue-100/90 text-base max-w-md leading-relaxed m-0">
              Bienvenido de nuevo. La salud de tus mejores amigos es nuestra prioridad absoluta.
            </p>
          </div>
          <div class="hidden md:flex gap-4">
            <div
              class="bg-white/20 backdrop-blur-md rounded-2xl px-8 py-5 text-center border border-white/20"
            >
              <p class="text-4xl font-bold text-white m-0">{{ totalMascotas }}</p>
              <p class="text-blue-100 text-xs mt-1 m-0 font-medium">Mascotas</p>
            </div>
            <div
              class="bg-white/20 backdrop-blur-md rounded-2xl px-8 py-5 text-center border border-white/20"
            >
              <p class="text-4xl font-bold text-white m-0">
                {{ String(totalPendientes).padStart(2, '0') }}
              </p>
              <p class="text-blue-100 text-xs mt-1 m-0 font-medium">Citas Pendientes</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Mis Mascotas -->
      <section>
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 m-0">Mis Mascotas</h2>
            <p class="text-slate-400 text-sm mt-1 m-0">{{ totalMascotas }} mascotas registradas</p>
          </div>
          <button
            @click="router.push('/client/mascotas')"
            class="bg-[#0056c2] hover:bg-[#004baa] text-white font-semibold text-sm px-5 py-2.5 rounded-xl border-none cursor-pointer transition-colors shadow-sm"
          >
            Ver todas
          </button>
        </div>
        <div class="bg-white rounded-3xl border border-blue-100 shadow-sm p-6">
          <p v-if="cargandoMascotas" class="text-center text-slate-400 py-8">
            Cargando mascotas...
          </p>
          <p v-else-if="mascotas.length === 0" class="text-center text-slate-400 py-8">
            No hay mascotas registradas.
          </p>
          <div v-else class="overflow-x-auto pb-2">
            <div class="flex gap-4" style="min-width: max-content">
              <div
                v-for="mascota in mascotas"
                :key="mascota.id"
                class="flex flex-col items-center gap-3 p-5 rounded-2xl border border-blue-100 bg-blue-50 w-44 flex-shrink-0"
              >
                <img
                  v-if="mascota.photo_url"
                  :src="mascota.photo_url"
                  class="w-20 h-20 rounded-full object-cover shadow-md ring-4 ring-white"
                />
                <div
                  v-else
                  class="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl shadow-md ring-4 ring-white"
                >
                  🐾
                </div>
                <div class="text-center">
                  <p class="font-bold text-slate-800 text-sm m-0">{{ mascota.name }}</p>
                  <p class="text-slate-500 text-xs mt-0.5 m-0">{{ mascota.species }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Gestión de Citas -->
      <section class="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
        <div class="flex flex-col lg:flex-row">
          <div class="flex-1 p-10 space-y-5">
            <div
              class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-[#0056c2] rounded-full font-bold text-[10px] tracking-widest uppercase"
            >
              Gestión de Citas
            </div>
            <h2 class="text-3xl font-bold text-slate-800 m-0">Próxima visita clínica</h2>
            <p class="text-slate-500 text-base leading-relaxed m-0">
              Recuerda que la prevención es la mejor medicina. Mantén el calendario de tus mascotas
              al día.
            </p>
            <div
              v-if="proximaCita !== '—'"
              class="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border-l-4 border-[#0056c2]"
            >
              <div>
                <p class="text-slate-800 font-bold text-sm m-0">Cita pendiente</p>
                <p class="text-slate-500 text-xs mt-0.5 m-0">{{ proximaCita }}</p>
              </div>
            </div>
            <div v-else class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <p class="text-slate-400 text-sm m-0">No tienes citas próximas agendadas.</p>
            </div>
          </div>
          <div
            class="lg:w-72 p-8 flex flex-col gap-4 justify-center border-t lg:border-t-0 lg:border-l border-blue-50 bg-gradient-to-br from-[#f0f4ff] to-[#e8f4ff]"
          >
            <button
              @click="router.push('/client/agendar')"
              class="w-full text-white font-bold py-4 rounded-2xl border-none cursor-pointer transition-all text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 bg-gradient-to-br from-[#0056c2] to-[#3b82f6]"
            >
              Programar Cita
            </button>
            <button
              @click="router.push('/client/citas')"
              class="w-full bg-white hover:bg-blue-50 text-slate-700 font-bold py-4 rounded-2xl border border-blue-200 cursor-pointer transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              Ver mis Citas
            </button>
          </div>
        </div>
      </section>

      <!-- 4. Quiénes somos + Servicios -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Quiénes somos -->
        <div
          class="rounded-3xl p-10 flex flex-col justify-between gap-6 bg-gradient-to-br from-[#0056c2] to-[#06b6d4]"
        >
          <div class="space-y-4">
            <span
              class="inline-block px-4 py-1.5 bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-full"
              >Nuestra Clínica</span
            >
            <h2 class="text-3xl font-bold text-white m-0">¿Quiénes somos?</h2>
            <p class="text-blue-100 text-base leading-relaxed m-0">
              En Veterinaria del Oriente somos un equipo de profesionales comprometidos con el
              bienestar y salud de tus mascotas. Brindamos atención médica integral, ética y de
              calidad en un ambiente cálido y de confianza.
            </p>
            <p class="text-blue-100 text-base leading-relaxed m-0">
              Creemos que cada animal es un miembro importante de la familia.
            </p>
          </div>
          <div class="flex items-center gap-3 bg-white/15 rounded-2xl px-5 py-4">
            <div>
              <p class="text-white font-bold text-sm m-0">📍 Periférico 9344, Torreón</p>
              <p class="text-blue-100 text-xs m-0">Lun - Sáb: 9:00am - 7:00pm</p>
            </div>
            <div class="rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
              <iframe
                width="100%"
                height="200"
                style="border: 0"
                loading="lazy"
                allowfullscreen
                referrerpolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=Periférico+9344+Torreón+Coahuila&output=embed"
              />
            </div>
          </div>
        </div>

        <!-- Servicios -->
        <div class="bg-white rounded-3xl border border-blue-100 shadow-sm p-8 flex flex-col gap-5">
          <div>
            <span
              class="inline-block px-4 py-1.5 bg-blue-50 text-[#0056c2] text-[10px] font-bold uppercase tracking-widest rounded-full"
              >Servicios</span
            >
            <h2 class="text-2xl font-bold text-slate-800 mt-3 m-0">Lo que ofrecemos</h2>
            <p class="text-slate-400 text-sm mt-1 m-0">
              Conoce todos nuestros servicios disponibles
            </p>
          </div>
          <div class="flex flex-col gap-3">
            <p v-if="cargandoServicios" class="text-center text-slate-400 py-4 text-sm">
              Cargando servicios...
            </p>
            <div
              v-else
              v-for="servicio in serviciosPreview"
              :key="servicio.id"
              class="flex items-center justify-between p-3 rounded-xl bg-slate-50"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg flex-shrink-0"
                >
                  🩺
                </div>
                <div>
                  <p class="text-slate-800 font-semibold text-sm m-0">{{ servicio.name }}</p>
                  <p class="text-slate-400 text-xs m-0">
                    {{ servicio.description?.slice(0, 35) ?? '—' }}...
                  </p>
                </div>
              </div>
              <span class="text-[#0056c2] font-bold text-sm">${{ servicio.price }}</span>
            </div>
          </div>
          <button
            @click="mostrarModalServicios = true"
            class="w-full mt-auto py-3 rounded-2xl font-bold text-sm border-none cursor-pointer transition-all text-white shadow-sm bg-gradient-to-br from-[#0056c2] to-[#3b82f6]"
          >
            Ver todos los servicios
          </button>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-100 mt-10">
      <div class="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div class="col-span-2 md:col-span-1 space-y-3">
          <div class="text-base font-bold text-slate-900">Veterinaria del Oriente</div>
          <p class="text-slate-400 text-sm leading-relaxed m-0">
            Expertos en el cuidado integral de tus mascotas.
          </p>
        </div>
        <div class="space-y-3">
          <h4 class="text-[10px] font-bold text-slate-600 uppercase tracking-widest m-0">
            Clínica
          </h4>
          <ul class="space-y-2 list-none p-0 m-0">
            <li>
              <a href="#" class="text-slate-400 hover:text-[#0056c2] text-sm transition-colors"
                >Ubicación</a
              >
            </li>
            <li>
              <a href="#" class="text-slate-400 hover:text-[#0056c2] text-sm transition-colors"
                >Urgencias</a
              >
            </li>
            <li>
              <a href="#" class="text-slate-400 hover:text-[#0056c2] text-sm transition-colors"
                >Contacto</a
              >
            </li>
          </ul>
        </div>
        <div class="space-y-3">
          <h4 class="text-[10px] font-bold text-slate-600 uppercase tracking-widest m-0">Legal</h4>
          <ul class="space-y-2 list-none p-0 m-0">
            <li>
              <a href="#" class="text-slate-400 hover:text-[#0056c2] text-sm transition-colors"
                >Privacidad</a
              >
            </li>
            <li>
              <a href="#" class="text-slate-400 hover:text-[#0056c2] text-sm transition-colors"
                >Términos</a
              >
            </li>
          </ul>
        </div>
        <div class="space-y-3">
          <h4 class="text-[10px] font-bold text-slate-600 uppercase tracking-widest m-0">
            Horarios
          </h4>
          <p class="text-slate-400 text-sm m-0">
            Lun - Vie: 8am - 8pm<br />Sáb: 9am - 4pm<br />Emergencias 24/7
          </p>
        </div>
      </div>
      <div
        class="border-t border-slate-100 py-5 text-center text-slate-300 text-[10px] uppercase tracking-widest"
      >
        © 2026 Veterinaria del Oriente. El Santuario Clínico.
      </div>
    </footer>

    <!-- MODAL: Todos los servicios -->
    <div
      v-if="mostrarModalServicios"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div
          class="p-7 border-b border-slate-100 flex items-center justify-between bg-gradient-to-br from-[#0056c2] to-[#3b82f6]"
        >
          <div>
            <h2 class="text-white font-bold text-2xl m-0">Servicios Disponibles</h2>
            <p class="text-blue-100 text-sm mt-1 m-0">Todos nuestros servicios para tu mascota</p>
          </div>
          <button
            @click="mostrarModalServicios = false"
            class="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white border-none cursor-pointer flex items-center justify-center text-xl transition-colors"
          >
            ✕
          </button>
        </div>
        <div class="overflow-y-auto flex-1 p-7">
          <p v-if="cargandoServicios" class="text-center text-slate-400 py-8">
            Cargando servicios...
          </p>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="servicio in servicios"
              :key="servicio.id"
              class="rounded-2xl p-5 border border-blue-100 bg-blue-50 flex flex-col gap-3"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
                >
                  🩺
                </div>
                <div>
                  <p class="font-bold text-slate-800 text-base m-0">{{ servicio.name }}</p>
                  <p class="text-[#0056c2] font-bold text-sm m-0">${{ servicio.price }}</p>
                </div>
              </div>
              <p class="text-slate-500 text-sm leading-relaxed m-0">
                {{ servicio.description ?? 'Sin descripción disponible.' }}
              </p>
            </div>
          </div>
        </div>
        <div class="p-5 border-t border-slate-100 bg-slate-50">
          <button
            @click="mostrarModalServicios = false"
            class="w-full py-3 rounded-2xl font-bold text-sm bg-slate-200 hover:bg-slate-300 text-slate-600 border-none cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const router = useRouter()
const authStore = useAuthStore()

const nombreUsuario = authStore.user?.name ?? 'Cliente'
const totalMascotas = ref(0)
const totalPendientes = ref(0)
const proximaCita = ref('—')
const mascotas = ref<any[]>([])
const servicios = ref<any[]>([])
const cargandoMascotas = ref(true)
const cargandoServicios = ref(true)
const mostrarModalServicios = ref(false)

const serviciosPreview = computed(() => servicios.value.slice(0, 3))

async function cargarDatos() {
  const { data: datosMascotas, execute: execMascotas } = ApiUseFetch('mis-mascotas').get().json()
  await execMascotas()
  mascotas.value = datosMascotas.value?.data ?? []
  totalMascotas.value = mascotas.value.length
  cargandoMascotas.value = false

  const { data: datosCitas, execute: execCitas } = ApiUseFetch('appointments').get().json()
  await execCitas()
  const todas = datosCitas.value?.data ?? []
  const pendientes = todas.filter((c: any) => c.status === 'pending' || c.status === 'confirmed')
  totalPendientes.value = pendientes.length
  proximaCita.value = pendientes[0]?.time_slot?.start_time ?? '—'

  const { data: datosServicios, execute: execServicios } = ApiUseFetch('services').get().json()
  await execServicios()
  servicios.value = datosServicios.value?.data ?? []
  cargandoServicios.value = false
}

onMounted(cargarDatos)
</script>
