<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const clientes = ref<any[]>([])
const mascotas = ref<any[]>([])
const servicios = ref<any[]>([])
const slots = ref<any[]>([])

const clienteId = ref<number | null>(null)
const mascotaId = ref<number | null>(null)
const servicioId = ref<number | null>(null)
const slotId = ref<number | null>(null)
const fechaSeleccionada = ref('')
const notas = ref('')

const busquedaCliente = ref('')
const clientesFiltrados = ref<any[]>([])
const mostrarDropdown = ref(false)

const cargandoMascotas = ref(false)
const cargandoSlots = ref(false)
const enviando = ref(false)
const errorMsg = ref('')

// Toast de éxito
const toastVisible = ref(false)
const toastData = ref<{ mascota: string; servicio: string } | null>(null)

async function cargarClientes() {
  const { data, execute } = ApiUseFetch('/admin/users').get().json()
  await execute()
  const todos = data.value?.data ?? []
  clientes.value = todos.filter((u: any) => u.role_id === 3)
}

async function cargarServicios() {
  const { data, execute } = ApiUseFetch('/services').get().json()
  await execute()
  servicios.value = data.value?.data ?? []
}

function filtrarClientes() {
  const q = busquedaCliente.value.toLowerCase()
  clientesFiltrados.value = q
    ? clientes.value.filter(c => c.name?.toLowerCase().includes(q) || c.phone?.includes(q))
    : clientes.value
  mostrarDropdown.value = true
}

function seleccionarCliente(cliente: any) {
  clienteId.value = cliente.id
  busquedaCliente.value = cliente.name
  mostrarDropdown.value = false
  mascotaId.value = null
  mascotas.value = []
  cargarMascotas(cliente.id)
}

async function cargarMascotas(ownerId: number) {
  cargandoMascotas.value = true
  mascotas.value = []
  const { data, execute } = ApiUseFetch(`/admin/pets?owner_id=${ownerId}`).get().json()
  await execute()
  mascotas.value = data.value?.data ?? []
  cargandoMascotas.value = false
}

async function cargarSlots() {
  if (!fechaSeleccionada.value) return
  cargandoSlots.value = true
  slots.value = []
  slotId.value = null
  const { data: wdData, execute: wdExecute } = ApiUseFetch(`/working-days?date=${fechaSeleccionada.value}`).get().json()
  await wdExecute()
  const wds = wdData.value?.data ?? []
  if (wds.length === 0) { cargandoSlots.value = false; return }
  const { data, execute } = ApiUseFetch(`/time-slots?working_day_id=${wds[0].id}&status=available`).get().json()
  await execute()
  slots.value = data.value?.data ?? []
  cargandoSlots.value = false
}

watch(fechaSeleccionada, () => cargarSlots())

function initials(name: string) {
  return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
}

function resetForm() {
  clienteId.value = null
  mascotaId.value = null
  servicioId.value = null
  slotId.value = null
  fechaSeleccionada.value = ''
  notas.value = ''
  busquedaCliente.value = ''
  mascotas.value = []
  slots.value = []
  errorMsg.value = ''
}

function mostrarToast(mascota: string, servicio: string) {
  toastData.value = { mascota, servicio }
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 5000)
}

async function registrar() {
  errorMsg.value = ''
  if (!mascotaId.value || !servicioId.value) {
    errorMsg.value = 'Selecciona la mascota y el servicio.'
    return
  }
  enviando.value = true

  const mascotaNombre = mascotas.value.find(m => m.id === mascotaId.value)?.name ?? ''
  const servicioNombre = servicios.value.find(s => s.id === servicioId.value)?.name ?? ''

  const { data, execute } = ApiUseFetch('/walk-in').post({
    pet_id: mascotaId.value,
    service_id: servicioId.value,
    time_slot_id: slotId.value ?? undefined,
    notes: notas.value || null,
  }).json()
  await execute()
  enviando.value = false

  if (!(data.value as any)?.success) {
    errorMsg.value = (data.value as any)?.message ?? 'Error al registrar la atención.'
    return
  }

  resetForm()
  mostrarToast(mascotaNombre, servicioNombre)
}

