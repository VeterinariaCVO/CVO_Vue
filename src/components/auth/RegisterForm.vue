<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const paso = ref(1) // Control de pasos
const isLoading = ref(false)
const message = ref('')

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
    message.value = 'Por favor, completa tus datos básicos'
  }
}

const register = async () => {
  if (form.password.length < 8) {
    message.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }
  if (form.password !== form.password_confirmation) {
    message.value = 'Las contraseñas no coinciden'
    return
  }

  isLoading.value = true
  // Aquí iría tu fetch al backend
}
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center lg:justify-end relative overflow-hidden bg-slate-900 p-6 lg:p-20 font-sans italic selection:bg-blue-100">

    <div class="absolute inset-0 z-0">
      <img src="/regfondo.jpg" class="w-full h-full object-cover opacity-40 animate-slow-zoom" />
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
      <div class="bg-white/90 backdrop-blur-2xl rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] border border-white/40 p-10 md:p-14">

        <div class="flex justify-center gap-2 mb-8">
          <div :class="paso === 1 ? 'w-12 bg-[#3f98ff]' : 'w-4 bg-slate-200'" class="h-1.5 rounded-full transition-all duration-500"></div>
          <div :class="paso === 2 ? 'w-12 bg-[#3f98ff]' : 'w-4 bg-slate-200'" class="h-1.5 rounded-full transition-all duration-500"></div>
        </div>

        <div class="text-center mb-8">
          <h4 class="text-4xl font-black text-slate-800 uppercase tracking-tighter leading-none italic">
            {{ paso === 1 ? 'Tus Datos' : 'Seguridad' }}
          </h4>
          <p class="text-[#3f98ff] font-bold text-[9px] tracking-[0.4em] uppercase mt-3">
            {{ paso === 1 ? 'Paso 1 de 2' : 'Paso 2 de 2' }}
          </p>
        </div>

        <transition name="fade">
          <div v-if="message" class="bg-red-50 text-red-700 p-4 rounded-2xl mb-6 text-[11px] font-bold text-center italic">
            ⚠️ {{ message }}
          </div>
        </transition>

        <form @submit.prevent="register" class="space-y-5">

          <div v-if="paso === 1" class="space-y-5 animate-slide-in">
            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre Completo</label>
              <input v-model="form.name" type="text" placeholder="Juan Pérez" required
                class="w-full px-5 py-3.5 rounded-2xl text-sm font-semibold outline-none border-2 border-slate-100 focus:border-[#3f98ff] bg-slate-50/50 focus:bg-white transition-all shadow-inner" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Correo Electrónico</label>
              <input v-model="form.email" type="email" placeholder="correo@ejemplo.com" required
                class="w-full px-5 py-3.5 rounded-2xl text-sm font-semibold outline-none border-2 border-slate-100 focus:border-[#3f98ff] bg-slate-50/50 focus:bg-white transition-all shadow-inner" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Teléfono</label>
              <input v-model="form.phone" type="tel" placeholder="871 000 0000"
                class="w-full px-5 py-3.5 rounded-2xl text-sm font-semibold outline-none border-2 border-slate-100 focus:border-[#3f98ff] bg-slate-50/50 focus:bg-white transition-all shadow-inner" />
            </div>
            <button type="button" @click="irAlPaso2"
              class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-tighter hover:bg-[#3f98ff] transition-all shadow-xl mt-4">
              Siguiente Paso →
            </button>
          </div>

          <div v-if="paso === 2" class="space-y-5 animate-slide-in">
            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Domicilio</label>
              <input v-model="form.address" type="text" placeholder="Calle y número"
                class="w-full px-5 py-3.5 rounded-2xl text-sm font-semibold outline-none border-2 border-slate-100 focus:border-[#3f98ff] bg-slate-50/50 focus:bg-white transition-all shadow-inner" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contraseña (mín. 8)</label>
              <input v-model="form.password" type="password" placeholder="••••••••" required
                class="w-full px-5 py-3.5 rounded-2xl text-sm font-semibold outline-none border-2 border-slate-100 focus:border-[#3f98ff] bg-slate-50/50 focus:bg-white transition-all shadow-inner" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Confirmar</label>
              <input v-model="form.password_confirmation" type="password" placeholder="••••••••" required
                class="w-full px-5 py-3.5 rounded-2xl text-sm font-semibold outline-none border-2 border-slate-100 focus:border-[#3f98ff] bg-slate-50/50 focus:bg-white transition-all shadow-inner" />
            </div>
            <div class="flex gap-3 mt-4">
              <button type="button" @click="paso = 1"
                class="w-1/3 border-2 border-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-50 transition-all">
                Atrás
              </button>
              <button type="submit" :disabled="isLoading"
                class="w-2/3 bg-[#22c55e] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-tighter shadow-lg shadow-green-100 hover:bg-green-600 transition-all">
                {{ isLoading ? 'Registrando...' : 'Finalizar ✓' }}
              </button>
            </div>
          </div>
        </form>

        <div class="mt-10 text-center border-t border-slate-100 pt-8">
          <button @click="router.push('/login')" class="text-slate-400 text-xs font-bold hover:text-[#3f98ff] transition-colors">
            ¿Ya tienes cuenta? <span class="font-black uppercase text-[11px] ml-1">Inicia sesión</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slow-zoom {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
.animate-slow-zoom { animation: slow-zoom 30s ease-in-out infinite; }

/* Animación de entrada para los pasos */
.animate-slide-in {
  animation: slideIn 0.4s ease-out forwards;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
