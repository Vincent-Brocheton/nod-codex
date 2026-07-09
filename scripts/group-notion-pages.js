import { loadLocalEnv, requireNotionToken } from "./notion/env.js";
import { notionRequest } from "./notion/client.js";
import { richTextToPlainText } from "./notion/richText.js";

function titleForPage(page) {
  const titleProperty = Object.values(page.properties || {}).find((property) => property.type === "title");
  return richTextToPlainText(titleProperty?.title || []) || "Sans titre";
}

async function main() {
  await loadLocalEnv();
  requireNotionToken();

  const pages = [];
  let cursor;

  do {
    const data = await notionRequest("/search", {
      method: "POST",
      body: JSON.stringify({
        filter: { property: "object", value: "page" },
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {})
      })
    });
    pages.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  const groups = new Map();
  for (const page of pages) {
    const parent = page.parent;
    const key = parent?.database_id || parent?.page_id || parent?.workspace || "parent inconnu";
    const group = groups.get(key) || { parent, pages: [] };
    group.pages.push(titleForPage(page));
    groups.set(key, group);
  }

  for (const [id, group] of groups.entries()) {
    console.log(`${group.parent?.type || "unknown"}: ${id}`);
    console.log(`  ${group.pages.length} page(s): ${group.pages.slice(0, 12).join(", ")}${group.pages.length > 12 ? ", ..." : ""}\n`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
