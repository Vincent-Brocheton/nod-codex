import { loadLocalEnv, requireNotionToken } from "./notion/env.js";
import { notionRequest } from "./notion/client.js";
import { richTextToPlainText } from "./notion/richText.js";

function titleForObject(object) {
  if (object.object === "database") return richTextToPlainText(object.title) || "Sans titre";
  if (object.object === "page") {
    const titleProperty = Object.values(object.properties || {}).find((property) => property.type === "title");
    return richTextToPlainText(titleProperty?.title || []) || "Sans titre";
  }
  return "Sans titre";
}

async function main() {
  await loadLocalEnv();
  requireNotionToken();

  const objects = [];
  let cursor;

  do {
    const data = await notionRequest("/search", {
      method: "POST",
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) })
    });

    objects.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  if (objects.length === 0) {
    console.log("Aucun objet visible par cette intégration.");
    return;
  }

  for (const object of objects) {
    console.log(`${object.object.toUpperCase()} - ${titleForObject(object)}\n  ${object.id}\n  ${object.url || ""}\n`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
