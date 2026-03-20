import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiUseFetch } from '@/services/ApiUseFetch.ts'


//parte de joan

// Así se ve un cliente
interface Cliente {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
  active: boolean
  role: string
  pets?: any[] // sus mascotas (opcional)
}

export const useClienteStore = defineStore('cliente', () => {
  // ── STATE ─────────────────────────────────────────────

  const clientes = ref<Cliente[]>([]) // lista de todos los clientes
  const clienteActual = ref<Cliente | null>(null) // el cliente seleccionado
  const loading = ref(false) // true mientras espera respuesta del backend
  const error = ref<string | null>(null) // mensaje de error si algo falla

  // ── ACTIONS ───────────────────────────────────────────

  // Pide todos los clientes al backend
  async function fetchClientes() {
    loading.value = true // activamos el "cargando..."
    error.value = null // limpiamos errores anteriores

    const { data, error: fetchError } = await ApiUseFetch('/empleado/clients').get().json()

    if (fetchError.value) {
      // Si hubo error, guardamos el mensaje
      error.value = 'Error al cargar clientes'
    } else {
      // Si todo bien, guardamos la lista
      // ?? [] significa: si viene vacío, usa un arreglo vacío
      clientes.value = data.value?.clients ?? []
    }

    loading.value = false // apagamos el "cargando..."
  }

  // Pide UN cliente específico por su id
  async function fetchCliente(id: number) {
    loading.value = true

    const { data, error: fetchError } = await ApiUseFetch(`/empleado/clients/${id}`).get().json()

    if (!fetchError.value) {
      clienteActual.value = data.value?.client ?? null
    }

    loading.value = false
    return clienteActual.value
  }

  // Registra un nuevo cliente en el backend
  async function registrarCliente(payload: {
    name: string
    email: string
    password: string
    phone: string
    address: string
  }) {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await ApiUseFetch('/register')
      .post(payload) // enviamos los datos del formulario
      .json()

    loading.value = false

    if (fetchError.value) {
      // Si falló, guardamos el error y lanzamos excepción
      // para que el componente lo pueda atrapar con try/catch
      error.value = data.value?.message || 'Error al registrar cliente'
      throw new Error(error.value!)
    }

    // Si salió bien, agregamos el cliente a la lista local
    // sin tener que volver a pedir todos al backend
    if (data.value?.data) {
      clientes.value.push(data.value.data)
    }

    return data.value
  }

  // Limpia el cliente seleccionado (útil al salir de una pantalla)
  function limpiarClienteActual() {
    clienteActual.value = null
  }

  return {
    clientes,
    clienteActual,
    loading,
    error,
    fetchClientes,
    fetchCliente,
    registrarCliente,
    limpiarClienteActual,
  }
})
