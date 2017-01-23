module.exports = function(dir) {
  var res;
  res = require("./src/a/data.json");
  if('result.json' !== res) return 'require must return "result.json"';
  res = require("./src/b/data.json");
  if('result.json' !== res) return 'require must return "result.json"';
  res = require("./src/c/target.json");
  if('result.json' !== res) return 'require must return "result.json"';
  return 'ok';
};
