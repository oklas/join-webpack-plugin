# join plugin for webpack

This plugin with loader allow join set of files by predefined method.
This join produce single asset. The set of files may be splitted
to group of set of files that produce group of assets.
The method of joining is defined by specified function.


- [Install](#install)
- [Webpack configuration](#webpack-configuration)
- [Requiring](#requiring)
- [Plugin configuration](#plugin-configuration)
- [Define joining](#define-joining)
- [Loader configuration](#oader-configuration)
- [Groupping](#groupping)


## Install

```bash
npm install --save-dev join-webpack-plugin
```


## Webpack configuration

This example is minimal configuration to merge json to single asset:

``` javascript
var JoinPlugin = require("join-webpack-plugin");
const merge = require("merge");
module.exports = {
  module: {
    loaders: [
      {
        test: /\.(json)$/i,
        loaders: [
          JoinPlugin.loader(),
          // some more pre loaders
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


## Requiring

``` javascript
var url = require("one-of-files.ext");
```

This will return public url of file with result of joining.
This will be same url for each file joined together.

Files that need to be joined must be required by `require`
or must be prefetched by configure `search` param of
plugin configuration.


## Plugin configuration

JoinPlugin typically created at webpack configuration file and
wait hash of configuration options as its create param:

``` javascript
var JoinPlugin = require("join-webpack-plugin");

var join = new JoinPlugin({
  search: 'glob' || ['globs',...],
  skip: 'substr' || /regexp/ || [ 'substr', /regex/, ...],
  join: function(common, addition) { ... },
  save: function(common) { ... },
  loaderOptions: { ...LOADER_OPTIONS }
});
```

Values is (bold marked is mandatory):

* **`search`** - glob pattern or patterns array to find and prefetch files see [glob](https://www.npmjs.com/package/glob) module for reference
* `skip` - substring or regular expression or array to skip some from searched results
* **`join`** - function that make joining
* **`save`** - function that produce result for saving to asset
* `loaderOptions` - default options for loader of this join plugin, loader options described below


## Define joining

The joining process need two function `join` and `save`.

### joining

At first is joining itself:

``` javascript
function(common, addition)
```

Params:

* `common` - common data structure where data from files to join is
  collected - this is any data structure. At first call this param
  is `null`. Each next calls this is result of previous call of this function.
* `addition` - next peace information to join - this is content of file may
  be passed through loaders specified before in loaders chain where loader
  of this plugin is invoked.

### saving

After all files is loaded and collected in common place produce result:

``` javascript
function(common)
```

This function have same param as first param of join function - `common`
data where collected information about loaded files. This function need
to converts collected information to string and return this string. 
The result of tis function will be saved in asset.


## Loader configuration

To define loader is better call loader function from same object that
in plugin section. If multiple join plugin or its subclasses is
used this requirement become mandatory:

``` javascript
var JoinPlugin = require("join-webpack-plugin");
var theJoin = new JoinPlugin({...})

{
  module: {
  loaders: [
      theJoin.loader({group:'[name]'}),
      // some more pre loaders
    ],
  }
  plugins: [
     theJoin
  ]
}

```        

Loader function wait hash of configuration options as its param:
Default values of loader may be specified in plugin configuration
described above.

Values is:

* `group` - this allow grouping of files to separated assets
  by specifing gropping pattern, refer to interpolateName
  [loader-utils](https://github.com/webpack/loader-utils#interpolatename)
* `name` - same as `group` pattern for specifying destination
  asset file name

Configuration values specified directly in `lodaer()` override
same values specified as default in plugin configuration.


## Grouping

Files may be groupped by simple criteria. Grouping criteria is
specified in `group` loader param. If `group` param is not
specified than will be only one common group where will be 
all files. 

* to group files with same name set group param:

```    
[name]
```

* to group files with same ext set group param:

```    
[ext]
```

* to group files where in each group will be files from same directory:

```    
[path]
```

And any derivative combinations.
    
Groupping criteria formed by template placeholders described
in `interpolateName()` from [loader-utils](https://github.com/webpack/loader-utils#interpolatename) module.


## LICENSE

#### [MIT](./LICENSE.md)