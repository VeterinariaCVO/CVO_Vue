<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardado'): void
}>()

const contraseniaActual = ref('')
const contraseniaNueva = ref('')
const contraseniaConfirmar = ref('')
const cargando = ref(false)
const errores = ref<any>({})

async function cambiarContrasenia() {
  errores.value = {}

  if (!contraseniaActual.value) {
    errores.value.current_password = 'La contraseña actual es obligatoria'
    return
  }
  if (contraseniaNueva.value.length < 6) {
    errores.value.password = 'Mínimo 6 caracteres'
    return
  }
  if (contraseniaNueva.value !== contraseniaConfirmar.value) {
    errores.value.confirmar = 'Las contraseñas no coinciden'
    return
  }

  cargando.value = true

  try {
    const token = localStorage.getItem('token')
    // ✅ Usa la variable de entorno en lugar de URL hardcodeada
    const baseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'
    const res = await fetch(`${baseUrl}/me/password`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_password: contraseniaActual.value,
        password: contraseniaNueva.value,
        password_confirmation: contraseniaConfirmar.value,
      }),
    })

    const data = await res.json()
    cargando.value = false

    if (!res.ok) {
      if (data?.errors) {
        for (const campo in data.errors) {
          errores.value[campo] = data.errors[campo][0]
        }
        return
      }
      errores.value.general = data?.message ?? 'Error al cambiar la contraseña'
      return
    }

    emit('guardado')

  } catch (e) {
    cargando.value = false
    errores.value.general = 'Error de conexión. Intenta de nuevo.'
  }
}

function cerrar() {
  contraseniaActual.value = ''
  contraseniaNueva.value = ''
  contraseniaConfirmar.value = ''
  errores.value = {}
  emit('cerrar')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="cerrar"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-active-class="transition-all duration-150"
          leave-to-class="opacity-0 scale-95"
        >
          <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

            <div class="h-1 w-full bg-gradient-to-r from-[#1d6bbf] to-[#6b8ef0]" />

            <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <div>
                <p class="text-sm font-semibold text-slate-800 m-0">Cambiar contraseña</p>
                <p class="text-xs text-slate-400 mt-0.5 m-0">Ingresa tu contraseña actual y la nueva</p>
              </div>
              <button
                @click="cerrar"
                class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 bg-transparent border-none cursor-pointer transition-colors"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="13" y1="3" x2="3" y2="13"/><line x1="3" y1="3" x2="13" y2="13"/>
                </svg>
              </button>
            </div>

            <div class="px-6 py-5 flex flex-col gap-4">

              <div v-if="errores.general" class="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2.5 text-sm">
                {{ errores.general }}
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-slate-500">
                  Contraseña actual <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="contraseniaActual"
                  type="password"
                  placeholder="Ingresa tu contraseña actual"
                  class="border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1d6bbf] focus:ring-2 focus:ring-[#1d6bbf]/10 transition-all"
                  @keyup.enter="cambiarContrasenia"
                />
                <span v-if="errores.current_password" class="text-xs text-red-500">{{ errores.current_password }}</span>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-slate-500">
                  Nueva contraseña <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="contraseniaNueva"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  class="border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1d6bbf] focus:ring-2 focus:ring-[#1d6bbf]/10 transition-all"
                  @keyup.enter="cambiarContrasenia"
                />
                <span v-if="errores.password" class="text-xs text-red-500">{{ errores.password }}</span>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-slate-500">
                  Confirmar nueva contraseña <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="contraseniaConfirmar"
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  class="border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1d6bbf] focus:ring-2 focus:ring-[#1d6bbf]/10 transition-all"
                  @keyup.enter="cambiarContrasenia"
                />
                <span v-if="errores.confirmar" class="text-xs text-red-500">{{ errores.confirmar }}</span>
              </div>
            </div>

            <div class="flex gap-2 px-6 pb-6">
              <button
                @click="cerrar"
                class="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 font-medium hover:bg-slate-50 cursor-pointer transition-colors bg-transparent"
              >Cancelar</button>
              <button
                @click="cambiarContrasenia"
                :disabled="cargando"
                class="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium cursor-pointer border-none transition-all active:scale-95"
              >{{ cargando ? 'Actualizando...' : 'Actualizar contraseña' }}</button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>