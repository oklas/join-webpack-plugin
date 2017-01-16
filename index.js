
//! @file
//! @date 2017.01.09
//! @license MIT (in the root of this source tree)
//! @author Serguei Okladnikov <oklaspec@gmail.com>

var glob = require('glob');
const merge = require("merge");
var PrefetchPlugin = require('webpack').PrefetchPlugin;

var NEXT_ID = 0;

function JoinPlugin(options) {
  if(typeof options === 'string')
    options = { searchGlobs: options };

  if(typeof options.searchGlobs === 'string' )
    options.searchGlobs = [ options.searchGlobs ];

  options.skipPaths = options.skipPaths == null ?
    options.skipPaths : [];

  if(typeof options.skipPaths === 'string' )
    options.skipPaths = [ options.skipPaths ];

  this.sources = []
  this.result = {}
  this.files = {}
  this.finished_at = ''

  this.id = options.id == null ? ++NEXT_ID : options.id;
  this.options = options;
}


JoinPlugin.prototype.doPrefetch = function (compiler) {
  var self = this;
  var found = {};
  self.options.searchGlobs.forEach(function(item) {
    glob.sync(item, {cwd: compiler.options.context}).forEach(function(path) {
      found[path] = null;
    });
  });
  found = Object.keys(found);
  found.forEach(function(item){
    compiler.apply(new PrefetchPlugin(item));
  });
};

JoinPlugin.prototype.apply = function (compiler) {
  var self = this;
  self.doPrefetch(compiler);
};

JoinPlugin.prototype.loader = function(options) {
  var query = options == null ? {} : options;
  query.id = this.id;
  return require.resolve("./loader") + '?' + JSON.stringify(query);
};

JoinPlugin.loader = JoinPlugin.prototype.loader.bind(JoinPlugin);

module.exports = JoinPlugin;
