export function richTextToPlainText(richText = []) {
  return richText.map((item) => item.plain_text || "").join("");
}

/**
 * Segments successifs d'un texte enrichi Notion, chacun avec son propre
 * texte et si le passage est en gras. Les runs consécutifs partageant le
 * même état sont fusionnés, pour limiter le nombre de segments produits.
 */
export function richTextToSegments(richText = []) {
  const segments = [];

  for (const run of richText) {
    const text = run.plain_text || "";
    if (!text) continue;

    const bold = Boolean(run.annotations?.bold);
    const last = segments[segments.length - 1];

    if (last && last.bold === bold) {
      last.text += text;
    } else {
      segments.push({ text, bold });
    }
  }

  return segments;
}
