<script setup lang="ts">
import { ref } from 'vue'
import { type Credentials } from '@/types/auth'
import { useFetch } from '@vueuse/core'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = ref<Credentials>({
  email: '',
  password: '',
})

const message = ref('')
const isLoading = ref(false)

function login() {
  message.value = ''
  isLoading.value = true

  const { data, onFetchResponse, onFetchError } = useFetch(
    import.meta.env.VITE_API_URL + '/login',
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    },
  )
    .post(form.value)
    .json()

  onFetchResponse(() => {
    isLoading.value = false

    const loginData = data.value?.data || data.value

    if (loginData?.token) {
      authStore.token = loginData.token
      authStore.user = loginData.user
      localStorage.setItem('token', loginData.token) // ← agrega esto
      localStorage.setItem('user', JSON.stringify(loginData.user)) // ← agrega esto

      router.push('/dashboard')
    }
  })
}
</script>

<template>
  <div
    class="fixed inset-0 flex items-center justify-center"
    style="
      background: linear-gradient(135deg, #e8f4ff 0%, #f4f9ff 50%, #e0eeff 100%);
      font-family: 'Poppins', sans-serif;
    "
  >
    <nav
      class="fixed top-0 left-0 right-0 z-50 py-4 shadow-md text-center"
      style="background-color: #3f98ff"
    >
      <h3 class="text-white font-semibold text-xl tracking-wide">Veterinaria del Oriente</h3>
    </nav>

    <div
      class="bg-white rounded-3xl p-10 w-full max-w-md"
      style="
        box-shadow:
          0 20px 60px rgba(63, 152, 255, 0.15),
          0 4px 20px rgba(0, 0, 0, 0.08);
      "
    >
      <!-- Header -->
      <div class="text-center mb-8">
        <img
          src="/logo.jpg"
          width="75"
          class="rounded-full mx-auto mb-4 border-2 border-blue-100"
          alt="Logo"
          style="box-shadow: 0 4px 12px rgba(63, 152, 255, 0.2)"
        />
        <h4 class="text-2xl font-bold mb-1" style="color: #1a6fd4">Acceso al Sistema</h4>
        <p class="text-sm" style="color: #8a9bb0">Ingresa tus credenciales para continuar</p>
      </div>

      <!-- Error -->
      <div
        v-if="message"
        class="rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2"
        style="background: #fff0f0; border: 1px solid #ffcdd2; color: #c62828"
      >
        <span>⚠</span> {{ message }}
      </div>

      <form @submit.prevent="login" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold mb-2" style="color: #4a5568"
            >Correo electrónico</label
          >
          <input
            v-model="form.email"
            type="email"
            placeholder="ejemplo@veterinaria.com"
            required
            class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style="border: 1.5px solid #e2e8f0; color: #2d3748; background: #f8faff"
            @focus="($event.target as HTMLInputElement).style.border = '1.5px solid #3f98ff'"
            @blur="($event.target as HTMLInputElement).style.border = '1.5px solid #e2e8f0'"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-2" style="color: #4a5568">Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
            class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style="border: 1.5px solid #e2e8f0; color: #2d3748; background: #f8faff"
            @focus="($event.target as HTMLInputElement).style.border = '1.5px solid #3f98ff'"
            @blur="($event.target as HTMLInputElement).style.border = '1.5px solid #e2e8f0'"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full text-white font-semibold py-3 rounded-xl text-base transition-all duration-200 disabled:opacity-70 mt-2"
          style="
            background: linear-gradient(135deg, #3f98ff, #1a6fd4);
            box-shadow: 0 4px 15px rgba(63, 152, 255, 0.4);
            letter-spacing: 0.3px;
          "
        >
          {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <p class="text-center text-sm mt-6" style="color: #8a9bb0">
        ¿No tienes cuenta?
        <a
          @click="router.push('/register')"
          class="font-semibold cursor-pointer hover:underline"
          style="color: #3f98ff"
        >
          Regístrate aquí
        </a>
      </p>
    </div>
  </div>
</template>
