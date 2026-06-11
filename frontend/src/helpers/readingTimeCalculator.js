import wordCounter from "./wordCounter";

const WORDS_PER_MINUTE = 200;

export default function readingTimeCalculator(text) {
  const count = wordCounter(text);
  const minutes = Math.ceil(count / WORDS_PER_MINUTE);
  const displayMinutes = minutes < 1 ? 1 : minutes;
  return `${displayMinutes} min read`;
}