onMounted(() => { cargarClientes(); cargarServicios() })
</script>

<template>
  <div class="flex flex-col" style="height: calc(100vh - 64px);">

    <!-- Header -->
    <div class="bg-white border-b border-slate-200 px-8 py-4 shrink-0">
      <h1 class="text-xl font-semibold text-[#1e3a5f] m-0">Walk-in</h1>
      <p class="text-sm text-slate-400 mt-0.5 m-0">Registra atenciones directamente en progreso, sin cita previa</p>
    </div>

    <!-- Toast de éxito -->
    <Transition name="toast">
      <div
        v-if="toastVisible"
        class="mx-6 mt-4 shrink-0 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
      >
        <div class="w-7 h-7 rounded-full bg-green-100 border border-green-200 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-green-800 m-0">Atención registrada correctamente</p>
          <p class="text-xs text-green-600 m-0">
            {{ toastData?.mascota }} · {{ toastData?.servicio }} · <span class="font-medium">In progress</span>
          </p>
        </div>
        <button
          @click="toastVisible = false"
          class="text-green-400 hover:text-green-600 bg-transparent border-none cursor-pointer text-lg leading-none shrink-0"
        >×</button>
      </div>
    </Transition>

    <!-- Contenido -->
    <div class="flex-1 flex items-stretch p-6 min-h-0" :class="toastVisible ? 'pt-3' : ''">

      <!-- Formulario -->
      <div class="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col min-h-0">
        <div class="flex-1 grid grid-cols-2 divide-x divide-slate-100 min-h-0">

          <!-- Columna izquierda -->
          <div class="flex flex-col gap-6 px-8 py-7 overflow-y-auto">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest m-0">Datos del cliente</p>

            <!-- Cliente -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-600">Cliente</label>
              <div class="relative">
                <input
                  v-model="busquedaCliente"
                  @input="filtrarClientes"
                  @focus="filtrarClientes"
                  :disabled="!!clienteId"
                  type="text"
                  placeholder="Buscar por nombre o teléfono..."
                  class="w-full border border-slate-200 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-[#1d6bbf] transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                />
                <div
                  v-if="mostrarDropdown && clientesFiltrados.length > 0 && !clienteId"
                  class="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl mt-1 shadow-lg z-10 max-h-48 overflow-y-auto"
                >
                  <button
                    v-for="cliente in clientesFiltrados.slice(0, 6)"
                    :key="cliente.id"
                    @click="seleccionarCliente(cliente)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 border-none bg-white cursor-pointer border-b border-slate-50 last:border-none transition-colors"
                  >
                    <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-[10px] font-semibold text-[#0c447c]">
                      {{ initials(cliente.name) }}
                    </div>
                    <div>
                      <p class="text-sm font-medium text-slate-800 m-0">{{ cliente.name }}</p>
                      <p class="text-xs text-slate-400 m-0">{{ cliente.phone ?? cliente.email }}</p>
                    </div>
                  </button>
                </div>
              </div>
              <button
                v-if="clienteId"
                @click="clienteId = null; busquedaCliente = ''; mascotas = []; mascotaId = null"
                class="text-xs text-slate-400 hover:text-red-400 self-start bg-transparent border-none cursor-pointer"
              >× Cambiar cliente</button>
            </div>

            <!-- Mascota -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-600">Mascota</label>
              <p v-if="cargandoMascotas" class="text-xs text-slate-400 m-0">Cargando mascotas...</p>
              <p v-else-if="!clienteId" class="text-xs text-slate-400 italic m-0">Selecciona un cliente primero</p>
              <p v-else-if="mascotas.length === 0" class="text-xs text-slate-400 m-0">Este cliente no tiene mascotas registradas.</p>
              <div v-else class="grid grid-cols-2 gap-2">
                <button
                  v-for="mascota in mascotas"
                  :key="mascota.id"
                  @click="mascotaId = mascota.id"
                  :class="mascotaId === mascota.id
                    ? 'border-[#1d6bbf] bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'"
                  class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-left"
                >
                  <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                    <img v-if="mascota.photo_url" :src="mascota.photo_url" class="w-8 h-8 object-cover" />
                    <span v-else class="text-[10px] font-semibold text-slate-500">{{ initials(mascota.name) }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-800 m-0">{{ mascota.name }}</p>
                    <p class="text-xs text-slate-400 m-0">{{ mascota.species }}</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Servicio -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-600">Servicio</label>
              <select
                v-model="servicioId"
                class="w-full border border-slate-200 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-[#1d6bbf] transition-colors bg-white"
              >
                <option :value="null" disabled>Selecciona un servicio</option>
                <option v-for="s in servicios" :key="s.id" :value="s.id">
                  {{ s.name }} — ${{ Number(s.price).toFixed(2) }}
                </option>
              </select>
            </div>
          </div>

          <!-- Columna derecha -->
          <div class="flex flex-col gap-6 px-8 py-7 overflow-y-auto">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest m-0">Horario y notas</p>

            <!-- Fecha -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-600">
                Fecha <span class="text-slate-300 font-normal">(opcional)</span>
              </label>
              <input
                type="date"
                v-model="fechaSeleccionada"
                :min="new Date().toISOString().slice(0, 10)"
                class="w-full border border-slate-200 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-[#1d6bbf] transition-colors"
              />
            </div>

            <!-- Slots -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-600">
                Slot de horario <span class="text-slate-300 font-normal">(opcional)</span>
              </label>
              <p v-if="!fechaSeleccionada" class="text-xs text-slate-400 italic m-0">Selecciona una fecha primero</p>
              <p v-else-if="cargandoSlots" class="text-xs text-slate-400 m-0">Cargando horarios...</p>
              <p v-else-if="slots.length === 0" class="text-xs text-slate-400 m-0">Sin horarios disponibles para ese día.</p>
              <div v-else class="flex flex-wrap gap-2">
                <button
                  v-for="slot in slots"
                  :key="slot.id"
                  @click="slotId = slotId === slot.id ? null : slot.id"
                  :class="slotId === slot.id
                    ? 'bg-[#1d6bbf] text-white border-[#1d6bbf]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'"
                  class="border rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                >
                  {{ slot.start_time.slice(0, 5) }}
                </button>
              </div>
            </div>

            <!-- Notas -->
            <div class="flex flex-col gap-1.5 flex-1">
              <label class="text-sm font-medium text-slate-600">
                Notas <span class="text-slate-300 font-normal">(opcional)</span>
              </label>
              <textarea
                v-model="notas"
                placeholder="Motivo de la visita, síntomas, observaciones..."
                class="w-full flex-1 border border-slate-200 rounded-lg px-3.5 py-3 text-sm outline-none focus:border-[#1d6bbf] transition-colors resize-none"
                style="min-height: 120px;"
              ></textarea>
            </div>

            <!-- Error -->
            <div v-if="errorMsg" class="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {{ errorMsg }}
            </div>

            <!-- Botones -->
            <div class="flex gap-2 shrink-0">
              <button
                @click="resetForm"
                class="flex-1 border border-slate-200 text-slate-500 text-sm py-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-transparent"
              >
                Limpiar
              </button>
              <button
                @click="registrar"
                :disabled="enviando"
                class="flex-2 bg-[#1d6bbf] hover:bg-[#185fa5] disabled:opacity-50 text-white text-sm py-3 rounded-lg cursor-pointer border-none transition-colors font-medium"
              >
                {{ enviando ? 'Registrando...' : 'Registrar cita' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>