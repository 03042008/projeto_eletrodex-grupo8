const apiHost = window.location.hostname || 'localhost';
const apiPort = window.ELETRODEX_API_PORT || 3000;

window.ELETRODEX_CONFIG = Object.freeze({
  apiBaseUrl: window.ELETRODEX_API_URL || `http://${apiHost}:${apiPort}`,
});