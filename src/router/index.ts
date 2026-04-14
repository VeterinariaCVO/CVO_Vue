import { createRouter, createWebHistory, type Router } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// ── Auth ──────────────────────────────────────────────────────────────────────
import LoginView from '@/components/auth/LoginForm.vue'
import RegisterView from '@/components/auth/RegisterForm.vue'
import WelcomeView from '@/components/auth/WelcomeView.vue'

// ── Cliente ───────────────────────────────────────────────────────────────────
import AppointmentsView from '@/views/client/AppointmentsView.vue'
import CreateAppointmentView from '@/views/client/CreateAppointmentView.vue'

// ── Empleado / Recepcionista ──────────────────────────────────────────────────
import RDashboard from '@/views/recepcionista/RDashboard.vue'
import RAppointmentsView from '@/views/recepcionista/RAppointmentsView.vue'
import RCreateAppointment from '@/views/recepcionista/RCreateAppointment.vue'
import RClientesView from '@/views/recepcionista/RClientesView.vue'
import RMascotaDetalle from '@/views/recepcionista/RMascotaDetalle.vue'
import RHistorialView from '@/views/recepcionista/RHistorialView.vue'
import RegistrarCliente from '@/views/client/RegisterClient.vue'

// ── Veterinario ───────────────────────────────────────────────────────────────
import VetAgendaView from '@/view2/empleado/vet/VetAgendaView_1.vue'
import VetMascotasView from '@/view2/empleado/vet/VetMascotasView_1.vue'
import VetHistorialView from '@/view2/empleado/vet/VetHistorialView.vue'

