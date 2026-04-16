<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const router = useRouter()
const paso = ref(1)
const isLoading = ref(false)
const message = ref('')
const isError = ref(false)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  password_confirmation: '',
  role_id: 3
})

const irAlPaso2 = () => {
  if (form.name && form.email && form.phone) {
    message.value = ''
    paso.value = 2
  } else {
    isError.value = true
    message.value = 'Completa nombre, email y teléfono'
  }
}

const register = async () => {
  if (form.password.length < 4) {
    isError.value = true
    message.value = 'La contraseña debe tener al menos 4 caracteres'
    return
  }

  isLoading.value = true
  message.value = ''
  isError.value = false

  const { data, error, execute } = ApiUseFetch('/register')
    .post(form)
    .json<{ message?: string }>()

  await execute()

  if (error.value) {
    isLoading.value = false
    isError.value = true
    message.value = data.value?.message || 'Error en el registro. Revisa los datos.'
  } else {
    isLoading.value = false
    isError.value = false
    message.value = '¡Registro exitoso! Redirigiendo...'
    setTimeout(() => router.push('/login'), 2000)
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center lg:justify-end relative overflow-hidden bg-slate-900 p-6 lg:p-20 font-sans italic selection:bg-blue-100">

    <button
      @click="router.push('/')"
      class="absolute top-8 left-8 md:left-12 z-50 flex items-center gap-3 px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
    >
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Volver al Inicio
    </button>

    <div class="absolute inset-0 z-0">
      <img src="/regfoto.jpg" class="w-full h-full object-cover opacity-40 animate-slow-zoom" />
      <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/40 to-transparent"></div>
    </div>

    <div class="hidden lg:block absolute left-24 top-1/2 -translate-y-1/2 z-10 text-white max-w-xl">
      <h1 class="text-7xl font-black leading-[0.9] uppercase tracking-tighter drop-shadow-2xl">
        CREA TU <br> <span class="text-[#3f98ff]">CUENTA.</span>
      </h1>
      <p class="mt-8 text-xl font-medium text-slate-300 leading-relaxed max-w-md">
        Únete a nuestra comunidad y comienza a gestionar la salud de tus mascotas de forma profesional.
      </p>
    </div>

    <div class="relative z-20 w-full max-w-md">
      <div class="bg-white/95 backdrop-blur-2xl rounded-[3.5rem] shadow-2xl p-10 md:p-14 border border-white/40">

        <div class="flex justify-center gap-2 mb-8">
          <div :class="paso === 1 ? 'w-12 bg-[#3f98ff]' : 'w-4 bg-slate-200'" class="h-1.5 rounded-full transition-all duration-500"></div>
          <div :class="paso === 2 ? 'w-12 bg-[#3f98ff]' : 'w-4 bg-slate-200'" class="h-1.5 rounded-full transition-all duration-500"></div>
        </div>

        <div class="text-center mb-8">
          <h4 class="text-4xl font-black text-slate-800 uppercase italic tracking-tighter">{{ paso === 1 ? 'Tus Datos' : 'Seguridad' }}</h4>
          <p class="text-[#3f98ff] font-bold text-[9px] tracking-[0.4em] uppercase mt-2">Paso {{ paso }} de 2</p>
        </div>

        <div v-if="message"
             :class="isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'"
             class="p-4 rounded-2xl mb-6 text-[11px] font-bold text-center border transition-all italic">
          {{ message }}
        </div>

        <form @submit.prevent="register" class="space-y-5">
          <div v-if="paso === 1" class="space-y-5 animate-slide-in">
            <div class="space-y-1">
               <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre Completo</label>
               <input v-model="form.name" type="text" placeholder="Juan Pérez" required
                   class="w-full px-5 py-4 rounded-2xl text-sm font-semibold border-2 border-slate-100 focus:border-[#3f98ff] bg-slate-50/50 outline-none transition-all shadow-inner" />
            </div>

            <div class="space-y-1">
               <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Correo Electrónico</label>
               <input v-model="form.email" type="email" placeholder="correo@ejemplo.com" required
                   class="w-full px-5 py-4 rounded-2xl text-sm font-semibold border-2 border-slate-100 focus:border-[#3f98ff] bg-slate-50/50 outline-none transition-all shadow-inner" />
            </div>

            <div class="space-y-1">
               <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Teléfono</label>
               <input v-model="form.phone" type="tel" placeholder="871 000 0000" required
                   class="w-full px-5 py-4 rounded-2xl text-sm font-semibold border-2 border-slate-100 focus:border-[#3f98ff] bg-slate-50/50 outline-none transition-all shadow-inner" />
            </div>

            <button type="button" @click="irAlPaso2"
                    class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase hover:bg-[#3f98ff] transition-all shadow-xl mt-2 active:scale-95">
              Siguiente Paso →
            </button>
          </div>

          <div v-if="paso === 2" class="space-y-5 animate-slide-in">
            <div class="space-y-1">
               <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Domicilio</label>
               <input v-model="form.address" type="text" placeholder="Domicilio"
                   class="w-full px-5 py-4 rounded-2xl text-sm font-semibold border-2 border-slate-100 focus:border-[#3f98ff] bg-slate-50/50 outline-none transition-all shadow-inner" />
            </div>

            <div class="space-y-1">
               <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contraseña</label>
               <input v-model="form.password" type="password" placeholder="Mín. 4 caracteres" required
                   class="w-full px-5 py-4 rounded-2xl text-sm font-semibold border-2 border-slate-100 focus:border-[#3f98ff] bg-slate-50/50 outline-none transition-all shadow-inner" />
            </div>

            <div class="space-y-1">
               <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Confirmar</label>
               <input v-model="form.password_confirmation" type="password" placeholder="Confirmar Contraseña" required
                   class="w-full px-5 py-4 rounded-2xl text-sm font-semibold border-2 border-slate-100 focus:border-[#3f98ff] bg-slate-50/50 outline-none transition-all shadow-inner" />
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" @click="paso = 1"
                      class="w-1/3 border-2 border-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-50 transition-all">
                Atrás
              </button>
              <button type="submit" :disabled="isLoading"
                      class="w-2/3 bg-[#22c55e] text-white py-4 rounded-2xl font-black uppercase hover:bg-green-600 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                {{ isLoading ? 'Registrando...' : 'Finalizar ✓' }}
              </button>
            </div>
          </div>
        </form>

        <div class="mt-10 text-center border-t border-slate-100 pt-8">
          <button @click="router.push('/login')" class="text-slate-400 text-xs font-bold hover:text-[#3f98ff] transition-colors italic">
            ¿Ya tienes cuenta?
            <span class="font-black uppercase text-[11px] ml-1">Inicia sesión</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
.animate-slide-in { animation: slideIn 0.3s ease-out; }
@keyframes slow-zoom { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
.animate-slow-zoom { animation: slow-zoom 30s ease-in-out infinite; }
</style>
