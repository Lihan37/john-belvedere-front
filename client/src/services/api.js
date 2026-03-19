const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message =
      typeof body === 'object' && body?.message
        ? body.message
        : 'Something went wrong.'
    const error = new Error(message)
    error.status = response.status
    error.code = typeof body === 'object' ? body?.code : undefined
    error.errors = typeof body === 'object' ? body?.errors : undefined
    throw error
  }

  return body
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, data, options) =>
    request(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: (path, data, options) =>
    request(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
