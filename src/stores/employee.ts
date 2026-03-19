import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useFetch } from '@/composables/useFetch'
import type { User } from '@/types/user'

export const useEmployeeStore = defineStore('employee', () => {

  const employees = ref<User[]>([])
  const { apiFetch, loading, error } = useFetch()

  async function fetchEmployees() {
    const data = await apiFetch<{ employees: User[] }>('/admin/employees')
    if (data) employees.value = data.employees
  }

  async function createEmployee(formData: FormData) {
    const data = await apiFetch<{ employee: User }>('/admin/employees', {
      method: 'POST',
      body: formData,
    })
    return data
  }

  async function updateEmployee(id: number, formData: FormData) {
    const data = await apiFetch<{ employee: User }>(`/admin/employees/${id}`, {
      method: 'POST',
      body: formData,
    })
    return data
  }

  async function toggleActive(employee: User) {
    const formData = new FormData()
    formData.append('name',       employee.name)
    formData.append('email',      employee.email)
    formData.append('role_id',    String(employee.role_id))
    formData.append('active',     employee.active ? '0' : '1')
    formData.append('_method',    'PUT')
    if (employee.phone)   formData.append('phone',   employee.phone)
    if (employee.address) formData.append('address', employee.address)

    const data = await apiFetch(`/admin/employees/${employee.id}`, {
      method: 'POST',
      body: formData,
    })

    if (data !== null) {
      employee.active = !employee.active
    }

    return data
  }

  async function deleteEmployee(id: number) {
    const data = await apiFetch(`/admin/employees/${id}`, {
      method: 'DELETE',
    })
    if (data !== null) {
      employees.value = employees.value.filter(e => e.id !== id)
    }
    return data
  }

  return { employees, loading, error, fetchEmployees, createEmployee, updateEmployee, toggleActive, deleteEmployee }
})