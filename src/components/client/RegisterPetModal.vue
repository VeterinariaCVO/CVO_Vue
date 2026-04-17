<template>
  <div
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 italic"
  >
    <div
      class="bg-white rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 flex flex-col no-scrollbar"
    >
      <div class="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
        <div>
          <h2 class="text-2xl font-black text-slate-900 uppercase tracking-tighter m-0 italic">
            Nueva Mascota
          </h2>
          <p class="text-[#3f98ff] text-[9px] font-black uppercase tracking-[0.3em] mt-1 m-0">
            Registro de Paciente
          </p>
        </div>
        <button
          @click="$emit('cerrar')"
          class="w-10 h-10 rounded-full bg-slate-100 text-slate-400 border-none cursor-pointer flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
        >
          ✕
        </button>
      </div>

      <div class="p-8 space-y-6">
        <div class="flex flex-col items-center gap-4">
          <div
            @click="inputFoto?.click()"
            class="group relative w-32 h-32 border-4 border-dashed border-slate-100 rounded-[2rem] cursor-pointer overflow-hidden flex items-center justify-center bg-slate-50 hover:border-[#3f98ff] hover:bg-[#3f98ff]/5 transition-all"
          >
            <img
              v-if="preview"
              :src="preview"
              class="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
            <div v-else class="flex flex-col items-center gap-1 text-slate-300">
              <svg
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
              <p class="text-[8px] font-black uppercase tracking-widest m-0">Subir Foto</p>
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
            type="button"
            @click="eliminarFoto"
            class="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline bg-transparent border-none cursor-pointer p-0"
          >
            Eliminar imagen
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="flex flex-col gap-1.5">
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic"
              >Nombre *</label
            >
            <input v-model="form.name" placeholder="Ej: Max" :class="ic('name')" />
            <p v-if="errores.name" class="text-red-500 text-[9px] font-black uppercase italic m-0">
              {{ errores.name }}
            </p>
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic"
            >
              Especie *
            </label>

            <select
              v-model="form.species"
              :class="ic('species')"
              class="cursor-pointer appearance-none"
            >
              <option value="" disabled selected>Seleccionar especie...</option>

              <optgroup label="Domésticas" class="font-black uppercase italic text-[#3f98ff]">
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Conejo">Conejo</option>
                <option value="Hámster">Hámster</option>
                <option value="Cobaya">Cobaya</option>
                <option value="Pájaro">Pájaro</option>
                <option value="Tortuga">Tortuga</option>
                <option value="Pez">Pez</option>
              </optgroup>

              <optgroup label="Granja" class="font-black uppercase italic text-[#3f98ff]">
                <option value="Caballo">Caballo</option>
                <option value="Vaca">Vaca</option>
                <option value="Cerdo">Cerdo</option>
                <option value="Cabra">Cabra</option>
                <option value="Oveja">Oveja</option>
                <option value="Gallina">Gallina</option>
                <option value="Pato">Pato</option>
              </optgroup>
            </select>

            <p
              v-if="errores.species"
              class="text-red-500 text-[9px] font-black uppercase italic m-0 px-1"
            >
              {{ errores.species }}
            </p>
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic"
              >Sexo *</label
            >
            <select v-model="form.sex" :class="ic('sex')">
              <option value="male">Macho</option>
              <option value="female">Hembra</option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic"
              >Raza</label
            >
            <input v-model="form.breed" placeholder="Ej: Husky" :class="ic('breed')" />
          </div>
        </div>

        <div class="bg-[#f8fafc] p-5 rounded-[1.5rem] border border-slate-50">
          <label
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest italic block mb-3"
            >Edad Estimada</label
          >
          <div class="flex gap-4">
            <div class="flex-1">
              <input v-model="form.age" type="number" placeholder="0" :class="ic('age')" />
              <span
                class="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center block mt-1"
                >Años</span
              >
            </div>
            <div class="flex-1">
              <input
                v-model="form.age_months"
                type="number"
                placeholder="0"
                :class="ic('age_months')"
              />
              <span
                class="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center block mt-1"
                >Meses</span
              >
            </div>
          </div>
          <p
            v-if="errores.age || errores.age_months"
            class="text-red-500 text-[9px] font-black uppercase italic mt-2 m-0 text-center"
          >
            {{ errores.age || errores.age_months }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-5">
          <div class="flex flex-col gap-1.5">
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic"
              >Peso (kg)</label
            >
            <input
              v-model="form.weight"
              type="number"
              step="0.1"
              placeholder="0.0"
              :class="ic('weight')"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic"
              >Color</label
            >
            <input v-model="form.color" placeholder="Blanco/Gris" :class="ic('color')" />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic"
            >Marcas Especiales</label
          >
          <textarea
            v-model="form.special_marks"
            rows="2"
            placeholder="Cicatrices, manchas, etc."
            :class="ic('special_marks') + ' resize-none'"
          ></textarea>
        </div>
      </div>

      <div class="p-8 pt-4 flex gap-4 bg-slate-50/50">
        <button
          @click="$emit('cerrar')"
          class="flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          @click="registrar"
          :disabled="guardando"
          class="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border-none cursor-pointer transition-all shadow-lg shadow-[#3f98ff]/20 active:scale-95"
          :class="
            guardando ? 'bg-slate-200 text-slate-400' : 'bg-[#3f98ff] text-white hover:bg-[#2d87ee]'
          "
        >
          {{ guardando ? 'Guardando...' : 'Confirmar Registro' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits<{ cerrar: []; guardado: [] }>()

const authStore = useAuthStore()
const guardando = ref(false)
const errores = ref<Record<string, string>>({})

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
const inputFoto = ref<HTMLInputElement | null>(null)

function seleccionarFoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  fotoArchivo.value = file
  preview.value = URL.createObjectURL(file)
}
function eliminarFoto() {
  preview.value = null
  fotoArchivo.value = null
}

function validar(): boolean {
  errores.value = {}
  if (!form.value.name.trim()) errores.value.name = 'Nombre requerido'
  if (!form.value.species.trim()) errores.value.species = 'Especie requerida'

  const años = Number(form.value.age || 0)
  const meses = Number(form.value.age_months || 0)

  if (años < 0 || años > 30) errores.value.age = 'Edad inválida (0-30)'
  if (meses < 0 || meses > 11) errores.value.age_months = 'Meses inválidos (0-11)'

  return Object.keys(errores.value).length === 0
}

async function registrar() {
  if (guardando.value) return
  if (!validar()) return

  guardando.value = true
  const totalMeses = Number(form.value.age || 0) * 12 + Number(form.value.age_months || 0)

  const formData = new FormData()
  Object.entries(form.value).forEach(([key, value]) => {
    if (key !== 'age' && key !== 'age_months') formData.append(key, String(value))
  })
  formData.append('age', String(totalMeses))
  if (fotoArchivo.value) formData.append('photo', fotoArchivo.value)

  try {
    await fetch(`${import.meta.env.VITE_API_URL}/mis-mascotas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}`, Accept: 'application/json' },
      body: formData,
    })
    emit('guardado')
    emit('cerrar')
  } catch (e) {
    console.error(e)
  } finally {
    guardando.value = false
  }
}

const inputClass =
  'w-full bg-[#f8fafc] border-[2px] rounded-xl px-4 py-3 text-[11px] font-black text-slate-800 uppercase italic outline-none transition-all duration-200 placeholder:text-slate-300 focus:bg-white focus:shadow-xl focus:shadow-[#3f98ff]/5'

function ic(campo: string) {
  return (
    inputClass +
    (errores.value[campo]
      ? ' border-red-200 focus:border-red-400'
      : ' border-slate-100 focus:border-[#3f98ff]')
  )
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
