
//! @file
//! @date 2017.01.09
//! @license MIT (in the root of this source tree)
//! @author Serguei Okladnikov <oklaspec@gmail.com>

var glob = require('glob');
const merge = require("merge"); // TODO: remove
var PrefetchPlugin = require('webpack').PrefetchPlugin;
var RawSource = require("webpack-sources").RawSource;

var NEXT_ID = 0;

function JoinPlugin(options) {
  if(typeof options === 'string')
    options = { searchGlobs: options };

  if(typeof options.searchGlobs === 'string' )
    options.searchGlobs = [ options.searchGlobs ];

  options.skipPaths = options.skipPaths == null ?
    [] : options.skipPaths;
  options.skipPaths = Array.isArray(options.skipPaths) ?
    options.skipPaths : [options.skipPaths];

  this.sources = []
  this.result = {}
  this.files = {}
  this.finished_at = ''

  this.id = options.id == null ? ++NEXT_ID : options.id;
  this.options = options;
}


JoinPlugin.prototype.addSource = function(source, path) {
  var struct = JSON.parse(source);
  this.result = merge.recursive(this.result, struct);
  this.files[path] = this.files[path] ? 1+this.files[path] : 1
  this.finished_at = path;
};


JoinPlugin.prototype.hash = function (buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex');
};

JoinPlugin.prototype.doPrefetch = function (compiler) {
  var self = this;
  var found = {};

  self.options.searchGlobs.forEach(function(item) {
    var globOpts = {cwd: compiler.options.context};
    glob.sync(item, globOpts).forEach(function(path) {
      found[path] = null;
    });
  });

  found = Object.keys(found);

  found = found.filter(function(item) {
    var skip = self.options.skipPaths.filter(function(skipPath) {
      return skipPath instanceof RegExp ?
       skipPath.test(item) : item.indexOf(skipPath) !== -1;
    });
    return 0 == skip.length;
  });

  found.forEach(function(item){
    compiler.apply(new PrefetchPlugin(item));
  });
};

JoinPlugin.prototype.apply = function (compiler) {
  var self = this;
  self.doPrefetch(compiler);

  compiler.plugin("this-compilation", function(compilation) {
    compilation.plugin("additional-assets", function(callback) {
      var file = 'target.json';
      var content = JSON.stringify(self.result);
      compilation.assets[file] = new RawSource(content);
      callback();
    });
  });
};

JoinPlugin.prototype.loader = function(options) {
  var query = options == null ? {} : options;
  query.id = this.id;
  return require.resolve("./loader") + '?' + JSON.stringify(query);
};

JoinPlugin.loader = JoinPlugin.prototype.loader.bind(JoinPlugin);

module.exports = JoinPlugin;
