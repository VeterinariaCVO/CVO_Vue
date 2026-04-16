<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()
const isLoading = ref(false)
const message = ref('')

const form = reactive({ email: '', password: '' })

const login = async () => {
  if (isLoading.value) return // Evita múltiples clics

  isLoading.value = true
  message.value = ''

  try {
    // Llamamos a la función de tu store
    // Agregamos un timeout manual para que no se quede colgado si el server no responde
    await Promise.race([
      auth.login(form.email, form.password),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera agotado')), 10000))
    ])

    // Si el login es exitoso, redirigimos
    if (auth.isAdmin) router.push('/admin/dashboard')
    else if (auth.isRecepcionista) router.push('/recepcionista/dashboard')
    else if (auth.isVeterinario) router.push('/veterinario/agenda')
    else router.push('/client/dashboard')

  } catch (error: any) {
    console.error('Error capturado:', error)
    // Mostramos el error real para saber qué pasa
    message.value = error.message || 'Error de conexión'
  } finally {
    // ESTO ES LO MÁS IMPORTANTE: Pase lo que pase, liberamos el botón
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen relative overflow-hidden bg-slate-900 font-sans italic selection:bg-blue-100">

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
      <img src="/loginfoto.jpg" class="w-full h-full object-cover opacity-50 animate-slow-zoom" />
      <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/40 to-transparent"></div>
    </div>

    <div class="hidden lg:block absolute left-24 top-1/2 -translate-y-1/2 z-10 text-white max-w-xl">
      <h1 class="text-8xl font-black leading-[0.9] uppercase tracking-tighter drop-shadow-2xl">
        HOLA DE <br> <span class="text-[#3f98ff]">NUEVO.</span>
      </h1>
      <p class="mt-8 text-xl font-medium text-slate-300 leading-relaxed max-w-md">
        Accede al sistema de gestión de <span class="text-white font-bold">Veterinaria del Oriente</span> para continuar cuidando a tus pacientes.
      </p>
    </div>

    <div class="relative z-20 flex items-center justify-center lg:justify-end min-h-screen p-6 lg:p-20">
      <div class="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[3.5rem] shadow-2xl p-10 md:p-14 border border-white/40">

        <div class="text-center mb-10">
          <img src="/logo.jpg" width="65" class="mx-auto rounded-xl shadow-xl mb-6 rotate-3" />
          <h4 class="text-5xl font-black text-slate-800 uppercase italic tracking-tighter">Acceso</h4>
          <p class="text-[#3f98ff] font-bold text-[10px] tracking-[0.4em] uppercase mt-4">Panel de Control</p>
        </div>

        <div v-if="message" class="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 text-[11px] font-bold italic animate-pulse border border-red-100 text-center">
          ⚠️ {{ message }}
        </div>

        <form @submit.prevent="login" class="space-y-6">
          <div class="space-y-1">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email</label>
            <input v-model="form.email" type="email" placeholder="usuario@cvo.com" required
                   class="w-full px-6 py-4 rounded-2xl text-sm font-semibold border-2 border-slate-100 focus:border-[#3f98ff] bg-slate-50/50 outline-none transition-all shadow-inner" />
          </div>

          <div class="space-y-1">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Password</label>
            <input v-model="form.password" type="password" placeholder="••••••••" required
                   class="w-full px-6 py-4 rounded-2xl text-sm font-semibold border-2 border-slate-100 focus:border-[#3f98ff] bg-slate-50/50 outline-none transition-all shadow-inner" />
          </div>

          <button type="submit" :disabled="isLoading"
                  class="group relative w-full bg-slate-900 text-white py-5 rounded-2xl overflow-hidden font-black text-xl uppercase italic shadow-xl active:scale-95 disabled:opacity-50 transition-all">
            <div class="absolute inset-0 bg-[#3f98ff] -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            <span class="relative z-10">{{ isLoading ? 'Verificando...' : 'Entrar' }}</span>
          </button>
        </form>

        <div class="mt-12 text-center border-t border-slate-100 pt-8">
          <p class="text-slate-400 text-xs font-bold italic">
            ¿Aún no tienes cuenta?
            <button @click="router.push('/register')" class="text-[#3f98ff] font-black hover:underline ml-1 uppercase text-[11px] tracking-widest transition-all">Regístrate aquí</button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slow-zoom { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
.animate-slow-zoom { animation: slow-zoom 30s ease-in-out infinite; }
</style>
