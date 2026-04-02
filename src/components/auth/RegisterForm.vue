<script setup lang="ts">
import { ref } from 'vue'
import { type RegisterCredentials } from '@/types/auth'
import { useFetch } from '@vueuse/core'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref<RegisterCredentials>({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone: '',
  address: '',
   role_id: 3,
})

const message = ref('')
const isError = ref(false)
const isLoading = ref(false)

function register() {
  message.value = ''
  isError.value = false

  if (form.value.password !== form.value.password_confirmation) {
    isError.value = true
    message.value = 'Las contraseñas no coinciden'
    return
  }

  isLoading.value = true

  // Aquí disparamos la petición directa, sin intermediarios
  const { data, onFetchResponse, onFetchError } = useFetch(
    import.meta.env.VITE_API_URL + '/register',
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true', // Súper importante si usas ngrok
      },
    }
  ).post(form.value).json()

  // Si Laravel responde con éxito (Código 200 o 201)
  onFetchResponse(() => {
    isLoading.value = false
    isError.value = false
    message.value = data.value?.message ?? 'Usuario registrado correctamente'

    setTimeout(() => {
      router.push('/login')
    }, 1500)
  })

  // Si Laravel manda un error o la petición choca
  onFetchError((error) => {
    isLoading.value = false
    isError.value = true
    message.value = 'Error al registrar. Verifica los datos e intenta de nuevo.'
    console.error('El chisme del error:', error) // Esto te dirá en consola qué falló exactamente
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
    <!-- Navbar -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 py-4 shadow-md text-center"
      style="background-color: #3f98ff"
    >
      <h3 class="text-white font-semibold text-xl tracking-wide">Veterinaria del Oriente</h3>
    </nav>

    <!-- Card -->
    <div
      class="bg-white rounded-3xl p-10 w-full max-w-4xl"
      style="
        box-shadow:
          0 20px 60px rgba(63, 152, 255, 0.15),
          0 4px 20px rgba(0, 0, 0, 0.08);
      "
    >
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold mb-1" style="color: #2d8a4e">Crea tu Cuenta de Cliente</h2>
        <p class="text-sm" style="color: #8a9bb0">
          ¡Solo unos datos y estarás listo para agendar citas!
        </p>
      </div>

      <!-- Alerta -->
      <div
        v-if="message"
        class="rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2"
        :style="
          isError
            ? 'background: #fff0f0; border: 1px solid #ffcdd2; color: #c62828;'
            : 'background: #f0fff4; border: 1px solid #c3e6cb; color: #1a7a3c;'
        "
      >
        <span>{{ isError ? '⚠' : '✓' }}</span> {{ message }}
      </div>

      <form @submit.prevent="register">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1">
          <!-- Columna izquierda -->
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-semibold mb-2" style="color: #4a5568"
                >Nombre Completo</label
              >
              <input
                v-model="form.name"
                type="text"
                placeholder="Nombre y Apellidos"
                required
                class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400"
                style="border: 1.5px solid #e2e8f0; color: #2d3748; background: #f8faff"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2" style="color: #4a5568"
                >Teléfono</label
              >
              <input
                v-model="form.phone"
                type="tel"
                placeholder="Ej: 555-123-4567"
                class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400"
                style="border: 1.5px solid #e2e8f0; color: #2d3748; background: #f8faff"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2" style="color: #4a5568">Email</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400"
                style="border: 1.5px solid #e2e8f0; color: #2d3748; background: #f8faff"
              />
            </div>
          </div>

          <!-- Columna derecha -->
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-semibold mb-2" style="color: #4a5568"
                >Contraseña</label
              >
              <input
                v-model="form.password"
                type="password"
                placeholder="Mínimo 4 caracteres"
                required
                class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400"
                style="border: 1.5px solid #e2e8f0; color: #2d3748; background: #f8faff"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2" style="color: #4a5568"
                >Confirmar Contraseña</label
              >
              <input
                v-model="form.password_confirmation"
                type="password"
                placeholder="Repite tu contraseña"
                required
                class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400"
                style="border: 1.5px solid #e2e8f0; color: #2d3748; background: #f8faff"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2" style="color: #4a5568"
                >Domicilio</label
              >
              <input
                v-model="form.address"
                type="text"
                placeholder="Calle, número, colonia"
                class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400"
                style="border: 1.5px solid #e2e8f0; color: #2d3748; background: #f8faff"
              />
            </div>
          </div>
        </div>

        <!-- Botón -->
        <div class="text-center mt-8">
          <button
            type="submit"
            :disabled="isLoading"
            class="text-white font-semibold px-12 py-3 rounded-xl transition-all duration-200 disabled:opacity-70"
            style="
              background: linear-gradient(135deg, #28a745, #1e7e34);
              box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
            "
          >
            {{ isLoading ? 'Registrando...' : 'Confirmar Registro' }}
          </button>
        </div>
      </form>

      <div class="text-center mt-6 pt-5" style="border-top: 1px solid #e2e8f0">
        <p class="text-sm" style="color: #8a9bb0">
          ¿Ya tienes una cuenta?
          <a
            @click="router.push('/login')"
            class="font-semibold cursor-pointer hover:underline"
            style="color: #3f98ff"
          >
            Inicia Sesión aquí
          </a>
        </p>
      </div>
    </div>
  </div>
</template>
