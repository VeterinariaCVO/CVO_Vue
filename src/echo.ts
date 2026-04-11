import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,

  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: 443,
  wssPort: 443,

  forceTLS: true,
  enabledTransports: ['ws', 'wss'],

  authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,

  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      Accept: 'application/json',
    },
  },
})

export default echo
