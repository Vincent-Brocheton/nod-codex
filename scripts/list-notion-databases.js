import { loadLocalEnv, requireNotionToken } from "./notion/env.js";
import { notionRequest } from "./notion/client.js";
import { richTextToPlainText } from "./notion/richText.js";

async function main() {
  await loadLocalEnv();
  requireNotionToken();

  const databases = [];
  let cursor;

  do {
    const body = {
      filter: { property: "object", value: "database" },
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {})
    };

    const data = await notionRequest("/search", {
      method: "POST",
      body: JSON.stringify(body)
    });

    databases.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  if (databases.length === 0) {
    console.log("Aucune base visible par cette intégration.");
    return;
  }

  for (const database of databases) {
    const title = richTextToPlainText(database.title) || "Sans titre";
    console.log(`${title}\n  ${database.id}\n`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
