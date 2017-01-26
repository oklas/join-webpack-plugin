var JoinPlugin = require("../../../");
const merge = require("merge");

module.exports = {
  entry: "./index",
  output: { libraryTarget: 'umd' },
  module: {
    loaders: [
      {
        test: /\.(yaml-json)$/i,
        loaders: [
          JoinPlugin.loader({group:'[name]', name: '[name].[ext]'}),
          'yaml-loader'
        ]
      }
    ]
  },
  plugins: [
    new JoinPlugin({
      search: './src/**/*.yaml-json',
      join: function(common, addition) {
        return merge.recursive(
          common ? common : {},
          JSON.parse(addition)
        );
      },
      save: function(common) {
        return JSON.stringify(common);
      }
    })
  ]
};
