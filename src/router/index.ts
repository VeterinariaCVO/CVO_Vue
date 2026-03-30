import { createRouter, createWebHistory, type Router } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import HomeView from '@/views/HomeView.vue'
import LoginView from '@/components/auth/LoginForm.vue'
import RegisterView from '@/components/auth/RegisterForm.vue'
import WelcomeView from '@/components/auth/WelcomeView.vue'
import RegistrarCliente from '@/views/RegisterClient.vue'
import LoginViewTest from '@/views/LoginViewTest.vue'
import ClientAppointmentsView from '../views/client/ClientAppointmentsView.vue'
import CreateAppointmentsView from '../views/client/CreateAppointmentView.vue'

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guest: true },
    },
    {
      path: '/empleado/registrar-cliente',
      name: 'RegisterCliente',
      component: RegistrarCliente,
      meta: { requiresAuth: true, role: 2 },
    },
    {
      path: '/client/citas',
      name: 'ClientCitas',
      component: ClientAppointmentsView,
      meta: { requiresAuth: true, role: 3 },
    },
    {
      path: '/client/create-cita',
      name: 'CreateCita',
      component: CreateAppointmentsView,
      meta: { requiresAuth: true, role: 3 },
    },
    {
      path: '/cliente/perfil',
      name: 'ClientePerfil',
      component: () => import('../views/client/PerfilView.vue'),
      meta: { requiresAuth: true, role: 3 },
    },
    {
      path: '/empleado/consultas',
      name: 'EmpleadoConsultas',
      component: () => import('../views/empleado/ConsultaView.vue'),
      meta: { requiresAuth: true, role: 2 },
    },
    {
      path: '/client/mascotas',
      name: 'ClientMascotas',
      component: () => import('../views/ClientsView.vue'),
      meta: { requiresAuth: true, role: 3 },
    },
  ],
})

router.beforeEach((to) => {
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
  if (roleId === 1) return { path: '/admin' }
  if (roleId === 2) return { path: '/recepcion' }
  if (roleId === 4) return { path: '/veterinario' }
  if (roleId === 3) return { path: '/client/mascotas' }
  return { path: '/' }
}

export default router
