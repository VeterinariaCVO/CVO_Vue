<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'
import { getStorageUrl } from '@/utils/storageUrl'

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

const toastVisible = ref(false)
const toastData = ref<{ mascota: string; servicio: string } | null>(null)

function petPhotoUrl(path?: string | null) {
  return getStorageUrl(path)
}

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
  <div class="walkin-root">

    <!-- Header -->
    <div class="walkin-header">
      <div class="walkin-header-inner">
        <div class="walkin-header-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 class="walkin-title">Walk-in</h1>
          <p class="walkin-subtitle">Atención inmediata sin cita previa</p>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toastVisible" class="walkin-toast">
        <div class="walkin-toast-icon">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="walkin-toast-text">
          <span class="walkin-toast-title">Atención registrada</span>
          <span class="walkin-toast-sub">{{ toastData?.mascota }} · {{ toastData?.servicio }}</span>
        </div>
        <button @click="toastVisible = false" class="walkin-toast-close">×</button>
      </div>
    </Transition>

    <!-- Cuerpo -->
    <div class="walkin-body">
      <div class="walkin-card">

        <!-- Columna izquierda -->
        <div class="walkin-col">
          <p class="walkin-section-label">Cliente & mascota</p>

          <!-- Buscador cliente -->
          <div class="walkin-field">
            <label class="walkin-label">Cliente</label>
            <div class="walkin-input-wrap">
              <svg class="walkin-input-icon" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
              </svg>
              <input
                v-model="busquedaCliente"
                @input="filtrarClientes"
                @focus="filtrarClientes"
                :disabled="!!clienteId"
                type="text"
                placeholder="Nombre o teléfono..."
                class="walkin-input"
              />
            </div>

            <!-- Dropdown -->
            <div v-if="mostrarDropdown && clientesFiltrados.length > 0 && !clienteId" class="walkin-dropdown">
              <button
                v-for="cliente in clientesFiltrados.slice(0, 6)"
                :key="cliente.id"
                @click="seleccionarCliente(cliente)"
                class="walkin-dropdown-item"
              >
                <div class="walkin-avatar">{{ initials(cliente.name) }}</div>
                <div>
                  <p class="walkin-dropdown-name">{{ cliente.name }}</p>
                  <p class="walkin-dropdown-sub">{{ cliente.phone ?? cliente.email }}</p>
                </div>
              </button>
            </div>

            <button v-if="clienteId" @click="clienteId = null; busquedaCliente = ''; mascotas = []; mascotaId = null" class="walkin-change-btn">
              × Cambiar cliente
            </button>
          </div>

          <!-- Mascotas -->
          <div class="walkin-field">
            <label class="walkin-label">Mascota</label>
            <p v-if="cargandoMascotas" class="walkin-hint">Cargando mascotas...</p>
            <p v-else-if="!clienteId" class="walkin-hint">Selecciona un cliente primero</p>
            <p v-else-if="mascotas.length === 0" class="walkin-hint">Sin mascotas registradas.</p>
            <div v-else class="walkin-pet-grid">
              <button
                v-for="mascota in mascotas"
                :key="mascota.id"
                @click="mascotaId = mascota.id"
                :class="['walkin-pet-card', mascotaId === mascota.id ? 'walkin-pet-card--active' : '']"
              >
                <div class="walkin-pet-avatar">
                  <img v-if="mascota.photo_url" :src="petPhotoUrl(mascota.photo_url)" class="walkin-pet-img" />
                  <span v-else>{{ initials(mascota.name) }}</span>
                </div>
                <div>
                  <p class="walkin-pet-name">{{ mascota.name }}</p>
                  <p class="walkin-pet-species">{{ mascota.species }}</p>
                </div>
                <div v-if="mascotaId === mascota.id" class="walkin-pet-check">
                  <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <!-- Servicio -->
          <div class="walkin-field">
            <label class="walkin-label">Servicio</label>
            <select v-model="servicioId" class="walkin-select">
              <option :value="null" disabled>Selecciona un servicio</option>
              <option v-for="s in servicios" :key="s.id" :value="s.id">
                {{ s.name }} — ${{ Number(s.price).toFixed(2) }}
              </option>
            </select>
          </div>
        </div>

        <!-- Divider vertical -->
        <div class="walkin-divider"></div>

        <!-- Columna derecha -->
        <div class="walkin-col">
          <p class="walkin-section-label">Horario & notas <span class="walkin-optional">(opcionales)</span></p>

          <!-- Fecha -->
          <div class="walkin-field">
            <label class="walkin-label">Fecha</label>
            <input
              type="date"
              v-model="fechaSeleccionada"
              :min="new Date().toISOString().slice(0, 10)"
              class="walkin-input walkin-input--date"
            />
          </div>

          <!-- Slots -->
          <div class="walkin-field">
            <label class="walkin-label">Horario</label>
            <p v-if="!fechaSeleccionada" class="walkin-hint">Selecciona una fecha primero</p>
            <p v-else-if="cargandoSlots" class="walkin-hint">Cargando horarios...</p>
            <p v-else-if="slots.length === 0" class="walkin-hint">Sin horarios disponibles.</p>
            <div v-else class="walkin-slots">
              <button
                v-for="slot in slots"
                :key="slot.id"
                @click="slotId = slotId === slot.id ? null : slot.id"
                :class="['walkin-slot', slotId === slot.id ? 'walkin-slot--active' : '']"
              >
                {{ slot.start_time.slice(0, 5) }}
              </button>
            </div>
          </div>

          <!-- Notas -->
          <div class="walkin-field walkin-field--grow">
            <label class="walkin-label">Notas</label>
            <textarea
              v-model="notas"
              placeholder="Motivo de la visita, síntomas, observaciones..."
              class="walkin-textarea"
            ></textarea>
          </div>

          <!-- Error -->
          <div v-if="errorMsg" class="walkin-error">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" stroke-linecap="round"/>
            </svg>
            {{ errorMsg }}
          </div>

          <!-- Acciones -->
          <div class="walkin-actions">
            <button @click="resetForm" class="walkin-btn-secondary">Limpiar</button>
            <button @click="registrar" :disabled="enviando" class="walkin-btn-primary">
              <svg v-if="!enviando" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="walkin-spinner" v-if="enviando"></span>
              {{ enviando ? 'Registrando...' : 'Registrar atención' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

.walkin-root {
  font-family: 'DM Sans', sans-serif;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  background: #f6f7f9;
}

/* Header */
.walkin-header {
  background: #fff;
  border-bottom: 1px solid #e8eaed;
  padding: 20px 36px;
  flex-shrink: 0;
}
.walkin-header-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}
.walkin-header-icon {
  width: 36px;
  height: 36px;
  background: #1d6bbf;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.walkin-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a2332;
  margin: 0;
  letter-spacing: -0.3px;
}
.walkin-subtitle {
  font-size: 12.5px;
  color: #9aa3b0;
  margin: 2px 0 0;
}

/* Toast */
.walkin-toast {
  margin: 16px 36px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f0faf4;
  border: 1px solid #b7e4c7;
  border-radius: 12px;
  padding: 12px 16px;
  flex-shrink: 0;
}
.walkin-toast-icon {
  width: 26px;
  height: 26px;
  background: #d1f0de;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d8a55;
  flex-shrink: 0;
}
.walkin-toast-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.walkin-toast-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e6e42;
}
.walkin-toast-sub {
  font-size: 12px;
  color: #4caf78;
}
.walkin-toast-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #7cc99a;
  font-size: 18px;
  line-height: 1;
  padding: 0;
}

