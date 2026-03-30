import { createRouter, createWebHistory, type Router } from 'vue-router'
import { useAuthStore } from "@/stores/authStore";


import LoginView from '@/components/auth/LoginForm.vue'
import RegisterView from '@/components/auth/RegisterForm.vue'
import WelcomeView from '@/components/auth/WelcomeView.vue';

import AppointmentsView from '@/views/client/AppointmentsView.vue'
import CreateAppointmentView from '@/views/client/CreateAppointmentView.vue'
import AAppointmentsView from '@/views/admin/AAppointmentsView.vue'
import ACreateAppointmentView from '@/views/admin/ACreateAppointmentView.vue'

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: WelcomeView,
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
      path: '/admin/citas',
      name: 'admin.citas',
      component: AAppointmentsView,
      meta: { requiresAuth: true, role: 1 },
    },
    {
      path: '/admin/agendar',
      name: 'admin.agendar.cita',
      component: ACreateAppointmentView,
      meta: { requiresAuth: true, role: 1 },
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
  if (roleId === 1) return { path: '/admin/citas' }
  if (roleId === 2) return { path: '/recepcion' }
  if (roleId === 4) return { path: '/veterinario' }
  if (roleId === 3) return { path: '/client/citas' }


  return { path: '/' }
}
export default router
