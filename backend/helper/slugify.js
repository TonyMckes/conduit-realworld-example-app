/**
 *
 * @param {string} string
 * @returns
 */
module.exports.slugify = (string) => {
  return string.trim().toLowerCase().replace(/\W|_/g, "-");
};