/* Body */
.walkin-body {
  flex: 1;
  display: flex;
  padding: 24px 36px;
  min-height: 0;
}

/* Card */
.walkin-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e8eaed;
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.walkin-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px 36px;
  overflow-y: auto;
  min-height: 0;
}

.walkin-divider {
  width: 1px;
  background: #f0f1f3;
  flex-shrink: 0;
}

/* Section label */
.walkin-section-label {
  font-size: 10.5px;
  font-weight: 600;
  color: #b0b8c4;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}
.walkin-optional {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: #c8d0da;
  font-size: 10px;
}

/* Fields */
.walkin-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}
.walkin-field--grow {
  flex: 1;
}

.walkin-label {
  font-size: 12.5px;
  font-weight: 500;
  color: #5a6473;
}

.walkin-hint {
  font-size: 12px;
  color: #b0b8c4;
  font-style: italic;
  margin: 0;
}

/* Input */
.walkin-input-wrap {
  position: relative;
}
.walkin-input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #b0b8c4;
  pointer-events: none;
}
.walkin-input {
  width: 100%;
  border: 1.5px solid #e8eaed;
  border-radius: 10px;
  padding: 10px 14px 10px 34px;
  font-size: 13.5px;
  font-family: 'DM Sans', sans-serif;
  color: #1a2332;
  background: #fafbfc;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
  box-sizing: border-box;
}
.walkin-input--date {
  padding-left: 14px;
}
.walkin-input:focus {
  border-color: #1d6bbf;
  background: #fff;
}
.walkin-input:disabled {
  background: #f4f5f7;
  color: #7a8694;
  cursor: not-allowed;
}