// ── Admin ─────────────────────────────────────────────────────────────────────
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import AAppointmentsView from '@/views/admin/AAppointmentsView.vue'
import CalendarManagementView from '@/views/admin/CalendarManagementView.vue'

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Públicas ───────────────────────────────────────────────────────────────
    { path: '/', name: 'home', component: WelcomeView },
    { path: '/login', name: 'login', component: LoginView, meta: { guest: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guest: true } },

    // ── Perfil (todos los roles) ───────────────────────────────────────────────
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('../views/admin/ProfileView.vue'),
      meta: { requiresAuth: true },
    },

    // ── Cliente (role 3) ───────────────────────────────────────────────────────
    {
      path: '/client/dashboard',
      name: 'ClientDashboard',
      component: () => import('../views/client/DashboardClientView.vue'),
      meta: { requiresAuth: true, role: 3 },
    },
    {
      path: '/client/citas',
      name: 'client.citas',
      component: AppointmentsView,
      meta: { requiresAuth: true, role: 3 },
    },
    {
      path: '/client/agendar',
      name: 'client.agendar.cita',
      component: CreateAppointmentView,
      meta: { requiresAuth: true, role: 3 },
    },
    {
      path: '/client/mascotas',
      name: 'ClientMascotas',
      component: () => import('../views/client/ClientsView.vue'),
      meta: { requiresAuth: true, role: 3 },
    },
    {
      path: '/cliente/perfil',
      name: 'ClientePerfil',
      component: () => import('../views/client/PerfilView.vue'),
      meta: { requiresAuth: true, role: 3 },
    },

    // ── Empleado / Recepcionista (role 2) ─────────────────────────────────────
    {
      path: '/recepcionista/dashboard',
      name: 'recepcionista.dashboard',
      component: RDashboard,
      meta: { requiresAuth: true, role: 2 },
    },
    {
      path: '/recepcionista/citas',
      name: 'recepcionista.citas',
      component: RAppointmentsView,
      meta: { requiresAuth: true, role: 2 },
    },
    {
      path: '/recepcionista/agendar',
      name: 'recepcionista.agendar.cita',
      component: RCreateAppointment,
      meta: { requiresAuth: true, role: 2 },
    },
    {
      path: '/recepcionista/clientes',
      name: 'recepcionista.clientes',
      component: RClientesView,
      meta: { requiresAuth: true, role: 2 },
    },
    {
      path: '/recepcionista/registrar-cliente',
      name: 'RegisterCliente',
      component: RegistrarCliente,
      meta: { requiresAuth: true, role: 2 },
    },
    {
      path: '/recepcionista/mascotas/:id',
      name: 'recepcionista.mascota.detalle',
      component: RMascotaDetalle,
      meta: { requiresAuth: true, role: 2 },
    },
    {
      path: '/recepcionista/mascotas/:id/historial',
      name: 'recepcionista.historial',
      component: RHistorialView,
      meta: { requiresAuth: true, role: 2 },
    },
    {
      path: '/recepcionista/consultas',
      name: 'EmpleadoConsultas',
      component: () => import('../views/empleado/ConsultaView.vue'),
      meta: { requiresAuth: true, role: 2 },
    },
    {
      path: '/recepcionista/walk-in',
      name: 'recepcionista.walkin',
      component: () => import('../views/admin/WalkInView.vue'),
      meta: { requiresAuth: true, role: 2 },
    },

    // ── Veterinario (role 4) ──────────────────────────────────────────────────
    {
      path: '/veterinario/agenda',
      name: 'VetAgenda',
      component: VetAgendaView,
      meta: { requiresAuth: true, role: 4 },
    },
    {
      path: '/veterinario/mascotas',
      name: 'VetMascotas',
      component: VetMascotasView,
      meta: { requiresAuth: true, role: 4 },
    },
    {
      path: '/veterinario/mascotas/:id/historial',
      name: 'VetHistorial',
      component: VetHistorialView,
      meta: { requiresAuth: true, role: 4 },
    },

    // ── Admin (role 1) ────────────────────────────────────────────────────────
    {
      path: '/admin/dashboard',
      name: 'admin.dashboard',
      component: AdminDashboard,
      meta: { requiresAuth: true, role: 1 },
    },
    {
      path: '/admin/citas',
      name: 'admin.citas',
      component: AAppointmentsView,
      meta: { requiresAuth: true, role: 1 },
    },
    {
      path: '/admin/calendario',
      name: 'admin.calendario',
      component: CalendarManagementView,
      meta: { requiresAuth: true, role: 1 },
    },
    {
      path: '/admin/empleados',
      redirect: '/admin/usuarios',
    },
    {
      path: '/admin/usuarios',
      name: 'admin.usuarios',
      component: () => import('../views/admin/EmployeeManagementView.vue'),
      meta: { requiresAuth: true, role: 1 },
    },
    {
      path: '/admin/mascotas',
      name: 'admin.mascotas',
      component: () => import('../views/admin/PetsManagementView.vue'),
      meta: { requiresAuth: true, role: 1 },
    },
    {
      path: '/admin/historial',
      name: 'admin.historial',
      component: () => import('../views/admin/MedicalHistoryView.vue'),
      meta: { requiresAuth: true, role: 1 },
    },
    {
      path: '/admin/servicios',
      name: 'admin.servicios',
      component: () => import('../views/ServicesView.vue'),
      meta: { requiresAuth: true, role: 1 },
    },
    {
      path: '/admin/walk-in',
      name: 'admin.walkin',
      component: () => import('../views/admin/WalkInView.vue'),
      meta: { requiresAuth: true, role: 1 },
    },
  ],
})

router.beforeEach((to: any) => {
  const auth = useAuthStore()

  if (to.meta.guest && auth.isAuthenticated) {
    return redirigirPorRol(auth.user?.role_id)
  }

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      return { name: 'login' }
    }
    if (to.meta.role && auth.user?.role_id !== to.meta.role) {
      return redirigirPorRol(auth.user?.role_id)
    }
  }
})

function redirigirPorRol(roleId?: number) {
  if (roleId === 1) return { path: '/admin/dashboard' }
  if (roleId === 2) return { path: '/recepcionista/dashboard' }
  if (roleId === 4) return { path: '/veterinario/agenda' }
  if (roleId === 3) return { path: '/client/dashboard' }
  return { path: '/' }
}

export default router
