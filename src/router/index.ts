import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegistrarCliente from '../views/RegistrarCliente.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/AdminUsersView.vue'),
    },
    {
      path: '/empleado/clientes',
      name: 'employee-clients',
      component: () => import('../views/EmployeeClientsView.vue'),
    },
    {
      path: '/empleado/clientes/:id',
      name: 'client-profile',
      component: () => import('../views/ClientProfileView.vue'),
    },
    {
      path: '/empleado/mascotas/:id',
      name: 'pet-detail',
      component: () => import('../views/PetDetailView.vue'),
    },
    {
      path: '/admin/employees',
      name: 'admin-employees',
      component: () => import('../views/AdminEmployeesView.vue'),
    },
    {
      path: '/empleado/registrar-cliente',
      name: 'RegisterCliente',
      component: RegistrarCliente,
    },
  ],
})

export default router
