<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'
import { getStorageUrl } from '@/utils/storageUrl'

// Componentes y Vistas
import RegisterPetModal from '@/components/client/RegisterPetModal.vue'
import CreateAppointmentView from '@/views/client/CreateAppointmentView.vue'

const router = useRouter()
const authStore = useAuthStore()

// Estados de Datos
const nombreUsuario = authStore.user?.name ?? 'Invitado'
const totalMascotas = ref(0)
const totalPendientes = ref(0)
const proximaCita = ref('—')
const mascotas = ref<any[]>([])
const servicios = ref<any[]>([])
const cargandoMascotas = ref(true)

// Estados de Control de Modales
const mostrarModalServicios = ref(false)
const mostrarModalCita = ref(false)
const mostrarModalMascota = ref(false)

function petPhotoUrl(path?: string | null) {
  return getStorageUrl(path)
}

const serviciosPreview = computed(() => servicios.value.slice(0, 3))

async function cargarDatos() {
  cargandoMascotas.value = true
  try {
    // 1. Cargar Mascotas
    const { data: datosMascotas, execute: execMascotas } = ApiUseFetch('mis-mascotas').get().json()
    await execMascotas()
    mascotas.value = datosMascotas.value?.data ?? []
    totalMascotas.value = mascotas.value.length

    // 2. Cargar Citas
    const { data: datosCitas, execute: execCitas } = ApiUseFetch('appointments').get().json()
    await execCitas()
    const todas = datosCitas.value?.data ?? []
    const pendientes = todas.filter((c: any) => c.status === 'pending' || c.status === 'confirmed')
    totalPendientes.value = pendientes.length

    if (pendientes.length > 0) {
      proximaCita.value = pendientes[0]?.time_slot?.start_time ?? '—'
    } else {
      proximaCita.value = '—'
    }

    // 3. Cargar Servicios
    const { data: datosServicios, execute: execServicios } = ApiUseFetch('services').get().json()
    await execServicios()
    servicios.value = datosServicios.value?.data ?? []
  } catch (error) {
    console.error('Error cargando dashboard:', error)
  } finally {
    cargandoMascotas.value = false
  }
}

function refrescarYcerrar() {
  mostrarModalCita.value = false
  mostrarModalMascota.value = false
  cargarDatos()
}

onMounted(cargarDatos)
</script>

