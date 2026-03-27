<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div
    class="fixed inset-0 flex flex-col items-center justify-center bg-cover bg-center"
    style="
      background-image:
        linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/Mascotasfondo.jpg');
    "
  >
    <nav class="fixed top-0 left-0 right-0 z-50 bg-[#3f98ff] py-4 shadow-md text-center">
      <h3 class="text-white font-semibold text-xl">Veterinaria del Oriente</h3>
    </nav>

    <div class="bg-white/95 rounded-2xl shadow-2xl p-10 w-[90%] max-w-lg text-center">
      <img src="/logo.jpg" width="80" class="rounded-full mx-auto mb-4" />

      <h1 class="text-4xl font-bold text-blue-500 mb-2">
        ¡Te damos la bienvenida!
      </h1>

      <p class="text-gray-500 mb-8">
        Regístrate para gestionar tus mascotas.
      </p>

      <div class="flex justify-center gap-4">
        <button @click="router.push('/register')" class="bg-green-500 px-6 py-2 text-white rounded">
          Registrarse
        </button>

        <button @click="router.push('/login')" class="bg-blue-500 px-6 py-2 text-white rounded">
          Login
        </button>
      </div>
    </div>
  </div>
</template>
