module.exports = function (config) {
  config.addPassthroughCopy('assets')
  return {
    dir: { input: '.', output: '_site' },
  }
}
