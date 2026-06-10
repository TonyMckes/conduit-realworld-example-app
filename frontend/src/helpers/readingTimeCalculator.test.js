import readingTimeCalculator from "./readingTimeCalculator";

it("should return 1 min read for empty string", () => {
  expect(readingTimeCalculator("")).toBe("1 min read");
});

it("should return 1 min read for less than 200 words", () => {
  const text = Array(150).fill("word").join(" ");
  expect(readingTimeCalculator(text)).toBe("1 min read");
});

it("should return 1 min read for exactly 1 word", () => {
  expect(readingTimeCalculator("hello")).toBe("1 min read");
});

it("should return 1 min read for exactly 200 words", () => {
  const text = Array(200).fill("word").join(" ");
  expect(readingTimeCalculator(text)).toBe("1 min read");
});

it("should return 2 min read for 201 words", () => {
  const text = Array(201).fill("word").join(" ");
  expect(readingTimeCalculator(text)).toBe("2 min read");
});

it("should return 2 min read for 399 words", () => {
  const text = Array(399).fill("word").join(" ");
  expect(readingTimeCalculator(text)).toBe("2 min read");
});

it("should return 2 min read for 400 words", () => {
  const text = Array(400).fill("word").join(" ");
  expect(readingTimeCalculator(text)).toBe("2 min read");
});

it("should return 3 min read for 401 words", () => {
  const text = Array(401).fill("word").join(" ");
  expect(readingTimeCalculator(text)).toBe("3 min read");
});

it("should ignore numbers in word count", () => {
  const text = "hello 123 world 456 foo";
  expect(readingTimeCalculator(text)).toBe("1 min read");
});
