module.exports = function(dir) {
  var res;
  res = require("./src/a/data.json");
  var filename = res;
  res = require("./src/b/data.json");
  if(filename !== res) return '"'+filename+'" not equal "'+res+'"';
  res = require("./src/c/target.json");
  if(filename !== res) return '"'+filename+'" not equal "'+res+'"';
  return 'ok';
};
