import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import HomeView from '@/views/HomeView.vue'
import RegistrarCliente from '@/views/RegisterClient.vue'
import LoginViewTest from '@/views/LoginViewTest.vue'
import ClientAppointmentsView from '../views/client/ClientAppointmentsView.vue'
import CreateAppointmentsView from '../views/client/CreateAppointmentView.vue'

const router = createRouter({
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
      name: 'Login',
      component: LoginViewTest,
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
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.guest && auth.isAuthenticated) {
    return redirigirPorRol(auth.user?.role_id)
  }

  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      return { name: 'Login' }
    }
    if (to.meta.role && auth.user?.role_id !== to.meta.role) {
      return redirigirPorRol(auth.user?.role_id)
    }
  }
})

function redirigirPorRol(roleId?: number) {
  if (roleId === 1) return { path: '/admin/usuarios' }
  if (roleId === 2) return { path: '/empleado/registrar-cliente' }
  if (roleId === 3) return { path: '/client/citas' }
  return { name: 'Login' }
}

export default router
