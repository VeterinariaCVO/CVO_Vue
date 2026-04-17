<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardado'): void
}>()

const mascotas = ref<any[]>([])
const servicios = ref<any[]>([])
const slots = ref<any[]>([])

const mascotaId = ref<number | null>(null)
const servicioId = ref<number | null>(null)
const slotId = ref<number | null>(null)
const fechaSeleccionada = ref('')
const notas = ref('')

const cargandoSlots = ref(false)
const enviando = ref(false)
const errorMsg = ref('')
const exitoso = ref(false)

async function cargarMascotas() {
  const { data, execute } = ApiUseFetch('/mis-mascotas').get().json()
  await execute()
  mascotas.value = data.value?.data ?? []
}

async function cargarServicios() {
  const { data, execute } = ApiUseFetch('/services').get().json()
  await execute()
  servicios.value = data.value?.data ?? []
}

async function cargarSlots() {
  if (!fechaSeleccionada.value) return
  cargandoSlots.value = true
  slots.value = []
  slotId.value = null

  const fecha = fechaSeleccionada.value
  const [year, month] = fecha.split('-').map(Number)

  const { data, execute } = ApiUseFetch(`working-days?year=${year}&month=${month}`).get().json()
  await execute()

  const days = Array.isArray(data.value) ? data.value : (data.value?.data ?? [])
  const wd = days.find((d: any) => d.date === fecha)

  if (!wd || !wd.is_open) {
    cargandoSlots.value = false
    return
  }

  slots.value = (wd.time_slots ?? []).filter((s: any) => s.status === 'available' && s.is_open)
  cargandoSlots.value = false
}

watch(fechaSeleccionada, () => cargarSlots())

async function agendar() {
  if (enviando.value || exitoso.value) return
  errorMsg.value = ''

  if (!mascotaId.value || !servicioId.value || !slotId.value) {
    errorMsg.value = 'Por favor, selecciona mascota, servicio y horario.'
    return
  }

  enviando.value = true
  try {
    const {
      data,
      error: fetchError,
      execute,
    } = ApiUseFetch('/cliente/appointments')
      .post({
        pet_id: mascotaId.value,
        service_id: servicioId.value,
        time_slot_id: slotId.value,
        notes: notas.value,
      })
      .json()

    await execute()

    if (fetchError.value || !data.value?.success) {
      errorMsg.value = data.value?.message ?? 'No pudimos agendar. Intenta otro horario.'
      return
    }

    exitoso.value = true
    setTimeout(() => emit('guardado'), 2000)
  } catch {
    errorMsg.value = 'Error de conexión. Intenta de nuevo.'
  } finally {
    enviando.value = false
  }
}

onMounted(() => {
  cargarMascotas()
  cargarServicios()
})
</script>

<template>
  <div
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    @click.self="!enviando && emit('cerrar')"
  >
    <div
      class="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
    >
      <div class="p-8 bg-[#0056c2] text-white flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter m-0">Nueva Cita</h2>
          <p class="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1 m-0 opacity-80">
            Reserva su lugar
          </p>
        </div>
        <button
          v-if="!exitoso"
          @click="emit('cerrar')"
          class="bg-white/10 hover:bg-white/20 border-none rounded-xl p-2 text-white cursor-pointer transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-width="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div
          v-if="exitoso"
          class="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-300"
        >
          <div
            class="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner"
          >
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-2xl font-black italic uppercase text-slate-800 m-0">¡Todo listo!</h3>
          <p class="text-slate-500 font-medium mt-2">Hemos registrado la cita de tu mejor amigo.</p>
        </div>

        <div v-else class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2"
                >¿Quién nos visita?</label
              >
              <select
                v-model="mascotaId"
                :disabled="enviando"
                class="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-700 font-bold focus:border-[#0056c2] focus:bg-white outline-none transition-all appearance-none cursor-pointer"
              >
                <option :value="null" disabled>Selecciona mascota</option>
                <option v-for="m in mascotas" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2"
                >¿Qué servicio requiere?</label
              >
              <select
                v-model="servicioId"
                :disabled="enviando"
                class="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-700 font-bold focus:border-[#0056c2] focus:bg-white outline-none transition-all appearance-none cursor-pointer"
              >
                <option :value="null" disabled>Tipo de consulta</option>
                <option v-for="s in servicios" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2"
              >Selecciona el día</label
            >
            <input
              type="date"
              v-model="fechaSeleccionada"
              :disabled="enviando"
              :min="new Date(Date.now() + 86400000).toISOString().slice(0, 10)"
              class="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-700 font-bold focus:border-[#0056c2] focus:bg-white outline-none transition-all cursor-pointer"
            />
          </div>

          <div
            v-if="fechaSeleccionada"
            class="space-y-3 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-50"
          >
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-[#0056c2]"
              >Horarios Disponibles</label
            >

            <div v-if="cargandoSlots" class="flex gap-2">
              <div
                v-for="i in 3"
                :key="i"
                class="h-10 w-20 bg-white rounded-xl animate-pulse"
              ></div>
            </div>

            <div v-else-if="slots.length === 0" class="py-4 text-center">
              <p class="text-slate-400 font-bold italic text-sm m-0">
                No hay espacios disponibles para esta fecha.
              </p>
            </div>

            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="slot in slots"
                :key="slot.id"
                @click="!enviando && (slotId = slot.id)"
                :disabled="enviando"
                :class="
                  slotId === slot.id
                    ? 'bg-[#0056c2] text-white shadow-lg shadow-blue-200 border-[#0056c2]'
                    : 'bg-white text-slate-600 border-white hover:border-blue-200'
                "
                class="px-5 py-2.5 rounded-xl text-xs font-black italic border-2 cursor-pointer transition-all active:scale-95 disabled:opacity-40"
              >
                {{ slot.start_time.slice(0, 5) }}
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2"
              >Observaciones</label
            >
            <textarea
              v-model="notas"
              :disabled="enviando"
              rows="2"
              placeholder="Ej: Viene por vacuna anual, está un poco inquieto..."
              class="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-700 font-medium focus:border-[#0056c2] focus:bg-white outline-none transition-all resize-none"
            ></textarea>
          </div>

          <Transition name="fade">
            <div
              v-if="errorMsg"
              class="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-xl"
            >
              {{ errorMsg }}
            </div>
          </Transition>
        </div>
      </div>

      <div v-if="!exitoso" class="p-8 bg-slate-50 flex gap-4">
        <button
          @click="emit('cerrar')"
          :disabled="enviando"
          class="flex-1 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-transparent border-2 border-slate-200 text-slate-400 hover:bg-slate-200 hover:text-slate-600 cursor-pointer transition-all"
        >
          Cancelar
        </button>
        <button
          @click="agendar"
          :disabled="enviando"
          class="flex-[2] py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-[#0056c2] text-white border-none shadow-xl shadow-blue-200 hover:bg-[#004299] cursor-pointer transition-all active:scale-95 disabled:opacity-50"
        >
          {{ enviando ? 'Procesando...' : 'Confirmar Cita' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(0.3);
  cursor: pointer;
}
</style>
