import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegistrarCliente from '../views/RegisterClient.vue'
import { useAuthStore } from '@/stores/authStore.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/empleado/registrar-cliente',
      name: 'RegisterCliente',
      component: RegistrarCliente,
    },
  ],
})

// ── GUARDIA GLOBAL ────────────────────────────────────────
// Esta función se ejecuta ANTES de entrar a cualquier ruta
router.beforeEach((to) => {
  const auth = useAuthStore()

  // Caso 1: La ruta es solo para invitados (como /login)
  // Si ya estás logueado, te mandamos a tu pantalla según tu rol
  if (to.meta.guest && auth.isAuthenticated) {
    return redirigirPorRol(auth.user?.role_id)
  }

  // Caso 2: La ruta necesita que estés logueado
  if (to.meta.requiresAuth) {

    // Si no estás logueado, te mandamos al login
    if (!auth.isAuthenticated) {
      return { name: 'Login' }
    }

    // Si estás logueado pero no tienes el rol correcto,
    // te mandamos a tu pantalla correspondiente
    if (to.meta.role && auth.user?.role_id !== to.meta.role) {
      return redirigirPorRol(auth.user?.role_id)
    }
  }
  // Si todo está bien, deja pasar (no retorna nada = continúa)
})

// Función auxiliar: según el rol te manda a la ruta correcta
function redirigirPorRol(roleId?: number) {
  if (roleId === 1) return { path: '/admin/usuarios' }
  if (roleId === 2) return { path: '/empleado/clientes' }
  if (roleId === 3) return { path: '/cliente/mis-mascotas' }
  return { name: 'Login' }
}

export default router
