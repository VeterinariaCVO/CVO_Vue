import { createRouter, createWebHistory, type Router } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.ts'


import HomeView from '@/components/auth/WelcomeView.vue'
import LoginView from '@/components/auth/LoginForm.vue'
import RegisterView from '@/components/auth/RegisterForm.vue'

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
  if (roleId === 3) return { path: '/cliente' }

  return { name: 'login' }
}

export default router
