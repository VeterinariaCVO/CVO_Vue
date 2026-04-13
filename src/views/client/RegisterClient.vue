<script setup lang="ts">
import { ref } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardado'): void
}>()

const nombre = ref('')
const correo = ref('')
const telefono = ref('')
const direccion = ref('')
const cargando = ref(false)
const exitoso = ref(false)
const errores = ref<Record<string, string>>({})

async function registrar() {
  errores.value = {}
  cargando.value = true

  const { data, execute } = ApiUseFetch('admin/users').post({
    name: nombre.value,
    email: correo.value,
    phone: telefono.value,
    address: direccion.value,
    role_id: 3,
    password: 'password123',
    active: true,
  }).json()

  await execute()
  cargando.value = false

  if (!data.value) return

  if ((data.value as any)?.errors) {
    const e = (data.value as any).errors
    for (const campo in e) errores.value[campo] = e[campo][0]
    return
  }

  exitoso.value = true
  setTimeout(() => emit('guardado'), 1500)
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
    @click.self="emit('cerrar')"
  >
    <div class="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden">

      <div class="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
        <div>
          <h2 class="font-black text-slate-800 text-xs uppercase tracking-widest">Registrar Cliente</h2>
          <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Alta de nuevo propietario</p>
        </div>
        <button
          @click="emit('cerrar')"
          class="text-slate-300 hover:text-slate-500 bg-transparent border-none cursor-pointer transition-colors text-lg leading-none"
        >
          ✕
        </button>
      </div>

      <div v-if="exitoso" class="px-8 py-12 text-center">
        <p class="text-3xl mb-3">✅</p>
        <p class="text-xs font-black text-emerald-600 uppercase tracking-widest">Cliente registrado correctamente</p>
      </div>

      <div v-else class="px-8 py-6 space-y-4">

        <div class="space-y-1">
          <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nombre completo</label>
          <input
            v-model="nombre"
            type="text"
            placeholder="Ej. Juan Pérez"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1d6bbf]/50 focus:ring-2 focus:ring-[#1d6bbf]/10 transition-all font-medium placeholder:text-slate-300"
          />
          <p v-if="errores.name" class="text-[10px] text-red-500 font-bold">{{ errores.name }}</p>
        </div>

        <div class="space-y-1">
          <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Correo electrónico</label>
          <input
            v-model="correo"
            type="email"
            placeholder="correo@ejemplo.com"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1d6bbf]/50 focus:ring-2 focus:ring-[#1d6bbf]/10 transition-all font-medium placeholder:text-slate-300"
          />
          <p v-if="errores.email" class="text-[10px] text-red-500 font-bold">{{ errores.email }}</p>
        </div>

        <div class="space-y-1">
          <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Teléfono</label>
          <input
            v-model="telefono"
            type="text"
            placeholder="10 dígitos"
            maxlength="10"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1d6bbf]/50 focus:ring-2 focus:ring-[#1d6bbf]/10 transition-all font-medium placeholder:text-slate-300"
          />
          <p v-if="errores.phone" class="text-[10px] text-red-500 font-bold">{{ errores.phone }}</p>
        </div>

        <div class="space-y-1">
          <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dirección</label>
          <input
            v-model="direccion"
            type="text"
            placeholder="Calle, colonia..."
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1d6bbf]/50 focus:ring-2 focus:ring-[#1d6bbf]/10 transition-all font-medium placeholder:text-slate-300"
          />
          <p v-if="errores.address" class="text-[10px] text-red-500 font-bold">{{ errores.address }}</p>
        </div>

        <div class="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <span class="text-amber-400">🔑</span>
          <p class="text-[10px] font-bold text-amber-600">
            Se asignará la contraseña temporal <span class="font-black">password123</span>
          </p>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            @click="emit('cerrar')"
            class="flex-1 border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors bg-transparent"
          >
            Cancelar
          </button>
          <button
            @click="registrar"
            :disabled="cargando"
            class="flex-1 bg-[#1d6bbf] hover:bg-[#16569a] disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl cursor-pointer border-none transition-colors"
          >
            {{ cargando ? 'Guardando...' : 'Registrar' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
