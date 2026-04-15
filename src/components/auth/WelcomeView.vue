<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Lógica para el Modal de Servicios
const modalAbierto = ref(false)
const servicioSeleccionado = ref({ nombre: '', detalle: '', icon: '' })

const servicios = [
  {
    nombre: 'Baño y estética',
    desc: 'Grooming completo: baño, corte y secado',
    detalle: 'Nuestro servicio integral incluye baño con agua templada, shampoo especializado según el pelaje, corte de uñas, limpieza profunda de oídos y un estilismo profesional acorde a la raza.',
    icon: '🛁'
  },
  {
    nombre: 'Cirugía y Reahabilitación',
    desc: 'Procedimientos quirúrgicos especializados y cuidado postoperatorio',
    detalle: 'Realizamos intervenciones de tejidos blandos y esterilizaciones con tecnología de vanguardia y monitoreo constante de signos vitales para garantizar la seguridad de tu mascota y su recuperación incluyendo seguimiento médico continuo.',
    icon: '🏥'
  },
  {
    nombre: 'Consulta médica',
    desc: 'Revisión general con expertos',
    detalle: 'Evaluación física exhaustiva para prevenir y diagnosticar enfermedades. Incluye revisión de peso, frecuencia cardíaca y asesoría nutricional personalizada.',
    icon: '🩺'
  },
  {
    nombre: 'Desparasitación',
    desc: 'Protección interna y externa',
    detalle: 'Tratamientos preventivos contra parásitos internos, pulgas y garrapatas utilizando productos de alta gama con efecto prolongado.',
    icon: '🛡️'
  },
  {
    nombre: 'Guardería',
    desc: 'El mejor cuidado mientras no estás',
    detalle: 'Áreas seguras y recreativas donde tu mascota podrá socializar bajo supervisión profesional. Incluye periodos de juego, descanso y atención constante.',
    icon: '🏠'
  },
  {
    nombre: 'Vacunación',
    desc: 'Esquemas completos de salud',
    detalle: 'Aplicación de refuerzos anuales y esquemas iniciales (Quíntuple, Rabia, Bordetella, etc.). Te entregamos una cartilla actualizada para el seguimiento de tu amigo.',
    icon: '💉'
  }
]

const abrirServicio = (servicio: any) => {
  servicioSeleccionado.value = servicio
  modalAbierto.value = true
}

