import { createRouter, createWebHistory } from 'vue-router'
import type { Router } from 'vue-router'
import ClientAppointmentsView from '../views/client/ClientAppointmentsView.vue'
import CreateAppointmentsView from '../views/client/CreateAppointmentView.vue'

const routes = [
  {
    path: '/client/citas',
    component: ClientAppointmentsView,
  },
  {
    path: '/client/create-cita',
    component: CreateAppointmentsView,
  },
]

const router: Router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
