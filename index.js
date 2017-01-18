
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

  options.name = options.name || '[name].[hash].[ext]';
  options.group = options.group || '[name].[ext]';
  this.groups = {};

  this.options = options;
  this.id = options.id == null ? ++NEXT_ID : options.id;
}

JoinPlugin.prototype.group = function(groupName) {
  if(groupName == null) groupName = "";
  if(!this.groups[groupName]) {
    this.groups[groupName] = {
      modules: [],
      sources: [],
      files: [],
      result: {},
      finished_path: "",
      finished_name: ""
    };
  }
  return this.groups[groupName];
};

JoinPlugin.prototype.addSource = function(groupName, name, source, path, module) {
  var group = this.group(groupName);
  var struct = JSON.parse(source);
  group.result = merge.recursive(group.result, struct);
  group.files[path] = group.files[path] ? 1+group.files[path] : 1;
  group.finished_path = path;
  group.finished_name = name;
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
      Object.keys(self.groups).forEach(function(groupName) {
        var group = self.group(groupName);
        var content = JSON.stringify(group.result);
        compilation.assets[group.finished_name] = new RawSource(content);
      });
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
