module.exports = function (plop) {
  plop.setGenerator('feature', require('./feature'));
  plop.setGenerator('component', require('./component'));
};
