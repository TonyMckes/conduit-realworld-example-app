export default function wordCounter(text) {
  if (!text) return 0;
  const matches = text.match(/\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g);
  return matches ? matches.length : 0;
}
