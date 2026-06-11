import wordCounter from "./wordCounter";

it("should return 0 for empty string", () => {
  expect(wordCounter("")).toBe(0);
});

it("should return 0 for null", () => {
  expect(wordCounter(null)).toBe(0);
});

it("should return 0 for undefined", () => {
  expect(wordCounter(undefined)).toBe(0);
});

it("should count simple English words", () => {
  expect(wordCounter("hello world")).toBe(2);
});

it("should ignore numbers", () => {
  expect(wordCounter("hello 123 world 456")).toBe(2);
});

it("should count words with punctuation", () => {
  expect(wordCounter("hello, world! how's it going?")).toBe(5);
});

it("should ignore mixed alphanumeric tokens", () => {
  expect(wordCounter("hello123 world456")).toBe(0);
});

it("should handle single word", () => {
  expect(wordCounter("hello")).toBe(1);
});

it("should handle text with newlines", () => {
  expect(wordCounter("hello\nworld\nfoo bar")).toBe(4);
});