<template>
  <div
    class="min-h-screen bg-[#f4f7ff] flex flex-col font-sans antialiased selection:bg-blue-100 italic"
  >
    <main class="w-full max-w-[1400px] mx-auto px-6 py-8 md:px-10 md:py-12 space-y-12 flex-1">
      <section class="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/10">
        <div
          class="absolute inset-0 bg-gradient-to-br from-[#004299] via-[#0056c2] to-[#06b6d4]"
        ></div>
        <div
          class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
        ></div>

        <div
          class="relative z-10 p-8 md:p-14 flex flex-col lg:flex-row items-center justify-between gap-10"
        >
          <div class="space-y-6 text-center lg:text-left">
            <div
              class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full"
            >
              <p
                class="text-white text-[10px] font-black uppercase tracking-[0.2em] m-0 text-cyan-300"
              >
                Portal de Bienestar
              </p>
            </div>
            <h1
              class="text-white font-black text-5xl md:text-6xl tracking-tighter m-0 uppercase leading-none"
            >
              ¡Hola, <span class="text-cyan-300">{{ nombreUsuario }}</span
              >!
            </h1>
            <p class="text-blue-50 text-lg max-w-xl leading-relaxed m-0 font-medium opacity-90">
              Tu confianza es nuestro motor. Aquí tienes un resumen del cuidado de tus mejores
              amigos.
            </p>
          </div>

          <div class="flex gap-4 md:gap-6">
            <div
              class="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 text-center border border-white/20 shadow-xl"
            >
              <p class="text-5xl font-black text-white m-0 tracking-tighter">{{ totalMascotas }}</p>
              <p class="text-cyan-200 text-[10px] mt-2 m-0 font-black uppercase tracking-widest">
                Mascotas
              </p>
            </div>
            <div
              class="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 text-center border border-white/20 shadow-xl"
            >
              <p class="text-5xl font-black text-white m-0 tracking-tighter">
                {{ totalPendientes }}
              </p>
              <p class="text-cyan-200 text-[10px] mt-2 m-0 font-black uppercase tracking-widest">
                Citas
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div
          class="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-8 px-2 gap-4"
        >
          <div>
            <h2 class="text-3xl font-black text-slate-800 m-0 uppercase tracking-tighter">
              Mis Consentidos
            </h2>
            <div class="h-1.5 w-20 bg-[#0056c2] rounded-full mt-2"></div>
          </div>

          <div class="flex gap-3">
            <button
              @click="mostrarModalMascota = true"
              class="bg-[#0056c2] text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-2xl shadow-xl border-none cursor-pointer hover:bg-[#004299] transition-all"
            >
              + Registrar Mascota
            </button>
            <button
              @click="router.push('/client/mascotas')"
              class="bg-white hover:bg-slate-50 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-2xl shadow-sm border border-slate-100 transition-all cursor-pointer"
            >
              Ver Galería
            </button>
          </div>
        </div>

        <div class="bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-50">
          <div v-if="cargandoMascotas" class="flex flex-col items-center py-12">
            <div
              class="w-10 h-10 border-4 border-blue-100 border-t-[#0056c2] rounded-full animate-spin"
            ></div>
          </div>

          <div v-else class="overflow-x-auto pb-4 custom-scrollbar">
            <div class="flex gap-6" style="min-width: max-content">
              <div
                v-for="mascota in mascotas"
                :key="mascota.id"
                class="flex flex-col items-center p-6 rounded-[2rem] bg-[#f8faff] border border-blue-50 w-48 transition-all hover:bg-white hover:shadow-2xl"
              >
                <img
                  v-if="mascota.photo_url"
                  :src="petPhotoUrl(mascota.photo_url)"
                  class="w-24 h-24 rounded-[2rem] object-cover shadow-lg"
                />
                <div
                  v-else
                  class="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center font-black text-slate-300"
                >
                  PET
                </div>
                <div class="text-center mt-5">
                  <p class="font-black text-slate-800 text-sm m-0 uppercase tracking-tight">
                    {{ mascota.name }}
                  </p>
                  <p
                    class="text-[#0056c2] text-[9px] font-black mt-1 m-0 uppercase tracking-widest opacity-60"
                  >
                    {{ mascota.species }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section
          class="lg:col-span-7 bg-white rounded-[2.5rem] shadow-xl border border-slate-50 overflow-hidden flex flex-col"
        >
          <div class="p-10 space-y-6 flex-1">
            <span
              class="px-4 py-2 bg-blue-50 text-[#0056c2] rounded-xl font-black text-[9px] tracking-widest uppercase"
              >Próxima Consulta</span
            >
            <h2
              class="text-4xl font-black text-slate-800 m-0 tracking-tighter uppercase leading-none"
            >
              Calendario Clínico
            </h2>

            <div
              class="p-8 bg-slate-50 rounded-[2rem] border border-blue-100 flex items-center gap-6"
            >
              <div
                class="w-12 h-12 bg-[#0056c2] rounded-2xl flex items-center justify-center text-white font-black italic"
              >
                !
              </div>
              <div>
                <p class="text-slate-400 font-black text-[10px] uppercase tracking-widest m-0">
                  Hora Agendada
                </p>
                <p class="text-slate-800 font-black text-xl m-0 uppercase tracking-tighter">
                  {{ proximaCita }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-slate-50 p-6 flex gap-4">
            <button
              @click="mostrarModalCita = true"
              class="flex-1 bg-[#0056c2] text-white font-black uppercase text-[10px] py-5 rounded-2xl border-none cursor-pointer tracking-widest hover:bg-[#004299] transition-all shadow-lg"
            >
              Programar Nueva Cita
            </button>
            <button
              @click="router.push('/client/citas')"
              class="flex-1 bg-white text-slate-700 border border-slate-200 font-black uppercase text-[10px] py-5 rounded-2xl cursor-pointer hover:bg-slate-50"
            >
              Historial
            </button>
          </div>
        </section>

        <section
          class="lg:col-span-5 bg-[#0056c2] rounded-[2.5rem] p-10 shadow-xl flex flex-col text-white"
        >
          <h2 class="text-3xl font-black m-0 uppercase tracking-tighter">Servicios</h2>
          <div class="space-y-3 mt-8 flex-1">
            <div
              v-for="servicio in serviciosPreview"
              :key="servicio.id"
              class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <p class="font-black text-sm m-0 uppercase">{{ servicio.name }}</p>
              <p class="text-cyan-300 text-[10px] m-0 font-black">${{ servicio.price }} MXN</p>
            </div>
          </div>
          <button
            @click="mostrarModalServicios = true"
            class="w-full mt-8 py-5 rounded-2xl font-black text-[10px] uppercase bg-white text-[#0056c2] border-none cursor-pointer hover:bg-cyan-50"
          >
            Ver Todo
          </button>
        </section>
      </div>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-50">
          <span
            class="px-4 py-2 bg-blue-50 text-[#0056c2] rounded-xl font-black text-[9px] uppercase tracking-widest"
            >Nuestra Sede</span
          >
          <h2 class="text-3xl font-black text-slate-800 uppercase mt-6 mb-4 italic">
            Santuario Oriente
          </h2>
          <p class="text-slate-500 font-medium leading-relaxed m-0">
            Líderes en medicina animal avanzada. Ubicados estratégicamente en Torreón Coahuila.
          </p>
          <div class="grid grid-cols-2 gap-4 mt-8">
            <div class="p-4 bg-slate-50 rounded-2xl">
              <p class="text-[9px] font-black text-slate-400 uppercase m-0">Teléfono</p>
              <p class="text-slate-700 font-black text-xs m-0">871 123 4567</p>
            </div>
            <div class="p-4 bg-slate-50 rounded-2xl">
              <p class="text-[9px] font-black text-slate-400 uppercase m-0">Horarios</p>
              <p class="text-slate-700 font-black text-xs m-0">L-S: 9:00 - 19:00</p>
            </div>
          </div>
        </div>
        <div class="rounded-[2.5rem] overflow-hidden shadow-2xl h-[350px] border-4 border-white">
          <iframe
            width="100%"
            height="100%"
            style="border: 0"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Periférico+9344+Torreón+Coahuila&output=embed"
          ></iframe>
        </div>
      </section>
    </main>

    <footer class="bg-slate-900 text-white pt-16 pb-8">
      <div class="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div class="col-span-1 md:col-span-2 space-y-4">
          <h3 class="text-2xl font-black uppercase text-cyan-400 m-0 italic">
            Veterinaria del Oriente
          </h3>
          <p class="text-slate-400 max-w-sm font-medium m-0">
            Cuidando de los que no tienen voz con la tecnología más avanzada de la Comarca Lagunera.
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <h4 class="text-[10px] font-black uppercase text-slate-500 mb-2">Secciones</h4>
          <button
            @click="router.push('/client/dashboard')"
            class="text-left text-sm font-black text-slate-300 bg-transparent border-none cursor-pointer uppercase hover:text-cyan-400 transition-colors"
          >
            Dashboard
          </button>
          <button
            @click="router.push('/client/mascotas')"
            class="text-left text-sm font-black text-slate-300 bg-transparent border-none cursor-pointer uppercase hover:text-cyan-400 transition-colors"
          >
            Mis Mascotas
          </button>
          <button
            @click="router.push('/client/citas')"
            class="text-left text-sm font-black text-slate-300 bg-transparent border-none cursor-pointer uppercase hover:text-cyan-400 transition-colors"
          >
            Mis Citas
          </button>
        </div>
        <div>
          <h4 class="text-[10px] font-black uppercase text-slate-500 mb-2">Contacto</h4>
          <p class="text-slate-300 text-sm font-black italic m-0">Emergencias 24/7</p>
          <p class="text-slate-400 text-xs m-0">contacto@santuario.com</p>
        </div>
      </div>
      <div class="border-t border-white/5 pt-8 text-center">
        <p class="text-[10px] font-black uppercase text-slate-600 tracking-[0.5em]">
          © 2026 El Santuario Clínico.
        </p>
      </div>
    </footer>

    <Transition name="fade">
      <div
        v-if="mostrarModalCita"
        class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-6"
      >
        <div
          class="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto relative no-scrollbar shadow-2xl"
        >
          <button
            @click="mostrarModalCita = false"
            class="absolute top-6 right-6 w-12 h-12 bg-slate-100 rounded-full border-none cursor-pointer font-black z-[1001] flex items-center justify-center hover:bg-red-50 transition-colors"
          >
            ✕
          </button>
          <CreateAppointmentView @cerrar="refrescarYcerrar" @guardado="refrescarYcerrar" />
        </div>
      </div>
    </Transition>

    <RegisterPetModal
      v-if="mostrarModalMascota"
      @cerrar="refrescarYcerrar"
      @guardado="refrescarYcerrar"
    />

    <Transition name="fade">
      <div
        v-if="mostrarModalServicios"
        class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-6"
      >
        <div
          class="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        >
          <div class="p-10 bg-[#0056c2] text-white flex items-center justify-between">
            <h2 class="text-4xl font-black m-0 uppercase italic">Servicios</h2>
            <button
              @click="mostrarModalServicios = false"
              class="bg-transparent text-white border-none cursor-pointer text-2xl font-black"
            >
              ✕
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="servicio in servicios"
                :key="servicio.id"
                class="p-6 bg-slate-50 rounded-[2rem] border border-slate-100"
              >
                <h3 class="text-slate-800 font-black uppercase m-0 text-sm italic">
                  {{ servicio.name }}
                </h3>
                <span class="text-lg font-black text-[#0056c2]">${{ servicio.price }} MXN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
