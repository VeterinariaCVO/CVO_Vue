<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const clientes = ref<any[]>([])
const mascotas = ref<any[]>([])
const servicios = ref<any[]>([])
const clienteSeleccionado = ref<number | null>(null)
const mascotaSeleccionada = ref<number | null>(null)
const servicioSeleccionado = ref<number | null>(null)
const paso = ref(1)
const cargando = ref(false)
const mensajeExito = ref('')
const mensajeError = ref('')

const formulario = ref({
  inicio_enfermedad: '',
  habitat: '',
  dx_presuntivo: '',
  dx_diferencial: '',
  observaciones: '',
  fallecio: false,
  sospecha_muerte: '',
})

const tratamientos = ref([{ nombre_comercial: '', dosis_ml: '', via_admin: '', num_dias: '' }])

onMounted(async () => {
  const { data: dc, execute: ec } = ApiUseFetch('/empleado/clients', { immediate: false })
    .get()
    .json()
  await ec()
  clientes.value = dc.value?.clients ?? []

  const { data: ds, execute: es } = ApiUseFetch('/service', { immediate: false }).get().json()
  await es()
  servicios.value = ds.value?.data ?? []
})


