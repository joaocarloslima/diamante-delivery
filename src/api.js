// Cliente da API do Projeto Diamante 02.
// order-service responde na porta 8080 e review-service na 8083.

const TIMEOUT_MS = 30000; // o pagamento pode demorar por causa do retry

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const STATUS_MESSAGES = {
  400: 'Dados inválidos.',
  404: 'Não encontrado.',
  409: 'Prato esgotado.',
  429: 'Muitas requisições. Aguarde um instante.',
  502: 'Pagamento indisponível. Tente novamente.',
};

function describeError(status, serverMessage) {
  const base = STATUS_MESSAGES[status] ?? 'Erro no servidor.';
  const text = `${status} · ${base}`;
  return serverMessage ? `${text}\n${serverMessage}` : text;
}

async function request(url, { method = 'GET', body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    const message =
      error.name === 'AbortError'
        ? 'O servidor demorou demais para responder.'
        : `Não foi possível conectar em ${url}`;
    throw new ApiError(0, message);
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const serverMessage = data && typeof data === 'object' ? data.error : null;
    throw new ApiError(response.status, describeError(response.status, serverMessage));
  }
  return data;
}

export function createApi(host) {
  const orderBase = `http://${host}:8080`;
  const reviewBase = `http://${host}:8083`;

  return {
    orderBase,
    reviewBase,
    getDishes: () => request(`${orderBase}/dishes`),
    createOrder: (dishId, quantity) =>
      request(`${orderBase}/orders`, { method: 'POST', body: { dishId, quantity } }),
    sendReview: (dishId, rating, comment) =>
      request(`${orderBase}/reviews`, { method: 'POST', body: { dishId, rating, comment } }),
    ask: (question) =>
      request(`${orderBase}/assistant`, { method: 'POST', body: { question } }),
    getRanking: () => request(`${reviewBase}/reviews/ranking`),
  };
}

export function formatPrice(value) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}
