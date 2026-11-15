export default function dateFormatter(date) {
  return new Date(date).toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function dateTimeFormatter(date) {
  return new Date(date).toLocaleString("en", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
