
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Limiteur global : une seule requête à la fois,
// avec un intervalle minimum de 400 ms entre les appels.
function createRateLimiter(minIntervalMs) {
  let queue = Promise.resolve();
  let lastRequestAt = 0;

  return function limit(fn) {
    const request = queue.then(async () => {
      const elapsed = Date.now() - lastRequestAt;
      const wait = Math.max(0, minIntervalMs - elapsed);

      if (wait > 0) {
        await sleep(wait);
      }

      lastRequestAt = Date.now();
      return fn();
    });

    // Une erreur ne doit pas bloquer les requêtes suivantes.
    queue = request.catch(() => {});

    return request;
  };
}

const limitNotionRequest = createRateLimiter(400);

const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

const MAX_ATTEMPTS = 5;

function getRetryDelay(response, attempt) {
  if (response.status === 429) {
    const retryAfter = response.headers.get("retry-after");

    if (retryAfter) {
      const seconds = Number(retryAfter);

      if (Number.isFinite(seconds) && seconds >= 0) {
        return seconds * 1000;
      }

      const date = Date.parse(retryAfter);

      if (Number.isFinite(date)) {
        return Math.max(0, date - Date.now());
      }
    }
  }

  // Backoff exponentiel avec jitter.
  const baseDelay = 1000 * (2 ** attempt);
  return baseDelay + Math.random() * 500;
}

export async function notionRequest(endpoint, options = {}) {
  let lastError = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const response = await limitNotionRequest(() =>
        fetch(`https://api.notion.com/v1${endpoint}`, {
          ...options,
          headers: {
            Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
            "Notion-Version":
                process.env.NOTION_VERSION || "2022-06-28",
            "Content-Type": "application/json",
            ...(options.headers || {})
          }
        })
    );

    if (response.ok) {
      return response.json();
    }

    const body = await response.text();

    lastError = {
      status: response.status,
      body
    };

    if (!RETRYABLE_STATUSES.has(response.status)) {
      throw new Error(
          `Erreur Notion ${response.status} sur ${endpoint}: ${body}`
      );
    }

    if (attempt < MAX_ATTEMPTS - 1) {
      const delay = getRetryDelay(response, attempt);

      console.warn(
          `[Notion] HTTP ${response.status} sur ${endpoint}. ` +
          `Tentative ${attempt + 1}/${MAX_ATTEMPTS}. ` +
          `Nouvel essai dans ${Math.ceil(delay)} ms.`
      );

      await sleep(delay);
    }
  }

  throw new Error(
      `Erreur Notion après ${MAX_ATTEMPTS} tentatives. ` +
      `Dernier statut HTTP : ${lastError.status}. ` +
      `Endpoint : ${endpoint}. ` +
      `Réponse : ${lastError.body}`
  );
}
