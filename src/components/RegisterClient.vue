<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFetch } from '@vueuse/core';

const url = computed(() => 'http://127.0.0.1:8000/api/empleado/clientes');

const name     = ref('');
const email    = ref('');
const password = ref('');

const body = computed(() => ({
  name:     name.value,
  email:    email.value,
  password: password.value,
}));

const token = localStorage.getItem('token') ?? '';

const { isFetching, data, error, execute } = useFetch(url, {
  immediate: false,
  beforeFetch({ options }) {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };
    return { options };
  },
  onFetchError(ctx) { return ctx; },
}).post(body).json();

const mensaje = ref('');

async function registrar() {
  mensaje.value = '';
  await execute();

  if (data.value?.status === true) {
    mensaje.value = 'Cliente registrado correctamente';
    name.value     = '';
    email.value    = '';
    password.value = '';
  } else {
    mensaje.value = data.value?.message ?? 'Ocurrió un error';
  }
}
</script>

<template>
  <div class="contenedor">
    <h2>Registrar Cliente</h2>

    <p v-if="mensaje">{{ mensaje }}</p>

    <form @submit.prevent="registrar">

      <div>
        <label>Nombre</label>
        <input v-model="name" type="text" placeholder="Nombre completo" />
      </div>

      <div>
        <label>Correo</label>
        <input v-model="email" type="email" placeholder="correo@ejemplo.com" />
      </div>

      <div>
        <label>Contraseña</label>
        <input v-model="password" type="password" placeholder="Mínimo 6 caracteres" />
      </div>

      <button type="submit" :disabled="isFetching">
        {{ isFetching ? 'Guardando...' : 'Registrar' }}
      </button>

    </form>
  </div>
</template>

<style scoped>
.contenedor {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-family: sans-serif;
}

h2 {
  margin-bottom: 1rem;
}

form div {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 1rem;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

input {
  padding: 0.6rem 0.8rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
}

input:focus {
  border-color: #0d9488;
}

button {
  width: 100%;
  padding: 0.65rem;
  background: #0d9488;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

p {
  padding: 0.75rem;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 8px;
  color: #0f766e;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
