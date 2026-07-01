const cache = new Map();

export async function getManifest() {
    return get("/data/manifest.json");
}

export async function getCollection(file) {

    if (cache.has(file)) {
        return cache.get(file);
    }

    const data = await get(file);

    cache.set(file, data);

    return data;

}

async function get(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Impossible de charger ${url}`);
    }

    return response.json();
}