import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
  ],
})

export default router