<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { getStorageUrl } from '@/utils/storageUrl'

const props = defineProps<{ id: number }>()
const emit = defineEmits<{ cerrar: []; guardado: [] }>()

const authStore = useAuthStore()
const cargando = ref(true)
const guardando = ref(false)
const errores = ref<Record<string, string>>({})
const mensaje = ref('')

const form = ref({
  name: '',
  species: '',
  sex: 'male',
  breed: '',
  color: '',
  special_marks: '',
  age: '',
  age_months: '',
  weight: '',
})

const preview = ref<string | null>(null)
const fotoArchivo = ref<File | null>(null)
const eliminarFoto = ref(false)
const inputFoto = ref<HTMLInputElement | null>(null)

// --- Lógica de Negocio ---
function seleccionarFoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  fotoArchivo.value = file
  eliminarFoto.value = false
  preview.value = URL.createObjectURL(file)
}

function quitarFoto() {
  preview.value = null
  fotoArchivo.value = null
  eliminarFoto.value = true
}

async function cargarMascota() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/mis-mascotas/${props.id}`, {
      headers: { Authorization: `Bearer ${authStore.token}`, Accept: 'application/json' },
    })
    const json = await response.json()
    const d = json.data

    const totalMeses = Number(d.age ?? 0)
    const años = Math.floor(totalMeses / 12)
    const meses = totalMeses % 12

    form.value = {
      name: d.name ?? '',
      species: d.species ?? '',
      sex: d.sex ?? 'male',
      breed: d.breed ?? '',
      color: d.color ?? '',
      special_marks: d.special_marks ?? '',
      age: String(años),
      age_months: String(meses),
      weight: String(d.weight ?? ''),
    }
    preview.value = getStorageUrl(d.photo_url) ?? null
  } catch {
    mensaje.value = 'Error al obtener datos.'
  } finally {
    cargando.value = false
  }
}

async function guardar() {
  if (guardando.value) return
  guardando.value = true

  const totalMeses = Number(form.value.age || 0) * 12 + Number(form.value.age_months || 0)
  const formData = new FormData()
  formData.append('_method', 'PUT')
  formData.append('name', form.value.name)
  formData.append('species', form.value.species)
  formData.append('sex', form.value.sex)
  formData.append('breed', form.value.breed)
  formData.append('color', form.value.color)
  formData.append('special_marks', form.value.special_marks)
  formData.append('age', String(totalMeses))
  formData.append('weight', form.value.weight)
  if (fotoArchivo.value) formData.append('photo', fotoArchivo.value)
  if (eliminarFoto.value) formData.append('remove_photo', '1')

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/mis-mascotas/${props.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}`, Accept: 'application/json' },
      body: formData,
    })
    if (!res.ok) throw new Error()
    emit('guardado')
    emit('cerrar')
  } catch {
    mensaje.value = 'Error al intentar actualizar los datos.'
  } finally {
    guardando.value = false
  }
}

// Estilos basados en tu Sidebar
const labelClass = 'text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2 italic'
const inputBase =
  'w-full bg-[#f8fafc] border border-slate-200 rounded-[1.2rem] px-4 py-3 text-[11px] font-bold text-slate-700 outline-none transition-all duration-300 italic'

function getIc(campo: string) {
  return `${inputBase} ${errores.value[campo] ? 'border-red-400 ring-4 ring-red-500/5' : 'focus:border-[#3f98ff] focus:ring-4 focus:ring-[#3f98ff]/10'}`
}

onMounted(cargarMascota)
</script>

