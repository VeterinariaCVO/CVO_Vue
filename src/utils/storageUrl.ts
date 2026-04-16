export function getStorageUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path

  const storageBase = (import.meta.env.VITE_STORAGE_URL as string) || ''
  if (storageBase) {
    const base = storageBase.endsWith('/') ? storageBase : `${storageBase}/`
    const cleanPath = path.replace(/^\/storage\//, '').replace(/^storage\//, '')
    return `${base}${cleanPath}`
  }

  const apiBase = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api'
  const base = apiBase.replace(/\/api\/?$/, '')
  const cleanPath = path.replace(/^\/storage\//, '').replace(/^storage\//, '')
  return `${base}/storage/${cleanPath}`
}