const scrollTo = (id: string) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-600">

    <nav class="fixed top-0 left-0 right-0 z-[100] bg-[#3f98ff]/80 backdrop-blur-lg py-4 px-10 flex justify-between items-center border-b border-white/20">
      <div class="flex items-center gap-3 group cursor-pointer" @click="scrollTo('inicio')">
        <div class="bg-white p-1 rounded-xl rotate-3 group-hover:rotate-0 transition-transform duration-300 shadow-lg">
          <img src="/logo.jpg" width="40" class="rounded-lg" />
        </div>
        <div>
          <h3 class="text-white font-black text-xl leading-none italic uppercase">Veterinaria</h3>
          <p class="text-blue-100 text-[10px] font-bold tracking-[0.2em]">DEL ORIENTE</p>
        </div>
      </div>

      <div class="flex items-center gap-10 font-bold text-white">
        <button @click="scrollTo('inicio')" class="hover:text-blue-200 transition">Inicio</button>
        <button @click="scrollTo('info')" class="hover:text-blue-200 transition">Nosotros</button>
        <button @click="scrollTo('servicios')" class="hover:text-blue-200 transition">Servicios</button>
      </div>
    </nav>

    <section id="inicio" class="relative h-[95vh] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent z-10"></div>
        <img src="/Mascotasfondo.jpg" class="w-full h-full object-cover animate-slow-zoom" />
      </div>

      <div class="relative z-20 max-w-7xl mx-auto px-10 grid lg:grid-cols-2 gap-12 items-center">
        <div class="text-white space-y-6">
          <span class="bg-[#22c55e] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">30 años de experiencia</span>
          <h1 class="text-5xl md:text-7xl font-black leading-[1.1] italic">
            Cuidamos lo que <br> <span class="text-blue-400">más amas.</span>
          </h1>
          <p class="text-lg text-blue-50 max-w-md leading-relaxed opacity-90 italic">
            Atención profesional y humana para tus mascotas en el corazón de Torreón.
          </p>
        </div>

        <div class="hidden lg:block">
          <div class="bg-white/10 backdrop-blur-xl p-1 border border-white/20 rounded-[2.5rem] shadow-2xl">
            <div class="bg-white rounded-[2.2rem] p-10 text-center">
              <img src="/logo.jpg" width="80" class="mx-auto mb-6 rounded-3xl shadow-lg rotate-3" />
              <h2 class="text-3xl font-black text-slate-800 mb-2 italic tracking-tighter">¡Hola de nuevo!</h2>
              <p class="text-slate-500 mb-8 font-medium italic">Regístrate para gestionar tus mascotas fácilmente.</p>

              <div class="grid gap-4">
                <button @click="router.push('/register')" class="w-full bg-[#22c55e] text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all">Crear cuenta gratis</button>
                <button @click="router.push('/login')" class="w-full text-[#3f98ff] font-bold hover:underline">Ya tengo cuenta</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 w-full leading-none z-30">
        <svg class="relative block w-full h-[100px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C58.47,112.49,123.89,103.06,182.2,85.11,240.51,67.16,263.39,67.23,321.39,56.44Z" fill="#f8fafc"></path>
        </svg>
      </div>
    </section>

    <section id="info" class="py-24 px-10 max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-5xl font-black text-slate-800 italic uppercase">Veterinario en Torreón</h2>
        <p class="text-slate-500 max-w-3xl mx-auto mt-4 text-lg italic leading-relaxed">
          En Veterinaria del Oriente tenemos años de experiencia dedicados al bienestar y cuidado de los animales en la Comarca Lagunera.
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div class="relative rounded-[3rem] overflow-hidden shadow-2xl h-[550px] border-4 border-white">
          <img src="/info.jpg" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#3f98ff]/80 via-transparent to-transparent flex flex-col justify-end p-10">
            <h3 class="text-white text-5xl font-black italic leading-none uppercase">Hospital <br> 24 HORAS</h3>
          </div>
        </div>

        <div class="space-y-6">
          <h3 class="text-2xl font-black text-slate-700 mb-8 italic uppercase tracking-tight underline decoration-[#3f98ff] decoration-4 underline-offset-8">Nuestras Especialidades:</h3>

          <div class="flex items-center justify-between bg-red-100 p-8 rounded-[2.5rem] border border-red-200 hover:scale-[1.02] transition-transform shadow-sm">
            <div>
              <h4 class="text-xl font-black text-red-800 italic uppercase leading-tight">Emergencias 24h</h4>
              <p class="text-red-700/70 font-medium italic">Atención de calidad ante cualquier imprevisto.</p>
            </div>
          </div>

          <div class="flex items-center justify-between bg-amber-100 p-8 rounded-[2.5rem] border border-amber-200 hover:scale-[1.02] transition-transform shadow-sm">
            <div>
              <h4 class="text-xl font-black text-amber-800 italic uppercase leading-tight">Guardería</h4>
              <p class="text-amber-700/70 font-medium italic">Cuidado especializado para tu mascota durante tu ausencia.</p>
            </div>
          </div>

          <div class="flex items-center justify-between bg-slate-200 p-8 rounded-[2.5rem] border border-slate-300 hover:scale-[1.02] transition-transform shadow-sm">
            <div>
              <h4 class="text-xl font-black text-slate-800 italic uppercase leading-tight">Traumatología</h4>
              <p class="text-slate-700/70 font-medium italic">Especialistas en cirugía y rehabilitación ósea.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="servicios" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-10 text-center mb-16">
        <h2 class="text-5xl font-black text-slate-800 mb-4 italic uppercase tracking-tighter">Nuestros Servicios</h2>
        <div class="w-24 h-2 bg-[#3f98ff] mx-auto rounded-full mb-4"></div>
        <p class="text-slate-400 font-medium italic">Haz clic para ver el detalle de lo que realizamos.</p>
      </div>

      <div class="max-w-7xl mx-auto px-10 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="s in servicios" :key="s.nombre"
          @click="abrirServicio(s)"
          class="group p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
        >
          <div class="text-5xl mb-6 bg-white w-20 h-20 flex items-center justify-center rounded-3xl shadow-sm group-hover:bg-blue-50 transition-colors">
            {{ s.icon }}
          </div>
          <h3 class="text-xl font-black text-slate-800 mb-3 uppercase italic leading-none">{{ s.nombre }}</h3>
          <p class="text-slate-500 font-medium italic leading-relaxed">{{ s.desc }}</p>
        </div>
      </div>
    </section>

    <footer class="bg-slate-950 pt-24 pb-12 px-10 text-white italic relative">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center mb-16">
        <div class="space-y-12">
          <h2 class="text-5xl font-black uppercase leading-tight">¿Dudas? <br> <span class="text-[#3f98ff]">Contáctanos.</span></h2>
          <div class="space-y-8">
            <div class="flex items-center gap-6">
              <div class="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-3xl">📞</div>
              <div>
                <p class="text-slate-500 font-bold text-xs uppercase">Llámanos ahora</p>
                <p class="text-2xl font-black tracking-tight">871-123-4567</p>
              </div>
            </div>
            <div class="flex items-center gap-6">
              <div class="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-3xl">✉️</div>
              <div>
                <p class="text-slate-500 font-bold text-xs uppercase">Email corporativo</p>
                <p class="text-2xl font-black lowercase tracking-tighter">veterinariaoriente@cvo.com</p>
              </div>
            </div>
          </div>
        </div>

        <div class="h-[400px] bg-slate-800 rounded-[3.5rem] overflow-hidden border-8 border-white/5 shadow-2xl">
          <iframe src="https://www.google.com/maps?q=Periférico+9344+Torreón+Coahuila&output=embed" width="100%" height="100%" style="border:0;" loading="lazy"></iframe>
        </div>
      </div>
      <div class="pt-10 border-t border-white/10 text-center text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">
        © 2026 Veterinaria del Oriente · Torreón, México
      </div>
    </footer>

    <div v-if="modalAbierto" class="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md" @click.self="modalAbierto = false">
      <div class="bg-white w-full max-w-xl rounded-[3.5rem] p-12 relative shadow-2xl animate-modal-in">
        <button @click="modalAbierto = false" class="absolute top-10 right-10 text-slate-300 hover:text-slate-600 text-3xl font-black transition-colors">✕</button>
        <div class="text-8xl mb-6">{{ servicioSeleccionado.icon }}</div>
        <h3 class="text-4xl font-black italic text-[#3f98ff] mb-4 uppercase">{{ servicioSeleccionado.nombre }}</h3>
        <p class="text-xl text-slate-600 leading-relaxed mb-10 italic font-medium">
          {{ servicioSeleccionado.detalle }}
        </p>
        <button @click="modalAbierto = false" class="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-slate-800 transition">ENTENDIDO</button>
      </div>
    </div>

  </div>
</template>

<style>
@keyframes slow-zoom { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
.animate-slow-zoom { animation: slow-zoom 20s ease-in-out infinite; }
@keyframes modal-in { from { opacity: 0; transform: scale(0.9) translateY(40px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.animate-modal-in { animation: modal-in 0.3s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
html { scroll-behavior: smooth; }
</style>