<template>
  <div
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4 selection:bg-blue-100"
  >
    <div
      class="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-white/20"
    >
      <div
        class="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-[#f8fafc]"
      >
        <div>
          <h2
            class="text-[#3f98ff] text-xl font-black italic uppercase tracking-tighter leading-none"
          >
            Expediente
          </h2>
          <p class="text-slate-400 text-[8px] font-bold uppercase tracking-[0.2em] mt-1">
            Edición de paciente v2.0
          </p>
        </div>
        <button
          @click="$emit('cerrar')"
          class="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" stroke-width="3" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-10 py-8 no-scrollbar">
        <div v-if="cargando" class="flex flex-col items-center justify-center py-12">
          <div
            class="w-8 h-8 border-4 border-[#3f98ff] border-t-transparent rounded-full animate-spin"
          ></div>
        </div>

        <template v-else>
          <div
            v-if="mensaje"
            class="bg-red-50 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-2xl px-4 py-3 mb-6 border border-red-100 italic"
          >
            {{ mensaje }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-6">
              <div class="flex flex-col">
                <label :class="labelClass">Fotografía Actual</label>
                <div
                  @click="inputFoto?.click()"
                  class="relative aspect-square w-full rounded-[2rem] bg-[#f8fafc] border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer group hover:border-[#3f98ff] transition-all"
                >
                  <img
                    v-if="preview"
                    :src="preview"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    v-else
                    class="flex flex-col items-center justify-center h-full text-slate-400"
                  >
                    <span class="text-[8px] font-black uppercase tracking-widest italic"
                      >Subir Imagen</span
                    >
                  </div>
                </div>
                <input
                  ref="inputFoto"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="seleccionarFoto"
                />
                <button
                  v-if="preview"
                  @click="quitarFoto"
                  class="mt-3 text-[8px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors italic self-start px-2"
                >
                  [ Eliminar Foto ]
                </button>
              </div>

              <div class="flex flex-col">
                <label :class="labelClass">Nombre del Paciente</label>
                <input v-model="form.name" placeholder="EJ. ROCKY" :class="getIc('name')" />
              </div>
            </div>

            <div class="space-y-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <label :class="labelClass">Especie</label>
                  <input
                    v-model="form.species"
                    list="especies-list"
                    placeholder="BUSCAR..."
                    :class="getIc('species')"
                  />
                  <datalist id="especies-list">
                    <option value="Perro">Doméstica</option>
                    <option value="Gato">Doméstica</option>
                    <option value="Caballo">Granja</option>
                    <option value="Vaca">Granja</option>
                  </datalist>
                </div>
                <div class="flex flex-col">
                  <label :class="labelClass">Sexo</label>
                  <select v-model="form.sex" :class="getIc('sex')">
                    <option value="male">MACHO</option>
                    <option value="female">HEMBRA</option>
                  </select>
                </div>
              </div>

              <div class="flex flex-col">
                <label :class="labelClass">Raza / Variedad</label>
                <input
                  v-model="form.breed"
                  placeholder="EJ. PASTOR ALEMÁN"
                  :class="getIc('breed')"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col">
                  <label :class="labelClass">Color</label>
                  <input v-model="form.color" placeholder="EJ. MIEL" :class="getIc('color')" />
                </div>
                <div class="flex flex-col">
                  <label :class="labelClass">Peso (KG)</label>
                  <input v-model="form.weight" type="number" step="0.1" :class="getIc('weight')" />
                </div>
              </div>

              <div class="flex flex-col">
                <label :class="labelClass">Edad Estimada</label>
                <div class="flex gap-3">
                  <div class="relative flex-1">
                    <input
                      v-model="form.age"
                      type="number"
                      :class="getIc('age') + ' text-center'"
                    />
                    <span
                      class="absolute -bottom-4 left-0 w-full text-center text-[7px] font-black text-slate-400 uppercase italic"
                      >Años</span
                    >
                  </div>
                  <div class="relative flex-1">
                    <input
                      v-model="form.age_months"
                      type="number"
                      :class="getIc('age_months') + ' text-center'"
                    />
                    <span
                      class="absolute -bottom-4 left-0 w-full text-center text-[7px] font-black text-slate-400 uppercase italic"
                      >Meses</span
                    >
                  </div>
                </div>
              </div>

              <div class="flex flex-col pt-2">
                <label :class="labelClass">Señas Particulares</label>
                <textarea
                  v-model="form.special_marks"
                  rows="2"
                  :class="getIc('special_marks') + ' resize-none'"
                  placeholder="NOTAS ADICIONALES..."
                ></textarea>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="p-10 border-t border-slate-100 bg-[#f8fafc] flex gap-4">
        <button
          @click="$emit('cerrar')"
          class="flex-1 py-4 rounded-[1.5rem] text-slate-400 font-black uppercase text-[10px] tracking-[0.15em] hover:bg-slate-200/50 transition-all italic"
        >
          Cancelar
        </button>
        <button
          @click="guardar"
          :disabled="guardando"
          class="flex-[2] py-4 rounded-[1.5rem] bg-[#3f98ff] text-white font-black uppercase text-[10px] tracking-[0.15em] shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all italic disabled:opacity-50"
        >
          {{ guardando ? 'Procesando...' : 'Actualizar Expediente' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Forzar mayúsculas en placeholders para el estilo minimal */
input::placeholder,
textarea::placeholder {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 9px;
  opacity: 0.6;
}
</style>
