[![npm][npm-image]][npm-url]
[![travis-cl][travis-image]][travis-url]
[![coverage][cover-image]][cover-url]

# join plugin for webpack


- [Install](#install)
- [Webpack configuration](#webpack-configuration)
- [Requiring](#requiring)
- [Plugin configuration](#plugin-configuration)
- [Define joining](#define-joining)
- [Loader configuration](#loader-configuration)
- [Grouping](#grouping)


**Webpack plugin with loader that join sources by predefined method**

This is **[webpack](https://webpack.js.org/)** plugin produces single asset
for set of files or multiple assets with grouping technique. The set of files
may be splited to groups of set of files that produce group of assets.

The method of joining is defined by specified functions.


**Advantages**:

* deep webpack integration
* possibility to group files by simple criterion
* autorebuild and reload on source file change (due to deep integration)
* files may be loaded and joined by path pattern or by call function
  `require` or `import`

This join plugin is enough flexible as it allows to predefine data join
method. With that it is more general and requires to specify functions
which produce joining.

Consider to use derivative plugins instead of this:

* **[merge-webpack-plugin](https://github.com/oklas/merge-webpack-plugin)** -
  when it's necessary to merge json data (or data loaded from another formats
  with structured data like yaml for example).

* **[intl-webpack-plugin](https://github.com/oklas/intl-webpack-plugin)** -
  build internationalization locale assets according to component
  internationalization approach.


## Install

```bash
npm install --save-dev join-webpack-plugin
```


## Webpack configuration

This is minimal configuration to merge json into single asset:

``` javascript
var JoinPlugin = require("join-webpack-plugin");
const merge = require("merge");
module.exports = {
  module: {
    rules: [
      {
        test: /\.(json)$/i,
        use: [
          JoinPlugin.loader(),
          // some preloaders
        ]
      }
    ]
  },
  plugins: [
    new JoinPlugin({
      search: './src/**/*.json',
      join: function(common, addition) {
        return merge.recursive(
          common ? common : {}, JSON.parse(addition)
        );
      },
      save: function(common) {
        return JSON.stringify(common);
      }
    })
  ]
}
```

The using this plugin directly in webpack configuration can lead to code
duplication. A good solution in that case may be creation and sharing a new
useful plugin. A good starting point in this case is to do fork of
[merge-webpack-plugin](https://github.com/oklas/merge-webpack-plugin)
and take it as a base.

## Requiring

``` javascript
var url1 = require("one-of-files.ext");
var url2 = require("another-file.ext");
require("third-file.ext");
// or describe files by pattern in plugin param

// url1 and url2 will be same name refers to same file
// which will also contain content of "third-file.ext"
```

Same in modern syntax:

``` jsx
import url1 from "one-of-files.ext"
import url2 from "another-file.ext"
import "third-file.ext"
// or describe files by pattern in plugin param
```

This returns public url of file with result of joining.
This will be same url for each file joined together
according to plugin configuration.

In order to involve files into join, files must be required by `require`
function or configured by `search` param of plugin configuration.


## Plugin configuration

JoinPlugin is created typically in webpack configuration file and
waits hash of configuration options as its create param:

``` javascript
var JoinPlugin = require("join-webpack-plugin");

var join = new JoinPlugin({
  search: 'glob' || ['globs',...],
  skip: 'substr' || /regexp/ || [ 'substr', /regex/, ...],
  join: function(common, addition) { ... },
  save: function(common) { ... },
  group: '[name]',
  name: '[name].[hash].[ext]',
});
```

Options:

* **`join`** - user defined joining function (mandatory required)
* **`save`** - user defined asset saving function (mandatory required)
* `search` - glob pattern or pattern array of files to find and prefetch
  see [glob](https://www.npmjs.com/package/glob) module for reference
* `skip` - substring or regular expression or array to skip from searched results
* `group` - default group loader option (see below)
* `name` - default name loader option (see below)

The `search` param works like multi-require with glob patterns.
Only files that required by `require` function in code
will be loaded in that case.

Any file that does not match to `search` or `skip` param and
match to loader section in webpack config and is required in code
by function `require` or `import` will be loaded and joined anyway.


## Define joining

The joining process needs two function `join` and `save`
(the pure functions is recommended).

### joining

The user defined joining function prototype:

``` javascript
join: function(common, addition)
```

Params:

* `common` - common data structure collecting data to join. Here may be
  any user defined data structure. At first call this param is `null`.
  With each next call `common` is result of previous call of this function.
* `addition` - next peace information to join. This data is passed through
  loaders chain from source file which currenly joined.


### saving

After all files are loaded and collected in `common` place.
User defined function prototype producing the result:

``` javascript
save: function(common)
```

This function has the same param `common` as first param of `join` function.
The `common` param contains information loaded form files collected on
`joining` step. This user defined function must process `common` collected
information and must produce result string and return it.
The result of this function will be saved in asset.


## Loader configuration

The `loader()` method includes join loader into loader chain.

``` javascript
var JoinPlugin = require("join-webpack-plugin");
var theJoin = new JoinPlugin({...})

{
  module: {
    rules: [
      { test: /\.(json)$/i,
        use: [
          theJoin.loader({group:'[name]'}),
          // some more pre loaders
        ]
      }
    ]
  }
  plugins: [
     theJoin
  ]
}

```        

Preliminary loaders must be applied before join loader. This means that
join loader must be final loader in loaders chain.

Loader function waits hash of configuration options as its param.
Default values of loader may be specified in plugin configuration
described above.

Loader options:

* `group` - devides files into separated assets by specifying
  groping pattern. May include template placeholders described
  below in groupping section. Grouping is not applied if
  value is not specified.
* `name` - specifies destination asset file name. String value
  may include template placeholders described below. Default
  value is `[hash]`.

Configuration values specified directly in `loader()` override
same values specified as default in plugin configuration.


The `loader()` function may be invoked as class function if only one plugin
instance is passed to config. Therefore it is better to use object form
instead of class form:

``` javascript
var theJoin = new JoinPlugin({...})

loaders: [
  // this form valid only for single plugin instance:
  JoinPlugin.loader(),
  // to avoid problems better to use always object form:
  theJoin.loader(),
],
```


## Grouping

Files may be grouped by simple criterion. Grouping criterion is
specified in `group` loader param. If `group` param is not
specified than will be only one common group where will be 
all files joined togather.

Grouping criteria formed by template placeholders described
in `interpolateName()` from [loader-utils](https://github.com/webpack/loader-utils#interpolatename) module.
Some of that is:

* `[name]` - to group files with same name set group param:
* `[ext]` - to group files with same ext set group param:
* `[path]` - to group files where each group contains files from same directory:

And any derivative combinations.
    

## LICENSE

#### [MIT](./LICENSE.md)

[npm-image]: https://img.shields.io/npm/v/join-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/join-webpack-plugin
[travis-image]: https://travis-ci.org/oklas/join-webpack-plugin.svg
[travis-url]: https://travis-ci.org/oklas/join-webpack-plugin
[cover-image]: https://img.shields.io/codecov/c/github/oklas/join-webpack-plugin.svg
[cover-url]: https://codecov.io/gh/oklas/join-webpack-plugin
