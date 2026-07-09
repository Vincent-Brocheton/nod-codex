export function richTextToPlainText(richText = []) {
  return richText.map((item) => item.plain_text || "").join("");
}
