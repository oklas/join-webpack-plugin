
//! @file
//! @date 2017.01.13
//! @author Serguei Okladnikov <oklaspec@gmail.com>

var JoinPlugin = require('./index')

var loaderUtils = require("loader-utils");

module.exports = function(source) {

  var query = loaderUtils.parseQuery(this.query);

  var plugins = this.options.plugins.filter(function(plugin) {
    return plugin instanceof JoinPlugin
  });
  var plugin = this.options.plugins.filter(function(plugin) {
    return plugin.id == query.id
  });
  plugin = plugin.length > 0 ? plugin[0] :
  (plugins.length > 0 && query.id == null ? plugins[0] :  null);

  if(!plugin)
    throw new Error('associated webpack plugin not found');

  var name = query.name;

  var content = JSON.stringify(plugin.result);

  this.emitFile(name, content);
  return "module.exports = __webpack_public_path__ + " + JSON.stringify(name) + ";";

};
module.exports.raw = true;
