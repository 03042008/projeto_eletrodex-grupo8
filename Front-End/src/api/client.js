const apiHost = window.location.hostname || 'localhost';
const apiPort = import.meta.env.VITE_API_PORT || 3000;

export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${apiHost}:${apiPort}`;

export async function apiRequest(path, options = {}) {
  const { token, headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);

  if (requestOptions.body && !(requestOptions.body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (token) requestHeaders.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.erro || payload.mensagem || 'Não foi possível concluir a solicitação.');
  }

  return payload;
}