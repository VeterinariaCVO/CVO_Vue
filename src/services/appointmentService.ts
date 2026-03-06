import axios from 'axios'

const API = 'http://127.0.0.1:8000/api/appointments'

export const createAppointment = (data: object) => {
  return axios.post(`${API}`, data)
}

export const getAppointments = () => {
  return axios.get(`${API}`)
}
