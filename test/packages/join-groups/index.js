module.exports = function(dir) {
  var res;
  res = require("./src/a/data.json");
  if('data.json' !== res) return 'require must return "data.json"';
  res = require("./src/b/data.json");
  if('data.json' !== res) return 'require must return "data.json"';
  res = require("./src/b/target.json");
  if('target.json' !== res) return 'require must return "target.json"';
  res = require("./src/c/target.json");
  if('target.json' !== res) return 'require must return "target.json"';
  return 'ok';
};
