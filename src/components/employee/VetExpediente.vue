<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiUseFetch } from '@/composables/ApiUseFetch'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const isSaving = ref(false)
const message = ref('')
const isError = ref(false)

const form = ref({
  weight: '',
  temperature: '',
  symptoms: '',
  diagnosis: '',
  treatment: '',
  prescriptions: '',
  observations: '',
  next_visit: '',
})


const info = ref({
  pet: '',
  species: '',
  service: '',
  date: '',
  vet: '',
})



function loadRecord() {
  isLoading.value = true

  const id = route.params.id

  const { data, onFetchResponse, onFetchError, execute } = ApiUseFetch(`/medical-records/${id}`)
    .get()
    .json()

  onFetchResponse(() => {
    isLoading.value = false
    const d = data.value?.data

