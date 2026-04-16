<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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
    detalle: 'Realizamos intervenciones de tejidos blandos y esterilizaciones con tecnología de vanguardia y monitoreo constante de signos vitales para garantizar la seguridad de tu mascota.',
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
    detalle: 'Aplicación de refuerzos anuales y esquemas iniciales (Quíntuple, Rabia, Bordetella, etc.). Te entregamos una cartilla actualizada para el seguimiento.',
    icon: '💉'
  }
]

const abrirServicio = (servicio: any) => {
  servicioSeleccionado.value = servicio
  modalAbierto.value = true
}

// LÓGICA DE SCROLL CORREGIDA Y A PRUEBA DE FALLOS
const scrollTo = (id: string) => {
  const el = document.getElementById(id)

  // Buscamos el contenedor fijo de App.vue que envuelve la Landing Page
  const scrollContainer = document.querySelector('.z-\\[200\\].overflow-y-auto')

  if (el && scrollContainer) {
    // Calculamos la posición exacta restando los 85px de la barra de navegación
    const topPosition = el.offsetTop - 85
    scrollContainer.scrollTo({
      top: topPosition,
      behavior: 'smooth'
    })
  } else if (el) {
    // Respaldo por si el contenedor cambia
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] font-sans italic selection:bg-blue-100 selection:text-blue-600 overflow-x-hidden relative">

    <nav class="fixed top-0 left-0 right-0 z-[100] bg-slate-900/95 backdrop-blur-md py-4 px-10 flex justify-between items-center border-b border-white/5 shadow-2xl">
      <a @click.prevent="scrollTo('inicio')" href="#inicio" class="flex items-center gap-3 group cursor-pointer no-underline">
        <div class="bg-white p-1.5 rounded-xl rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-xl">
          <img src="/logo.jpg" width="35" class="rounded-lg" />
        </div>
        <div>
          <h3 class="text-white font-black text-xl leading-none uppercase tracking-tighter m-0">Veterinaria</h3>
          <p class="text-[#3f98ff] text-[9px] font-bold tracking-[0.3em] uppercase mt-0.5 m-0">DEL ORIENTE</p>
        </div>
      </a>

      <div class="hidden md:flex items-center gap-10">
        <a href="#inicio" @click.prevent="scrollTo('inicio')" class="text-white font-black text-[10px] uppercase tracking-widest hover:text-[#3f98ff] transition-colors cursor-pointer no-underline">Inicio</a>
        <a href="#info" @click.prevent="scrollTo('info')" class="text-white font-black text-[10px] uppercase tracking-widest hover:text-[#3f98ff] transition-colors cursor-pointer no-underline">Nosotros</a>
        <a href="#servicios" @click.prevent="scrollTo('servicios')" class="text-white font-black text-[10px] uppercase tracking-widest hover:text-[#3f98ff] transition-colors cursor-pointer no-underline">Servicios</a>
        <a href="#contacto" @click.prevent="scrollTo('contacto')" class="text-white font-black text-[10px] uppercase tracking-widest hover:text-[#3f98ff] transition-colors cursor-pointer no-underline">Contacto</a>
      </div>
    </nav>

    <section id="inicio" class="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/40 to-transparent z-10"></div>
        <img src="/Mascotasfondo.jpg" class="w-full h-full object-cover animate-slow-zoom" />
      </div>

      <div class="relative z-20 max-w-7xl mx-auto px-10 grid lg:grid-cols-2 gap-12 items-center pb-32">
        <div class="text-white space-y-8 animate-fade-in">
          <span class="bg-[#22c55e] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg italic">30 años de experiencia</span>
          <h1 class="text-6xl md:text-8xl font-black leading-[0.9] uppercase tracking-tighter drop-shadow-2xl">
            Cuidamos <br> lo que <br> <span class="text-[#3f98ff]">más amas.</span>
          </h1>
          <p class="text-lg text-slate-300 max-w-md leading-relaxed font-medium">
            Atención profesional y humana para tus mascotas en el corazón de Torreón, Coahuila.
          </p>
        </div>

        <div class="hidden lg:block animate-slide-up">
          <div class="bg-white/10 backdrop-blur-2xl p-1 border border-white/20 rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)]">
            <div class="bg-white rounded-[3.2rem] p-12 text-center">
              <img src="/logo.jpg" width="80" class="mx-auto mb-6 rounded-3xl shadow-xl rotate-3" />
              <h2 class="text-4xl font-black text-slate-800 mb-2 uppercase tracking-tighter leading-none">¡Hola!</h2>
              <p class="text-slate-400 mb-10 font-bold text-xs uppercase tracking-widest">Gestiona tus mascotas aquí</p>

              <div class="grid gap-4">
                <button @click="router.push('/register')" class="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#3f98ff] transition-all shadow-xl">Crear cuenta gratis</button>
                <button @click="router.push('/login')" class="w-full text-[#3f98ff] font-black uppercase text-[10px] tracking-widest hover:underline mt-2">Ya tengo cuenta</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-30">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" class="block w-full h-[80px] md:h-[120px]">
          <path fill="#f8fafc" fill-opacity="1" d="M0,160L80,170.7C160,181,320,203,480,197.3C640,192,800,160,960,149.3C1120,139,1280,149,1360,154.7L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </div>
    </section>

    <section id="info" class="py-24 px-10 max-w-7xl mx-auto relative z-20">
      <div class="grid lg:grid-cols-2 gap-20 items-center">
        <div class="relative rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] h-[600px] border-8 border-white group">
          <img src="/info.jpg" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex flex-col justify-end p-12">
            <p class="text-[#3f98ff] font-black text-xs uppercase tracking-[0.3em] mb-2">Hospital Abierto</p>
            <h3 class="text-white text-6xl font-black leading-none uppercase tracking-tighter italic">24 HORAS</h3>
          </div>
        </div>

        <div class="space-y-10">
          <div>
            <h2 class="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none italic mb-4">Veterinario <br> en Torreón</h2>
            <p class="text-slate-500 text-lg font-medium leading-relaxed">
              En Veterinaria del Oriente dedicamos nuestro esfuerzo diario al bienestar de los animales en la Comarca Lagunera.
            </p>
          </div>

          <div class="space-y-4">
            <div v-for="esp in [{t:'Emergencias', c:'bg-red-50 text-red-600', d:'Atención inmediata 24/7'}, {t:'Guardería', c:'bg-blue-50 text-[#3f98ff]', d:'Cuidado especializado'}, {t:'Especialistas', c:'bg-slate-100 text-slate-800', d:'Traumatología y cirugía'}]"
                 :key="esp.t"
                 class="p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all cursor-default"
                 :class="esp.c">
              <div>
                <h4 class="font-black uppercase tracking-widest text-sm italic">{{ esp.t }}</h4>
                <p class="text-[10px] font-bold uppercase opacity-70 mt-1">{{ esp.d }}</p>
              </div>
              <span class="text-2xl">→</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="servicios" class="pt-40 pb-32 bg-slate-900 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 z-20">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" class="block w-full h-[80px] md:h-[120px]">
          <path fill="#f8fafc" fill-opacity="1" d="M0,160L80,170.7C160,181,320,203,480,197.3C640,192,800,160,960,149.3C1120,139,1280,149,1360,154.7L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </div>

      <div class="absolute top-0 right-0 w-96 h-96 bg-[#3f98ff]/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 z-0"></div>

      <div class="max-w-7xl mx-auto px-10 text-center mb-20 relative z-10">
        <h2 class="text-6xl font-black text-white mb-4 uppercase tracking-tighter italic">Nuestros Servicios</h2>
        <div class="w-24 h-2 bg-[#3f98ff] mx-auto rounded-full mb-6 shadow-[0_0_15px_#3f98ff]"></div>
        <p class="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">Haz clic para ver detalles</p>
      </div>

      <div class="max-w-7xl mx-auto px-10 grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        <div
          v-for="s in servicios" :key="s.nombre"
          @click="abrirServicio(s)"
          class="group p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#3f98ff]/50 transition-all duration-500 cursor-pointer shadow-xl"
        >
          <div class="text-5xl mb-8 bg-white/10 w-24 h-24 flex items-center justify-center rounded-[2rem] shadow-inner group-hover:scale-110 group-hover:bg-[#3f98ff] transition-all duration-500">
            {{ s.icon }}
          </div>
          <h3 class="text-xl font-black text-white mb-3 uppercase italic tracking-tighter leading-none">{{ s.nombre }}</h3>
          <p class="text-slate-400 text-xs font-medium leading-relaxed italic">{{ s.desc }}</p>
        </div>
      </div>
    </section>

    <footer id="contacto" class="bg-slate-950 pt-32 pb-12 px-10 text-white relative">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center mb-20">
        <div class="space-y-12">
          <h2 class="text-7xl font-black uppercase leading-[0.9] tracking-tighter">¿Dudas? <br> <span class="text-[#3f98ff]">Contáctanos.</span></h2>
          <div class="space-y-10">
            <div class="flex items-center gap-8 group">
              <div class="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-4xl shadow-xl group-hover:bg-[#3f98ff] transition-colors">📞</div>
              <div>
                <p class="text-[#3f98ff] font-black text-[10px] uppercase tracking-widest mb-1">Llámanos ahora</p>
                <p class="text-3xl font-black tracking-tighter italic uppercase">871-123-4567</p>
              </div>
            </div>
            <div class="flex items-center gap-8 group">
              <div class="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-4xl shadow-xl group-hover:bg-[#3f98ff] transition-colors">✉️</div>
              <div>
                <p class="text-[#3f98ff] font-black text-[10px] uppercase tracking-widest mb-1">Email</p>
                <p class="text-3xl font-black tracking-tighter lowercase italic">cvo@veterinaria.com</p>
              </div>
            </div>
          </div>
        </div>

        <div class="h-[450px] bg-slate-900 rounded-[4rem] overflow-hidden border-[12px] border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
          <iframe src="https://www.google.com/maps?q=Periférico+9344+Torreón+Coahuila&output=embed" width="100%" height="100%" style="border:0;" loading="lazy"></iframe>
        </div>
      </div>
      <div class="pt-10 border-t border-white/5 text-center text-slate-600 font-black uppercase text-[10px] tracking-[0.5em] italic">
        © 2026 Veterinaria del Oriente · Torreón, México
      </div>
    </footer>

    <div v-if="modalAbierto" class="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl" @click.self="modalAbierto = false">
      <div class="bg-white w-full max-w-xl rounded-[4rem] p-16 relative shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-modal-in">
        <button @click="modalAbierto = false" class="absolute top-12 right-12 text-slate-300 hover:text-[#3f98ff] text-4xl font-black transition-colors">✕</button>
        <div class="text-[120px] mb-8 drop-shadow-2xl">{{ servicioSeleccionado.icon }}</div>
        <h3 class="text-5xl font-black italic text-slate-900 mb-6 uppercase tracking-tighter leading-none">{{ servicioSeleccionado.nombre }}</h3>
        <p class="text-xl text-slate-500 leading-relaxed mb-12 font-medium">
          {{ servicioSeleccionado.detalle }}
        </p>
        <button @click="modalAbierto = false" class="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl uppercase tracking-widest hover:bg-[#3f98ff] transition-all shadow-2xl active:scale-95">Entendido</button>
      </div>
    </div>

  </div>
</template>

<style>
@keyframes slow-zoom { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
.animate-slow-zoom { animation: slow-zoom 30s ease-in-out infinite; }
@keyframes modal-in { from { opacity: 0; transform: scale(0.8) translateY(100px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.animate-modal-in { animation: modal-in 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
html { scroll-behavior: smooth; }

.animate-fade-in { animation: fade-in 1s ease-out forwards; }
@keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.animate-slide-up { animation: slide-up 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
@keyframes slide-up { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
</style>
