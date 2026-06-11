import characterCounter from "./characterCounter";

it("should return 0 for empty string", () => {
  expect(characterCounter("")).toBe(0);
});

it("should return 0 for null", () => {
  expect(characterCounter(null)).toBe(0);
});

it("should return 0 for undefined", () => {
  expect(characterCounter(undefined)).toBe(0);
});

it("should count Chinese characters", () => {
  expect(characterCounter("这是一段中文")).toBe(6);
});

it("should count English characters (excluding spaces)", () => {
  expect(characterCounter("hello world")).toBe(10);
});

it("should count mixed Chinese and English", () => {
  expect(characterCounter("hello 世界 goodbye 世界")).toBe(16);
});

it("should ignore HTML tags", () => {
  expect(characterCounter("<p>hello world</p>")).toBe(10);
});

it("should ignore nested HTML tags", () => {
  expect(characterCounter("<div><p>hello</p><p>world</p></div>")).toBe(10);
});

it("should ignore whitespace and newlines", () => {
  expect(characterCounter("hello\nworld\tfoo bar")).toBe(16);
});

it("should count numbers and punctuation", () => {
  expect(characterCounter("hello, world! 123")).toBe(15);
});

it("should count text with only whitespace", () => {
  expect(characterCounter("   \n  \t  ")).toBe(0);
});

it("should handle text with only HTML tags", () => {
  expect(characterCounter("<p><b><i></i></b></p>")).toBe(0);
});
