<script setup lang="ts">
import { ref, computed } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch'


interface Appointment {
  id: number
  is_walk_in: boolean
  status: string
  notes: string | null
  pet: {
    id: number
    name: string
  }
  client: {
    id: number
    name: string
    phone: string
  }
  service: {
    id: number
    name: string
    price: string
  }
  time_slot: {
    id: number
    date: string
    start_time: string
    end_time: string
  }
  created_by: string
  created_at: string
}


const appointments = ref<Appointment[]>([])
const isLoading = ref(true)
const message = ref('')
const isError = ref(false)
const filterStatus = ref('all')
const showModal = ref(false)
const selectedApp = ref<Appointment | null>(null)

const form = ref({
  appointment_id: null as number | null,
  weight: '',
  temperature: '',
  symptoms: '',
  diagnosis: '',
  treatment: '',
  prescriptions: '',
  observations: '',
  next_visit: '',
})


function loadAppointments() {
  isLoading.value = true

  const { data, onFetchResponse, onFetchError } = ApiUseFetch('/appointments', {
    immediate: true,
  })
    .get()
    .json()

  onFetchResponse(() => {
    isLoading.value = false
    appointments.value = data.value?.data ?? []
  })

  onFetchError(() => {
    isLoading.value = false
    showMsg('No se pudieron cargar las citas', true)
  })
}

loadAppointments()



const filtered = computed(() => {
  if (filterStatus.value === 'all') return appointments.value
  return appointments.value.filter((a) => a.status === filterStatus.value)
})


function openModal(appointment: Appointment) {
  selectedApp.value = appointment
  form.value = {
    appointment_id: appointment.id,
    weight: '',
    temperature: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    prescriptions: '',
    observations: '',
    next_visit: '',
  }
  showModal.value = true
}