/* Select */
.walkin-select {
  border: 1.5px solid #e8eaed;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13.5px;
  font-family: 'DM Sans', sans-serif;
  color: #1a2332;
  background: #fafbfc;
  outline: none;
  transition: border-color 0.15s;
  cursor: pointer;
}
.walkin-select:focus {
  border-color: #1d6bbf;
  background: #fff;
}

/* Dropdown */
.walkin-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1.5px solid #e8eaed;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  z-index: 20;
  max-height: 200px;
  overflow-y: auto;
}
.walkin-dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}
.walkin-dropdown-item:hover { background: #f6f7f9; }
.walkin-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e8f0fb;
  color: #1d6bbf;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.walkin-dropdown-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a2332;
  margin: 0;
}
.walkin-dropdown-sub {
  font-size: 11.5px;
  color: #9aa3b0;
  margin: 0;
}

.walkin-change-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 11.5px;
  color: #b0b8c4;
  padding: 0;
  align-self: flex-start;
  transition: color 0.15s;
}
.walkin-change-btn:hover { color: #e05252; }

/* Mascotas */
.walkin-pet-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.walkin-pet-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1.5px solid #e8eaed;
  border-radius: 10px;
  background: #fafbfc;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  position: relative;
}
.walkin-pet-card:hover {
  border-color: #c2d8f5;
  background: #f5f9ff;
}
.walkin-pet-card--active {
  border-color: #1d6bbf !important;
  background: #f0f6ff !important;
  box-shadow: 0 0 0 3px rgba(29,107,191,0.08);
}
.walkin-pet-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e8eaed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #5a6473;
  flex-shrink: 0;
  overflow: hidden;
}
.walkin-pet-img {
  width: 34px;
  height: 34px;
  object-fit: cover;
}
.walkin-pet-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a2332;
  margin: 0;
}
.walkin-pet-species {
  font-size: 11px;
  color: #9aa3b0;
  margin: 0;
}
.walkin-pet-check {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 16px;
  height: 16px;
  background: #1d6bbf;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

/* Slots */
.walkin-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.walkin-slot {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 6px 12px;
  border: 1.5px solid #e8eaed;
  border-radius: 8px;
  background: #fafbfc;
  color: #5a6473;
  cursor: pointer;
  transition: all 0.15s;
}
.walkin-slot:hover {
  border-color: #1d6bbf;
  color: #1d6bbf;
  background: #f0f6ff;
}
.walkin-slot--active {
  background: #1d6bbf !important;
  border-color: #1d6bbf !important;
  color: #fff !important;
}

/* Textarea */
.walkin-textarea {
  flex: 1;
  border: 1.5px solid #e8eaed;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13.5px;
  font-family: 'DM Sans', sans-serif;
  color: #1a2332;
  background: #fafbfc;
  outline: none;
  resize: none;
  min-height: 110px;
  transition: border-color 0.15s, background 0.15s;
}
.walkin-textarea:focus {
  border-color: #1d6bbf;
  background: #fff;
}
.walkin-textarea::placeholder { color: #c8d0da; }

/* Error */
.walkin-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #c0392b;
  background: #fdf3f2;
  border: 1px solid #f5c6c2;
  border-radius: 8px;
  padding: 10px 12px;
}

/* Acciones */
.walkin-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.walkin-btn-secondary {
  flex: 1;
  border: 1.5px solid #e8eaed;
  background: #fff;
  color: #7a8694;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  padding: 11px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.walkin-btn-secondary:hover {
  background: #f6f7f9;
  color: #1a2332;
}
.walkin-btn-primary {
  flex: 2;
  background: #1d6bbf;
  color: #fff;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  padding: 11px 20px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: background 0.15s, opacity 0.15s;
  letter-spacing: -0.1px;
}
.walkin-btn-primary:hover { background: #185fa5; }
.walkin-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

.walkin-spinner {
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Toast transition */
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
