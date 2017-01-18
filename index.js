
//! @file
//! @date 2017.01.09
//! @license MIT (in the root of this source tree)
//! @author Serguei Okladnikov <oklaspec@gmail.com>

var glob = require('glob');
var PrefetchPlugin = require('webpack').PrefetchPlugin;
var RawSource = require("webpack-sources").RawSource;

var NEXT_ID = 0;

function JoinPlugin(options) {
  if(typeof options !== 'object' || Array.isArray(options) )
    throw new Error("options must be object of key:values");

  if(typeof options.join !== 'function')
    throw new Error("'join' option must be function");

  if(typeof options.save !== 'function')
    throw new Error("'save' option must be function");

  if(typeof options.search === 'string' )
    options.search = [ options.search ];

  if(!Array.isArray(options.search))
    throw new Error("'search' option must be string or array");

  options.skip = options.skip == null ?
    [] : options.skip;
  options.skip = Array.isArray(options.skip) ?
    options.skip : [options.skip];

  options.name = options.name || '[name].[hash].[ext]';
  options.group = options.group || null;
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
      result: null,
      finished_path: "",
      finished_name: ""
    };
  }
  return this.groups[groupName];
};

JoinPlugin.prototype.addSource = function(groupName, name, source, path, module) {
  var group = this.group(groupName);
  group.result = this.options.join(group.result, source);
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

  self.options.search.forEach(function(item) {
    var globOpts = {cwd: compiler.options.context};
    glob.sync(item, globOpts).forEach(function(path) {
      found[path] = null;
    });
  });

  found = Object.keys(found);

  found = found.filter(function(item) {
    var skip = self.options.skip.filter(function(skip) {
      return skip instanceof RegExp ?
       skip.test(item) : item.indexOf(skip) !== -1;
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
        var content = self.options.save(group.result);
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
