// L'API Notion tolère mal un trop grand nombre de requêtes simultanées.
// Ce limiteur borne le nombre d'appels HTTP réellement en vol à tout
// instant, quel que soit le niveau de parallélisme exprimé par le code
// appelant (bases et fiches traitées avec Promise.all).
function createLimiter(concurrency) {
  let active = 0;
  const queue = [];

  function runNext() {
    if (active >= concurrency || queue.length === 0) return;

    active++;
    const { fn, resolve, reject } = queue.shift();

    fn()
      .then(resolve, reject)
      .finally(() => {
        active--;
        runNext();
      });
  }

  return function limit(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      runNext();
    });
  };
}

const limitNotionRequest = createLimiter(6);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Appelle l'API Notion avec limitation de concurrence et relance
 * automatique (avec délai) sur une réponse 429 (trop de requêtes).
 */
export async function notionRequest(endpoint, options = {}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await limitNotionRequest(() =>
      fetch(`https://api.notion.com/v1${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
          "Notion-Version": process.env.NOTION_VERSION || "2022-06-28",
          "Content-Type": "application/json",
          ...(options.headers || {})
        }
      })
    );

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after")) || 1;
      await sleep(retryAfter * 1000);
      continue;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Erreur Notion ${response.status} sur ${endpoint}: ${body}`);
    }

    return response.json();
  }

  throw new Error(`Erreur Notion: trop de tentatives après des réponses 429 sur ${endpoint}`);
}
