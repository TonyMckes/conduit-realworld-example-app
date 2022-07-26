import dateFormatter from "./dateFormatter";

it("should format an ISO string", () => {
  const ISOString = "2020-01-01T12:11:08.212Z";

  expect(dateFormatter(ISOString)).toBe("January 1, 2020");
});
