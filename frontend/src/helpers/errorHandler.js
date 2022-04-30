function errorHandler(error) {
  if (!error.response) return console.log(error);

  const { status, data } = error.response;

  if ([401, 403, 404, 422, 500].includes(status)) {
    console.log(error.response, data.errors.body[0]);
    throw data.errors.body[0];
  }

  console.dir(error);
}

export default errorHandler;
