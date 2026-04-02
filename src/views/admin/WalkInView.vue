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

const cargandoMascotas = ref(false)
const cargandoSlots = ref(false)
const enviando = ref(false)
const errorMsg = ref('')
const exitoso = ref(false)
const atencionCreada = ref<any>(null)

async function cargarClientes() {
  const { data, execute } = ApiUseFetch('/admin/users').get().json()
  await execute()
  const todos = data.value?.data ?? []
  clientes.value = todos.filter((u: any) => u.role_id === 3)
  clientesFiltrados.value = clientes.value
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
}

function seleccionarCliente(cliente: any) {
  clienteId.value = cliente.id
  busquedaCliente.value = cliente.name
  clientesFiltrados.value = []
  mascotaId.value = null
  mascotas.value = []
  cargarMascotas(cliente.id)
}

async function cargarMascotas(ownerId: number) {
  cargandoMascotas.value = true
  mascotas.value = []
  const { data, execute } = ApiUseFetch(`/pets?owner_id=${ownerId}`).get().json()
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

async function registrar() {
  errorMsg.value = ''
  if (!mascotaId.value || !servicioId.value) {
    errorMsg.value = 'Selecciona la mascota y el servicio.'
    return
  }
  enviando.value = true
  const { data, execute } = ApiUseFetch('/appointments/walk-in').post({
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
  atencionCreada.value = data.value?.data
  exitoso.value = true
}

function nuevaAtencion() {
  exitoso.value = false
  atencionCreada.value = null
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

onMounted(() => { cargarClientes(); cargarServicios() })
</script>

<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-800 m-0">Atención sin cita</h1>
        <p class="text-sm text-slate-400 mt-0.5 mb-0">Registra una atención walk-in directamente en progreso</p>
      </div>
      <span class="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg font-medium">Walk-in · In Progress</span>
    </div>

    <!-- Éxito -->
    <div v-if="exitoso" class="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center text-center">
      <div class="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-4">
        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="22 4 12 14.01 9 11.01" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2 class="text-base font-semibold text-slate-800 mb-1">Atención registrada</h2>
      <p class="text-sm text-slate-500 mb-1">La atención está en progreso. Los veterinarios activos han sido notificados.</p>
      <div v-if="atencionCreada" class="mt-4 bg-slate-50 rounded-lg border border-slate-100 px-5 py-3 text-left w-full max-w-sm">
        <p class="text-xs text-slate-400 m-0 mb-1">Mascota: <span class="text-slate-700 font-medium">{{ atencionCreada.pet?.name }}</span></p>
        <p class="text-xs text-slate-400 m-0 mb-1">Servicio: <span class="text-slate-700 font-medium">{{ atencionCreada.service?.name }}</span></p>
        <p class="text-xs text-slate-400 m-0">Estado: <span class="text-purple-700 font-medium">En progreso</span></p>
      </div>
      <button @click="nuevaAtencion" class="mt-5 bg-slate-800 hover:bg-slate-700 text-white text-sm px-6 py-2 rounded-lg border-none cursor-pointer transition-colors">
        Registrar otra atención
      </button>
    </div>

    <!-- Formulario -->
    <div v-else class="grid grid-cols-5 gap-5">

      <!-- Panel formulario -->
      <div class="col-span-3">
        <div class="bg-white rounded-xl border border-slate-200 p-6">
          <div class="flex flex-col gap-5">

            <!-- Cliente -->
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-500">Cliente</label>
              <div class="relative">
                <input
                  v-model="busquedaCliente"
                  @input="filtrarClientes"
                  @focus="filtrarClientes"
                  type="text"
                  placeholder="Buscar por nombre o teléfono..."
                  class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1d6bbf] transition-colors"
                />
                <div v-if="busquedaCliente && clientesFiltrados.length > 0 && !clienteId" class="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg mt-1 shadow-sm z-10 max-h-48 overflow-y-auto">
                  <button
                    v-for="cliente in clientesFiltrados.slice(0, 8)"
                    :key="cliente.id"
                    @click="seleccionarCliente(cliente)"
                    class="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 border-none bg-white cursor-pointer border-b border-slate-50 last:border-none transition-colors"
                  >
                    <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-slate-800 m-0">{{ cliente.name }}</p>
                      <p class="text-xs text-slate-400 m-0">{{ cliente.phone ?? cliente.email }}</p>
                    </div>
                  </button>
                </div>
              </div>
              <button v-if="clienteId" @click="clienteId = null; busquedaCliente = ''; mascotas = []; mascotaId = null" class="text-xs text-slate-400 hover:text-red-500 self-start bg-transparent border-none cursor-pointer mt-0.5">× Cambiar cliente</button>
            </div>

            <!-- Mascota -->
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-500">Mascota</label>
              <div v-if="cargandoMascotas" class="text-xs text-slate-400">Cargando mascotas...</div>
              <div v-else-if="!clienteId" class="text-xs text-slate-400 italic">Selecciona un cliente primero</div>
              <div v-else-if="mascotas.length === 0" class="text-xs text-slate-400">Este cliente no tiene mascotas registradas.</div>
              <div v-else class="grid grid-cols-2 gap-2">
                <button
                  v-for="mascota in mascotas"
                  :key="mascota.id"
                  @click="mascotaId = mascota.id"
                  :class="mascotaId === mascota.id ? 'border-[#1d6bbf] bg-blue-50 text-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors text-left"
                >
                  <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <img v-if="mascota.photo_url" :src="mascota.photo_url" class="w-7 h-7 rounded-full object-cover" />
                    <svg v-else class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium m-0">{{ mascota.name }}</p>
                    <p class="text-xs text-slate-400 m-0">{{ mascota.species }}</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Servicio -->
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-500">Servicio</label>
              <select v-model="servicioId" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1d6bbf] transition-colors bg-white">
                <option :value="null" disabled>Selecciona un servicio</option>
                <option v-for="s in servicios" :key="s.id" :value="s.id">{{ s.name }} — ${{ Number(s.price).toFixed(2) }} · {{ s.duration }} min</option>
              </select>
            </div>

            <!-- Horario opcional -->
            <div class="flex flex-col gap-2">
              <label class="text-xs font-medium text-slate-500">Horario <span class="text-slate-400 font-normal">(opcional — si hay slot disponible)</span></label>
              <input type="date" v-model="fechaSeleccionada" :min="new Date().toISOString().slice(0, 10)" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1d6bbf] transition-colors" />
              <div v-if="fechaSeleccionada">
                <div v-if="cargandoSlots" class="text-xs text-slate-400">Cargando horarios...</div>
                <div v-else-if="slots.length === 0" class="text-xs text-slate-400">Sin horarios disponibles para esta fecha.</div>
                <div v-else class="flex flex-wrap gap-2 mt-1">
                  <button
                    v-for="slot in slots"
                    :key="slot.id"
                    @click="slotId = slotId === slot.id ? null : slot.id"
                    :class="slotId === slot.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'"
                    class="border rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer"
                  >{{ slot.start_time.slice(0, 5) }}</button>
                </div>
              </div>
            </div>

            <!-- Notas -->
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-500">Notas <span class="text-slate-400 font-normal">(opcional)</span></label>
              <textarea v-model="notas" rows="2" placeholder="Motivo de la visita, observaciones iniciales..." class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1d6bbf] transition-colors resize-none"></textarea>
            </div>

            <div v-if="errorMsg" class="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ errorMsg }}</div>

            <button
              @click="registrar"
              :disabled="enviando"
              class="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm py-2.5 rounded-lg cursor-pointer border-none transition-colors font-medium"
            >
              {{ enviando ? 'Registrando...' : 'Registrar atención sin cita' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Panel lateral info -->
      <div class="col-span-2 flex flex-col gap-4">

        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">¿Qué es un walk-in?</p>
          <div class="flex flex-col gap-3">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p class="text-xs text-slate-600 m-0">La atención se registra directamente en estado <span class="font-medium text-purple-700">In Progress</span>, sin pasar por Pendiente ni Confirmada.</p>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="6" y1="1" x2="6" y2="4" stroke-linecap="round"/><line x1="10" y1="1" x2="10" y2="4" stroke-linecap="round"/>
                </svg>
              </div>
              <p class="text-xs text-slate-600 m-0">Todos los veterinarios activos recibirán una <span class="font-medium">notificación automática</span> para atender al paciente.</p>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-md bg-green-50 border border-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p class="text-xs text-slate-600 m-0">El dueño de la mascota también recibirá una notificación de la atención.</p>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="12 6 12 12 16 14" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p class="text-xs text-slate-600 m-0">El horario es <span class="font-medium">opcional</span>. Puedes asignarlo si hay slots disponibles o dejarlo sin asignar.</p>
            </div>
          </div>
        </div>

        <!-- Resumen -->
        <div v-if="mascotaId || servicioId" class="bg-white rounded-xl border border-slate-200 p-5">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Resumen</p>
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">Cliente</span>
              <span class="text-xs font-medium text-slate-700">{{ busquedaCliente || '—' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">Mascota</span>
              <span class="text-xs font-medium text-slate-700">{{ mascotas.find(m => m.id === mascotaId)?.name ?? '—' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">Servicio</span>
              <span class="text-xs font-medium text-slate-700">{{ servicios.find(s => s.id === servicioId)?.name ?? '—' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">Horario</span>
              <span class="text-xs font-medium text-slate-700">{{ slotId ? slots.find(s => s.id === slotId)?.start_time?.slice(0,5) : 'Sin asignar' }}</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
              <span class="text-xs text-slate-400">Estado inicial</span>
              <span class="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-md font-medium">In Progress</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>