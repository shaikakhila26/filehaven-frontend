export function splitByQuery(text, query) {
  if (!query) return [{ t: text, h: false }];
  const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${q})`, "ig");
  const parts = text.split(re).filter(Boolean);
  return parts.map(p => ({ t: p, h: re.test(p) }));
}
