import errorHandler from "./errorHandler";

describe("Catching errors", () => {
  const errors = [401, 403, 404, 422, 500];

  test.each(errors)("Status %p should throw an error", (statusCode) => {
    const resError = {
      response: new Response(null, { status: statusCode }),
    };

    expect(() => errorHandler(resError)).toThrow();
  });
});
