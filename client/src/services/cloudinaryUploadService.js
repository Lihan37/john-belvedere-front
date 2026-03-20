import { api } from './api'

export async function uploadMenuImage(file) {
  const signatureResponse = await api.get('/menu/upload-signature')
  const { cloudName, apiKey, folder, timestamp, signature } = signatureResponse.data || signatureResponse

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('folder', folder)
  formData.append('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  const body = await response.json()

  if (!response.ok) {
    throw new Error(body?.error?.message || 'Cloudinary upload failed.')
  }

  return body.secure_url
}
