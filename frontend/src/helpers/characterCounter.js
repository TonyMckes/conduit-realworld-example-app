export default function characterCounter(text) {
  if (!text) return 0;
  const stripped = text.replace(/<[^>]*>/g, "").replace(/[\s\n\r]+/g, "");
  return stripped.length;
}
