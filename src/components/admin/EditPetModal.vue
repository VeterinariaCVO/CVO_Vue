<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ApiUseFetch } from '@/composables/ApiUseFetch.ts'

const props = defineProps<{ id: number }>()
const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardado'): void
}>()

const nombre = ref('')
const especie = ref('')
const raza = ref('')
const color = ref('')
const marcas = ref('')
const sexo = ref<'male' | 'female'>('male')
const edad = ref<number | null>(null)
const peso = ref<number | null>(null)
const cargando = ref(false)
const cargandoDatos = ref(true)
const errores = ref<any>({})

const especiesOpciones = ['Perro', 'Gato', 'Ave', 'Conejo', 'Reptil', 'Otro']

const razasPorEspecie: Record<string, string[]> = {
  Perro: ['Labrador', 'Pastor Alemán', 'Bulldog', 'Golden Retriever', 'Chihuahua', 'Poodle', 'Beagle', 'Rottweiler', 'Dálmata', 'Mestizo', 'Otro'],
  Gato: ['Siamés', 'Persa', 'Maine Coon', 'Bengalí', 'Ragdoll', 'Esfinge', 'Angora', 'Mestizo', 'Otro'],
  Ave: ['Periquito', 'Canario', 'Agapornis', 'Cacatúa', 'Loro', 'Guacamayo', 'Ninfas', 'Otro'],
  Conejo: ['Holandés', 'Angora', 'Rex', 'Lionhead', 'Mini Lop', 'Otro'],
  Reptil: ['Iguana', 'Gecko', 'Tortuga', 'Camaleón', 'Serpiente maíz', 'Otro'],
  Otro: ['Otro'],
}

const razasOpciones = computed(() => especie.value ? (razasPorEspecie[especie.value] ?? ['Otro']) : [])

function onEspecieChange() {
  raza.value = ''
}

async function cargarMascota() {
  cargandoDatos.value = true
  const { data, execute } = ApiUseFetch(`/admin/pets/${props.id}`).get().json()
  await execute()
  const m = data.value?.data
  nombre.value = m?.name ?? ''
  especie.value = m?.species ?? ''
  raza.value = m?.breed ?? ''
  color.value = m?.color ?? ''
  marcas.value = m?.special_marks ?? ''
  sexo.value = m?.sex ?? 'male'
  edad.value = m?.age ?? null
  peso.value = m?.weight ?? null
  cargandoDatos.value = false
}

async function actualizar() {
  errores.value = {}
  cargando.value = true
  const { data, execute } = ApiUseFetch(`/admin/pets/${props.id}`).put({
    name: nombre.value,
    species: especie.value,
    breed: raza.value || null,
    color: color.value || null,
    special_marks: marcas.value || null,
    sex: sexo.value,
    age: edad.value,
    weight: peso.value,
  }).json()
  await execute()
  cargando.value = false
  if ((data.value as any)?.errors) {
    const e = (data.value as any).errors as any
    for (const campo in e) errores.value[campo] = e[campo][0]
    return
  }
  emit('guardado')
}

onMounted(cargarMascota)
</script>

<template>
  <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50" @click.self="emit('cerrar')">
    <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-base font-semibold text-slate-800">Editar mascota</h2>
        <button @click="emit('cerrar')" class="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-lg leading-none">✕</button>
      </div>

      <p v-if="cargandoDatos" class="text-sm text-slate-400 py-4 text-center">Cargando...</p>

      <div v-else class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Nombre</label>
          <input v-model="nombre" type="text" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          <span v-if="errores.name" class="text-xs text-red-500">{{ errores.name }}</span>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Especie</label>
          <select
            v-model="especie"
            @change="onEspecieChange"
            class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors bg-white"
          >
            <option value="">Selecciona una especie</option>
            <option v-for="e in especiesOpciones" :key="e" :value="e">{{ e }}</option>
          </select>
          <span v-if="errores.species" class="text-xs text-red-500">{{ errores.species }}</span>
        </div>

        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-xs text-slate-500">Raza</label>
            <select
              v-model="raza"
              :disabled="!especie"
              class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors bg-white disabled:opacity-50"
            >
              <option value="">{{ especie ? 'Selecciona una raza' : 'Elige especie primero' }}</option>
              <option v-for="r in razasOpciones" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-xs text-slate-500">Color</label>
            <input v-model="color" type="text" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Sexo</label>
          <select v-model="sexo" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors bg-white">
            <option value="male">Macho</option>
            <option value="female">Hembra</option>
          </select>
        </div>

        <div class="flex gap-3">
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-xs text-slate-500">Edad (años)</label>
            <input v-model.number="edad" type="number" min="0" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-xs text-slate-500">Peso (kg)</label>
            <input v-model.number="peso" type="number" min="0" step="0.1" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Marcas especiales</label>
          <input v-model="marcas" type="text" class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 transition-colors" />
        </div>
      </div>

      <div v-if="!cargandoDatos" class="flex gap-2 mt-5">
        <button @click="emit('cerrar')" class="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-transparent">Cancelar</button>
        <button @click="actualizar" :disabled="cargando" class="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm py-2 rounded-lg cursor-pointer border-none transition-colors">
          {{ cargando ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>