
//! @file
//! @date 2017.01.09
//! @license MIT (in the root of this source tree)
//! @author Serguei Okladnikov <oklaspec@gmail.com>

var async = require("async");
var glob = require('glob');
var loaderUtils = require("loader-utils");
var PrefetchPlugin = require('webpack').PrefetchPlugin;
var RawSource = require("webpack-sources").RawSource;

var NEXT_ID = 0;

function JoinPlugin(options) {
  if(typeof options !== 'object' )
    throw new Error("options must be object of key:values");

  if(typeof options.join !== 'function')
    throw new Error("'join' option must be function");

  if(typeof options.save !== 'function')
    throw new Error("'save' option must be function");

  if(!options.search)
    options.search = [];

  if(typeof options.search === 'string' )
    options.search = [ options.search ];

  if(!Array.isArray(options.search))
    throw new Error("'search' option must be string or array");

  options.skip = options.skip == null ?
    [] : options.skip;
  options.skip = Array.isArray(options.skip) ?
    options.skip : [options.skip];

  options.name = options.name || '[hash]';
  options.group = options.group || null;
  this.groups = {};

  this.options = options;
  this.state = 'loading';
  this.id = options.id == null ? ++NEXT_ID : options.id;
}

JoinPlugin.prototype.group = function(groupName) {
  if(groupName == null) groupName = "";
  if(!this.groups[groupName]) {
    this.groups[groupName] = {
      sources: {},
      result: null,
      filetmpl: this.options.name,
      filename: "join-webpack-plugin.default"
    };
  }
  return this.groups[groupName];
};

JoinPlugin.prototype.addSource = function(groupName, source, path, module) {
  var group = this.group(groupName);
  if( this.state === 'loading' ) {
    group.sources[path] = source;
    return 'join-webpack-plugin.in.process';
  } else {
    return group.filename;
  }
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

JoinPlugin.prototype.buildGroup = function(group) {
  var self = this;
  var files = Object.keys(group.sources);
  var result = null;
  files.forEach(function(file) {
    result = self.options.join(result, group.sources[file])
  });
  group.result = self.options.save(result);
  group.filename = loaderUtils.interpolateName(
    this, group.filetmpl, { content: group.result });
};

JoinPlugin.prototype.apply = function(compiler) {
  var self = this;
  self.doPrefetch(compiler);

  compiler.plugin("this-compilation", function(compilation) {

    compilation.plugin("optimize-tree", function(chunks,modules,callback) {
      self.state = 'building';

      Object.keys(self.groups).forEach(function(groupName) {
        var group = self.group(groupName);
        self.buildGroup(group);
      });

      async.forEach(chunks, function(chunk, callback) {
        async.forEach(chunk.modules.slice(), function(module, callback) {

          var group = null;
          Object.keys(self.groups).forEach(function(groupName) {
            var g = self.group(groupName);
            if(module.resource in g.sources)
              group = g;
          });
          if( !group ) return callback();

          compilation.rebuildModule(module, function(err) {
            if(err) compilation.errors.push(err);
            callback();
          });

        }, function(err) {
          if(err) return callback(err);
          callback();
        });
      }, function(err) {
        if(err) return callback(err);
        self.state = 'loading';
        callback();
      });

    });

    compilation.plugin("additional-assets", function(callback) {
      Object.keys(self.groups).forEach(function(groupName) {
        var group = self.group(groupName);
        compilation.assets[group.filename] = new RawSource(group.result);
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
